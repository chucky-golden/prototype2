import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const corsOptions: CorsOptions = {
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: '*',
  };

  app.enableCors(corsOptions)

  app.useGlobalPipes(new ValidationPipe())  

  const config_service = new ConfigService()

  const PORT = config_service.get<number>("PORT");

  console.log(`Server started on Port: ${PORT}`);

  await app.listen(PORT ?? 3000);
}
bootstrap();
