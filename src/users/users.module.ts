import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserSchema } from './schema/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/auth/auth.module';
import { SendMailService } from 'src/mailer';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema }
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService, SendMailService]
})
export class UsersModule {}
