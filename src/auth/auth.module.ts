// nest g resource auth --no-spec -> NestJS CLI ile auth için module + controller + service oluşturur (test dosyaları oluşturulmaz)
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
