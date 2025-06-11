import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    this.logger.debug(`Checking authentication for request`);
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      this.logger.error(`JWT Auth Error: ${err.message}`, err.stack);
      throw err;
    }

    if (!user) {
      this.logger.error('JWT Auth Error: No user found', info);
      throw new UnauthorizedException('Invalid or missing token');
    }

    this.logger.debug(
      `User authenticated: ${user.userId} (${typeof user.userId})`,
    );

    return user;
  }
}
