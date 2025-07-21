// Phone number formatting utilities

export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Apply formatting: (xxx) xxx-xxxx
  if (digits.length === 0) return '';
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

export const unformatPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const isValidPhoneNumber = (value: string): boolean => {
  const digits = unformatPhoneNumber(value);
  return digits.length === 10;
};
