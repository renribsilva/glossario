import Glossario from "../json/glossary.json";
import { GlosaData, GlosaEntry } from "../types";
import { formatObject } from "./arabicToRoman";
import { ni } from "./normalizedEntry";

export function getGlosaEntries(inputValue: string, inputFullText: string) {
  const entries: GlosaEntry[] = [];
  const regex = new RegExp(`(^|\\s)${inputValue}($|\\s)`, "i");

  for (const [chave, valor] of Object.entries(Glossario)) {
    if (regex.test(ni(chave))) {
      entries.push({ original: valor.original });
    }
  }

  // Ordena colocando no topo os que terminam com inputFullText
  return entries.sort((a, b) => {
    const aEndsWith = ni(inputFullText).endsWith(ni(a.original)) ? -1 : 0;
    const bEndsWith = ni(inputFullText).endsWith(ni(b.original)) ? -1 : 0;
    return aEndsWith - bEndsWith;
  });
}

export function getGlosaData(input: string) {
  const valor = Glossario[input];
  if (valor) {
    const data: GlosaData = {
      original: valor.original || undefined,
      exp: formatObject(valor.exp),
      conj: formatObject(valor.conj),
      gram: formatObject(valor.gram),
      def: formatObject(valor.def),
      dif: formatObject(valor.dif),
    };

    return data;
  }
}