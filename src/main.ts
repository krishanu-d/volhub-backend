import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('VolHub API')
    .setDescription('API documentation for the VolHub application')
    .setVersion('1.0')
    .addBearerAuth() // If you're using Bearer token authentication (JWT)
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // The path where Swagger UI will be available

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
