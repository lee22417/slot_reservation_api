import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthRegisterRequestDto } from './dto/auth_register_request.dto';
import { ApiOperation, ApiBody } from '@nestjs/swagger';

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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }
}
