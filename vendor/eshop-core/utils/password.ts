export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true
};

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Heslo musí mať aspoň ${PASSWORD_REQUIREMENTS.minLength} znakov`);
  }

  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Heslo musí obsahovať aspoň jedno číslo');
  }

  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*]/.test(password)) {
    errors.push('Heslo musí obsahovať aspoň jeden špeciálny znak (!@#$%^&*)');
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Heslo musí obsahovať aspoň jedno veľké písmeno');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
} 