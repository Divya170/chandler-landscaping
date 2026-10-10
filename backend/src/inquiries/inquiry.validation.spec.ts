import { validateQuote } from './inquiry.validation';

const SERVICES = ['lawn', 'hedge', 'cleanup'];
const day = (offset: number) => new Date(Date.now() + offset * 86_400_000).toISOString().slice(0, 10);

const valid = () => ({
  name: 'Jane Doe', phone: '(617) 555-0142', email: 'jane@example.com', service: 'lawn',
  location: '12 Elm Street, 10028', date: '', details: '', consent: true,
});

describe('validateQuote', () => {
  it('accepts a complete, valid request', () => {
    const { errors, data } = validateQuote(valid(), SERVICES);
    expect(errors).toEqual({});
    expect(data.name).toBe('Jane Doe');
    expect(data.service).toBe('lawn');
  });

  it('requires name, phone, email, location and consent', () => {
    const { errors } = validateQuote({}, SERVICES);
    expect(errors.name).toBe('Enter your full name.');
    expect(errors.phone).toBe('Enter a phone number we can reach you on.');
    expect(errors.email).toBe('Enter your email address.');
    expect(errors.location).toBe('Enter the property address, or neighborhood and ZIP code.');
    expect(errors.consent).toBe('Please confirm so we can use your details to reply.');
  });

  it('checks phone digits (7 to 15) and allowed characters', () => {
    expect(validateQuote({ ...valid(), phone: '12345' }, SERVICES).errors.phone).toBe('Check the number — it should have 7 to 15 digits.');
    expect(validateQuote({ ...valid(), phone: '1234567890123456' }, SERVICES).errors.phone).toBe('Check the number — it should have 7 to 15 digits.');
    expect(validateQuote({ ...valid(), phone: 'call me' }, SERVICES).errors.phone).toBe('Use only digits, spaces, brackets, + or -.');
    expect(validateQuote({ ...valid(), phone: '+1 617 722 6832' }, SERVICES).errors.phone).toBeUndefined();
  });

  it('checks the email format', () => {
    expect(validateQuote({ ...valid(), email: 'not-an-email' }, SERVICES).errors.email).toBe('Enter an email in the format name@example.com.');
    expect(validateQuote({ ...valid(), email: 'a@b.c' }, SERVICES).errors.email).toBe('Enter an email in the format name@example.com.');
  });

  it('rejects a name that is too short', () => {
    expect(validateQuote({ ...valid(), name: 'J' }, SERVICES).errors.name).toBe('Name looks too short.');
  });

  it('accepts "unsure" or no service, and rejects unknown services', () => {
    expect(validateQuote({ ...valid(), service: 'unsure' }, SERVICES).errors.service).toBeUndefined();
    expect(validateQuote({ ...valid(), service: '' }, SERVICES).errors.service).toBeUndefined();
    expect(validateQuote({ ...valid(), service: 'roofing' }, SERVICES).errors.service).toBe('Choose a service from the list, or “Not sure yet”.');
  });

  it('accepts today or a future date, and rejects the past or a malformed date', () => {
    expect(validateQuote({ ...valid(), date: day(0) }, SERVICES).errors.date).toBeUndefined();
    expect(validateQuote({ ...valid(), date: day(30) }, SERVICES).errors.date).toBeUndefined();
    expect(validateQuote({ ...valid(), date: day(-5) }, SERVICES).errors.date).toBe('Choose today or a future date.');
    expect(validateQuote({ ...valid(), date: '31/12/2030' }, SERVICES).errors.date).toBe('Enter a valid date.');
  });

  it('limits project details to 1,000 characters', () => {
    expect(validateQuote({ ...valid(), details: 'x'.repeat(1000) }, SERVICES).errors.details).toBeUndefined();
    expect(validateQuote({ ...valid(), details: 'x'.repeat(1001) }, SERVICES).errors.details).toBe('Keep the description under 1,000 characters.');
  });

  it('treats consent "on" and "true" as ticked, anything else as not', () => {
    expect(validateQuote({ ...valid(), consent: 'on' }, SERVICES).errors.consent).toBeUndefined();
    expect(validateQuote({ ...valid(), consent: 'true' }, SERVICES).errors.consent).toBeUndefined();
    expect(validateQuote({ ...valid(), consent: 'false' }, SERVICES).errors.consent).toBe('Please confirm so we can use your details to reply.');
  });

  it('trims whitespace around values', () => {
    const { data } = validateQuote({ ...valid(), name: '  Jane Doe  ', email: ' jane@example.com ' }, SERVICES);
    expect(data.name).toBe('Jane Doe');
    expect(data.email).toBe('jane@example.com');
  });
});
