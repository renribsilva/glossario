import { nw } from "../../src/lib/normalizedEntry";

type SinEntry = {
  plain_text: string;
  entries: string[];
};

export default function sinData(inputData: Record<string, string[]>[]): Record<string, SinEntry> {
  const outputData: Record<string, SinEntry> = {};

  for (const entry of inputData) {
    const key = Object.keys(entry)[0]; // Pegando a chave numérica (como "0", "1", "2", ...)
    const values = entry[key]; // Obtendo o array de duas strings

    if (values && values.length >= 2) {
      const plain_text = nw(values[1]); // Normaliza a palavra-chave
      const entries = nw(values[0]
        .toLowerCase())
        .replace(/\([^)]*\)/g, "") // Remove tudo dentro de parênteses e os próprios parênteses
        .replace(/[\d]/g, "") // Remove números
        .replace(/\b\w+-se\b/g, "") // Remove "-se"
        .replace(/[-–—]+/g, " ") // Remove hífens e traços
        .trim()
        .split(/[,;@#*]/) // Divide usando os caracteres separadores
        .map((item) => item.trim().replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")) // Remove espaços extras e pontuações
        .filter((item) => item !== ""); // Remove strings vazias

      if (!outputData[plain_text]) {
        outputData[plain_text] = {
          plain_text,
          entries,
        };
      }
    }
  }

  return outputData;
}
