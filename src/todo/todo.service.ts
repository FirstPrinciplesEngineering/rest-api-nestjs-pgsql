import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './todo.entity';

@Injectable()
export class TodoService {
  constructor(
    @InjectRepository(Todo) private readonly todoRepository: Repository<Todo>,
  ) {}

  async getAllTodo() {
    try {
      const query = this.todoRepository.createQueryBuilder('todo');
      const todo = await query.getMany();
      return todo;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async createTodo(createTodoDto: CreateTodoDto): Promise<Todo> {
    try {
      const { title, description } = createTodoDto;
      const todo = this.todoRepository.create({
        title,
        description,
      });
      await this.todoRepository.save(todo);
      return todo;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getTodoById(id: string): Promise<Todo> {
    try {
      const todo = await this.todoRepository.findOne({ where: { id: id } });
      if (!todo) {
        throw new NotFoundException(`Todo with id ${id} not found`);
      }
      return todo;
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async updateTodo(
    id: string,
    updateTodoDto: UpdateTodoDto,
  ): Promise<{ message: string }> {
    try {
      const body = { ...updateTodoDto };
      const updated = await this.todoRepository.update(id, body);
      if (updated.affected === 0) {
        throw new NotFoundException(`Todo with id ${id} not found`);
      }
      return { message: 'Todo updated successfully' };
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new InternalServerErrorException();
    }
  }

  async deleteTodo(id: string): Promise<{ message: string }> {
    try {
      const deleted = await this.todoRepository.delete(id);
      if (deleted.affected === 0) {
        throw new NotFoundException(`Todo with id ${id} not found`);
      }
      return { message: 'Todo deleted successfully' };
    } catch (error) {
      if (error.response) {
        throw new HttpException(
          error.response.message,
          error.response.statusCode,
        );
      }
      throw new InternalServerErrorException();
    }
  }
}
