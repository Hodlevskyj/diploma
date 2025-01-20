import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', //дозволити frontend
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', //дозволені методи
    credentials: true, //дозволити cookies
  });

  await app.listen(4000); // backend працює на порту 4000
}
bootstrap();
