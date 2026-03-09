import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthDto } from './dto/auth.dto';
import * as bctypt from 'bcrypt';

@Injectable()
export class AuthService {
  //aynı email ile ikinci kez kayıt olmayı engeller
  constructor(private prisma: PrismaService) {}
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
  async signin(dto: AuthDto) {
    const { email, password } = dto;

    const foundUser = await this.prisma.user.findUnique({ where: { email } });

    if (!foundUser) {
      throw new BadRequestException('Wrong credentials.');
    }
    const isMatch = await this.comparePasswords({
      password,
      hash: foundUser.hashedPassword,
    });

    if (!isMatch) {
      throw new BadRequestException('Wrong credentials.');
    }

    //sign jwt and return to the user 
    
    return '';
  }
  async signout() {
    return '';
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
}
