import { AccessTokenGuard } from './access-token.guard';

describe('AccessTokenGuard', () => {
  it('should be defined', () => {
    //@ts-expect-error arguments not passed
    expect(new AccessTokenGuard()).toBeDefined();
  });
});
