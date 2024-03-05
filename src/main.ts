import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT || 5051;
  await app.listen(port, () => {
    console.log(`[CultureLand_BE] Server is running at port : ${port}`);
  });
}
bootstrap();
