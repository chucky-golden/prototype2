import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from './schema/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,

        // bringing in jwt to generate tokens
        private authService: AuthService,
    ){}

    async createAccount(signupDto: {email: string, username: string, password: string}){
        try{
            const user =  await this.userModel.create(signupDto);
            user.password = ''
            const token = await this.authService.generateToken({ id: user._id, type: 'user' })

            return { message: 'successful', user, token }

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

            return { message: 'successful', user, token }
        }catch(error: any){
            if (error instanceof UnauthorizedException) {
                throw error;
            } else {
                console.log('signing up ' + error);            
                throw new InternalServerErrorException(`user cannot be created now`);
            }   
        }
    }
}
