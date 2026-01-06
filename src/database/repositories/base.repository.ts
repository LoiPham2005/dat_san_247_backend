import { Repository, ObjectLiteral } from 'typeorm';

export abstract class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
    // Common repository methods can be added here
}
