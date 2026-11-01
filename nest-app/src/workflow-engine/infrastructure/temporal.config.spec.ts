import { TemporalConfig } from './temporal.config';

const LOCAL_TEMPORAL = {
  TEMPORAL_ADDRESS: 'localhost:17233',
  TEMPORAL_NAMESPACE: 'temporal-lab',
};

describe('Temporal configuration', () => {
  it('connects to the configured server and namespace', () => {
    expect(TemporalConfig.fromEnv(LOCAL_TEMPORAL)).toEqual({
      address: 'localhost:17233',
      namespace: 'temporal-lab',
    });
  });

  it('refuses to start without a server address', () => {
    expect(() =>
      TemporalConfig.fromEnv({ TEMPORAL_NAMESPACE: 'temporal-lab' }),
    ).toThrow(/TEMPORAL_ADDRESS is required/);
  });

  it('refuses an address written as a URL instead of host:port', () => {
    expect(() =>
      TemporalConfig.fromEnv({
        ...LOCAL_TEMPORAL,
        TEMPORAL_ADDRESS: 'http://localhost:17233',
      }),
    ).toThrow(/TEMPORAL_ADDRESS must be host:port/);
  });

  it('refuses to start without a namespace', () => {
    expect(() =>
      TemporalConfig.fromEnv({ TEMPORAL_ADDRESS: 'localhost:17233' }),
    ).toThrow(/TEMPORAL_NAMESPACE is required/);
  });
});
