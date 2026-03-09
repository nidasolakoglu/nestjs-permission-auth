import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bctypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { jwtSecret } from '../utils/constants';
import type { Request, Response } from 'express';

@Injectable()
export class AuthService {
  //aynı email ile ikinci kez kayıt olmayı engeller
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}
  // dto içinden email ve password alanlarını çıkar
  async signup(dto: AuthDto) {
    const { email, password } = dto;

    const foundUser = await this.prisma.user.findUnique({ where: { email } });

    if (foundUser) {
      throw new BadRequestException('Email already exists');
    }

    const hashedPassword = await this.hashPassword(password);

    await this.prisma.user.create({
      data: {
        email,
        hashedPassword,
      },
    });

    return { message: 'signup was succesfull' };
  }
  async signin(dto: AuthDto, req: Request, res: Response) {
    const { email, password } = dto;

    const foundUser = await this.prisma.user.findUnique({ where: { email } });

    if (!foundUser) {
      throw new BadRequestException('Wrong credentials.');
    }

    //kullanıcının yazdığı şifre ile db'de eşlenmiş şifre eşleşiyor mu?
    const isMatch = await this.comparePasswords({
      password,
      hash: foundUser.hashedPassword,
    });

    if (!isMatch) {
      throw new BadRequestException('Wrong credentials.');
    }

    //bu kullanıcı için token üret
    //sign jwt and return to the user
    const token = await this.signToken({
      userId: foundUser.id,
      email: foundUser.email,
    });

    if (!token) {
      throw new ForbiddenException('Could not signin');
    }

    //kullanıcı login olduktan sonra ona bir jwt token ürettin ve bu token'ı cookie içine yazıyorsun
    //bu tokenı cookie'ye koy sonra da başarı mesajı dön
    //token adlı cookie oluştur ve içine bu değeri koy.
    res.cookie('token', token);

    return res.send({ message: 'Logged in succesfully' });
  }
  async signout(req: Request, res: Response) {
    res.clearCookie('token');
    return res.send({ message: 'Logged out succesfully' });
  }
  //kullanıcıdan gelen password alınır
  async hashPassword(password: string) {
    //saltOrRounds=bcrypt içinde kaç tur hesaplama yapılacağını belirleyen sayı.
    //başka bir deyişle hashleme işleminin zorluk seviyesi
    //salt=rastgele eklenen veri
    const saltOrRounds = 10;

    //password hashlenir
    const hashedPassword = await bctypt.hash(password, saltOrRounds);

    return hashedPassword;
  }

  async comparePasswords(args: { password: string; hash: string }) {
    return await bctypt.compare(args.password, args.hash);
  }

  //kullanıcı için JWT token üreteceğiz
  async signToken(args: { userId: string; email: string }) {
    //token içine konulacak veriyi oluşturur
    const payload = {
      id: args.userId,
      email: args.email,
    };
    //token oluşturma= payload'ı al JWT token üret
    const token = await this.jwt.signAsync(payload, {
      //token imzalamak için kullanılan gizli anahtar
      secret: jwtSecret,
    });
    return this.jwt.signAsync(payload, { secret: jwtSecret });
  }
}
