import { InferSubjects } from '@casl/ability';
import { User } from 'src/modules/users/entities/user.entity';

export enum Action {
    Manage = 'manage',
    Create = 'create',
    Read = 'read',
    Update = 'update',
    Delete = 'delete'
}

export type Subjects = InferSubjects<typeof User> | 'all';