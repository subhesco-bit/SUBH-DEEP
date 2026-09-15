const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../../database/connection', () => ({ getPostgreSQL: jest.fn() }));
jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

const { getPostgreSQL } = require('../../database/connection');
const { hashPassword, comparePassword } = require('../authService/passwordUtils');

// Cover both retained public services, including middleware/auth's actual dependency.
describe.each([
  ['live dual-use service', require('../dual-use/authService')],
  ['root service', require('../authService.js')],
])('%s authentication boundary', (_name, authService) => {
  const user = { id: 42, email: 'farmer@example.com', role: 'farmer', status: 'active' };
  let query;
  let passwordHash;

  beforeAll(async () => { passwordHash = await bcrypt.hash('correct-password', 4); });
  beforeEach(() => {
    query = jest.fn().mockResolvedValue({ rows: [] });
    getPostgreSQL.mockReturnValue({ query });
  });

  function storedUser(hash = passwordHash) {
    query.mockResolvedValueOnce({ rows: [{ ...user, password_hash: hash }] });
  }

  test('valid bcrypt login issues a verifiable user token', async () => {
    storedUser();
    const result = await authService.loginUser(user.email, 'correct-password');
    expect(authService.verifyToken(result.accessToken)).toMatchObject({
      userId: user.id, role: user.role, sub: String(user.id),
    });
    expect(result.user).not.toHaveProperty('password_hash');
  });

  test('rejects an incorrect password and records the failed attempt', async () => {
    storedUser();
    await expect(authService.loginUser(user.email, 'wrong')).rejects.toThrow('Invalid credentials');
    expect(query).toHaveBeenLastCalledWith(expect.stringContaining('failed_login_attempts'), [1, user.id]);
  });

  test('rejects the stored bcrypt hash as a login password', async () => {
    storedUser();
    await expect(authService.loginUser(user.email, passwordHash)).rejects.toThrow('Invalid credentials');
  });

  test.each([
    ['password', '$2a$10$test'],
    ['plaintext-password', 'plaintext-password'],
    ['password', null],
  ])('rejects unsupported password storage (%s)', async (password, hash) => {
    storedUser(hash);
    await expect(authService.loginUser(user.email, password)).rejects.toThrow('Invalid credentials');
  });

  test('rejects missing users', async () => {
    await expect(authService.loginUser(user.email, 'wrong')).rejects.toThrow('Invalid credentials');
  });

  test.each([
    { issuer: 'wrong-issuer' },
    { audience: 'wrong-audience' },
    { algorithm: 'HS384' },
    { expiresIn: -1 },
  ])('rejects invalid token constraints %j', overrides => {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      issuer: process.env.JWT_ISSUER || 'afrera-platform',
      audience: process.env.JWT_AUDIENCE || 'afrera-users',
      expiresIn: '15m', ...overrides,
    });
    expect(() => authService.verifyToken(token)).toThrow();
  });

  test('rejects tokens missing issuer and audience', () => {
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    expect(() => authService.verifyToken(token)).toThrow('Invalid token');
  });
});

describe('shared password verification', () => {
  test('hashes with independent salts and verifies only the matching password', async () => {
    const first = await hashPassword('a-real-password');
    const second = await hashPassword('a-real-password');
    expect(first).not.toBe(second);
    await expect(comparePassword('a-real-password', first)).resolves.toBe(true);
    await expect(comparePassword('wrong', first)).resolves.toBe(false);
    await expect(comparePassword(first, first)).resolves.toBe(false);
  });

  test.each([[null, null], [{}, 'password'], ['password', '$2a$10$test'], ['password', 'password']])(
    'fails closed for invalid credentials %j / %j', async (password, hash) => {
      await expect(comparePassword(password, hash)).resolves.toBe(false);
    },
  );
});

describe('canonical authentication module', () => {
  test('legacy entry points delegate to the same service instance', () => {
    const canonical = require('../authService.js');
    expect(require('../dual-use/authService')).toBe(canonical);
    expect(require('../authService/index')).toBe(canonical);
  });
});
