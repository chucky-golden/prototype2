import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose'
import * as bcrypt from 'bcrypt';
import { NextFunction } from 'express';


@Schema({ timestamps: true })

export class User extends Document{ 

    @Prop({ required: false })
    name: string

    @Prop({ unique: [true, 'Email Already Exist'] })
    readonly email: string

    @Prop({ unique: [true, 'Username Already Exist'] })
    username: string

    @Prop({ unique: [true, 'Phone Number Already Exist'] })
    phone: string

    @Prop()
    password: string

    @Prop({ required: false })
    picture: string
    
    @Prop({ default: 1 })
    active: Number
    
    @Prop({ default: 0 })
    depositBalance: Number
    
    @Prop({ default: 0 })
    betBalance: Number
    
    @Prop({ default: false })
    suscribed: Boolean
    
    @Prop({ default: '' })
    suscription: String
    
    @Prop({ default: '' })
    otp: String

    validatePassword: (password: string) => Promise<boolean>;
}

export const UserSchema = SchemaFactory.createForClass(User)

UserSchema.pre('save', async function (next: NextFunction) {
    if ((this.isNew && this.password) || this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  
    next();
});
  
UserSchema.methods.validatePassword = async function (password: string) {
    if (!this.password) return false;

    return await bcrypt.compare(password, this.password);
};