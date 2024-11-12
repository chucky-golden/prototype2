import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from './users.service';

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
}
