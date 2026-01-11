import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe, VersioningType } from '@nestjs/common';
import { ValidationError } from 'class-validator';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (validationErrors: ValidationError[] = []) => {
      return new BadRequestException(
        validationErrors.map((error) => {
          return {
            field: error.property,
            error: Object.values(error)
          }
        }),
      );
    },
    whitelist: true,
    transform: true,
  }));

  app.enableVersioning({
    type: VersioningType.URI,
  });

  await app.listen(8080);
}
bootstrap();


