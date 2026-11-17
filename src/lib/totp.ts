import { Secret, TOTP } from 'otpauth';
import QRCode from 'qrcode';

export function generateTotpSecret(): string {
  const secret = new Secret({ size: 20 });
  return secret.base32;
}

export function buildTotpUri(secret: string, email: string): string {
  const totp = new TOTP({
    issuer: 'CaidensServices',
    label: email,
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });
  return totp.toString();
}

export async function generateQrCodeDataUrl(uri: string): Promise<string> {
  return QRCode.toDataURL(uri, { width: 220, margin: 2 });
}

export function verifyTotpCode(secret: string, token: string): boolean {
  const totp = new TOTP({
    issuer: 'CaidensServices',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret,
  });
  const delta = totp.validate({ token: token.trim(), window: 1 });
  return delta !== null;
}
