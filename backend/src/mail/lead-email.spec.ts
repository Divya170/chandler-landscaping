import { buildLeadEmail, LeadEmailInput, oneLine } from './lead-email';

const lead = (over: Partial<LeadEmailInput> = {}): LeadEmailInput => ({
  reference: 'CL-K3F9QZ', name: 'Jane Doe', phone: '(617) 555-0142', email: 'jane@example.com', serviceLabel: 'Lawn care',
  location: '12 Elm Street', preferredDate: '2030-05-01', details: 'Front lawn needs reseeding.', photoCount: 2,
  receivedAt: new Date('2030-04-01T15:30:00Z'), ...over,
});
const URL = 'https://example.com/admin/enquiries';

describe('buildLeadEmail', () => {
  it('puts the reference, name and service in the subject', () => {
    expect(buildLeadEmail(lead(), URL, 'Chandler Landscaping').subject).toBe('New quote request CL-K3F9QZ — Jane Doe (Lawn care)');
  });

  it('includes every detail and the admin link in the plain-text body', () => {
    const { text } = buildLeadEmail(lead(), URL, 'Chandler Landscaping');
    for (const bit of ['CL-K3F9QZ', 'Jane Doe', '(617) 555-0142', 'jane@example.com', 'Lawn care', '12 Elm Street', '2030-05-01', 'Front lawn needs reseeding.', URL]) {
      expect(text).toContain(bit);
    }
    expect(text).toContain('Photos attached: 2');
  });

  it('says so when optional fields are empty', () => {
    const { text } = buildLeadEmail(lead({ preferredDate: null, details: null, photoCount: 0 }), URL, 'Chandler Landscaping');
    expect(text).toContain('Preferred date: Not given');
    expect(text).toContain('Photos attached: None');
    expect(text).toContain('(none given)');
  });

  it('escapes HTML in visitor-supplied text', () => {
    const { html } = buildLeadEmail(lead({ name: '<script>alert(1)</script>', details: '"><img src=x onerror=alert(1)>' }), URL, 'Chandler Landscaping');
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('keeps line breaks out of the subject', () => {
    const { subject } = buildLeadEmail(lead({ name: 'Jane\r\nBcc: attacker@example.com' }), URL, 'Chandler Landscaping');
    expect(subject).not.toMatch(/[\r\n]/);
  });
});

describe('oneLine', () => {
  it('collapses control characters and extra spaces', () => {
    expect(oneLine('a\r\nb\t c')).toBe('a b c');
  });
});
