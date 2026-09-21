const { logger } = require('../utils/logger');

const MAX_PROMPT_LENGTH = 8000;
const DEFAULT_TIMEOUT_MS = 60000;

let clientPromise;
let sdkModulePromise;

function isEnabled() {
  return process.env.COPILOT_SDK_ENABLED === 'true';
}

function getStatus() {
  return {
    enabled: isEnabled(),
    configured: Boolean(process.env.GITHUB_TOKEN || process.env.COPILOT_CLI_PATH),
    model: process.env.COPILOT_SDK_MODEL || null,
    provider: '@github/copilot-sdk',
  };
}

async function loadSdk() {
  if (!sdkModulePromise) {
    sdkModulePromise = import('@github/copilot-sdk').catch((error) => {
      sdkModulePromise = undefined;
      throw Object.assign(new Error('VS Code Copilot SDK dependency is unavailable'), {
        code: 'COPILOT_SDK_DEPENDENCY_UNAVAILABLE',
        cause: error,
      });
    });
  }

  return sdkModulePromise;
}

async function getClient() {
  if (!isEnabled()) {
    throw Object.assign(new Error('VS Code Copilot SDK integration is disabled'), {
      code: 'COPILOT_SDK_DISABLED',
    });
  }

  if (!clientPromise) {
    clientPromise = loadSdk()
      .then(({ CopilotClient }) => {
        const client = new CopilotClient({
          cliPath: process.env.COPILOT_CLI_PATH || undefined,
        });
        return client.start().then(() => client);
      })
      .catch((error) => {
        clientPromise = undefined;
        throw error;
      });
  }

  return clientPromise;
}

function validateRequest({ prompt, systemMessage }) {
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    throw Object.assign(new Error('prompt must be a non-empty string'), {
      code: 'COPILOT_SDK_INVALID_PROMPT',
    });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw Object.assign(new Error(`prompt must not exceed ${MAX_PROMPT_LENGTH} characters`), {
      code: 'COPILOT_SDK_PROMPT_TOO_LARGE',
    });
  }

  if (systemMessage !== undefined &&
      (typeof systemMessage !== 'string' || systemMessage.length > MAX_PROMPT_LENGTH)) {
    throw Object.assign(new Error(`systemMessage must be a string of at most ${MAX_PROMPT_LENGTH} characters`), {
      code: 'COPILOT_SDK_INVALID_SYSTEM_MESSAGE',
    });
  }
}

function waitForIdle(session, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(Object.assign(new Error('VS Code Copilot SDK request timed out'), {
        code: 'COPILOT_SDK_TIMEOUT',
      }));
    }, timeoutMs);

    session.on('session.idle', () => {
      clearTimeout(timer);
      resolve();
    });
  });
}

async function generateResponse({ prompt, systemMessage }) {
  validateRequest({ prompt, systemMessage });

  const client = await getClient();
  const session = await client.createSession({
    model: process.env.COPILOT_SDK_MODEL || undefined,
    systemMessage: systemMessage ? { mode: 'append', content: systemMessage } : undefined,
    // No tools or permission approvals are exposed by this server-side adapter.
  });

  let content = '';
  session.on('assistant.message', (event) => {
    if (typeof event?.data?.content === 'string') {
      content += event.data.content;
    }
  });

  try {
    const idle = waitForIdle(
      session,
      Number.parseInt(process.env.COPILOT_SDK_TIMEOUT_MS, 10) || DEFAULT_TIMEOUT_MS,
    );
    await session.send({ prompt });
    await idle;

    if (!content.trim()) {
      throw Object.assign(new Error('VS Code Copilot SDK returned an empty response'), {
        code: 'COPILOT_SDK_EMPTY_RESPONSE',
      });
    }

    return {
      content: content.trim(),
      model: process.env.COPILOT_SDK_MODEL || null,
      provider: '@github/copilot-sdk',
    };
  } finally {
    await session.disconnect();
  }
}

async function shutdown() {
  if (!clientPromise) return;
  const client = await clientPromise;
  clientPromise = undefined;
  await client.stop();
  logger.info('VS Code Copilot SDK client stopped');
}

module.exports = {
  generateResponse,
  getStatus,
  shutdown,
};
