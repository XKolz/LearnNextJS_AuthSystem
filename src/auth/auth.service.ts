// src/auth/auth.service.ts
import { Injectable, ConflictException, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private connection: Connection,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<User> {
    const { firstname, email, password } = createUserDto;
    const existingUser = await this.usersRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const user = this.usersRepository.create({ firstname, email, password });
    try {
      const savedUser = await this.usersRepository.save(user);
      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      savedUser.otp = otp;
      await this.usersRepository.save(savedUser);
      await this.sendOtpEmail(email, otp);
      return savedUser;
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while creating the user');
    }
  }

  async sendOtpEmail(email: string, otp: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use any email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from:  process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
  }

  async verifyOtp(verifyOtpDto: VerifyOtpDto): Promise<{ user: User, access_token: string }> {
    const { email, otp } = verifyOtpDto;
    const user = await this.usersRepository.findOne({ where: { email, otp } });
    if (!user) {
      throw new UnauthorizedException('Invalid OTP');
    }
    const payload = { email: user.email, sub: user.id };
    const access_token = this.jwtService.sign(payload);
    user.otp = null; // Clear OTP after verification
    user.isVerified = true; // Mark user as verified
    await this.usersRepository.save(user);
    return {
      user,
      access_token,
    };
  }

  async login(loginDto: LoginDto): Promise<{ user: User, access_token: string }> {
    const user = await this.usersRepository.findOne({ where: { email: loginDto.email } });
    if (user && (await bcrypt.compare(loginDto.password, user.password))) {
      if (!user.isVerified) {
        throw new UnauthorizedException('User not verified');
      }
      const payload = { email: user.email, sub: user.id };
      const access_token = this.jwtService.sign(payload);
      if (!user.welcomeEmailSent) {
        await this.sendWelcomeEmail(user.email);
        user.welcomeEmailSent = true;
        await this.usersRepository.save(user);
      }
      return {
        user,
        access_token,
      };
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  async sendWelcomeEmail(email: string) {
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use any email service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to XK’s Family',
      text: 'Welcome to XK’s Family!',
    };

    await transporter.sendMail(mailOptions);
  }

  async findUserById(id: number): Promise<User> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async realignIds() {
    await this.connection.transaction(async manager => {
      await manager.query('CREATE TABLE IF NOT EXISTS temp_user LIKE user');
      await manager.query('SET @new_id = 0');
      await manager.query(`
        INSERT INTO temp_user (id, firstname, email, password, isVerified, welcomeEmailSent)
        SELECT @new_id := @new_id + 1, firstname, email, password, isVerified, welcomeEmailSent FROM user ORDER BY id
      `);
      await manager.query('DROP TABLE user');
      await manager.query('ALTER TABLE temp_user RENAME TO user');
      await manager.query('ALTER TABLE user AUTO_INCREMENT = 1');
    });
  }

  async resetAutoIncrement() {
    const result = await this.usersRepository.query('SELECT MAX(id) as maxId FROM user');
    const maxId = result[0].maxId || 0;

    // If there are no users, set AUTO_INCREMENT to 1, otherwise set it to maxId + 1
    const newAutoIncrementValue = maxId === 0 ? 1 : maxId + 1;

    await this.usersRepository.query(`ALTER TABLE user AUTO_INCREMENT = ${newAutoIncrementValue}`);
  }

}
