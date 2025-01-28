import { ni, nw } from "../../src/lib/normalizedEntry";

export default function conjData(inputData: string[]): Record<string, { plain_text: string | Record<number, string> }> {
  const outputData: Record<string, { plain_text: string | Record<number, string> }> = {};

  for (const entry of inputData) {

    const key = Object.keys(entry)[0];
    const values = entry[key];

    if (values[0] !== "") {
      const term = ni(values[0]);
      const conjValue = nw(String(values[1]));

      if (!outputData[term]) {
        outputData[term] = { plain_text: {} };
      }

      if (typeof outputData[term].plain_text === "string") {
        outputData[term].plain_text = { 1: outputData[term].plain_text as string };
      }

      const nextIndex = Object.keys(outputData[term].plain_text).length + 1;
      outputData[term].plain_text[nextIndex] = conjValue;
    }
  }

  return outputData;
}