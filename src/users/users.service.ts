import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Request } from 'express';
import type { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) {}
    
    //controller'dan gelen kullanıcı idsi:id
    //HTTP'den gelen req onjesi,çünkü JWT doğrulandıktan sonra kullanıcı bilgisi req.user içine konur.
    //Yani giriş yapan kişinin kim olduğunu buradan öğreniyoruz
    
    async getMyUser(id: string,req: Request) {
        const user = await this.prisma.user.findUnique({ where: {id} })
        
        if(!user) {
            throw new NotFoundException()
        }

        //JwtGuard ve JwtStrategy kullanıyorsun.Onlar request geldiinde token'ı doğrulayıp payload'ı req.user içine koyar.
        //req.user onjesinin içindeki id ve email var kabul ediyorum 
        const decodeUser = req.user as {id:string, email:string}

        //YETKİ KONTROLÜ
        //URL'de istenen kullanıcı ile tokan'daki giriş yapan kullanıcı aynı kişi mi değilse hata fırlat
        if( user.id !== decodeUser.id) {
            throw new ForbiddenException()
        }

        //kullanıcı objesinden password'ü silip kalan bilgileri safeUser'a atıyor ve onu döndürüyor
        const { hashedPassword, ...safeUser} = user;
        return safeUser;
    }

    async getUsers() {
        return await this.prisma.user.findMany({
        select: {id: true, email: true},
     });

    
    }
}
