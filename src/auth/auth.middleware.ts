// import { Injectable, NestMiddleware, UnauthorizedException } from '@nestjs/common'
// import { JwtService } from '@nestjs/jwt/dist/jwt.service'
// import { NextFunction } from 'express'

// @Injectable()
// export class AuthMiddleware implements NestMiddleware {
//   constructor(private readonly jwtService: JwtService) {}

//   async use(req: Request, res: Response, next: NextFunction) {
//     try {
//       const token = req.cookies['access_token'];

//       if (!token) {
//         throw new UnauthorizedException('Authentication token not found');
//       }

//       const decoded = this.jwtService.verify(token);
//       req.user = decoded;

//       // Переконаємося, що userId є числом
//       if (req.user && req.user.userId) {
//         req.user.userId = Number(req.user.userId);
//       }

//       next();
//     } catch (error) {
//       throw new UnauthorizedException('Invalid authentication token');
//     }
//   }
// }
