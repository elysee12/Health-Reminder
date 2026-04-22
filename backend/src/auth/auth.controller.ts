import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { PasswordResetRequestDto } from './dto/password-reset-request.dto';
import { PasswordResetConfirmDto } from './dto/password-reset-confirm.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('password-reset/request')
  requestPasswordReset(@Body() passwordResetRequestDto: PasswordResetRequestDto) {
    return this.authService.requestPasswordReset(passwordResetRequestDto);
  }

  @Post('password-reset/confirm')
  confirmPasswordReset(@Body() passwordResetConfirmDto: PasswordResetConfirmDto) {
    return this.authService.confirmPasswordReset(passwordResetConfirmDto);
  }
}
