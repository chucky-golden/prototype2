import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from "../users/schema/user.schema";
// import { Admin } from "../admin/schema/admin.schema";
import { Model } from "mongoose";
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';

dotenv.config();

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<User>,

        // @InjectModel(Admin.name)
        // private adminModel: Model<Admin>,

        @Inject(ConfigService)
        private config: ConfigService,

        private jwtService: JwtService
    ){}

    async validateUser(payload) {
        try {    
            const { id, type } = payload;
            
            if (type === 'user') {
                const user = await this.userModel.findById(id);
                if (!user) {
                    throw new UnauthorizedException('Login first to access this endpoint');
                }
                return user;
            } 
            // else if (type === 'admin') {
            //     const admin = await this.adminModel.findById(id);
            //     if (!admin) {
            //         throw new UnauthorizedException('Login first to access this endpoint');
            //     }
            //     return admin;
            // }
        } catch (error) {
            console.error('Error validating user:', error);
            throw new UnauthorizedException('Invalid token');
        }
    }

    async generateToken(user: any) {
        // Generate JWT token
        const payload = { id: user.id, type: user.type };
        const accessToken = this.jwtService.sign(
            payload, 
            { secret: this.config.get<string>('JWT_SECRET'), expiresIn: this.config.get<string | number>('JWT_EXPIRE') }
        );

        return accessToken
    }

}
