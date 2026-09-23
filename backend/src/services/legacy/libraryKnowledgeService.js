/**
 * Enhanced Library Knowledge Service with AI Integration
 * Complete catalog system with content hashing and AI search
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getPostgreSQL } = require('../../database/connection');

class LibraryKnowledgeService {
  constructor() {
    this.libraryRoot = path.join(__dirname, '../../../../_EBDESIGN_LIBRARY');
    this.catalogPath = path.join(this.libraryRoot, '00_CATALOG');
    this.modulesPath = path.join(this.libraryRoot, '01_MODULES');
    // The real, substantial library in this repository: modules/ — one package
    // per module, each with a module.json manifest and backend code. The card
    // directories above have never existed here (see buildIndex).
    this.modulePackagesRoot = path.join(__dirname, '../../../../modules');
    this.index = new Map();
    this.contentHashes = new Map();
    // Which sources were expected, which were found. Populated by buildIndex so
    // callers can tell "the library is empty" from "the library is missing".
    this.sources = [];
  }

  /**
   * Report what the index is actually built from.
   *
   * WHY THIS EXISTS
   *
   * buildIndex used to read four paths under _EBDESIGN_LIBRARY — 00_CATALOG,
   * 01_MODULES, 01_MODULES/Module_Cards, 01_MODULES/Component_Cards — guard
   * each with fs.existsSync, find none, and log "Indexed 0 library items"
   * without error. Verified 2026-09-23 on consolidated/final: all four are
   * absent; _EBDESIGN_LIBRARY itself holds three governance markdown files and
   * no cards. So /api/v1/library/* returned structurally valid, permanently
   * empty results, and a caller could not distinguish an empty library from a
   * missing one.
   *
   * CLAUDE.md's "524 cards" describes content that is not on disk. The 192-plus
   * packages under modules/ are the real library, and are now indexed.
   */
  getStatus() {
    const found = this.sources.filter((s) => s.found);
    const missing = this.sources.filter((s) => !s.found);
    return {
      indexed: this.index.size,
      // Empty with every source missing is a deployment problem, not an empty
      // library; say so rather than returning a bare zero.
      available: this.index.size > 0,
      reason:
        this.index.size > 0
          ? null
          : missing.length === this.sources.length
            ? 'no library source is present on disk'
            : 'library sources are present but contain no indexable items',
      sources: this.sources,
      foundCount: found.length,
      missingCount: missing.length,
    };
  }

  /**
   * Index modules/<PACKAGE>/module.json — the real library.
   *
   * Two manifest shapes exist: a rich one (moduleId, endpoints, dataModels,
   * claudeIntegration) on a handful of packages, and a lean one on the rest.
   * Both are read through optional access so the lean majority cannot throw.
   *
   * A manifest's own `status` is reported as `declaredStatus`, never as proof
   * of integration: most declare "WIRED", but modules/ is not loaded by the
   * server bootstrap — neither index.js nor bootstrap.js references
   * moduleRegistry — so that label means packaged, not mounted.
   */
  indexModulePackages() {
    const root = this.modulePackagesRoot;
    const source = { name: 'modules/', path: root, found: false, indexed: 0 };

    if (!fs.existsSync(root)) {
      this.sources.push(source);
      return;
    }
    source.found = true;

    for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const manifestPath = path.join(root, entry.name, 'module.json');
      if (!fs.existsSync(manifestPath)) continue;

      let manifest;
      try {
        manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      } catch (error) {
        // A malformed manifest is recorded, not skipped silently — an
        // unparseable module is a defect someone needs to see.
        this.index.set(`${entry.name}/module.json`, {
          type: 'module-package',
          data: { packageName: entry.name, parseError: error.message },
          path: manifestPath,
          lastModified: fs.statSync(manifestPath).mtime,
        });
        source.indexed += 1;
        continue;
      }

      this.index.set(`${entry.name}/module.json`, {
        type: 'module-package',
        data: {
          packageName: entry.name,
          moduleId: manifest.moduleId || entry.name,
          name: manifest.name || entry.name,
          version: manifest.version || null,
          category: manifest.category || 'uncategorised',
          description: manifest.description || null,
          // Declared, not verified — see the note above.
          declaredStatus: manifest.status || null,
          mounted: false,
          dependencies: manifest.dependencies || null,
        },
        path: manifestPath,
        lastModified: fs.statSync(manifestPath).mtime,
      });
      source.indexed += 1;
    }

    this.sources.push(source);
  }

  /**
   * Initialize library indexing
   */
  async initialize() {
    try {
      await this.buildIndex();
      await this.computeContentHashes();
      await this.syncToDatabase();
      console.log('Library Knowledge Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize library service:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive library index
   */
  async buildIndex() {
    console.log('Building library index...');

    // Index module cards
    const modulesDir = path.join(this.modulesPath, 'Module_Cards');
    if (fs.existsSync(modulesDir)) {
      const moduleFiles = fs.readdirSync(modulesDir).filter(f => f.endsWith('.md'));

      for (const file of moduleFiles) {
        const filePath = path.join(modulesDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const moduleData = this.parseModuleCard(content);

        this.index.set(file, {
          type: 'module',
          data: moduleData,
          path: filePath,
          lastModified: fs.statSync(filePath).mtime,
        });
      }
    }

    // Index component cards
    const componentsDir = path.join(this.modulesPath, 'Component_Cards');
    if (fs.existsSync(componentsDir)) {
      const componentFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.md'));

      for (const file of componentFiles) {
        const filePath = path.join(componentsDir, file);
        const content = fs.readFileSync(filePath, 'utf8');
        const componentData = this.parseComponentCard(content);

        this.index.set(file, {
          type: 'component',
          data: componentData,
          path: filePath,
          lastModified: fs.statSync(filePath).mtime,
        });
      }
    }

    // Record whether the card directories were present, so getStatus() can
    // distinguish an empty library from a missing one.
    this.sources.push({
      name: '_EBDESIGN_LIBRARY/01_MODULES/Module_Cards',
      path: modulesDir,
      found: fs.existsSync(modulesDir),
    });
    this.sources.push({
      name: '_EBDESIGN_LIBRARY/01_MODULES/Component_Cards',
      path: componentsDir,
      found: fs.existsSync(componentsDir),
    });

    // The real library.
    this.indexModulePackages();

    const status = this.getStatus();
    if (!status.available) {
      console.warn(
        `Library index is EMPTY (${status.reason}). Missing sources: ` +
          status.sources.filter((x) => !x.found).map((x) => x.name).join(', ')
      );
    } else {
      console.log(
        `Indexed ${this.index.size} library items from ` +
          `${status.foundCount}/${status.sources.length} sources`
      );
    }
  }

  /**
   * Compute SHA256 content hashes for all library files
   */
  async computeContentHashes() {
    console.log('Computing content hashes...');

    for (const [filename, item] of this.index) {
      if (!item.path || !fs.existsSync(item.path)) continue;
      const content = fs.readFileSync(item.path, 'utf8');
      const hash = crypto.createHash('sha256').update(content).digest('hex');

      this.contentHashes.set(filename, {
        hash,
        path: item.path,
        size: Buffer.byteLength(content),
        computedAt: new Date().toISOString(),
      });
    }

    console.log(`Computed ${this.contentHashes.size} content hashes`);
  }

  /**
   * Sync library data to database
   */
  async syncToDatabase() {
    try {
      const pool = await getPostgreSQL();

      // Create library_knowledge table if not exists
      await pool.query(`
        CREATE TABLE IF NOT EXISTS library_knowledge (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) UNIQUE NOT NULL,
          type VARCHAR(50) NOT NULL,
          content_hash VARCHAR(64) NOT NULL,
          data JSONB,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          last_modified TIMESTAMP,
          indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create library_content_hashes table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS library_content_hashes (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) UNIQUE NOT NULL,
          content_hash VARCHAR(64) NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          computed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Insert/update library items
      for (const [filename, item] of this.index) {
        const hashData = this.contentHashes.get(filename);

        await pool.query(`
          INSERT INTO library_knowledge (filename, type, content_hash, data, file_path, file_size, last_modified)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (filename) DO UPDATE SET
            type = EXCLUDED.type,
            content_hash = EXCLUDED.content_hash,
            data = EXCLUDED.data,
            file_path = EXCLUDED.file_path,
            file_size = EXCLUDED.file_size,
            last_modified = EXCLUDED.last_modified,
            indexed_at = CURRENT_TIMESTAMP
        `, [
          filename,
          item.type,
          hashData.hash,
          JSON.stringify(item.data),
          item.path,
          hashData.size,
          item.lastModified,
        ]);
      }

      // Insert/update content hashes
      for (const [filename, hashData] of this.contentHashes) {
        await pool.query(`
          INSERT INTO library_content_hashes (filename, content_hash, file_path, file_size, computed_at)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (filename) DO UPDATE SET
            content_hash = EXCLUDED.content_hash,
            file_path = EXCLUDED.file_path,
            file_size = EXCLUDED.file_size,
            computed_at = EXCLUDED.computed_at
        `, [
          filename,
          hashData.hash,
          hashData.path,
          hashData.size,
          hashData.computedAt,
        ]);
      }

      console.log('Library data synced to database');
    } catch (error) {
      console.error('Failed to sync to database:', error);
      throw error;
    }
  }

  /**
   * Parse module card from markdown
   */
  parseModuleCard(content) {
    const moduleData = {
      id: '',
      name: '',
      domain: '',
      status: '',
      implementation: '',
      components: [],
    };

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('# Module ID:')) {
        moduleData.id = line.replace('# Module ID:', '').trim();
      } else if (line.startsWith('# Module Name:')) {
        moduleData.name = line.replace('# Module Name:', '').trim();
      } else if (line.startsWith('# Domain:')) {
        moduleData.domain = line.replace('# Domain:', '').trim();
      } else if (line.startsWith('# Status:')) {
        moduleData.status = line.replace('# Status:', '').trim();
      } else if (line.startsWith('# Implementation:')) {
        moduleData.implementation = line.replace('# Implementation:', '').trim();
      }
    }

    return moduleData;
  }

  /**
   * Parse component card from markdown
   */
  parseComponentCard(content) {
    const componentData = {
      id: '',
      name: '',
      type: '',
      module: '',
      status: '',
    };

    const lines = content.split('\n');
    for (const line of lines) {
      if (line.startsWith('# Component ID:')) {
        componentData.id = line.replace('# Component ID:', '').trim();
      } else if (line.startsWith('# Component Name:')) {
        componentData.name = line.replace('# Component Name:', '').trim();
      } else if (line.startsWith('# Type:')) {
        componentData.type = line.replace('# Type:', '').trim();
      } else if (line.startsWith('# Module:')) {
        componentData.module = line.replace('# Module:', '').trim();
      } else if (line.startsWith('# Status:')) {
        componentData.status = line.replace('# Status:', '').trim();
      }
    }

    return componentData;
  }

  /**
   * Search library by keyword
   */
  async searchLibrary(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [filename, item] of this.index) {
      const content = JSON.stringify(item.data).toLowerCase();
      if (content.includes(lowerQuery)) {
        results.push({
          filename,
          type: item.type,
          data: item.data,
          relevance: this.calculateRelevance(content, lowerQuery),
        });
      }
    }

    return results.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * Calculate search relevance score
   */
  calculateRelevance(content, query) {
    const words = query.split(' ');
    let score = 0;

    for (const word of words) {
      const occurrences = (content.match(new RegExp(word, 'g')) || []).length;
      score += occurrences * 10;
    }

    return score;
  }

  /**
   * Get library statistics
   */
  async getStatistics() {
    const stats = {
      totalItems: this.index.size,
      modules: 0,
      components: 0,
      totalHashes: this.contentHashes.size,
      lastIndexed: new Date().toISOString(),
    };

    for (const [, item] of this.index) {
      if (item.type === 'module') stats.modules++;
      if (item.type === 'component') stats.components++;
    }

    return stats;
  }

  /**
   * Verify catalog integrity
   */
  async verifyCatalogIntegrity() {
    const issues = [];

    for (const [filename, hashData] of this.contentHashes) {
      if (!fs.existsSync(hashData.path)) {
        issues.push({
          type: 'missing_file',
          filename,
          path: hashData.path,
        });
        continue;
      }

      const currentContent = fs.readFileSync(hashData.path, 'utf8');
      const currentHash = crypto.createHash('sha256').update(currentContent).digest('hex');

      if (currentHash !== hashData.hash) {
        issues.push({
          type: 'hash_mismatch',
          filename,
          path: hashData.path,
          expected: hashData.hash,
          actual: currentHash,
        });
      }
    }

    return {
      verified: issues.length === 0,
      totalFiles: this.contentHashes.size,
      issues,
      verificationDate: new Date().toISOString(),
    };
  }
}

module.exports = new LibraryKnowledgeService();

