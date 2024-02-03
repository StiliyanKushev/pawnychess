import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  it('should be defined', () => {
    //@ts-expect-error arguments not passed
    expect(new RolesGuard()).toBeDefined();
  });
});
