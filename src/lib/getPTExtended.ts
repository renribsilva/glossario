import dataAB from "../json/ptBRJson/pt_BR_extended_AB.json";
import dataCD from "../json/ptBRJson/pt_BR_extended_CD.json";
import dataEF from "../json/ptBRJson/pt_BR_extended_EF.json";
import dataGHI from "../json/ptBRJson/pt_BR_extended_GHI.json";
import dataJKL from "../json/ptBRJson/pt_BR_extended_JKL.json";
import dataMNO from "../json/ptBRJson/pt_BR_extended_MNO.json";
import dataPQR from "../json/ptBRJson/pt_BR_extended_PQR.json";
import dataSTU from "../json/ptBRJson/pt_BR_extended_STU.json";
import dataVXZ from "../json/ptBRJson/pt_BR_extended_VXZ.json";
import { ExtendedWordMap } from "../types";

// Junta todos os arquivos em um único objeto
const extendedData: ExtendedWordMap = {
  ...dataAB,
  ...dataCD,
  ...dataEF,
  ...dataGHI,
  ...dataJKL,
  ...dataMNO,
  ...dataPQR,
  ...dataSTU,
  ...dataVXZ,
};

const cache = new Map<string, string[]>();

export function getPTExtended(searchTerm: string, searchType: "starts" | "contains" | "ends"): string[] {
  
  const cacheKey = `${searchTerm}|${searchType}`;

  if (cache.has(cacheKey)) {
    console.log("Usando cache");
    return cache.get(cacheKey)!;
  }

  const result: string[] = [];
  const searchLower = searchTerm.toLowerCase();

  for (const word in extendedData) {
    const wordData = extendedData[word];
    for (const flag in wordData) {
      const matches = new Set<string>(); 
      for (const variation of wordData[flag]) {
        const variationLower = variation.toLowerCase(); 
        if (
          (searchType === "starts" && variationLower.startsWith(searchLower)) ||
          (searchType === "contains" && variationLower.includes(searchLower)) ||
          (searchType === "ends" && variationLower.endsWith(searchLower))
        ) {
          matches.add(variation);
          matches.add(word); 
        }
      }

      if (matches.size > 0) {
        result.push(...Array.from(matches));
      }
    }
  }

  const uniqueList = Array.from(new Set(result));
  cache.set(cacheKey, uniqueList);
  // console.log(uniqueList);
  return uniqueList;

}

// getPTExtended("inar", "starts");