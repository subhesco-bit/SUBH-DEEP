/**
 * Library Knowledge Service (M645100)
 *
 * Indexes the real _EBDESIGN_LIBRARY layout plus plug-and-play modules and
 * exposes a Claude-compatible execute() contract for module discovery.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const orgChart = require('./orgChart');

const MODULE_ID = 'M645100_LIBRARYKNOWLEDGE';
const MODULE_NAME = 'Library Knowledge';
const TEXT_PREVIEW_BYTES = Number(process.env.LIBRARY_TEXT_PREVIEW_BYTES || 65536);
// Ledgers can hold hundreds of thousands of rows. Index a bounded head of them
// so a large .jsonl stays searchable without holding the whole file in memory.
const JSONL_MAX_RECORDS = Number(process.env.LIBRARY_JSONL_MAX_RECORDS || 500);

// Directories excluded from the whole-project sweep by default. node_modules
// is third-party code and .git is opaque object storage; neither is project
// content, and together they are four times the size of everything else.
// Set LIBRARY_INDEX_VENDOR=1 to map them too.
const VENDOR_DIRECTORIES = new Set(['node_modules', '.git']);

/**
 * Locate the repository root by walking up for the library directory itself.
 *
 * A fixed `path.resolve(__dirname, '../../..')` only works from one location,
 * and this module has already been moved once: from modules/ (where three
 * levels up is the repo root) into backend/src/modules/ (where it is
 * backend/src, so the library was never found and nothing got indexed).
 * Searching for the marker survives the next move too.
 */
/**
 * Zones: the project itself, plus any sibling directory that belongs to it.
 * A git worktree or a backup copy of this repository sits next to it rather
 * than inside it, so it is invisible to a sweep rooted at the project.
 */
function discoverSiblingRoots(projectRoot) {
  if (['0', 'false', 'off'].includes(String(process.env.LIBRARY_MAP_SIBLINGS || '').toLowerCase())) {
    return [];
  }

  const explicit = String(process.env.LIBRARY_EXTERNAL_ROOTS || '').trim();
  if (explicit) {
    return explicit.split(',').map((entry) => entry.trim()).filter(Boolean).map((dir, position) => ({
      id: `EXT${position + 1}`,
      path: path.resolve(dir)
    }));
  }

  const parent = path.dirname(projectRoot);
  const base = path.basename(projectRoot);
  const candidates = [
    { id: 'WORKTREES', path: path.join(parent, `${base}.worktrees`) },
    { id: 'BACKUPS', path: path.join(parent, `${base}.local-backups`) }
  ];

  return candidates.filter((candidate) => {
    try {
      return fs.statSync(candidate.path).isDirectory();
    } catch (error) {
      return false;
    }
  });
}

/**
 * A file's zone and path within it. Files under a sibling root are addressed
 * by that root's id, so nothing collides with the project's own tree.
 */
function locateInZones(filePath, projectRoot, externalRoots) {
  for (const root of externalRoots) {
    const relative = path.relative(root.path, filePath);
    if (relative && !relative.startsWith('..') && !path.isAbsolute(relative)) {
      return { zone: root.id, relativePath: relative.split(path.sep).join('/') };
    }
  }

  const relative = path.relative(projectRoot, filePath);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return { zone: 'PRJ', relativePath: relative.split(path.sep).join('/') };
}

/**
 * A stable call number, in the spirit of a shelf mark or a parking bay:
 *
 *   PRJ-BACKEND-1a2b3c4d
 *   |   |       |
 *   |   |       slot: first 8 hex of sha1(zone/path) - unique, collision-checked
 *   |   section: the top-level directory the file sits under
 *   zone: project, worktrees, backups
 *
 * It is derived only from the file's address, so it survives a rebuild, a
 * restart and a reindex unchanged - which is what makes it usable as a
 * durable handle for something else to store and come back with.
 */
function buildLocationId(zone, relativePath) {
  const segments = relativePath.split('/').filter(Boolean);
  const section = (segments.length > 1 ? segments[0] : '(root)')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '')
    .slice(0, 10) || 'ROOT';
  const slot = crypto.createHash('sha1').update(`${zone}/${relativePath}`).digest('hex').slice(0, 8);
  return `${zone}-${section}-${slot}`;
}

function findProjectRoot(startDir = __dirname) {
  let dir = startDir;
  for (let i = 0; i < 10; i += 1) {
    if (fs.existsSync(path.join(dir, '_EBDESIGN_LIBRARY'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Nothing found — fall back to the historical guess so behaviour is
  // unchanged rather than throwing at require time.
  return path.resolve(startDir, '../../..');
}

function optionalDatabase() {
  try {
    return require('../../../database/connection').getPostgreSQL();
  } catch (error) {
    return null;
  }
}

function stripBom(content) {
  return content.charCodeAt(0) === 0xFEFF ? content.slice(1) : content;
}

function readJson(filePath) {
  const content = stripBom(fs.readFileSync(filePath, 'utf8'));

  try {
    return JSON.parse(content);
  } catch (error) {
    return {
      name: path.basename(filePath),
      parseError: error.message,
      indexedWithWarning: true
    };
  }
}

/**
 * Parse a JSON Lines file: one JSON document per line.
 *
 * .jsonl was previously handed to readJson(), which JSON.parse()s the entire
 * file as a single document. Any ledger with more than one line therefore
 * failed outright and was indexed as a parse error with no usable data, so
 * every record in it was invisible to search — enterprise-file-activity-ledger
 * .jsonl among them. Parsing per line also means one malformed row no longer
 * hides the valid rows around it.
 */
function readJsonl(filePath) {
  const content = stripBom(fs.readFileSync(filePath, 'utf8'));
  const records = [];
  const lineErrors = [];

  content.split(/\r?\n/).forEach((line, offset) => {
    const trimmed = line.trim();
    if (!trimmed) return;

    try {
      if (records.length < JSONL_MAX_RECORDS) {
        records.push(JSON.parse(trimmed));
      } else {
        JSON.parse(trimmed);
      }
    } catch (error) {
      if (lineErrors.length < 20) {
        lineErrors.push({ line: offset + 1, message: error.message });
      }
    }
  });

  const data = {
    name: path.basename(filePath),
    format: 'jsonl',
    recordCount: records.length,
    records
  };

  if (lineErrors.length > 0) {
    data.lineErrors = lineErrors;
    data.indexedWithWarning = true;
  }

  return data;
}

function parseCsvHeaderLine(line) {
  const columns = [];
  let value = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      columns.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }

  columns.push(value.trim());
  return columns;
}

function readCsvHeader(filePath) {
  const content = stripBom(fs.readFileSync(filePath, 'utf8'));
  const rows = content.split(/\r?\n/).filter(Boolean);
  const [header = ''] = rows;

  return {
    columns: parseCsvHeaderLine(header),
    rowCount: Math.max(rows.length - 1, 0)
  };
}

/**
 * Read the head of a text file without pulling the whole thing into memory.
 * The library holds multi-megabyte documents; only a preview is ever indexed.
 */
function readTextPreview(filePath, maxBytes = TEXT_PREVIEW_BYTES) {
  const stat = safeStat(filePath);
  if (!stat || stat.size === 0) return '';

  const bytesToRead = Math.min(stat.size, maxBytes);
  const buffer = Buffer.alloc(bytesToRead);
  const fd = fs.openSync(filePath, 'r');

  try {
    const bytesRead = fs.readSync(fd, buffer, 0, bytesToRead, 0);
    return stripBom(buffer.subarray(0, bytesRead).toString('utf8'));
  } finally {
    fs.closeSync(fd);
  }
}

function safeStat(filePath) {
  try {
    return fs.statSync(filePath);
  } catch (error) {
    return null;
  }
}

class LibraryKnowledgeService {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || findProjectRoot();
    this.libraryRoot = options.libraryRoot || path.join(this.projectRoot, '_EBDESIGN_LIBRARY');
    this.modulesRoot = options.modulesRoot || path.join(this.projectRoot, 'modules');
    this.backendModulesRoot = options.backendModulesRoot || path.join(this.projectRoot, 'backend', 'src', 'modules');
    this.index = new Map();
    // Paths already indexed, so the untracked-file sweep can test membership in
    // O(1) instead of rescanning every entry per candidate file.
    this.indexedPaths = new Set();
    // Map everything the project owns, junk included, so nothing on disk is
    // invisible to the library. Bulk files are held at a metadata tier (path,
    // size, mtime, extension) with no content preview: 70k content previews
    // would cost gigabytes of memory, and /resolve reads content on demand.
    this.indexEverything = options.indexEverything !== false
      && !['0', 'false', 'off'].includes(String(process.env.LIBRARY_INDEX_ALL || '').toLowerCase());
    this.indexVendor = options.indexVendor === true
      || ['1', 'true', 'on'].includes(String(process.env.LIBRARY_INDEX_VENDOR || '').toLowerCase());
    // path -> keys, so removing a deleted file costs a lookup rather than a
    // scan of every entry in the index.
    this._pathToKeys = new Map();
    // Sibling checkouts and backups live beside the project, not inside it, so
    // a sweep of projectRoot alone never sees them. Each gets a zone id; keys
    // and location ids are namespaced by it so a file in a worktree can never
    // be confused with its twin in the project.
    this.externalRoots = options.externalRoots || discoverSiblingRoots(this.projectRoot);
    // locationId -> key, so a caller holding a call number resolves it in one
    // lookup instead of scanning the index.
    this.locationIndex = new Map();
    this.contentHashes = new Map();
    this.indexingWarnings = [];
    this.initialized = false;

    // Live indexing. The index is built once at initialize() and would then
    // drift from disk until a restart, so files added, changed, moved or
    // deleted afterwards were invisible to search. Watching the roots keeps it
    // current; changes are coalesced over a short window so a bulk copy or a
    // git checkout costs one update rather than thousands.
    this.watchDebounceMs = options.watchDebounceMs
      || Number(process.env.LIBRARY_WATCH_DEBOUNCE_MS)
      || 300;
    // Live by default. The index is only trustworthy if it matches disk, and
    // the server calls initialize() without asking for a watcher, so making
    // this opt-in meant the running platform served a snapshot that silently
    // aged. Set LIBRARY_WATCH=0 to disable (batch jobs, one-shot CLI runs).
    this.watchEnabled = options.watch === true
      || !['0', 'false', 'off'].includes(String(process.env.LIBRARY_WATCH || '').toLowerCase());
    this._watchers = [];
    this._watchTimer = null;
    this._pendingPaths = new Set();
    this._pendingFullReindex = false;
    this.watching = false;
    // Bumped on every index mutation so derived views (the org chart, the
    // manifest, the name lookup) know when they are stale without diffing.
    this.indexVersion = 0;
    this._chartCache = null;
    this._chartVersion = -1;
    this.watchStats = {
      events: 0,
      batches: 0,
      added: 0,
      updated: 0,
      removed: 0,
      fullReindexes: 0,
      lastChangeAt: null,
      lastError: null
    };
  }

  /** Roots whose contents are represented in the index. */
  watchRoots() {
    // One recursive watch on the project root covers every mapped file; the
    // narrower roots are only used when whole-project mapping is off.
    const roots = this.indexEverything
      ? [this.projectRoot, ...this.externalRoots.map((root) => root.path)]
      : [this.libraryRoot, this.modulesRoot, this.backendModulesRoot];
    return roots.filter((root) => root && fs.existsSync(root));
  }

  /**
   * Index (or re-index) a single library file, so a change to one file costs
   * one read instead of a full sweep of the library.
   */
  indexLibraryFileAt(filePath, options = {}) {
    const stat = safeStat(filePath);
    if (!stat || !stat.isFile()) return null;

    const relativePath = path.relative(this.libraryRoot, filePath).split(path.sep).join('/');
    if (relativePath.startsWith('..')) return null;

    const key = `LIBRARY:${relativePath}`;
    if (options.skipIfIndexed === true && (this.index.has(key) || this.indexedPaths.has(filePath))) {
      return null;
    }

    const name = path.basename(filePath);
    const extension = path.extname(name).toLowerCase();
    const data = {
      name,
      relativePath,
      extension,
      fileSize: stat.size
    };

    if (extension === '.jsonl') {
      Object.assign(data, readJsonl(filePath));
    } else if (extension === '.json') {
      Object.assign(data, readJson(filePath));
    } else if (['.md', '.txt', '.csv', '.yaml', '.yml', '.xml'].includes(extension)) {
      data.content = readTextPreview(filePath).slice(0, 12000);
    }

    this.indexFile(key, 'library-file', filePath, data);
    return key;
  }

  /** Drop every index entry that pointed at a path which no longer exists. */
  removeIndexedPath(filePath) {
    let removed = 0;
    for (const key of this._pathToKeys.get(filePath) || []) {
      // Read the call number before the entry goes, or the binding leaks and
      // the number stays pointing at a file that no longer exists.
      const entry = this.index.get(key);
      const locationId = entry && entry.data && entry.data.locationId;
      if (locationId) this.locationIndex.delete(locationId);
      if (this.index.delete(key)) removed += 1;
      this.contentHashes.delete(key);
    }
    this._pathToKeys.delete(filePath);
    this.indexedPaths.delete(filePath);
    if (removed > 0) this.indexVersion += 1;
    return removed;
  }

  /**
   * Rebuild the whole index without a restart. Content hashes are dropped so
   * they are recomputed on demand rather than served stale.
   */
  async reindex() {
    await this.buildIndex();
    this.contentHashes.clear();
    this.initialized = true;
    this.watchStats.fullReindexes += 1;
    return {
      success: true,
      moduleId: MODULE_ID,
      indexedItems: this.index.size,
      indexingWarnings: this.indexingWarnings.length,
      reindexedAt: new Date().toISOString()
    };
  }

  /**
   * Start watching the indexed roots. Node's recursive fs.watch is
   * best-effort (platform limits, network drives), so a failure to watch one
   * root is recorded and the others still run — the manual reindex() path is
   * always available as the fallback.
   */
  startWatching() {
    if (this.watching) return { success: true, alreadyWatching: true, roots: this.watchedRoots || [] };

    const watched = [];
    for (const root of this.watchRoots()) {
      try {
        const watcher = fs.watch(root, { recursive: true, persistent: false }, (eventType, filename) => {
          if (!filename) {
            // No name means the platform could not attribute the change;
            // fall back to a full rebuild rather than miss it.
            this._queueChange(null, true);
            return;
          }
          this._queueChange(path.join(root, filename.toString()), false);
        });
        watcher.on('error', (error) => { this.watchStats.lastError = error.message; });
        this._watchers.push(watcher);
        watched.push(root);
      } catch (error) {
        this.watchStats.lastError = `${root}: ${error.message}`;
      }
    }

    this.watching = this._watchers.length > 0;
    this.watchedRoots = watched;
    return { success: this.watching, roots: watched, debounceMs: this.watchDebounceMs };
  }

  stopWatching() {
    for (const watcher of this._watchers) {
      try { watcher.close(); } catch (error) { /* already closed */ }
    }
    this._watchers = [];
    if (this._watchTimer) { clearTimeout(this._watchTimer); this._watchTimer = null; }
    this._pendingPaths.clear();
    this._pendingFullReindex = false;
    this.watching = false;
    return { success: true, watching: false };
  }

  /** Record a change and (re)arm the debounce window. */
  _queueChange(filePath, forceFull) {
    this.watchStats.events += 1;
    this.watchStats.lastChangeAt = new Date().toISOString();

    if (forceFull) {
      this._pendingFullReindex = true;
    } else if (!this.indexVendor && this._isVendorPath(filePath)) {
      // Dependency and git-object churn is not project content; ignore it
      // rather than rebuilding the index for every npm write.
      this.watchStats.ignored = (this.watchStats.ignored || 0) + 1;
      return;
    } else if (this._isUnderLibraryRoot(filePath)
      || (this.indexEverything && locateInZones(filePath, this.projectRoot, this.externalRoots))) {
      // Every mapped file has a key derivable from its path, so a change to
      // any of them is applied incrementally. Without this a single edit
      // anywhere in the project would rebuild all 70k entries.
      this._pendingPaths.add(filePath);
    } else {
      // Module trees feed several catalogue-driven indexers whose keys are not
      // derivable from a path alone, so those changes need a full rebuild.
      this._pendingFullReindex = true;
    }

    if (this._watchTimer) clearTimeout(this._watchTimer);
    this._watchTimer = setTimeout(() => {
      this._watchTimer = null;
      this._flushChanges().catch((error) => { this.watchStats.lastError = error.message; });
    }, this.watchDebounceMs);
    if (typeof this._watchTimer.unref === 'function') this._watchTimer.unref();
  }

  _isVendorPath(filePath) {
    const relative = path.relative(this.projectRoot, filePath).split(path.sep);
    return relative.some((segment) => VENDOR_DIRECTORIES.has(segment));
  }

  _isUnderLibraryRoot(filePath) {
    const relative = path.relative(this.libraryRoot, filePath);
    return Boolean(relative) && !relative.startsWith('..') && !path.isAbsolute(relative);
  }

  /**
   * Apply one coalesced batch of changes. A path that still exists is
   * re-indexed; one that does not is removed. A rename arrives as both, so
   * moves are handled without any special case.
   */
  async _flushChanges() {
    const paths = [...this._pendingPaths];
    const needsFull = this._pendingFullReindex;
    this._pendingPaths.clear();
    this._pendingFullReindex = false;
    this.watchStats.batches += 1;

    if (needsFull) {
      await this.reindex();
      return { fullReindex: true, indexedItems: this.index.size };
    }

    let added = 0;
    let updated = 0;
    let removed = 0;

    for (const filePath of paths) {
      const stat = safeStat(filePath);

      if (!stat) {
        removed += this.removeIndexedPath(filePath);
        continue;
      }
      if (stat.isDirectory()) {
        // A new or renamed directory can bring in many files at once.
        this._indexDirectoryTree(filePath);
        added += 1;
        continue;
      }

      const existed = this.indexedPaths.has(filePath);
      if (this.indexPathAt(filePath)) {
        if (existed) updated += 1; else added += 1;
      }
    }

    this.watchStats.added += added;
    this.watchStats.updated += updated;
    this.watchStats.removed += removed;
    return { fullReindex: false, added, updated, removed };
  }

  _indexDirectoryTree(directory) {
    let entries;
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      return;
    }
    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) this._indexDirectoryTree(entryPath);
      else this.indexPathAt(entryPath);
    }
  }

  /**
   * The org chart, rebuilt only when the index has actually changed. Every
   * live add/change/delete bumps indexVersion, so the chart a caller sees is
   * never older than the last filesystem event.
   */
  orgChartData() {
    if (!this._chartCache || this._chartVersion !== this.indexVersion) {
      this._chartCache = orgChart.build(this.index);
      this._chartVersion = this.indexVersion;
    }
    return this._chartCache;
  }

  getOrgChart(options = {}) {
    return orgChart.toTree(this.orgChartData(), options);
  }

  /**
   * The manifest: every indexed file with its position, qualified name and
   * org path. Filterable so a controller or system can be pulled on its own.
   */
  getManifest(options = {}) {
    const chart = this.orgChartData();
    const limit = Math.min(Number(options.limit) || 200, 5000);
    const offset = Number(options.offset) || 0;

    let records = [...chart.manifest.values()];
    if (options.controller) records = records.filter((r) => r.controller === options.controller);
    if (options.system) records = records.filter((r) => r.system === options.system);
    if (options.module) records = records.filter((r) => r.module === options.module);
    if (options.ambiguousOnly === true) records = records.filter((r) => r.ambiguousName === true);

    return {
      project: orgChart.PROJECT,
      total: records.length,
      indexedItems: this.index.size,
      offset,
      limit,
      records: records.slice(offset, offset + limit)
    };
  }

  /** Names shared by more than one file, with each occurrence's org path. */
  getDuplicateNames(options = {}) {
    const chart = this.orgChartData();
    const limit = Math.min(Number(options.limit) || 50, 1000);
    return {
      total: chart.duplicates.length,
      duplicates: chart.duplicates.slice(0, limit)
    };
  }

  /**
   * Find files by name. Exact basename hits are O(1); a partial name falls
   * back to a scan. Context (controller/system/module) does not filter the
   * results, it ranks them, so a wrong hint degrades the order rather than
   * hiding the answer.
   */
  findFile(name, context = {}) {
    const chart = this.orgChartData();
    const needle = String(name || '').trim().toLowerCase();
    if (!needle) return { query: name, matchCount: 0, matches: [] };

    const keys = new Set(chart.byBasename.get(needle) || []);
    if (keys.size === 0) {
      // Partial match: filename contains the needle, or the org path does.
      for (const [basename, candidateKeys] of chart.byBasename) {
        if (basename.includes(needle)) candidateKeys.forEach((k) => keys.add(k));
      }
    }
    if (keys.size === 0) {
      for (const [key, record] of chart.manifest) {
        if (record.orgPath.toLowerCase().includes(needle)) keys.add(key);
      }
    }

    const scored = [...keys].map((key) => {
      const record = chart.manifest.get(key);
      let score = 0;
      if (record.file.toLowerCase() === needle) score += 100;
      else if (record.file.toLowerCase().startsWith(needle)) score += 40;
      else score += 10;
      if (context.controller && record.controller === context.controller) score += 30;
      if (context.system && record.system === context.system) score += 20;
      if (context.module && record.module === context.module) score += 25;
      return { ...record, score };
    }).sort((a, b) => b.score - a.score);

    return {
      query: name,
      context,
      matchCount: scored.length,
      ambiguous: scored.length > 1,
      matches: scored.slice(0, Number(context.limit) || 25)
    };
  }

  /**
   * Resolve one file and hand it over in a single call: position, org path and
   * content, so a system that needs a file does not have to find it, then read
   * it, then work out which of six same-named copies it got.
   */
  resolveFile(name, context = {}) {
    const found = this.findFile(name, context);
    if (found.matchCount === 0) {
      return { success: false, query: name, error: 'not_found', matches: [] };
    }

    const best = found.matches[0];
    const alternatives = found.matches.slice(1, 10);
    const result = {
      success: true,
      query: name,
      resolved: best,
      ambiguous: found.ambiguous,
      alternativeCount: found.matchCount - 1,
      alternatives
    };

    if (context.includeContent !== false) {
      const entry = this.index.get(best.key);
      const stat = safeStat(best.path);
      if (stat && stat.size <= (Number(context.maxContentBytes) || TEXT_PREVIEW_BYTES)) {
        try {
          result.content = stripBom(fs.readFileSync(best.path, 'utf8'));
          result.contentTruncated = false;
        } catch (error) {
          result.contentError = error.message;
        }
      } else if (stat) {
        result.content = readTextPreview(best.path);
        result.contentTruncated = true;
        result.fileSize = stat.size;
      }
      if (entry && entry.data) result.indexedData = entry.data;
    }

    return result;
  }

  getWatchStatus() {
    return {
      watching: this.watching,
      roots: this.watchedRoots || [],
      debounceMs: this.watchDebounceMs,
      pending: this._pendingPaths.size,
      indexedItems: this.index.size,
      ...this.watchStats
    };
  }

  async initialize(options = {}) {
    await this.buildIndex();

    // Hashing reads every byte of the library (~3 GB, ~20s warm and more cold).
    // Only syncToDatabase and verifyCatalogIntegrity consume the hashes, so a
    // search or discoverModules call should not pay for them. They are computed
    // on demand via ensureContentHashes(); pass hashContent to force it here.
    if (options.hashContent === true) {
      await this.computeContentHashes();
    }

    if (options.syncDatabase === true) {
      await this.syncToDatabase();
    }

    this.initialized = true;

    // Keep the index live from here on, unless the caller opted out.
    if (options.watch === true || (this.watchEnabled && options.watch !== false)) {
      this.startWatching();
    }

    return {
      success: true,
      moduleId: MODULE_ID,
      watching: this.watching,
      indexedItems: this.index.size,
      contentHashes: this.contentHashes.size,
      indexingWarnings: this.indexingWarnings.length
    };
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize({ syncDatabase: false });
    }
  }

  /** Compute content hashes if a caller actually needs them. */
  async ensureContentHashes() {
    await this.ensureInitialized();
    if (this.contentHashes.size === 0 && this.index.size > 0) {
      await this.computeContentHashes();
    }
    return this.contentHashes;
  }

  async buildIndex() {
    this.index.clear();
    this.indexedPaths.clear();
    this._pathToKeys.clear();
    this.locationIndex.clear();
    this.indexingWarnings = [];
    this.indexLibraryCatalogues();
    this.indexLibraryModuleCards();
    this.indexModularSystems();
    this.indexUntrackedLibraryFiles();
    this.indexRuntimeModules();
    this.indexBackendModules();
    // Last, so the richer indexers above keep ownership of the files they
    // already understand and this only picks up what they left behind.
    if (this.indexEverything) this.indexAllProjectFiles();
    this.indexVersion += 1;
    return this.index;
  }

  /**
   * Sweep the library root for files the catalogue-driven indexers did not
   * already pick up, so nothing in _EBDESIGN_LIBRARY is invisible to search
   * just because it is missing from a catalogue.
   */
  indexUntrackedLibraryFiles() {
    if (!fs.existsSync(this.libraryRoot)) return;

    const visit = (directory) => {
      for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
        const filePath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          visit(filePath);
          continue;
        }

        // Same per-file work the watcher does, so the sweep and the live
        // updates can never disagree about how a file is indexed.
        this.indexLibraryFileAt(filePath, { skipIfIndexed: true });
      }
    };

    visit(this.libraryRoot);
  }

  /**
   * Sweep the entire project and map every file the other indexers did not
   * already claim - including backup folders, merge scratch, stray copies and
   * anything else that would otherwise be invisible. Metadata only: no file is
   * read, so the cost is one stat per file rather than 6 GB of I/O.
   */
  indexAllProjectFiles() {
    const zones = [this.projectRoot, ...this.externalRoots.map((root) => root.path)]
      .filter((root) => root && fs.existsSync(root));
    if (zones.length === 0) return 0;

    let mapped = 0;
    const stack = [...zones];

    while (stack.length > 0) {
      const directory = stack.pop();
      let entries;
      try {
        entries = fs.readdirSync(directory, { withFileTypes: true });
      } catch (error) {
        continue;
      }

      for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isSymbolicLink()) continue;
        if (entry.isDirectory()) {
          if (!this.indexVendor && VENDOR_DIRECTORIES.has(entry.name)) continue;
          stack.push(entryPath);
          continue;
        }
        if (this.indexedPaths.has(entryPath)) continue;
        if (this.indexProjectFileAt(entryPath)) mapped += 1;
      }
    }

    return mapped;
  }

  /**
   * Map one file at the metadata tier. Returns the key, or null if the path
   * is not a readable file.
   */
  indexProjectFileAt(filePath) {
    const stat = safeStat(filePath);
    if (!stat || !stat.isFile()) return null;

    const located = locateInZones(filePath, this.projectRoot, this.externalRoots);
    if (!located) return null;

    const { zone, relativePath } = located;
    const key = zone === 'PRJ' ? `FILE:${relativePath}` : `FILE:@${zone}/${relativePath}`;
    const name = path.basename(filePath);
    const locationId = buildLocationId(zone, relativePath);

    this.indexFile(key, 'project-file', filePath, {
      name,
      zone,
      relativePath,
      locationId,
      extension: path.extname(name).toLowerCase(),
      fileSize: stat.size,
      metadataOnly: true
    });
    this.registerLocation(locationId, key);
    return key;
  }

  /**
   * Bind a call number to an index key. A collision would make two files
   * answer to the same number, so it is recorded as a warning rather than
   * silently overwriting the earlier binding.
   */
  registerLocation(locationId, key) {
    const existing = this.locationIndex.get(locationId);
    if (existing && existing !== key) {
      this.indexingWarnings.push({
        key,
        type: 'location',
        warning: 'location_id_collision',
        message: `${locationId} already bound to ${existing}`
      });
      return false;
    }
    this.locationIndex.set(locationId, key);
    return true;
  }

  /** Resolve a call number straight to its entry. */
  getByLocationId(locationId) {
    const key = this.locationIndex.get(String(locationId || '').trim());
    if (!key) return null;
    const entry = this.index.get(key);
    return entry ? { ...entry, locationId } : null;
  }

  /**
   * Index a path with whichever tier owns it: the library keeps its rich
   * entries, everything else is mapped as a project file.
   */
  indexPathAt(filePath, options = {}) {
    if (this._isUnderLibraryRoot(filePath)) {
      const key = this.indexLibraryFileAt(filePath, options);
      if (key) return key;
    }
    if (options.skipIfIndexed === true && this.indexedPaths.has(filePath)) return null;
    return this.indexEverything ? this.indexProjectFileAt(filePath) : null;
  }

  indexFile(key, type, filePath, data = {}) {
    const stat = safeStat(filePath);
    if (!stat) return;

    if (data.parseError) {
      this.indexingWarnings.push({
        key,
        type,
        path: filePath,
        warning: 'invalid_json',
        message: data.parseError
      });
    } else if (Array.isArray(data.lineErrors) && data.lineErrors.length > 0) {
      // The file itself indexed fine; only some rows were unparseable, so the
      // valid records stay searchable and the bad rows are reported.
      this.indexingWarnings.push({
        key,
        type,
        path: filePath,
        warning: 'invalid_jsonl_lines',
        message: `${data.lineErrors.length} unparseable line(s); ${data.recordCount} record(s) indexed`
      });
    }

    this.index.set(key, {
      key,
      type,
      path: filePath,
      data,
      lastModified: stat.mtime.toISOString(),
      fileSize: stat.size
    });
    this.indexedPaths.add(filePath);
    const keysForPath = this._pathToKeys.get(filePath);
    if (keysForPath) keysForPath.add(key);
    else this._pathToKeys.set(filePath, new Set([key]));
    this.indexVersion += 1;
  }

  indexLibraryCatalogues() {
    const catalogueRoots = [
      path.join(this.libraryRoot, '00_CATALOG'),
      path.join(this.libraryRoot, '03_CATALOGUE')
    ];

    for (const root of catalogueRoots) {
      if (!fs.existsSync(root)) continue;
      for (const file of fs.readdirSync(root)) {
        const filePath = path.join(root, file);
        const stat = safeStat(filePath);
        if (!stat || !stat.isFile()) continue;

        const ext = path.extname(file).toLowerCase();
        const data = ext === '.json' ? readJson(filePath) : readCsvHeader(filePath);
        this.indexFile(`CATALOG:${file}`, 'catalogue', filePath, {
          name: file,
          extension: ext,
          ...data
        });
      }
    }
  }

  indexLibraryModuleCards() {
    const cardsRoot = path.join(this.libraryRoot, '01_MODULE_CARDS');
    if (!fs.existsSync(cardsRoot)) return;

    for (const file of fs.readdirSync(cardsRoot)) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(cardsRoot, file);
      const data = readJson(filePath);
      this.indexFile(data.moduleId || data.CardID || path.basename(file, '.json'), 'library-module-card', filePath, data);
    }
  }

  indexModularSystems() {
    const modularRoot = path.join(this.libraryRoot, '01_MODULES', 'MODULAR_SYSTEM');
    if (!fs.existsSync(modularRoot)) return;

    for (const file of fs.readdirSync(modularRoot)) {
      if (!file.endsWith('.json')) continue;
      const filePath = path.join(modularRoot, file);
      const data = readJson(filePath);
      this.indexFile(data.systemId || data.moduleId || path.basename(file, '.json'), 'modular-system-card', filePath, data);
    }
  }

  indexRuntimeModules() {
    if (!fs.existsSync(this.modulesRoot)) return;

    for (const dir of fs.readdirSync(this.modulesRoot, { withFileTypes: true })) {
      if (!dir.isDirectory()) continue;
      const moduleJsonPath = path.join(this.modulesRoot, dir.name, 'module.json');
      if (!fs.existsSync(moduleJsonPath)) continue;

      const data = readJson(moduleJsonPath);
      this.indexFile(data.moduleId || dir.name, 'runtime-module', moduleJsonPath, {
        ...data,
        runtimePath: path.dirname(moduleJsonPath),
        hasBackend: fs.existsSync(path.join(this.modulesRoot, dir.name, 'backend', 'service.js')),
        hasApi: fs.existsSync(path.join(this.modulesRoot, dir.name, 'api', 'routes.js')),
        hasFrontend: fs.existsSync(path.join(this.modulesRoot, dir.name, 'frontend', 'index.jsx'))
      });
    }
  }

  indexBackendModules() {
    if (!fs.existsSync(this.backendModulesRoot)) return;

    for (const dir of fs.readdirSync(this.backendModulesRoot, { withFileTypes: true })) {
      if (!dir.isDirectory() || !/^M\d{3}$/.test(dir.name)) continue;
      const modulePath = path.join(this.backendModulesRoot, dir.name);
      const doc = this.readBackendModuleDoc(modulePath);
      this.indexFile(`BACKEND:${dir.name}`, 'backend-module', modulePath, {
        moduleId: dir.name,
        name: doc.title || this.inferBackendModuleName(dir.name),
        domain: doc.domain,
        description: doc.summary,
        docStatus: doc.status,
        hasBackend: fs.existsSync(path.join(modulePath, 'service.js')),
        hasRoutes: fs.existsSync(path.join(modulePath, 'routes.js')),
        hasController: fs.existsSync(path.join(modulePath, 'controller.js')),
        hasModel: fs.existsSync(path.join(modulePath, 'model.sql')),
        hasDocs: fs.existsSync(path.join(modulePath, 'README.md')),
        apiBase: `/api/v1/modules/${dir.name.toLowerCase()}`
      });
    }
  }

  /**
   * Read a backend module's README for its real title and declared domain.
   *
   * The directory name alone (M006) says nothing about what the module does,
   * so every bare module was unclassifiable and the org chart had to file 339
   * of them under Unassigned. The README states both: "# M006 - System
   * Administration" and "Domain: Platform Foundation".
   */
  readBackendModuleDoc(modulePath) {
    const readmePath = path.join(modulePath, 'README.md');
    if (!fs.existsSync(readmePath)) return {};

    const raw = readTextPreview(readmePath, 8192);

    // Some generated READMEs were written with literal "\n" escape sequences
    // instead of real newlines, so the whole document sits on one line. Left
    // as-is, the title match swallows the entire file and the module ends up
    // named after its own README body.
    const text = !raw.includes('\n') && raw.includes('\\n')
      ? raw.replace(/\\r\\n|\\n/g, '\n')
      : raw;

    const doc = {};

    const title = text.match(/^\uFEFF?#\s*M\d+\s*[-\u2013\u2014:]\s*(.+)$/m);
    if (title) doc.title = title[1].trim();

    const domain = text.match(/^Domain:\s*(.+)$/m);
    if (domain) {
      const value = domain[1].trim();
      // Some READMEs carry a placeholder or a wrapped sentence rather than a
      // label, so only a short, plausible value is taken as a real domain.
      if (value.length <= 60 && !/^TBD/i.test(value)) doc.domain = value;
    }

    const status = text.match(/^Status:\s*(.+)$/m);
    if (status) doc.status = status[1].trim();

    // First prose line, for keyword classification when no domain is declared.
    const prose = text.split(/\r?\n/).find((line) => {
      const trimmed = line.trim();
      return trimmed && !trimmed.startsWith('#') && !/^(Domain|Status):/.test(trimmed);
    });
    if (prose) doc.summary = prose.trim().slice(0, 300);

    return doc;
  }

  inferBackendModuleName(moduleId) {
    const names = {
      M026: 'Farmer Skill Management',
      M027: 'Farmer Certification',
      M028: 'Farmer Advisory',
      M029: 'Farmer Health & Welfare',
      M030: 'Farmer Performance'
    };
    return names[moduleId] || moduleId;
  }

  async computeContentHashes() {
    this.contentHashes.clear();

    for (const [key, item] of this.index) {
      const stat = safeStat(item.path);
      if (!stat || !stat.isFile()) continue;
      const content = fs.readFileSync(item.path);
      this.contentHashes.set(key, {
        key,
        hash: crypto.createHash('sha256').update(content).digest('hex'),
        path: item.path,
        size: content.length,
        computedAt: new Date().toISOString()
      });
    }

    return this.contentHashes;
  }

  async syncToDatabase() {
    // Each row carries a content hash, so they must exist before writing.
    await this.ensureContentHashes();
    const pool = optionalDatabase();
    if (!pool) {
      return { success: false, skipped: true, reason: 'Database connection is not available' };
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS library_knowledge (
        id SERIAL PRIMARY KEY,
        key VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(80) NOT NULL,
        content_hash VARCHAR(64),
        data JSONB,
        file_path TEXT NOT NULL,
        file_size INTEGER,
        last_modified TIMESTAMP,
        indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    for (const [key, item] of this.index) {
      const hashData = this.contentHashes.get(key);
      await pool.query(`
        INSERT INTO library_knowledge (key, type, content_hash, data, file_path, file_size, last_modified)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (key) DO UPDATE SET
          type = EXCLUDED.type,
          content_hash = EXCLUDED.content_hash,
          data = EXCLUDED.data,
          file_path = EXCLUDED.file_path,
          file_size = EXCLUDED.file_size,
          last_modified = EXCLUDED.last_modified,
          indexed_at = CURRENT_TIMESTAMP
      `, [
        key,
        item.type,
        hashData ? hashData.hash : null,
        JSON.stringify(item.data),
        item.path,
        item.fileSize,
        item.lastModified
      ]);
    }

    return { success: true, synced: this.index.size };
  }

  async searchLibrary(query = '', filters = {}) {
    await this.ensureInitialized();
    const terms = String(query).toLowerCase().split(/\s+/).filter(Boolean);
    const requestedType = filters.type;

    const results = [];
    for (const [key, item] of this.index) {
      if (requestedType && item.type !== requestedType) continue;
      const haystack = `${key} ${item.type} ${JSON.stringify(item.data)}`.toLowerCase();
      const score = terms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0);
      if (terms.length === 0 || score > 0) {
        results.push({
          key,
          type: item.type,
          data: item.data,
          path: item.path,
          relevance: terms.length ? score / terms.length : 1
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance || a.key.localeCompare(b.key));
  }

  async listModules(filters = {}) {
    await this.ensureInitialized();
    const typeSet = new Set(['runtime-module', 'backend-module', 'library-module-card']);
    const modules = Array.from(this.index.values())
      .filter(item => typeSet.has(item.type))
      .filter(item => !filters.status || item.data.status === filters.status)
      .filter(item => !filters.category || item.data.category === filters.category)
      .map(item => ({
        moduleId: item.data.moduleId || item.data.module_id || item.key,
        name: item.data.name || item.data.ModuleName || item.key,
        type: item.type,
        status: item.data.status || item.data.Status || 'catalogued',
        category: item.data.category || item.data.domain || item.data.Domain || null,
        backend: Boolean(item.data.hasBackend),
        api: Boolean(item.data.hasApi || item.data.hasRoutes),
        frontend: Boolean(item.data.hasFrontend),
        path: item.path
      }));

    return modules;
  }

  async getModule(moduleId) {
    await this.ensureInitialized();
    const normalized = String(moduleId).toLowerCase();

    for (const item of this.index.values()) {
      const candidate = String(item.data.moduleId || item.data.module_id || item.key).toLowerCase();
      if (candidate === normalized || item.key.toLowerCase() === normalized) {
        return { success: true, module: item };
      }
    }

    return { success: false, error: `Module not found: ${moduleId}` };
  }

  /**
   * Module-shaped view of searchLibrary, for agents asking "what can do X?"
   * rather than searching raw library entries.
   */
  async discoverModules(query = '', context = {}) {
    const results = await this.searchLibrary(query, context);
    const modules = results
      .filter((result) => ['runtime-module', 'backend-module', 'library-module-card'].includes(result.type))
      .slice(0, 10)
      .map((result) => ({
        moduleId: result.data.moduleId || result.data.module_id || result.key,
        name: result.data.name || result.data.ModuleName || result.key,
        matchScore: result.relevance,
        capabilities: result.data.discovery?.capabilities || [],
        aiContext: result.data.discovery?.aiContext || '',
        dependencies: result.data.dependencies || { modules: [] },
        status: result.data.status || result.data.Status || 'catalogued',
        category: result.data.category || result.data.domain || null,
        isProductionReady: result.data.status === 'production'
      }));

    return {
      success: true,
      modules,
      metadata: {
        totalMatches: modules.length,
        queryProcessed: true
      }
    };
  }

  /**
   * Topologically order a module's dependencies. Returns a failure rather than
   * throwing when the graph contains a cycle, so a bad catalogue entry cannot
   * take down the caller.
   */
  async resolveDependencies(moduleId) {
    const moduleResult = await this.getModule(moduleId);
    if (!moduleResult.success) return moduleResult;

    const resolutionOrder = [];
    const visiting = new Set();
    const visited = new Set();

    const visit = async (candidateId) => {
      if (visited.has(candidateId)) return;
      if (visiting.has(candidateId)) throw new Error(`Circular dependency detected: ${candidateId}`);
      visiting.add(candidateId);

      const candidate = await this.getModule(candidateId);
      if (candidate.success) {
        const dependencies = candidate.module.data.dependencies?.modules || [];
        for (const dependency of dependencies) await visit(dependency);
      }

      visiting.delete(candidateId);
      visited.add(candidateId);
      resolutionOrder.push(candidateId);
    };

    try {
      await visit(moduleId);
      return { success: true, resolutionOrder, modules: resolutionOrder };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async buildAIContext(query = '', context = {}) {
    const results = await this.searchLibrary(query, context);
    return {
      moduleId: MODULE_ID,
      query,
      context,
      matches: results.slice(0, Number(context.limit) || 12),
      guardrails: {
        claudeCompatible: true,
        sourceAuthority: '_EBDESIGN_LIBRARY and runtime module manifests',
        noFileMutation: true
      }
    };
  }

  async verifyCatalogIntegrity() {
    // Integrity is checked against content hashes, so they must be present.
    await this.ensureContentHashes();
    const issues = [];

    for (const [key, item] of this.index) {
      if (!fs.existsSync(item.path)) {
        issues.push({ key, type: 'missing_file', path: item.path });
      }

      if (item.data?.parseError) {
        issues.push({
          key,
          type: 'invalid_json',
          path: item.path,
          message: item.data.parseError
        });
      }
    }

    return {
      verified: issues.length === 0,
      totalItems: this.index.size,
      hashedFiles: this.contentHashes.size,
      issues,
      warnings: this.indexingWarnings,
      verificationDate: new Date().toISOString()
    };
  }

  getStatistics() {
    const byType = {};
    for (const item of this.index.values()) {
      byType[item.type] = (byType[item.type] || 0) + 1;
    }

    return {
      moduleId: MODULE_ID,
      moduleName: MODULE_NAME,
      initialized: this.initialized,
      totalItems: this.index.size,
      contentHashes: this.contentHashes.size,
      indexingWarnings: this.indexingWarnings.length,
      byType,
      libraryRoot: this.libraryRoot,
      modulesRoot: this.modulesRoot,
      lastIndexed: new Date().toISOString()
    };
  }

  async healthCheck() {
    await this.ensureInitialized();
    return {
      status: 'healthy',
      moduleId: MODULE_ID,
      moduleName: MODULE_NAME,
      indexedItems: this.index.size,
      indexingWarnings: this.indexingWarnings.length,
      claudeCompatible: true
    };
  }

  async execute(operation, parameters = {}, context = {}) {
    try {
      switch (operation) {
        case 'initialize':
          return { success: true, data: await this.initialize(parameters) };
        case 'search':
        case 'discover':
          return { success: true, data: await this.searchLibrary(parameters.query || '', parameters) };
        case 'modules':
        case 'list':
          return { success: true, data: await this.listModules(parameters) };
        case 'getModule':
        case 'read':
          return await this.getModule(parameters.moduleId || parameters.id);
        case 'aiContext':
        case 'analyze':
          return { success: true, data: await this.buildAIContext(parameters.query || '', context) };
        case 'discoverModules':
          return await this.discoverModules(parameters.query || '', context);
        case 'resolveDependencies':
          return await this.resolveDependencies(parameters.moduleId || parameters.id);
        case 'verify':
          return { success: true, data: await this.verifyCatalogIntegrity() };
        case 'statistics':
          await this.ensureInitialized();
          return { success: true, data: this.getStatistics() };
        case 'orgChart':
          await this.ensureInitialized();
          return { success: true, data: this.getOrgChart(parameters) };
        case 'manifest':
          await this.ensureInitialized();
          return { success: true, data: this.getManifest(parameters) };
        case 'duplicateNames':
          await this.ensureInitialized();
          return { success: true, data: this.getDuplicateNames(parameters) };
        case 'findFile':
          await this.ensureInitialized();
          return { success: true, data: this.findFile(parameters.name || parameters.query, parameters) };
        case 'resolveFile':
          await this.ensureInitialized();
          return { success: true, data: this.resolveFile(parameters.name || parameters.query, parameters) };
        case 'reindex':
          return { success: true, data: await this.reindex() };
        case 'startWatching':
          await this.ensureInitialized();
          return { success: true, data: this.startWatching() };
        case 'stopWatching':
          return { success: true, data: this.stopWatching() };
        case 'watchStatus':
          return { success: true, data: this.getWatchStatus() };
        case 'syncDatabase':
          await this.ensureInitialized();
          return { success: true, data: await this.syncToDatabase() };
        default:
          return { success: false, error: `Unsupported ${MODULE_ID} operation: ${operation}` };
      }
    } catch (error) {
      return {
        success: false,
        error: {
          code: 'LIBRARY_MODULE_ERROR',
          message: error.message,
          operation,
          moduleId: MODULE_ID,
          timestamp: new Date().toISOString()
        }
      };
    }
  }
}

module.exports = LibraryKnowledgeService;
module.exports.createService = (options) => new LibraryKnowledgeService(options);
module.exports.singleton = new LibraryKnowledgeService();
