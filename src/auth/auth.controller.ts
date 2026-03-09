import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  //Request body'de gelen veriyi al ve bunu dto değişkenine koy,o dto'yu service'e gönder
  singup(@Body() dto: AuthDto) {
    return this.authService.signup(dto);
  }

  @Post('signin')
  signin(@Body() dto: AuthDto, @Req() req, @Res() res) {
    return this.authService.signin(dto, req, res);
  }

  @Get('signout')
  signout(@Req() req, @Res() res) {
    return this.authService.signout(req,res);
  }
}
