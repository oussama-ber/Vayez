import { Test, TestingModule } from '@nestjs/testing';
import { MailService } from './mail.service';
import * as nodemailer from 'nodemailer';

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MailService],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should send activation email', async () => {
    const sendMailMock = jest.fn().mockResolvedValue({});
    service['transporter'] = { sendMail: sendMailMock } as any;

    const to = 'test@example.com';
    const token = 'mockToken';

    await service.sendActivationEmail(to, token);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'Auth-backend service',
      to: to,
      subject: 'Account Activation',
      html: expect.stringContaining(`http://localhost/activate?token=${token}`),
    });
  });

  it('should send password reset email', async () => {
    const sendMailMock = jest.fn().mockResolvedValue({});
    service['transporter'] = { sendMail: sendMailMock } as any;

    const to = 'test@example.com';
    const token = 'mockToken';

    await service.sendPasswordResetEmail(to, token);
    expect(sendMailMock).toHaveBeenCalledWith({
      from: 'Auth-backend service',
      to: to,
      subject: 'Password Reset Request',
      html: expect.stringContaining(`http://localhost/reset-password?token=${token}`),
    });
  });
});
