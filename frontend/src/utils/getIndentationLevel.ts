export const getIndentationLevel = (text: string): number => {
  let indentLevel = 0;
  for (const char of text) {
    if (char !== "\t") break;
    indentLevel++;
  }
  return indentLevel;
};
