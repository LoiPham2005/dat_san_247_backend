import { PrismaService } from '../../prisma/prisma.service';

/**
 * Base Repository wrapping Prisma for common operations.
 * T is the Prisma model delegate (e.g., this.prisma.users)
 */
export abstract class BaseRepository<T> {
    constructor(protected readonly prisma: PrismaService) { }

    // Common methods can be added here as needed
    // Since Prisma delegates don't share a common base type with all methods easily in TS,
    // we usually implement specific methods in child repositories.
}
