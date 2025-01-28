import { ni, nw } from "../../src/lib/normalizedEntry";

type AnalogEntry = {
  original: string;
  num_ref: string
  group: object
  sub: string;
  adj: string;
  verb: string;
  adv: string;
  phrase: string;
};

export default function anaData(inputData: string[]): Record<string, AnalogEntry> {
  const outputData: Record<string, AnalogEntry> = {};

  for (const entry of inputData) {
    const key = Object.keys(entry)[0]; 
    const values = entry[key];

    if (values[6] !== "") {
      const normOriginal = ni(values[6]);
      const original = nw(values[6]);
      const subgroup0 = values[0];
      const subgroup1 = values[1];
      const subgroup2 = values[2];
      const subgroup3 = values[3];
      const subgroup4 = values[4];
      const num_ref = values[5];
      const sub = values[7];
      const verb = values[8];
      const adj = values[9];
      const adv = values[10];
      const phrase = values[11];

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
          phrase: phrase,
        };
      }
    }
  }

  return outputData;
}