import { AuthenticationGuard } from './authentication.guard';

describe('AuthenticationGuard', () => {
  it('should be defined', () => {
    //@ts-expect-error arguments not passed
    expect(new AuthenticationGuard()).toBeDefined();
  });
});
