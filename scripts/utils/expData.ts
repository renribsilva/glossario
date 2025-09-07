import { ni, nw } from "../../src/lib/normalizedEntry";

export default function expData(inputData: string[]): Record<string, { exp: { plain_text: Record<number, string> }; original: string }> {
  const outputData: Record<string, { exp: { plain_text: Record<number, string> }; original: string }> = {};

  for (const entry of inputData) {
    const key = Object.keys(entry)[0];
    const values = entry[key];

    if (values[0] !== "") {

      const term = ni(values[0]);
      const definition = values[1];
      const splitDefinitions = definition.split(/(?=\d+\.)/); 

      const plainTextObject: Record<number, string> = {};
      splitDefinitions.forEach((part, index) => {
        if (part.trim() !== "") {
          const cleanedDefinition = nw(part.replace(/^\d+\.\s*/, "").trim());
          plainTextObject[index + 1] = cleanedDefinition; 
        }
      });

      outputData[term] = {
        original: nw(values[0]),
        exp: { 
          plain_text: plainTextObject,
        },
      };
    }
  }

  return outputData;
}