import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const entity = this.usersRepository.create(createUserDto);
      return await this.usersRepository.save(entity);
    } catch (err) {
      const pgUniqueViolationErrorCode = '23505';
      if (err.code == pgUniqueViolationErrorCode) {
        throw new ConflictException();
      }
      throw err;
    }
  }

  async findOne(id: number) {
    try {
      return await this.usersRepository.findOneByOrFail({ id });
    } catch {
      throw new NotFoundException();
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      return await this.usersRepository.findOneByOrFail({ email });
    } catch {
      throw new NotFoundException();
    }
  }

  async hasOne(id: number) {
    return await this.usersRepository.existsBy({ id });
  }

  async hasOneByEmail(email: string) {
    return await this.usersRepository.existsBy({ email });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const entity = await this.usersRepository.preload({ id, ...updateUserDto });

    if (!entity) {
      return new NotFoundException('cannot update, user does not exist');
    }

    return this.usersRepository.update({ id }, entity);
  }

  remove(id: number) {
    return this.usersRepository.delete({ id });
  }
}
