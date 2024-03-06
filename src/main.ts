import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TransformInterceptor } from './interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 5051;

  app.useGlobalInterceptors(new TransformInterceptor());

  await app.listen(port, () => {
    console.log(`[CultureLand_BE] Server is running at port : ${port}`);
  });
}
bootstrap();
