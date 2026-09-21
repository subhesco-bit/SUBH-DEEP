const adapter = require('./externalIntegrationAdapter');

describe('external integration adapter', () => {
  beforeEach(() => {
    adapter.adapters.clear();
    delete process.env.TEST_EXTERNAL_TOKEN;
    global.fetch = jest.fn();
  });

  it('fails closed when credentials are absent', async () => {
    adapter.register('weather', {
      baseUrl: 'https://weather.invalid',
      tokenEnv: 'TEST_EXTERNAL_TOKEN',
      allowedOperations: ['forecast'],
    });
    await expect(adapter.call('weather', 'forecast')).rejects.toMatchObject({
      code: 'INTEGRATION_NOT_CONFIGURED',
    });
  });

  it('rejects operations outside the adapter contract', async () => {
    adapter.register('gst', {
      baseUrl: 'https://gst.invalid',
      tokenEnv: 'TEST_EXTERNAL_TOKEN',
      allowedOperations: ['invoice'],
    });
    await expect(adapter.call('gst', 'refund')).rejects.toMatchObject({
      code: 'INTEGRATION_OPERATION_NOT_ALLOWED',
    });
  });

  it('sends a bearer token and parses a successful response', async () => {
    process.env.TEST_EXTERNAL_TOKEN = 'test-token';
    adapter.register('erp', {
      baseUrl: 'https://erp.invalid/',
      tokenEnv: 'TEST_EXTERNAL_TOKEN',
      allowedOperations: ['sync record'],
    });
    global.fetch.mockResolvedValue({
      ok: true,
      status: 202,
      text: async () => '{"accepted":true}',
    });

    await expect(adapter.call('erp', 'sync record', {
      body: { id: 42 },
      headers: { Authorization: 'spoofed' },
    })).resolves.toEqual({ status: 202, data: { accepted: true } });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://erp.invalid/sync%20record',
      expect.objectContaining({
        method: 'POST',
        body: '{"id":42}',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
      }),
    );
  });

  it('normalizes timeouts without exposing credentials', async () => {
    process.env.TEST_EXTERNAL_TOKEN = 'secret-token';
    adapter.register('claims', {
      baseUrl: 'https://claims.invalid',
      tokenEnv: 'TEST_EXTERNAL_TOKEN',
      allowedOperations: ['submit'],
    });
    global.fetch.mockRejectedValue(Object.assign(new Error('aborted'), { name: 'AbortError' }));

    await expect(adapter.call('claims', 'submit')).rejects.toMatchObject({
      code: 'INTEGRATION_TIMEOUT',
    });
    await expect(adapter.call('claims', 'submit')).rejects.not.toThrow('secret-token');
  });
});
