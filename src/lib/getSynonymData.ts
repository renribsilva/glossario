import Synonyms from "../json/synonyms.json";
import { SinData } from "../types";
import { ni } from "./normalizedEntry";

export function getSynonymsKeysData(inputValue: string | undefined) {
  const results = Synonyms.filter((synonym: SinData) =>
    synonym.entries.some((entry) =>
      ni(entry) === inputValue
    )
  );
  return results;
}