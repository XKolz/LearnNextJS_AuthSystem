import { Controller, Post, Body, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    try {
      return await this.authService.register(createUserDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw new ConflictException('Email already registered');
      } else {
        throw new InternalServerErrorException('An error occurred while creating the user');
      }
    }
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid credentials');
      } else {
        throw new InternalServerErrorException('An error occurred during login');
      }
    }
  }

  @Post('verify-otp')
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      return await this.authService.verifyOtp(verifyOtpDto);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException('Invalid OTP');
      } else {
        throw new InternalServerErrorException('An error occurred during OTP verification');
      }
    }
  }

  @Post('realign')
  async realignIds() {
    return this.authService.realignIds();
  }
  
  @Post('reset')
  async resetAutoIncrement() {
    return this.authService.resetAutoIncrement();
  }
}
