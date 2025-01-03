import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';
import { SendMailService } from 'src/mailer';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,

        // bringing in jwt to generate tokens
        private authService: AuthService,

        // send mail service
        private readonly sendMailService: SendMailService
    ){}

    async createAccount(signupDto: {email: string, username: string, password: string}){
        try{
            const user =  await this.userModel.create(signupDto);
            user.password = ''
            const token = await this.authService.generateToken({ id: user._id, type: 'user' })

            return { status: 'successful', message: 'account created', user, token }

        }catch(error: any){
            if (error instanceof UnauthorizedException) {
                throw error;
            } else {
                console.log('signing up ' + error);            
                throw new InternalServerErrorException(`user cannot be created now`);
            }
        }
    }

    async loginAccount(signInDto: {email: string, password: string}){
        try{
            const { email, password } = signInDto

            const user = await this.userModel.findOne({ email: email })

            if(!user){
                throw new UnauthorizedException('invalid email or password')
            }

            if(user.active !== 1){
                throw new UnauthorizedException('account has been blocked')
            }

            if (!user || !(await user.validatePassword(password))) {
                throw new NotFoundException('Invalid email or password!');
            }

            user.password = ''
            const token = await this.authService.generateToken({ id: user._id, type: 'user' })

            return { status: 'successful', message: 'login successful', user, token }
        }catch(error: any){
            if (error instanceof UnauthorizedException || error instanceof NotFoundException) {
                throw error;
            } else {
                console.log('sign in ' + error);            
                throw new InternalServerErrorException(`user cannot be created now`);
            }   
        }
    }

    async forgotPassword(forgotDto: {email: string}){
        try{
            const { email } = forgotDto

            const user = await this.userModel.findOne({ email })

            if(!user){
                throw new NotFoundException('email does not exist')
            }

            let num: string = ""
            for(let i = 0; i < 6; i++){ 
                num += Math.floor(Math.random() * (9 - 0 + 1)) + 0;
            }

            let send = await this.sendMailService.sendMail(email, 'Password Recovery', num)
            if(send === true){
                await this.userModel.updateOne({ email: email }, 
                    {
                        $set:{
                            otp: num
                        }
                    }
                )
                return { status: 'successful',  message: 'otp sent to mail', email, num}
            }else{
                throw new BadRequestException('error sending mail')
            }
        }catch(error: any){
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            } else {
                console.log('sign in: ' + error);            
                throw new InternalServerErrorException(`user cannot be created now`);
            }  
        }
    }

    async resetPassword( resetDto: {password: string, cpassword: string, otp: string}){
        try{
            const { otp, password, cpassword } = resetDto

            const user = await this.userModel.findOne({ otp: otp });

            if (password != cpassword) {
                throw new BadRequestException('password do not match')
            }


            if (!user) {
                throw new NotFoundException('invalid or expired otp')
            }

            user.password = password;
            user.otp = ''

            user.save({ validateModifiedOnly: true, validateBeforeSave: false });
            
            return { status: 'successful', message: 'password reset successful',}
        }catch(error: any){
            if (error instanceof BadRequestException || error instanceof NotFoundException) {
                throw error;
            } else {
                console.log('sign in: ' + error);            
                throw new InternalServerErrorException(`user cannot be created now`);
            }  
        }
    }
}
