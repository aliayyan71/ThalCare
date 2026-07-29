export type ValidationResult = {
  valid: boolean;
  message?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d\s\-()]{7,15}$/;

export function validateEmailOrPhone(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: 'Email or phone number is required' };
  }
  if (EMAIL_REGEX.test(trimmed) || PHONE_REGEX.test(trimmed)) {
    return { valid: true };
  }
  return { valid: false, message: 'Enter a valid email or phone number' };
}

export function validateEmail(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, message: 'Enter a valid email address' };
  }
  return { valid: true };
}

export function validatePassword(value: string): ValidationResult {
  if (!value) {
    return { valid: false, message: 'Password is required' };
  }
  if (value.length < 6) {
    return { valid: false, message: 'Password must be at least 6 characters' };
  }
  return { valid: true };
}

export function validateName(value: string): ValidationResult {
  const trimmed = value.trim();
  if (!trimmed) {
    return { valid: false, message: 'Name is required' };
  }
  if (trimmed.length < 2) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  return { valid: true };
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string,
): ValidationResult {
  if (!confirmPassword) {
    return { valid: false, message: 'Please confirm your password' };
  }
  if (password !== confirmPassword) {
    return { valid: false, message: 'Passwords do not match' };
  }
  return { valid: true };
}

export function toAuthEmail(identifier: string): string {
  const trimmed = identifier.trim();
  if (EMAIL_REGEX.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  const digits = trimmed.replace(/\D/g, '');
  return `${digits}@thalcare.phone`;
}
