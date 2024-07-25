import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendActivationEmail(email: string, token: string) {
    const url = `http://localhost/activate?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      from: 'babayfiras6@gmail.com',
      subject: 'Activate your account',
      template: './activation',
      context: {
        url,
      },
    });
  }
}
