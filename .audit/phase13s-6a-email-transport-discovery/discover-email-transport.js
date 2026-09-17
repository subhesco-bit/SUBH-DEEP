const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const SRC = path.join(ROOT, 'backend', 'src');

const PATTERNS = [
  /nodemailer/gi,
  /createTransport\s*\(/g,
  /sendMail\s*\(/g,
  /sendEmail\s*\(/g,
  /deliverEmail\s*\(/g,
  /smtp/gi,
  /sendgrid/gi,
  /@sendgrid/gi,
  /ses/gi,
  /aws-sdk/gi,
  /resend/gi,
  /mailgun/gi,
  /postmark/gi,
  /emailClient/gi,
  /mailer/gi
];

const EXTS = new Set(['.js','.cjs','.mjs','.ts']);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);

    if (e.isDirectory()) {
      if (
        e.name === 'node_modules' ||
        e.name === '.git' ||
        e.name === 'coverage'
      ) continue;

      walk(full, out);
      continue;
    }

    if (
      e.isFile() &&
      EXTS.has(path.extname(e.name).toLowerCase())
    ) {
      out.push(full);
    }
  }

  return out;
}

function rel(file) {
  return path.relative(ROOT, file).replace(/\\/g, '/');
}

function lineNo(text, index) {
  return text.slice(0, index).split(/\r?\n/).length;
}

function lineAt(text, n) {
  return text.split(/\r?\n/)[n - 1] || '';
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  const files = walk(SRC);
  const findings = [];

  console.log('');
  console.log('============================================================');
  console.log(' PHASE 13S-6A - EMAIL TRANSPORT DISCOVERY');
  console.log('============================================================');
  console.log(`Backend files scanned                : ${files.length}`);

  for (const file of files) {
    let text;

    try {
      text = fs.readFileSync(file, 'utf8');
    } catch {
      continue;
    }

    const hits = [];

    for (const pattern of PATTERNS) {
      pattern.lastIndex = 0;
      let m;

      while ((m = pattern.exec(text)) !== null) {
        const line = lineNo(text, m.index);

        hits.push({
          pattern: pattern.toString(),
          line,
          source: lineAt(text, line).trim()
        });

        if (pattern.lastIndex === m.index) {
          pattern.lastIndex++;
        }
      }
    }

    if (hits.length) {
      findings.push({
        file: rel(file),
        hits
      });
    }
  }

  findings.sort((a,b) =>
    b.hits.length - a.hits.length ||
    a.file.localeCompare(b.file)
  );

  console.log('');
  console.log('[TOP EMAIL / MAIL TRANSPORT CANDIDATES]');

  for (const f of findings.slice(0, 40)) {
    console.log('');
    console.log(`${f.file}  hits=${f.hits.length}`);

    for (const h of f.hits.slice(0, 20)) {
      console.log(
        `  L${h.line}  ${h.source}`
      );
    }
  }

  const stripe =
    path.join(
      SRC,
      'integrations',
      'stripeIntegrationComplete.js'
    );

  console.log('');
  console.log('[STRIPE EMAIL CONTRACT]');

  if (fs.existsSync(stripe)) {
    const text = fs.readFileSync(stripe, 'utf8');

    const lines = text.split(/\r?\n/);

    lines.forEach((line, i) => {
      if (
        /emailService|sendEmail/.test(line)
      ) {
        console.log(
          `${String(i + 1).padStart(5)}: ${line}`
        );
      }
    });
  }

  const notification =
    path.join(
      SRC,
      'services',
      'notificationService.js'
    );

  console.log('');
  console.log('[NOTIFICATION EMAIL CONTRACT]');

  if (fs.existsSync(notification)) {
    const text = fs.readFileSync(notification, 'utf8');
    const lines = text.split(/\r?\n/);

    lines.forEach((line, i) => {
      if (
        /deliverEmail|sendMail|nodemailer|smtp|email/i.test(line)
      ) {
        console.log(
          `${String(i + 1).padStart(5)}: ${line}`
        );
      }
    });
  }

  const report = path.join(
    OUT,
    'email-transport-discovery.json'
  );

  fs.writeFileSync(
    report,
    JSON.stringify(findings, null, 2),
    'utf8'
  );

  console.log('');
  console.log('APPLICATION SOURCE MODIFIED          : NO');
  console.log(`Evidence                             : ${report}`);
}

try {
  main();
  process.exitCode = 0;
} catch (err) {
  console.error(err.stack || err.message || String(err));
  console.error('APPLICATION SOURCE MODIFIED          : NO');
  process.exitCode = 1;
}
