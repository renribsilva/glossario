import { ni, nw } from "../../src/lib/normalizedEntry";

export default function conjData(inputData: Record<string, string[]>[]): Record<string, { 
  conj: { plain_text: Record<number, string> }
  original: string
}> {
  const outputData: Record<string, { 
    conj: { plain_text: Record<number, string> }
    original: string
  }> = {};

  for (const entry of inputData) {
    const key = Object.keys(entry)[0]; 
    const values = entry[key];

    if (values[0] !== "") {
      const term = ni(values[0]);
      const conjValue = nw(String(values[1]));

      if (!outputData[term]) {
        outputData[term] = { 
          original: nw(values[0]),
          conj: { plain_text: {} } 
        };
      }

      const nextIndex = Object.keys(outputData[term].conj.plain_text).length + 1;
      outputData[term].conj.plain_text[nextIndex] = conjValue;
    }
  }

  return outputData;
}
