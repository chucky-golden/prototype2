import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('api/users')
export class UsersController {
    constructor(private userService: UsersService){}

    @Post('/signup')
    signUp(@Body() signupDto: {email: string, username: string, password: string}){
        return this.userService.createAccount(signupDto)
    }

    @Post('/signin')
    signIn(@Body() signInDto: {email: string, password: string}){
        return this.userService.loginAccount(signInDto)
    }

    @Post('/forgot')
    forgotPassword(@Body() forgotDto: {email: string}){
        return this.userService.forgotPassword(forgotDto)
    }

    @Post('/reset')
    reset(@Body() resetDto: {password: string, cpassword: string, otp: string}){
        return this.userService.resetPassword(resetDto)
    }
}
