/**
 * Form validation utilities for Email and Phone numbers
 */

/**
 * Validates that an email contains '@' and follows standard email format
 */
export const validateEmail = (email: string): string | null => {
  const val = email.trim();
  if (!val) {
    return 'Email address is required';
  }
  if (!val.includes('@')) {
    return "Email must include '@' (e.g. name@hospital.org)";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(val)) {
    return "Please enter a valid email address (e.g. name@hospital.org)";
  }
  return null;
};

/**
 * Validates phone numbers:
 * - Cannot contain any letters
 * - Only numbers and standard phone formatting (+, -, spaces, parentheses)
 * - Must contain at least 7 digits
 */
export const validatePhone = (phone: string): string | null => {
  const val = phone.trim();
  if (!val) {
    return 'Contact phone number is required';
  }
  if (/[a-zA-Z]/.test(val)) {
    return 'Phone number cannot contain letters, only numbers are allowed';
  }
  const allowedCharsRegex = /^[0-9+\-\s()]+$/;
  if (!allowedCharsRegex.test(val)) {
    return 'Phone number can only contain numbers, +, -, and spaces';
  }
  const digits = val.replace(/\D/g, '');
  if (digits.length < 7) {
    return 'Phone number must have at least 7 digits';
  }
  if (digits.length > 20) {
    return 'Phone number cannot exceed 20 digits';
  }
  return null;
};
