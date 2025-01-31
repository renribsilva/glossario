import { ni, nw } from "../../src/lib/normalizedEntry";

type AnalogEntry = {
  original: string;
  num_ref: string;
  group: object;
  sub: string[];
  adj: string[];
  verb: string[];
  adv: string[];
  phr: string[];
};

export default function anaData(inputData: string[]): Record<string, AnalogEntry> {
  const outputData: Record<string, AnalogEntry> = {};

  for (const entry of inputData) {
    const key = Object.keys(entry)[0]; 
    const values = entry[key];

    if (values[6] !== "") {
      const normOriginal = ni(values[6]);
      const original = nw(values[6]);
      const subgroup0 = nw(values[0]);
      const subgroup1 = nw(values[1]);
      const subgroup2 = nw(values[2]);
      const subgroup3 = nw(values[3]);
      const subgroup4 = nw(values[4]);
      const num_ref = nw(values[5]);

      // Aqui, apenas aplicamos nw e depois split, map e filter sem adicionar um array extra
      const sub = nw(values[7]).split("$").map((item) => item.trim()).filter((item) => item !== "");
      const verb = nw(values[8]).split("$").map((item) => item.trim()).filter((item) => item !== "");
      const adj = nw(values[9]).split("$").map((item) => item.trim()).filter((item) => item !== "");
      const adv = nw(values[10]).split("$").map((item) => item.trim()).filter((item) => item !== "");
      const phrase = nw(values[11]).split("$").map((item) => item.trim()).filter((item) => item !== "");

      if (!outputData[normOriginal]) {
        outputData[normOriginal] = {
          original: original,
          num_ref: num_ref,
          group: {
            sub0: subgroup0,
            sub1: subgroup1,
            sub2: subgroup2,
            sub3: subgroup3,
            sub4: subgroup4,
          },
          sub: sub,
          adj: adj,
          verb: verb,
          adv: adv,
          phr: phrase,
        };
      }
    }
  }

  return outputData;
}
