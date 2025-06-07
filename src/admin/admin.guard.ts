import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    console.log('User in AdminGuard:', req.user);

    if (!req.user || !req.user.role) {
      throw new ForbiddenException(
        'Користувач не авторизований або роль не визначена',
      );
    }

    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenException('Доступ лише для адміністратора');
    }

    return true;
  }
}
