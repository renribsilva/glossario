import fs from "fs";
import path from "path";
import { ExtendedWordMap } from "../types";

const jsonDir = path.join(process.cwd(), "src", "json", "ptBRExtendedJson", "flagsJson");
const dicPath = path.join(process.cwd(), "public", "libre", "pt_BR.dic");

const extendedDataCache: { [key: string]: { data: ExtendedWordMap } } = {};
let dicWordsCache: string[] | null = null;

// Função para carregar os arquivos JSON, mas de forma otimizada (cache)
const loadAffFiles = (flagGroup: string): ExtendedWordMap => {
  
  if (extendedDataCache[flagGroup]) {
    return extendedDataCache[flagGroup].data;
  }

  const extendedData: ExtendedWordMap = {};
  const files = fs.readdirSync(path.join(jsonDir, flagGroup));
  const jsonFiles = files.filter(file => file.endsWith(".json"));

  jsonFiles.forEach(file => {
    const filePath = path.join(jsonDir, flagGroup, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    Object.assign(extendedData, data);
  });

  extendedDataCache[flagGroup] = {
    data: extendedData,
  }; 
  return extendedData;
};

// Função para carregar o dicionário de palavras (cache)
const loadDic = (): string[] => {

  if (dicWordsCache) {
    return dicWordsCache;
  }

  const dicContent = fs.readFileSync(dicPath, "utf-8");
  const dicWords = dicContent
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  dicWordsCache = dicWords;
  return dicWords;
};

const cache = new Map<string, string[]>();

export function getPTExtended(
  flagGroup: string,
  searchTerm: string, 
  searchType: "s" | "c" | "e",
  full: boolean
): string[] {

  const cacheKey = `${flagGroup}|${searchTerm}|${searchType}|${full}`;

  // Verifica se o resultado já está em cache
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const resultSet = new Set<string>();
  const searchLower = searchTerm.toLowerCase().trim();
  const extendedData = loadAffFiles(flagGroup);

  // Processa os dados do extendedData
  for (const word in extendedData) {
    const wordData = extendedData[word];
    for (const flag in wordData) {
      for (const variation of wordData[flag]) {
        const variationLower = variation.toLowerCase().trim();
        if (
          (searchType === "s" && variationLower.startsWith(searchLower)) ||
          (searchType === "c" && variationLower.includes(searchLower)) ||
          (searchType === "e" && variationLower.endsWith(searchLower))
        ) {
          resultSet.add(variation);
          if (searchLower === word.toLowerCase()) {
            resultSet.add(word);
          }
        }
      }
    }
  }

  // Processa o dicionário de palavras
  if (!full) {
    const dicWords = loadDic();
    for (const word of dicWords) {
      const wordLower = word.toLowerCase().split("/")[0].trim();
      if (
        (searchType === "s" && wordLower.startsWith(searchLower)) ||
        (searchType === "c" && wordLower.includes(searchLower)) ||
        (searchType === "e" && wordLower.endsWith(searchLower)) ||
        (searchType === "e" && wordLower.slice(-searchLower.length) === searchLower)
      ) {
        resultSet.add(word.split("/")[0].trim());
      }
    }
  }
  const resultArray = Array.from(resultSet);
  const shuffledResults = shuffleArray(resultArray);
  cache.set(cacheKey, shuffledResults);
  // console.log(shuffledResults);
  return shuffledResults;
}
const shuffleArray = (array: string[]): string[] => {
  return array.slice().sort((a, b) => a.length - b.length);
};

// getPTExtended("num_gen_Flags", "ter", "e", true);

