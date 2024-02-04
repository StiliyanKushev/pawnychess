import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { Role } from './enums/role.enum';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;

  // Mock user data
  const mockUser: User = {
    id: 1,
    email: 'test@example.com',
    password: 'xxxxxxxxx',
    role: Role.Regular,
  };

  const mockRepository = {
    create: jest.fn().mockReturnValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    findOneByOrFail: jest.fn(),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
    preload: jest.fn(),
    existsBy: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: mockUser.email,
        password: mockUser.password,
      };
      const result = await service.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(mockRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser);
    });

    it('should fail when conflict', async () => {
      const createUserDto: CreateUserDto = {
        email: mockUser.email,
        password: mockUser.password,
      };
      await service.create(createUserDto);
      mockRepository.save.mockRejectedValue(new Error());
      expect(service.create(createUserDto)).rejects.toThrow();
    });
  });

  describe('findOne', () => {
    it('should return a user if it exists', async () => {
      mockRepository.findOneByOrFail.mockResolvedValue(mockUser);
      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({ id: 1 });
    });

    it('should throw NotFoundException if no user is found', async () => {
      mockRepository.findOneByOrFail.mockRejectedValue(new Error());
      await expect(service.findOne(999)).rejects.toThrow();
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if it exists', async () => {
      mockRepository.findOneByOrFail.mockResolvedValue(mockUser);
      const result = await service.findOneByEmail(mockUser.email);
      expect(result).toEqual(mockUser);
      expect(mockRepository.findOneByOrFail).toHaveBeenCalledWith({
        email: mockUser.email,
      });
    });

    it('should throw NotFoundException if no user is found', async () => {
      mockRepository.findOneByOrFail.mockRejectedValue(new Error());
      await expect(service.findOneByEmail('not_email')).rejects.toThrow();
    });
  });

  describe('hasOne', () => {
    it('should return true if user exists', async () => {
      mockRepository.existsBy.mockResolvedValue(true);
      const result = await service.hasOne(1);
      expect(result).toBeTruthy();
      expect(mockRepository.existsBy).toHaveBeenCalledWith({
        id: 1,
      });
    });

    it('should return false otherwise', async () => {
      mockRepository.existsBy.mockResolvedValue(false);
      await expect(service.hasOne(2)).resolves.toBeFalsy();
    });
  });

  describe('hasOneByEmail', () => {
    it('should return true if user exists', async () => {
      mockRepository.existsBy.mockResolvedValue(true);
      const result = await service.hasOneByEmail('email');
      expect(result).toBeTruthy();
      expect(mockRepository.existsBy).toHaveBeenCalledWith({
        email: 'email',
      });
    });

    it('should return false otherwise', async () => {
      mockRepository.existsBy.mockResolvedValue(false);
      await expect(service.hasOneByEmail('email')).resolves.toBeFalsy();
    });
  });

  describe('update', () => {
    it('should update a user if it exists', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'mail@mail.com',
      };
      mockRepository.preload.mockResolvedValue({
        ...mockUser,
        ...updateUserDto,
      });
      const result = await service.update(1, updateUserDto);
      expect(mockRepository.preload).toHaveBeenCalledWith({
        id: 1,
        ...updateUserDto,
      });
      expect(mockRepository.update).toHaveBeenCalledWith(
        { id: 1 },
        {
          ...mockUser,
          ...updateUserDto,
        },
      );
      expect(result).toEqual({ affected: 1 });
    });
    it('should throw if user does not exist', async () => {
      const updateUserDto: UpdateUserDto = {
        email: 'mail@mail.com',
      };
      mockRepository.preload.mockReturnValue(undefined);
      const result = service.update(1, updateUserDto);
      expect(result).rejects.toThrow();
    });
  });

  describe('remove', () => {
    it('should resolve', async () => {
      const result = await service.remove(1);
      expect(result).toBeTruthy();
      expect(mockRepository.delete).toHaveBeenCalled();
    });
  });
});
