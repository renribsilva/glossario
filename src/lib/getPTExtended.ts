import fs from "fs";
import path from "path";
import { ExtendedWordMap } from "../types";

const jsonDir = path.join(process.cwd(), "src", "json", "ptBRJson");
const dicPath = path.join(process.cwd(), "public", "pt_BR.dic");

// Cache global para os dados
let extendedDataCache: ExtendedWordMap | null = null;
let dicWordsCache: string[] | null = null;

// Função para carregar os arquivos JSON, mas de forma otimizada (cache)
const loadJsonFiles = (): ExtendedWordMap => {
  if (extendedDataCache) {
    return extendedDataCache; // Retorna o cache se já tiver sido carregado
  }

  const extendedData: ExtendedWordMap = {};
  const files = fs.readdirSync(jsonDir);
  const jsonFiles = files.filter(file => file.endsWith(".json"));

  jsonFiles.forEach(file => {
    const filePath = path.join(jsonDir, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    Object.assign(extendedData, data);
  });

  extendedDataCache = extendedData; // Armazena no cache
  return extendedData;
};

// Função para carregar o dicionário de palavras (cache)
const loadDic = (): string[] => {
  if (dicWordsCache) {
    return dicWordsCache; // Retorna o cache se já tiver sido carregado
  }

  const dicContent = fs.readFileSync(dicPath, "utf-8");
  const dicWords = dicContent
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);

  dicWordsCache = dicWords;
  return dicWords;
};

// Cache para os resultados de busca
const cache = new Map<string, string[]>();

export function getPTExtended(
  searchTerm: string, 
  searchType: "s" | "c" | "e",
  full: boolean
): string[] {
  const cacheKey = `${searchTerm}|${searchType}|${full}`;

  // Verifica se o resultado já está em cache
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  const resultSet = new Set<string>();
  const searchLower = searchTerm.toLowerCase().trim();

  const ignoredFlags = new Set([
    "5", "6", "7", "8", "9", "k", "a", "c", "d", "e", "f", "g", "h", "i", "j",
    "k", "m", "n", "o", "p", "q", "r", "s", "v", "E", "G", "L", "O", "P", "Q", "R", "S", "T", "U", "V", "W"
  ]);

  // Carrega os dados de arquivos, apenas uma vez, e usa o cache
  const extendedData = loadJsonFiles();
  const dicWords = loadDic();

  // Processa os dados do extendedData
  for (const word in extendedData) {
    const wordData = extendedData[word];
    for (const flag in wordData) {
      if (!full && ignoredFlags.has(flag)) {
        continue;
      }

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

  // Converte para array, embaralha e armazena no cache
  const resultArray = Array.from(resultSet);
  const shuffledResults = shuffleArray(resultArray);
  cache.set(cacheKey, shuffledResults);

  return shuffledResults;
}

// Função para embaralhar o array
const shuffleArray = (array: string[]): string[] => {
  const shuffled = array.slice();
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

