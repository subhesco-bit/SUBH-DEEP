const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'backend', 'src');
const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-6b-email-transport-discovery'
);

const EXTENSIONS = new Set([
  '.js',
  '.cjs',
  '.mjs',
  '.ts'
]);

const DEFINITIVE_PATTERNS = [
  ['nodemailer', /\bnodemailer\b/gi],
  ['createTransport', /\bcreateTransport\s*\(/g],
  ['sendMail', /\bsendMail\s*\(/g],
  ['sendEmail', /\bsendEmail\s*\(/g],
  ['deliverEmail', /\bdeliverEmail\s*\(/g],
  ['smtp-env', /\bSMTP_[A-Z0-9_]+\b/g],
  ['smtp-url', /\bsmtp(?:s)?:\/\//gi],
  ['sendgrid-package', /@sendgrid\/mail/gi],
  ['sendgrid-key', /\bSENDGRID_API_KEY\b/g],
  ['aws-ses', /\b(?:SESClient|SendEmailCommand|AWS\.SES)\b/g],
  ['resend-package', /\b(?:new\s+Resend|from\s+['"]resend['"]|require\(['"]resend['"]\))/gi],
  ['mailgun', /\b(?:mailgun|MAILGUN_API_KEY)\b/gi],
  ['postmark', /\b(?:postmark|POSTMARK_SERVER_TOKEN)\b/gi],
  ['mailer-symbol', /\b(?:mailer|emailTransport|mailTransport|emailClient)\b/gi]
];

function walk(dir, result = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === '.git' ||
        entry.name === 'coverage' ||
        entry.name === '.audit'
      ) {
        continue;
      }

      walk(full, result);
      continue;
    }

    if (
      entry.isFile() &&
      EXTENSIONS.has(path.extname(entry.name).toLowerCase())
    ) {
      result.push(full);
    }
  }

  return result;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function lineNumber(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function getLine(text, n) {
  return text.split(/\r?\n/)[n - 1] || '';
}

function getContext(text, n, radius = 2) {
  const lines = text.split(/\r?\n/);
  const start = Math.max(0, n - 1 - radius);
  const end = Math.min(lines.length, n + radius);

  return lines
    .slice(start, end)
    .map((line, i) =>
      `${String(start + i + 1).padStart(5)}: ${line}`
    )
    .join('\n');
}

function scanFile(file, text) {
  const hits = [];

  for (const [name, regex] of DEFINITIVE_PATTERNS) {
    regex.lastIndex = 0;

    let match;

    while ((match = regex.exec(text)) !== null) {
      const line = lineNumber(text, match.index);

      hits.push({
        type: name,
        line,
        source: getLine(text, line).trim()
      });

      if (regex.lastIndex === match.index) {
        regex.lastIndex++;
      }
    }
  }

  return hits;
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log('');
  console.log('============================================================');
  console.log(' PHASE 13S-6B - EMAIL TRANSPORT DISCOVERY');
  console.log('============================================================');

  if (!fs.existsSync(SRC)) {
    throw new Error('backend/src does not exist');
  }

  const files = walk(SRC);
  const findings = [];

  for (const file of files) {
    let text;

    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const hits = scanFile(file, text);

    if (hits.length) {
      findings.push({
        file: rel(file),
        hits
      });
    }
  }

  findings.sort((a, b) =>
    b.hits.length - a.hits.length ||
    a.file.localeCompare(b.file)
  );

  console.log(`Backend source files scanned         : ${files.length}`);
  console.log(`Files with email evidence            : ${findings.length}`);

  console.log('');
  console.log('[TOP REAL EMAIL TRANSPORT CANDIDATES]');

  if (!findings.length) {
    console.log('NO EMAIL TRANSPORT EVIDENCE FOUND');
  }

  for (const candidate of findings.slice(0, 40)) {
    console.log('');
    console.log(
      `${candidate.file}  hits=${candidate.hits.length}`
    );

    for (const hit of candidate.hits.slice(0, 20)) {
      console.log(
        `  L${hit.line} [${hit.type}] ${hit.source}`
      );
    }
  }

  const stripePath = path.join(
    SRC,
    'integrations',
    'stripeIntegrationComplete.js'
  );

  console.log('');
  console.log('============================================================');
  console.log(' STRIPE EMAIL CONTRACT');
  console.log('============================================================');

  if (!fs.existsSync(stripePath)) {
    console.log('STRIPE INTEGRATION FILE MISSING');
  }

  if (fs.existsSync(stripePath)) {
    const text = fs.readFileSync(stripePath, 'utf8');

    const matches = [
      ...text.matchAll(
        /\b(?:emailService|sendEmail)\b/g
      )
    ];

    const lines = [
      ...new Set(
        matches.map(m => lineNumber(text, m.index))
      )
    ];

    for (const line of lines) {
      console.log('');
      console.log(getContext(text, line, 5));
    }
  }

  const notificationPath = path.join(
    SRC,
    'services',
    'notificationService.js'
  );

  console.log('');
  console.log('============================================================');
  console.log(' NOTIFICATION SERVICE EMAIL CONTRACT');
  console.log('============================================================');

  if (fs.existsSync(notificationPath)) {
    const text = fs.readFileSync(notificationPath, 'utf8');

    const matches = [
      ...text.matchAll(
        /\b(?:deliverEmail|sendMail|sendEmail|nodemailer|createTransport)\b/g
      )
    ];

    const lines = [
      ...new Set(
        matches.map(m => lineNumber(text, m.index))
      )
    ];

    for (const line of lines) {
      console.log('');
      console.log(getContext(text, line, 5));
    }
  }

  /*
   * Inspect package dependencies independently.
   */
  const packages = [
    path.join(ROOT, 'backend', 'package.json'),
    path.join(ROOT, 'package.json')
  ];

  console.log('');
  console.log('============================================================');
  console.log(' EMAIL-RELATED PACKAGE DEPENDENCIES');
  console.log('============================================================');

  const dependencyEvidence = [];

  for (const pkg of packages) {
    if (!fs.existsSync(pkg)) continue;

    let json;

    try {
      json = JSON.parse(fs.readFileSync(pkg, 'utf8'));
    } catch {
      continue;
    }

    const deps = {
      ...(json.dependencies || {}),
      ...(json.devDependencies || {}),
      ...(json.optionalDependencies || {})
    };

    const mailDeps = Object.entries(deps)
      .filter(([name]) =>
        /nodemailer|sendgrid|resend|mailgun|postmark|aws-sdk|client-ses|smtp|mailer/i.test(name)
      );

    if (!mailDeps.length) continue;

    console.log('');
    console.log(rel(pkg));

    for (const [name, version] of mailDeps) {
      console.log(`  ${name}: ${version}`);

      dependencyEvidence.push({
        packageFile: rel(pkg),
        name,
        version
      });
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    filesScanned: files.length,
    findings,
    dependencyEvidence
  };

  const reportPath = path.join(
    OUT,
    'email-transport-discovery.json'
  );

  fs.writeFileSync(
    reportPath,
    JSON.stringify(report, null, 2),
    'utf8'
  );

  console.log('');
  console.log('============================================================');
  console.log(' EMAIL DISCOVERY COMPLETE');
  console.log('============================================================');
  console.log('APPLICATION SOURCE MODIFIED          : NO');
  console.log(`Evidence                             : ${reportPath}`);
}

try {
  main();
  process.exitCode = 0;
} catch (err) {
  console.error('');
  console.error('EMAIL DISCOVERY FAILED');
  console.error(err.stack || err.message || String(err));
  console.error('APPLICATION SOURCE MODIFIED          : NO');
  process.exitCode = 1;
}
