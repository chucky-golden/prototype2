import * as Mailgen from 'mailgen';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const nodemailer = require('nodemailer');

@Injectable()
export class SendMailService {
    private transporter: any;
    private mailGenerator: any;
    private user: string;

    constructor(private config: ConfigService) {
        this.mailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Banter',
                link: 'https://www.banter.com/'
            }
        });

        const HOST = this.config.get<string>('EMAIL_HOST');
        const PORT = this.config.get<number>('EMAIL_PORT');
        this.user = this.config.get<string>('EMAIL_USER');
        const PASS = this.config.get<string>('EMAIL_PASS');

        this.transporter = nodemailer.createTransport({
            host: HOST,
            port: PORT,
            secure: true,
            auth: {
                user: this.user,
                pass: PASS
            }
        });
    }

    async generateMail(num: string) {
        var emailSender = {
            body: {
                name: 'User',
                intro: 'We got a request to reset your password. If this was you, enter the OTP in the next page to reset your password, or ignore it, and nothing will happen to your account.',
                action: {
                    instructions: 'To get started, enter the OTP in the app window',
                    button: {
                        color: '#ffffff',
                        text: `<span style="font-size: 30px; font-weight: bolder; color: black">${num}</span>`,
                        link: ''
                    }
                },
                outro: "Need help, or have questions? Just reply to this email, we'd love to help.\n\n Team Banter."
            }
        };

        return this.mailGenerator.generate(emailSender);
    }

    async sendMail(to: string, subject: string, num: string) {
        try {
            const message = await this.generateMail(num);
            const mailOptions = {
                from: this.user,
                to,
                subject,
                html: message
            };

            const info = await this.transporter.sendMail(mailOptions);
            return info.response.includes('OK');
        } catch (error) {
            console.error('Mail sending error:', error);
            return false;
        }
    }
}
