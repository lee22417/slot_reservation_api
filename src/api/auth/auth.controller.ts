import { Controller, Get, Post, Body, Headers, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterRequestDto } from './dto/auth_register_request.dto';
import { ApiOperation, ApiBody, ApiHeader } from '@nestjs/swagger';
import { JwtAuthGuard } from './jwt.guard';
import { AuthLoginRequestDto } from './dto/auth_login_request.dto';

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

  // 로그인
  @Post('login')
  @ApiOperation({
    summary: '로그인',
    description: '로그인',
  })
  @ApiBody({ type: AuthLoginRequestDto, description: '회원가입 요청' })
  async login(@Body() authLoginRequestDto: AuthLoginRequestDto) {
    return await this.authService.login(authLoginRequestDto);
  }

  // jwt token 조회
  @UseGuards(JwtAuthGuard) // JwtAuthGuard.canActivate() 실행
  @Get('token')
  @ApiOperation({ summary: 'jwt token 조회', description: 'jwt token 조회' })
  @ApiHeader({ name: 'authorization', description: 'jwt token' })
  async checkJwtToken(@Req() req) {
    const payload = req.user; // JwtStrategy.validate()에서 return한 값
    return { success: true, payload: payload };
  }
}
