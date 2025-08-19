import { Injectable } from '@nestjs/common';
import { Ability, AbilityBuilder, AbilityClass, ExtractSubjectType } from '@casl/ability';
import { Action, Subjects } from '../types/casl-types';
import { User } from 'src/modules/users/entities/user.entity';
import { Role } from 'src/modules/roles/role.enum';

export type AppAbility = Ability<[Action, Subjects]>;

@Injectable()
export class AbilityFactory {
    createForUser(user: User) {
        const { can, cannot, build } = new AbilityBuilder<AppAbility>(
            Ability as AbilityClass<AppAbility>
        );

        if (user.role === Role.ADMIN) {
            can(Action.Manage, 'all');
        } else {
            // Regular user permissions
            can(Action.Read, User, { id: user.id });
            can(Action.Update, User, { id: user.id });
            cannot(Action.Delete, User).because('Only admins can delete users');
        }

        return build({
            detectSubjectType: (item) =>
                item.constructor as ExtractSubjectType<Subjects>,
        });
    }
}