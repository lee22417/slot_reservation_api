import { Controller, Get, Post, Body, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterRequestDto } from './dto/auth_register_request.dto';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 회원가입
  @Post('register')
  @ApiOperation({
    summary: '회원가입',
    description: '신규 회원 가입',
  })
  @ApiBody({ type: AuthRegisterRequestDto, description: '회원가입 요청' })
  async register(@Body() authRegisterRequestDto: AuthRegisterRequestDto) {
    return await this.authService.register(authRegisterRequestDto);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  // jwt token 조회
  @UseGuards(JwtAuthGuard) // JwtAuthGuard.canActivate() 실행
  @Get('token')
  async checkJwtToken(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return await this.authService.checkJwtToken(token);
  }
}
