import { Test, TestingModule } from '@nestjs/testing';
import { BcryptService } from './bcrypt.service';
import { HashingService } from './hashing.service';

describe('BcryptService', () => {
  let service: BcryptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BcryptService],
    }).compile();

    service = module.get<BcryptService>(BcryptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should implement "HashingService"', () => {
    expect(service).toMatchObject(
      new (class implements HashingService {
        hash(): Promise<string> {
          throw new Error('Method not implemented.');
        }
        compare(): Promise<boolean> {
          throw new Error('Method not implemented.');
        }
      })(),
    );
  });

  it('should be able to hash', async () => {
    const result = await service.hash('hello');
    expect(result.length).toBeGreaterThan(1);
  });

  it('should be use salt', async () => {
    const a = await service.hash('hello');
    const b = await service.hash('hello');
    expect(a).not.toEqual(b);
  });

  it('should be able to compare', async () => {
    const hashed = await service.hash('hello');
    expect(service.compare('hello', hashed)).toBeTruthy();
  });
});
