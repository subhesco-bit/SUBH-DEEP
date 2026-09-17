const fs = require('fs');
const path = require('path');
const cp = require('child_process');

const ROOT = process.cwd();
const OUT = path.join(
  ROOT,
  '.audit',
  'phase13s-6e-email-canonical-repair'
);

const EMAIL_REL =
  'backend/src/services/emailService.js';

const M010_REL =
  'backend/src/modules/M010/service.js';

const NOTIFY_REL =
  'backend/src/services/notificationService.js';

const STRIPE_REL =
  'backend/src/integrations/stripeIntegrationComplete.js';

const EMAIL = path.join(ROOT, EMAIL_REL);
const M010 = path.join(ROOT, M010_REL);
const NOTIFY = path.join(ROOT, NOTIFY_REL);
const STRIPE = path.join(ROOT, STRIPE_REL);

function fail(message) {
  throw new Error(message);
}

function git(args) {
  return cp.spawnSync(
    'git',
    args,
    {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true
    }
  );
}

function runNode(args, options = {}) {
  return cp.spawnSync(
    process.execPath,
    args,
    {
      cwd: ROOT,
      encoding: 'utf8',
      windowsHide: true,
      env: {
        ...process.env,
        ...(options.env || {})
      }
    }
  );
}

function readUtf8Preserve(file) {
  const raw = fs.readFileSync(file);
  const bom =
    raw.length >= 3 &&
    raw[0] === 0xEF &&
    raw[1] === 0xBB &&
    raw[2] === 0xBF;

  const body = bom ? raw.slice(3) : raw;

  return {
    raw,
    bom,
    text: body.toString('utf8')
  };
}

function writeUtf8Preserve(file, text, bom) {
  const body = Buffer.from(text, 'utf8');

  if (bom) {
    fs.writeFileSync(
      file,
      Buffer.concat([
        Buffer.from([0xEF,0xBB,0xBF]),
        body
      ])
    );
    return;
  }

  fs.writeFileSync(file, body);
}

function detectEol(text) {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

function countRegex(text, regex) {
  return [...text.matchAll(regex)].length;
}

function syntaxCheck(file) {
  const result = runNode(['--check', file]);

  if (result.status !== 0) {
    console.error(result.stdout || '');
    console.error(result.stderr || '');
    fail(`Node syntax failed: ${file}`);
  }
}

function lint(files) {
  const eslint = path.join(
    ROOT,
    'backend',
    'node_modules',
    'eslint',
    'bin',
    'eslint.js'
  );

  if (!fs.existsSync(eslint)) {
    fail(`Local ESLint missing: ${eslint}`);
  }

  return runNode([
    eslint,
    ...files.map(f => path.join(ROOT, f))
  ]);
}

function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log('');
  console.log(
    '============================================================'
  );
  console.log(
    ' PHASE 13S-6E - CANONICAL EMAIL TRANSPORT REPAIR'
  );
  console.log(
    '============================================================'
  );

  /*
   * ----------------------------------------------------------
   * 1. HARD PRECONDITIONS
   * ----------------------------------------------------------
   */

  for (const file of [M010, NOTIFY, STRIPE]) {
    if (!fs.existsSync(file)) {
      fail(`Required file missing: ${file}`);
    }
  }

  if (fs.existsSync(EMAIL)) {
    fail(
      `${EMAIL_REL} already exists. ` +
      'Safety stop: do not overwrite an existing implementation.'
    );
  }

  console.log(
    'Canonical emailService currently absent: CONFIRMED'
  );

  /*
   * The existing source files must be Git-clean.
   * emailService must not already be staged/untracked.
   */
  const preStatus = git([
    'status',
    '--porcelain',
    '--',
    EMAIL_REL,
    M010_REL,
    NOTIFY_REL,
    STRIPE_REL
  ]);

  if (preStatus.status !== 0) {
    fail(
      preStatus.stderr ||
      'Unable to obtain Git status'
    );
  }

  if (preStatus.stdout.trim()) {
    console.error(preStatus.stdout);
    fail(
      'PRE-MODIFICATION SAFETY STOP: Batch 3 targets are not Git-clean.'
    );
  }

  console.log(
    'Batch 3 target Git state            : CLEAN'
  );

  const m010Data = readUtf8Preserve(M010);
  const notifyData = readUtf8Preserve(NOTIFY);
  const stripeData = readUtf8Preserve(STRIPE);

  const m010Original = m010Data.text;
  const notifyOriginal = notifyData.text;
  const stripeOriginal = stripeData.text;

  const m010Eol = detectEol(m010Original);
  const notifyEol = detectEol(notifyOriginal);

  /*
   * ----------------------------------------------------------
   * 2. VERIFY THE DEFECTS WE INTEND TO REPAIR
   * ----------------------------------------------------------
   */

  const m010Placeholder =
    /async function deliverEmail\(notification\)\s*\{\s*\/\/ Placeholder for email delivery\s*\/\/ Would integrate with email service\s*logger\.info\('Email notification queued',\s*\{\s*notificationId:\s*notification\.id,\s*userId:\s*notification\.user_id\s*\}\);\s*return\s*\{\s*method:\s*'email',\s*status:\s*'queued',\s*messageId:\s*`email_\$\{notification\.id\}_\$\{Date\.now\(\)\}`\s*\};\s*\}/m;

  const notifyPlaceholder =
    /async deliverEmail\(notificationData\)\s*\{\s*\/\/ Mock implementation - integrate with email service\s*logger\.info\('Sending email notification',\s*notificationData\);\s*return\s*\{\s*delivered:\s*true,\s*method:\s*'email'\s*\};\s*\}/m;

  if (!m010Placeholder.test(m010Original)) {
    fail(
      'Expected M010 fake email implementation not found exactly.'
    );
  }

  if (!notifyPlaceholder.test(notifyOriginal)) {
    fail(
      'Expected notificationService fake email implementation not found exactly.'
    );
  }

  if (
    !stripeOriginal.includes(
      "const { sendEmail } = require('../services/emailService');"
    )
  ) {
    fail(
      'Stripe no longer has the expected canonical sendEmail contract.'
    );
  }

  if (
    !stripeOriginal.includes(
      "template: 'payment-success'"
    ) ||
    !stripeOriginal.includes(
      "template: 'payment-failed'"
    )
  ) {
    fail(
      'Expected Stripe payment email contracts not found.'
    );
  }

  console.log(
    'M010 placeholder email path          : CONFIRMED'
  );

  console.log(
    'notificationService false-success    : CONFIRMED'
  );

  console.log(
    'Stripe sendEmail contract             : CONFIRMED'
  );

  /*
   * ----------------------------------------------------------
   * 3. BASELINE LINT EXISTING FILES BEFORE TOUCHING THEM
   * ----------------------------------------------------------
   */

  const baselineLint = lint([
    M010_REL,
    NOTIFY_REL
  ]);

  if (baselineLint.status !== 0) {
    console.error(baselineLint.stdout || '');
    console.error(baselineLint.stderr || '');

    fail(
      'Pre-existing ESLint errors exist in Batch 3 modification targets. ' +
      'Repair stopped before modification.'
    );
  }

  console.log(
    'Pre-repair target ESLint baseline     : PASS'
  );

  /*
   * ----------------------------------------------------------
   * 4. CREATE CANONICAL EMAIL SERVICE
   * ----------------------------------------------------------
   *
   * Intent:
   * - real Nodemailer transport;
   * - lazy transport creation;
   * - fail closed when SMTP_HOST is absent;
   * - optional SMTP auth;
   * - preserve localhost:1025 development convention;
   * - bounded payment templates only;
   * - unknown templates fail rather than pretend success.
   */

  const emailSource = `'use strict';

const nodemailer = require('nodemailer');

let transporter = null;
let transporterSignature = null;

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();

  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }

  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }

  throw new Error(\`Invalid boolean value: \${value}\`);
}

function getConfig() {
  const host = String(process.env.SMTP_HOST || '').trim();

  if (!host) {
    throw new Error(
      'Email transport is not configured: SMTP_HOST is required'
    );
  }

  const port = Number(process.env.SMTP_PORT || 587);

  if (
    !Number.isInteger(port) ||
    port <= 0 ||
    port > 65535
  ) {
    throw new Error(
      'Email transport configuration invalid: SMTP_PORT must be a valid TCP port'
    );
  }

  const secure = parseBoolean(
    process.env.SMTP_SECURE,
    port === 465
  );

  const user = String(
    process.env.SMTP_USER || ''
  ).trim();

  const pass = String(
    process.env.SMTP_PASS || ''
  );

  if (
    (user && !pass) ||
    (!user && pass)
  ) {
    throw new Error(
      'Email transport configuration invalid: SMTP_USER and SMTP_PASS must be supplied together'
    );
  }

  const from =
    String(
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      user ||
      'no-reply@localhost'
    ).trim();

  return {
    host,
    port,
    secure,
    user,
    pass,
    from
  };
}

function getTransporter() {
  const config = getConfig();

  const signature = JSON.stringify({
    host: config.host,
    port: config.port,
    secure: config.secure,
    user: config.user
  });

  if (
    transporter &&
    transporterSignature === signature
  ) {
    return {
      transporter,
      config
    };
  }

  const options = {
    host: config.host,
    port: config.port,
    secure: config.secure
  };

  if (config.user) {
    options.auth = {
      user: config.user,
      pass: config.pass
    };
  }

  transporter = nodemailer.createTransport(options);
  transporterSignature = signature;

  return {
    transporter,
    config
  };
}

function escapeHtml(value) {
  return String(
    value === undefined || value === null
      ? ''
      : value
  )
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderPaymentTemplate(template, data = {}) {
  if (template === 'payment-success') {
    const amount =
      data.amount === undefined
        ? ''
        : String(data.amount);

    const currency =
      data.currency
        ? String(data.currency)
        : '';

    const transactionId =
      data.transactionId
        ? String(data.transactionId)
        : '';

    const date =
      data.date
        ? String(data.date)
        : '';

    const subject = 'Payment Successful';

    const text = [
      'Your payment was successful.',
      amount
        ? \`Amount: \${amount}\${currency ? ' ' + currency : ''}\`
        : null,
      transactionId
        ? \`Transaction ID: \${transactionId}\`
        : null,
      date
        ? \`Date: \${date}\`
        : null
    ]
      .filter(Boolean)
      .join('\\n');

    const html = [
      '<p>Your payment was successful.</p>',
      amount
        ? \`<p><strong>Amount:</strong> \${escapeHtml(amount)}\${currency ? ' ' + escapeHtml(currency) : ''}</p>\`
        : '',
      transactionId
        ? \`<p><strong>Transaction ID:</strong> \${escapeHtml(transactionId)}</p>\`
        : '',
      date
        ? \`<p><strong>Date:</strong> \${escapeHtml(date)}</p>\`
        : ''
    ].join('');

    return {
      subject,
      text,
      html
    };
  }

  if (template === 'payment-failed') {
    const reason =
      data.reason
        ? String(data.reason)
        : 'Payment could not be completed';

    const transactionId =
      data.transactionId
        ? String(data.transactionId)
        : '';

    const subject = 'Payment Failed';

    const text = [
      'Your payment could not be completed.',
      \`Reason: \${reason}\`,
      transactionId
        ? \`Transaction ID: \${transactionId}\`
        : null
    ]
      .filter(Boolean)
      .join('\\n');

    const html = [
      '<p>Your payment could not be completed.</p>',
      \`<p><strong>Reason:</strong> \${escapeHtml(reason)}</p>\`,
      transactionId
        ? \`<p><strong>Transaction ID:</strong> \${escapeHtml(transactionId)}</p>\`
        : ''
    ].join('');

    return {
      subject,
      text,
      html
    };
  }

  throw new Error(
    \`Unsupported email template: \${template}\`
  );
}

function normalizeRecipients(value) {
  const recipients = Array.isArray(value)
    ? value
    : [value];

  const normalized = recipients
    .map(item => String(item || '').trim())
    .filter(Boolean);

  if (!normalized.length) {
    throw new Error(
      'Email recipient is required'
    );
  }

  return normalized;
}

async function sendEmail(options = {}) {
  const to = normalizeRecipients(options.to);

  let subject =
    options.subject
      ? String(options.subject)
      : '';

  let text =
    options.text === undefined ||
    options.text === null
      ? ''
      : String(options.text);

  let html =
    options.html === undefined ||
    options.html === null
      ? ''
      : String(options.html);

  if (options.template) {
    const rendered = renderPaymentTemplate(
      options.template,
      options.data || {}
    );

    subject = subject || rendered.subject;
    text = text || rendered.text;
    html = html || rendered.html;
  }

  if (!subject.trim()) {
    throw new Error(
      'Email subject is required'
    );
  }

  if (!text && !html) {
    throw new Error(
      'Email body is required'
    );
  }

  const {
    transporter: activeTransporter,
    config
  } = getTransporter();

  const result =
    await activeTransporter.sendMail({
      from: options.from || config.from,
      to,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      subject,
      text: text || undefined,
      html: html || undefined,
      headers: options.headers,
      attachments: options.attachments
    });

  return {
    messageId: result.messageId || null,
    accepted: Array.isArray(result.accepted)
      ? result.accepted
      : [],
    rejected: Array.isArray(result.rejected)
      ? result.rejected
      : [],
    pending: Array.isArray(result.pending)
      ? result.pending
      : [],
    response: result.response || null
  };
}

async function send(options = {}) {
  return sendEmail(options);
}

async function sendTemplate(
  to,
  template,
  data = {},
  options = {}
) {
  return sendEmail({
    ...options,
    to,
    template,
    data
  });
}

async function sendBulk(messages = []) {
  if (!Array.isArray(messages)) {
    throw new Error(
      'sendBulk expects an array of email messages'
    );
  }

  const results = [];

  for (const message of messages) {
    results.push(
      await sendEmail(message)
    );
  }

  return results;
}

function isConfigured() {
  try {
    getConfig();
    return true;
  } catch (_) {
    return false;
  }
}

async function verifyTransport() {
  const {
    transporter: activeTransporter
  } = getTransporter();

  return activeTransporter.verify();
}

module.exports = {
  send,
  sendEmail,
  sendTemplate,
  sendBulk,
  isConfigured,
  verifyTransport
};
`;

  /*
   * ----------------------------------------------------------
   * 5. BUILD M010 REPAIR
   * ----------------------------------------------------------
   */

  const m010Replacement = [
    'async function deliverEmail(notification) {',
    '  const pg = getPostgreSQL();',
    "  if (!pg) throw new Error('Database not initialized');",
    '',
    '  const userId = notification?.user_id || notification?.userId;',
    '',
    '  if (!userId) {',
    "    throw new Error('Email notification requires a user id');",
    '  }',
    '',
    '  const userResult = await pg.query(',
    "    'SELECT email FROM users WHERE id = $1',",
    '    [userId],',
    '  );',
    '',
    '  const email = userResult.rows?.[0]?.email;',
    '',
    '  if (!email) {',
    '    throw new Error(`Email address not found for user ${userId}`);',
    '  }',
    '',
    "  const { sendEmail } = require('../../services/emailService');",
    '',
    '  const result = await sendEmail({',
    '    to: email,',
    "    subject: notification.title || 'Notification',",
    "    text: notification.message || 'Notification',",
    '  });',
    '',
    '  return {',
    "    method: 'email',",
    "    status: 'sent',",
    '    messageId: result.messageId,',
    '    accepted: result.accepted,',
    '    rejected: result.rejected,',
    '  };',
    '}'
  ].join(m010Eol);

  const m010New =
    m010Original.replace(
      m010Placeholder,
      m010Replacement
    );

  if (m010New === m010Original) {
    fail(
      'M010 email replacement produced no change.'
    );
  }

  /*
   * ----------------------------------------------------------
   * 6. BUILD notificationService REPAIR
   * ----------------------------------------------------------
   */

  const notifyReplacement = [
    'async deliverEmail(notificationData) {',
    '    const { userId, title, message } = notificationData || {};',
    '',
    '    if (!userId) {',
    "      throw new Error('Email notification requires a user id');",
    '    }',
    '',
    '    const userResult = await this.db.query(',
    "      'SELECT email FROM users WHERE id = $1',",
    '      [userId],',
    '    );',
    '',
    '    const email = userResult.rows?.[0]?.email;',
    '',
    '    if (!email) {',
    '      throw new Error(`Email address not found for user ${userId}`);',
    '    }',
    '',
    "    const { sendEmail } = require('./emailService');",
    '',
    '    const result = await sendEmail({',
    '      to: email,',
    "      subject: title || 'Notification',",
    "      text: message || 'Notification',",
    '    });',
    '',
    '    return {',
    '      delivered: true,',
    "      method: 'email',",
    '      messageId: result.messageId,',
    '      accepted: result.accepted,',
    '      rejected: result.rejected,',
    '    };',
    '  }'
  ].join(notifyEol);

  const notifyNew =
    notifyOriginal.replace(
      notifyPlaceholder,
      notifyReplacement
    );

  if (notifyNew === notifyOriginal) {
    fail(
      'notificationService email replacement produced no change.'
    );
  }

  /*
   * ----------------------------------------------------------
   * 7. PRE-WRITE STRUCTURAL ASSERTIONS
   * ----------------------------------------------------------
   */

  if (
    /Placeholder for email delivery/.test(m010New)
  ) {
    fail(
      'M010 placeholder email implementation remains.'
    );
  }

  if (
    /Mock implementation - integrate with email service/.test(notifyNew)
  ) {
    fail(
      'notificationService fake email implementation remains.'
    );
  }

  if (
    !m010New.includes(
      "SELECT email FROM users WHERE id = $1"
    )
  ) {
    fail(
      'M010 recipient resolution missing.'
    );
  }

  if (
    !notifyNew.includes(
      "SELECT email FROM users WHERE id = $1"
    )
  ) {
    fail(
      'notificationService recipient resolution missing.'
    );
  }

  /*
   * ----------------------------------------------------------
   * 8. BACKUPS
   * ----------------------------------------------------------
   */

  const m010Backup = path.join(
    OUT,
    'M010-service.before.js'
  );

  const notifyBackup = path.join(
    OUT,
    'notificationService.before.js'
  );

  const stripeSnapshot = path.join(
    OUT,
    'stripeIntegrationComplete.snapshot.js'
  );

  fs.writeFileSync(
    m010Backup,
    m010Data.raw
  );

  fs.writeFileSync(
    notifyBackup,
    notifyData.raw
  );

  fs.writeFileSync(
    stripeSnapshot,
    stripeData.raw
  );

  let wroteEmail = false;
  let wroteM010 = false;
  let wroteNotify = false;

  try {
    /*
     * --------------------------------------------------------
     * 9. WRITE TRANSACTION
     * --------------------------------------------------------
     */

    fs.writeFileSync(
      EMAIL,
      emailSource,
      'utf8'
    );
    wroteEmail = true;

    writeUtf8Preserve(
      M010,
      m010New,
      m010Data.bom
    );
    wroteM010 = true;

    writeUtf8Preserve(
      NOTIFY,
      notifyNew,
      notifyData.bom
    );
    wroteNotify = true;

    console.log(
      'Canonical emailService created       : YES'
    );

    console.log(
      'M010 email path rewired               : YES'
    );

    console.log(
      'notificationService email rewired     : YES'
    );

    /*
     * --------------------------------------------------------
     * 10. SYNTAX CHECKS
     * --------------------------------------------------------
     */

    syntaxCheck(EMAIL);
    syntaxCheck(M010);
    syntaxCheck(NOTIFY);
    syntaxCheck(STRIPE);

    console.log(
      'Node syntax                           : PASS (4 files)'
    );

    /*
     * --------------------------------------------------------
     * 11. EMAIL SERVICE EXPORT CONTRACT
     * --------------------------------------------------------
     *
     * Do not send mail here.
     * Transport is lazy and no network operation occurs.
     */

    const contract = runNode([
      '-e',
      `
const service = require('./backend/src/services/emailService');

const required = [
  'send',
  'sendEmail',
  'sendTemplate',
  'sendBulk',
  'isConfigured',
  'verifyTransport'
];

const missing = required.filter(
  name => typeof service[name] !== 'function'
);

if (missing.length) {
  console.error(
    'Missing emailService exports: ' +
    missing.join(', ')
  );
  process.exit(1);
}

if (service.isConfigured() !== true) {
  console.error(
    'emailService did not recognize SMTP_HOST/SMTP_PORT configuration'
  );
  process.exit(1);
}

console.log(
  'emailService export/config contract: PASS'
);
`
    ], {
      env: {
        SMTP_HOST:
          process.env.SMTP_HOST ||
          'localhost',
        SMTP_PORT:
          process.env.SMTP_PORT ||
          '1025'
      }
    });

    if (contract.status !== 0) {
      console.error(contract.stdout || '');
      console.error(contract.stderr || '');

      fail(
        'Canonical emailService contract smoke failed.'
      );
    }

    console.log(
      contract.stdout.trim()
    );

    /*
     * --------------------------------------------------------
     * 12. FAIL-CLOSED CONFIGURATION TEST
     * --------------------------------------------------------
     */

    const failClosed = runNode([
      '-e',
      `
delete process.env.SMTP_HOST;
delete process.env.SMTP_PORT;

const service =
  require('./backend/src/services/emailService');

if (service.isConfigured() !== false) {
  console.error(
    'Expected email service to report unconfigured'
  );
  process.exit(1);
}

service.sendEmail({
  to: 'nobody@example.invalid',
  subject: 'configuration-test',
  text: 'configuration-test'
})
  .then(() => {
    console.error(
      'Email unexpectedly succeeded without SMTP_HOST'
    );
    process.exit(1);
  })
  .catch(error => {
    if (!/SMTP_HOST/.test(error.message)) {
      console.error(
        'Unexpected fail-closed error: ' +
        error.message
      );
      process.exit(1);
    }

    console.log(
      'Email fail-closed configuration contract: PASS'
    );
  });
`
    ], {
      env: {
        SMTP_HOST: '',
        SMTP_PORT: ''
      }
    });

    if (failClosed.status !== 0) {
      console.error(failClosed.stdout || '');
      console.error(failClosed.stderr || '');

      fail(
        'Fail-closed email configuration test failed.'
      );
    }

    console.log(
      failClosed.stdout.trim()
    );

    /*
     * --------------------------------------------------------
     * 13. BOUNDED TEMPLATE CONTRACT TEST
     * --------------------------------------------------------
     *
     * No network call. Unknown template should fail before
     * Nodemailer send is attempted.
     */

    const templateCheck = runNode([
      '-e',
      `
process.env.SMTP_HOST = 'localhost';
process.env.SMTP_PORT = '1025';

const service =
  require('./backend/src/services/emailService');

service.sendEmail({
  to: 'nobody@example.invalid',
  template: 'unsupported-template'
})
  .then(() => {
    console.error(
      'Unsupported template unexpectedly succeeded'
    );
    process.exit(1);
  })
  .catch(error => {
    if (
      !/Unsupported email template/.test(
        error.message
      )
    ) {
      console.error(
        'Unexpected template error: ' +
        error.message
      );
      process.exit(1);
    }

    console.log(
      'Bounded template contract: PASS'
    );
  });
`
    ]);

    if (templateCheck.status !== 0) {
      console.error(templateCheck.stdout || '');
      console.error(templateCheck.stderr || '');

      fail(
        'Bounded email template contract failed.'
      );
    }

    console.log(
      templateCheck.stdout.trim()
    );

    /*
     * --------------------------------------------------------
     * 14. ESLINT
     * --------------------------------------------------------
     */

    const postLint = lint([
      EMAIL_REL,
      M010_REL,
      NOTIFY_REL
    ]);

    if (postLint.status !== 0) {
      console.error(postLint.stdout || '');
      console.error(postLint.stderr || '');

      fail(
        'Post-repair targeted ESLint failed.'
      );
    }

    console.log(
      'Targeted ESLint                       : PASS (3 files)'
    );

    /*
     * --------------------------------------------------------
     * 15. VERIFY STRIPE IMPORT NOW RESOLVES
     * --------------------------------------------------------
     */

    const emailResolved =
      require.resolve(
        path.join(
          ROOT,
          'backend',
          'src',
          'services',
          'emailService.js'
        )
      );

    if (
      path.normalize(emailResolved) !==
      path.normalize(EMAIL)
    ) {
      fail(
        'Stripe canonical email dependency does not resolve to expected file.'
      );
    }

    const stripeAfter =
      fs.readFileSync(
        STRIPE,
        'utf8'
      );

    if (
      stripeAfter !== stripeOriginal
    ) {
      fail(
        'Stripe integration changed unexpectedly.'
      );
    }

    if (
      !stripeAfter.includes(
        "const { sendEmail } = require('../services/emailService');"
      )
    ) {
      fail(
        'Stripe canonical email import contract disappeared.'
      );
    }

    console.log(
      'Stripe email dependency               : RESOLVABLE'
    );

    console.log(
      'Stripe source                          : UNMODIFIED'
    );

    /*
     * --------------------------------------------------------
     * 16. VERIFY FALSE EMAIL SUCCESS PATHS ARE GONE
     * --------------------------------------------------------
     */

    const m010After =
      fs.readFileSync(M010, 'utf8');

    const notifyAfter =
      fs.readFileSync(NOTIFY, 'utf8');

    if (
      m010After.includes(
        'Placeholder for email delivery'
      )
    ) {
      fail(
        'M010 email placeholder remains.'
      );
    }

    if (
      notifyAfter.includes(
        'Mock implementation - integrate with email service'
      )
    ) {
      fail(
        'notificationService fake email path remains.'
      );
    }

    if (
      notifyAfter.includes(
        "return { delivered: true, method: 'email' };"
      )
    ) {
      fail(
        'notificationService unconditional fake email success remains.'
      );
    }

    console.log(
      'Fake email delivery paths              : REMOVED'
    );

    /*
     * --------------------------------------------------------
     * 17. GIT DIFF CHECK
     * --------------------------------------------------------
     */

    const diffCheck = git([
      'diff',
      '--check',
      '--',
      EMAIL_REL,
      M010_REL,
      NOTIFY_REL
    ]);

    if (diffCheck.status !== 0) {
      console.error(diffCheck.stdout || '');
      console.error(diffCheck.stderr || '');

      fail(
        'git diff --check failed.'
      );
    }

    console.log(
      'git diff --check                      : PASS'
    );

    /*
     * --------------------------------------------------------
     * 18. EXACT CHANGE SCOPE
     * --------------------------------------------------------
     */

    const finalStatus = git([
      'status',
      '--porcelain',
      '--',
      EMAIL_REL,
      M010_REL,
      NOTIFY_REL,
      STRIPE_REL
    ]);

    if (finalStatus.status !== 0) {
      fail(
        finalStatus.stderr ||
        'Final Git status failed.'
      );
    }

    const changed =
      finalStatus.stdout
        .split(/\r?\n/)
        .filter(Boolean);

    const changedPaths =
      changed.map(line =>
        line.slice(3).trim().replace(/\\/g, '/')
      );

    const expected = new Set([
      EMAIL_REL,
      M010_REL,
      NOTIFY_REL
    ]);

    if (changed.length !== 3) {
      fail(
        'Expected exactly 3 Batch 3 application changes; got:\n' +
        finalStatus.stdout
      );
    }

    for (const file of changedPaths) {
      if (!expected.has(file)) {
        fail(
          `Unexpected Batch 3 modified file: ${file}`
        );
      }
    }

    if (
      changedPaths.includes(STRIPE_REL)
    ) {
      fail(
        'Stripe source was unexpectedly modified.'
      );
    }

    console.log(
      'Exact application change scope        : PASS (3 files)'
    );

    /*
     * --------------------------------------------------------
     * 19. SAVE ACCEPTED EVIDENCE
     * --------------------------------------------------------
     */

    const diff = git([
      'diff',
      '--',
      EMAIL_REL,
      M010_REL,
      NOTIFY_REL
    ]);

    fs.writeFileSync(
      path.join(
        OUT,
        'accepted-diff.patch'
      ),
      diff.stdout || '',
      'utf8'
    );

    fs.writeFileSync(
      path.join(
        OUT,
        'accepted-status.txt'
      ),
      finalStatus.stdout,
      'utf8'
    );

    fs.writeFileSync(
      path.join(
        OUT,
        'repair-summary.json'
      ),
      JSON.stringify(
        {
          created: [
            EMAIL_REL
          ],
          modified: [
            M010_REL,
            NOTIFY_REL
          ],
          verifiedUnmodified: [
            STRIPE_REL
          ],
          smtpContract: {
            host: 'SMTP_HOST',
            port: 'SMTP_PORT',
            optionalUser: 'SMTP_USER',
            optionalPassword: 'SMTP_PASS',
            optionalSecure: 'SMTP_SECURE',
            optionalFrom: [
              'SMTP_FROM',
              'EMAIL_FROM'
            ]
          },
          supportedTemplates: [
            'payment-success',
            'payment-failed'
          ],
          generalTemplateEngineComplete: false
        },
        null,
        2
      ),
      'utf8'
    );

    console.log('');
    console.log(
      '============================================================'
    );
    console.log(
      ' BATCH 3 EMAIL REPAIR ACCEPTED'
    );
    console.log(
      '============================================================'
    );

    console.log(
      'Canonical Nodemailer transport        : CREATED'
    );

    console.log(
      'M010 fake email queue                 : REMOVED'
    );

    console.log(
      'M010 user -> email resolution         : CONNECTED'
    );

    console.log(
      'notificationService fake success      : REMOVED'
    );

    console.log(
      'notification user -> email resolution : CONNECTED'
    );

    console.log(
      'Stripe missing email dependency       : RESOLVED'
    );

    console.log(
      'Stripe source                         : UNMODIFIED'
    );

    console.log(
      'SMTP fail-closed behavior             : VERIFIED'
    );

    console.log(
      'Payment templates                     : 2 BOUNDED'
    );

    console.log(
      'General template system               : STILL INCOMPLETE'
    );

    console.log(
      'SMS / push placeholders               : UNTOUCHED'
    );

    console.log(
      'Modified/created application files    : 3'
    );

    console.log(
      `Evidence                               : ${OUT}`
    );

  } catch (error) {
    /*
     * --------------------------------------------------------
     * 20. BYTE-FOR-BYTE ROLLBACK
     * --------------------------------------------------------
     */

    console.error('');
    console.error(
      '============================================================'
    );
    console.error(
      ' BATCH 3 VALIDATION FAILED - ROLLBACK'
    );
    console.error(
      '============================================================'
    );

    console.error(
      error.stack ||
      error.message ||
      String(error)
    );

    if (wroteM010) {
      fs.copyFileSync(
        m010Backup,
        M010
      );
    }

    if (wroteNotify) {
      fs.copyFileSync(
        notifyBackup,
        NOTIFY
      );
    }

    if (
      wroteEmail &&
      fs.existsSync(EMAIL)
    ) {
      fs.unlinkSync(EMAIL);
    }

    const m010Restored =
      fs.readFileSync(M010);

    const notifyRestored =
      fs.readFileSync(NOTIFY);

    const stripeRestored =
      fs.readFileSync(STRIPE);

    const rollbackPass =
      m010Restored.equals(m010Data.raw) &&
      notifyRestored.equals(notifyData.raw) &&
      stripeRestored.equals(stripeData.raw) &&
      !fs.existsSync(EMAIL);

    console.error(
      `Byte-for-byte rollback                : ${rollbackPass}`
    );

    console.error(
      'BATCH 3 EMAIL REPAIR ACCEPTED         : NO'
    );

    process.exitCode = 1;
  }
}

try {
  main();
} catch (error) {
  console.error('');
  console.error(
    '============================================================'
  );
  console.error(
    ' PRE-MODIFICATION SAFETY STOP'
  );
  console.error(
    '============================================================'
  );

  console.error(
    error.stack ||
    error.message ||
    String(error)
  );

  console.error(
    'APPLICATION SOURCE MODIFIED            : NO'
  );

  console.error(
    'BATCH 3 EMAIL REPAIR ACCEPTED           : NO'
  );

  process.exitCode = 1;
}
