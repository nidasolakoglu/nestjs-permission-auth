import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
//cookie parser, gelen http req içindeki cookileri parse edip okunabilir hale getiren middleware'dir.
//tarayıcıdan string olarak gelir cookie parser bunu object'e çevirir.
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //useGlobalPipes=tüm controllerlarda çalış
  //ve aşağıdaki satırın anlamı=app.useGlobalPipes(new ValidationPipe())=
  //DTO'lara gelen request verilerini otomatik doğrula (validate et)
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe( {whitelist: true }));
  //whitelist:dto'da olmayan alanlar doldurulmayacak 
  await app.listen(5000);
}
bootstrap();
