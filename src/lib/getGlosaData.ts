import Glossario from "../json/glossary.json";
import { GlosaData, GlosaEntry } from "../types";
import { formatObject } from "./arabicToRoman";
import { ni } from "./normalizedEntry";

export function getGlosaEntries(inputValue: string) {
  const entries: GlosaEntry[] = [];
  const regex = new RegExp(`(^|\\s)${inputValue}($|\\s)`, "i");

  for (const [chave, valor] of Object.entries(Glossario)) {
    if (regex.test(ni(chave))) {
      entries.push({ original: valor.original });
    }
  }
  return entries;
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