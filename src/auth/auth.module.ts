import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { JwtStrategy } from './jwt-strategy';
// import { Admin, AdminSchema } from 'src/admin/schema/admin.schema';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          secret: config.get<string>('JWT_SECRET'),
          signOptions: {
            expiresIn: config.get<string | number>('JWT_EXPIRE')
          }
        }
      }
    }),

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      // { name: Admin.name, schema: AdminSchema },
    ]),
  ],
  controllers: [],
  providers: [AuthService, JwtStrategy, JwtService],
  exports: [AuthService, PassportModule], 
})
export class AuthModule {}
