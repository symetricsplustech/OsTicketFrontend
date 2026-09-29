export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateRequired(value: unknown): boolean {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

export function validateMinLength(value: string, min: number): boolean {
  return value.length >= min;
}

export function validateMaxLength(value: string, max: number): boolean {
  return value.length <= max;
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];
  if (password.length < 8) errors.push("Password must be at least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number");
  return errors;
}

export function validateConfirmPassword(password: string, confirmPassword: string): string[] {
  if (password !== confirmPassword) return ["Passwords do not match"];
  return [];
}

export function validateForm(fields: Array<{ name: string; value: unknown; required?: boolean; type?: string }>): ValidationResult {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (field.required && !validateRequired(field.value)) {
      errors[field.name] = "This field is required";
    }
    if (field.type === "email" && field.value && !validateEmail(String(field.value))) {
      errors[field.name] = "Invalid email format";
    }
  }
  return { isValid: Object.keys(errors).length === 0, errors };
}
