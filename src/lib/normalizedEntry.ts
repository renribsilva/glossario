export function ni(input: string): string {
  if (input == null) {
    return "";
  }

  const normalizedInput = input.normalize("NFD");

  if (typeof normalizedInput !== "string") {
    console.error("Erro: nw failed -> word não é uma string:", normalizedInput);
    return "";
  }

  const cleaned = normalizedInput.replace(/[\u0300-\u036f]/g, (match) => {
    if (match === "\u0327") {
      return match;
    }
    return "";
  });
  
  const result = cleaned
    .toLowerCase()
    .replace(/--+/g, "-")
    .trim()
    .replace(/#/g, ",")
    .replace(/\*/g, ":")
    .replace(/@/g, ";")
    .replace(/"\s*"/g, "\"")
    .replace(/[.;:]+$/, "")
    .normalize("NFC");

  return result.replace(/[.;:]$/, "");
}

export const nw = (word: string): string => {
  if (word == null) {
    return "";
  }

  if (typeof word !== "string") {
    console.error("Erro: nw failed -> word não é uma string:", word);
    return "";
  }

  return word
    .trim()
    .replace(/#/g, ",")
    .replace(/\*/g, ":")
    .replace(/@/g, ";")
    .replace(/"\s*"/g, "\"")
    .replace(/[.;:]$/, "")
    .normalize("NFC");
};

// Exemplos de uso
// console.log(ni("pôr"));      
// console.log(ni("ç"));        
// console.log(ni("àç."));      
// console.log(ni("começar;"));  
// console.log(ni("café."));     
// console.log(ni("ação"));     
// console.log(ni("co-habitar;"));  
