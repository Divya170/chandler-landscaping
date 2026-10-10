import { BadRequestException, HttpException } from '@nestjs/common';

export type FieldErrors = Record<string, string>;

/** 400 with the `{errors:{field:message}}` shape the forms render inline. */
export function throwIfErrors(errors: FieldErrors) {
  const keys = Object.keys(errors);
  if (!keys.length) return;
  throw new BadRequestException({
    errors,
    message: keys.length === 1 ? '1 field needs your attention.' : `${keys.length} fields need your attention.`,
  });
}

/** 422 — honeypot or other spam signal. */
export class SpamRejectedException extends HttpException {
  constructor() {
    super({ message: "This request couldn't be accepted." }, 422);
  }
}

export const str = (v: unknown): string => (v === undefined || v === null ? '' : String(v));
export const optional = (v: unknown): string | null => {
  const s = str(v).trim();
  return s ? s : null;
};
