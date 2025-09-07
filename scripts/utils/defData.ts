import { ni, nw } from "../../src/lib/normalizedEntry"; // Ajuste conforme necessário

export default function defData(inputData: string[]): Record<string, { 
  original: string,
  def: { plain_text: string | Record<number, string> } 
}> {
  const outputData: Record<string, { 
    original: string,
    def: { plain_text: string | Record<number, string> } 
  }> = {};

  for (const entry of inputData) {
    const key = Object.keys(entry)[0];
    const values = entry[key];

    if (values[0] !== "") {
      const term = ni(values[0]);
      const defValue = nw(String(values[2]));

      if (!outputData[term]) {
        outputData[term] = { 
          original: nw(values[0]),
          def: { plain_text: {} } 
        };
      }

      if (typeof outputData[term].def.plain_text === "string") {
        outputData[term].def.plain_text = { 1: outputData[term].def.plain_text as string };
      }

      const nextIndex = Object.keys(outputData[term].def.plain_text).length + 1;
      outputData[term].def.plain_text[nextIndex] = defValue;
    }
  }

  return outputData;
}
