import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const entity = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(entity);
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
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
