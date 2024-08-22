export const checkIfList = (text: string): boolean => {
  return /\s*(?=-\s*\w)/.test(text);
};
