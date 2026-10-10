const mockSendMail = jest.fn();
jest.mock('nodemailer', () => ({ createTransport: jest.fn(() => ({ sendMail: mockSendMail })) }));

import { config } from '../config';
import { MailService } from './mail.service';

const mail = { to: 'beau@example.com', subject: 'Hi', text: 'Hello', html: '<p>Hello</p>' };
const smtp = (over: Partial<typeof config.smtp>) => Object.assign(config.smtp, { host: '', from: '', user: '', pass: '', ...over });

describe('MailService', () => {
  beforeEach(() => { mockSendMail.mockReset(); });

  it('does nothing and returns false when SMTP is not configured', async () => {
    smtp({});
    const svc = new MailService();
    expect(svc.configured).toBe(false);
    await expect(svc.send(mail)).resolves.toBe(false);
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('sends through SMTP when configured', async () => {
    smtp({ host: 'smtp.example.com', from: 'Chandler <alerts@example.com>' });
    mockSendMail.mockResolvedValue({});
    const svc = new MailService();
    expect(svc.configured).toBe(true);
    await expect(svc.send(mail)).resolves.toBe(true);
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'Chandler <alerts@example.com>', to: 'beau@example.com', subject: 'Hi' }));
  });

  it('returns false instead of throwing when the SMTP server fails', async () => {
    smtp({ host: 'smtp.example.com', from: 'alerts@example.com' });
    mockSendMail.mockRejectedValue(new Error('connection refused'));
    await expect(new MailService().send(mail)).resolves.toBe(false);
  });
});
