export function arabicToRoman(num: number): string {
  const romanNumerals: [number, string][] = [
    [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], 
    [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], 
    [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
  ];
  
  let result = "";
  for (const [value, numeral] of romanNumerals) {
    while (num >= value) {
      result += numeral;
      num -= value;
    }
  }
  return result;
}

export function formatObject(entrie?: { plain_text: { [key: string]: string } }) {
  return entrie
    ? Object.values(entrie.plain_text)
        .map((value, index) => `${arabicToRoman(index + 1)}) ${value}`)
        .join("; ")
    : undefined;
}