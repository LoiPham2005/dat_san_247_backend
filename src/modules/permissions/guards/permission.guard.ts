import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    const userPermissions = await this.getUserPermissions(user);
    
    return requiredPermissions.every(permission => 
      userPermissions.includes(permission) || userPermissions.includes('*')
    );
  }

  private async getUserPermissions(user: any): Promise<string[]> {
    const role = user.userRole;
    return role.permissions.map(p => `${p.resource}:${p.action}`);
  }
}