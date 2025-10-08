import fs from "fs";
import path from "path";

const affPath = path.join(process.cwd(), "public", "libre", "pt_BR.aff");
const dicPath = path.join(process.cwd(), "public", "libre", "pt_BR.dic");
const outputDir = path.join(process.cwd(), "src", "json", "ptBRExtendedJson", "flagsJson");

const rawAff = fs.readFileSync(affPath, "utf-8");
const rawDic = fs.readFileSync(dicPath, "utf-8");

// Processamento das linhas do arquivo .aff
const affLines = rawAff
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(Boolean)
  .filter(
    line =>
      !line.startsWith("#") &&
      !line.startsWith("SET ") &&
      !line.startsWith("FLAG ") &&
      !line.startsWith("TRY ") &&
      !line.startsWith("MAP ") &&
      !line.startsWith("BREAK ") &&
      !line.startsWith("MAXNGRAMSUGS 12") &&
      !line.includes("NOSUGGEST Ý") &&
      !line.includes("FORBIDDENWORD ý") &&
      !line.includes("MAXDIFF 10") &&
      !line.includes("ONLYMAXDIFF") &&
      !line.includes("WARN ~")
  );

const dicLines = rawDic
  .split(/\r?\n/)
  .filter(Boolean);

const affData = {
  PFX: {},
  SFX: {}
};

const allFlags = {
  num_gen_Flags: new Set(["A", "B", "C", "D", "E", "G"]),
  superlativo_Flags: new Set(["H", "I"]),
  adv_adj_sub_Flags: new Set(["F", "J", "K", "L", "M", "N", "X", "Y", "Z", "1", "2", "3", "4", "j"]),
  aum_dim_Flags: new Set(["O", "P", "Q", "R", "S", "T", "U", "V", "W", "6", "7"]),
  verbos_conj_Flags: new Set(["a", "b", "c", "d", "e", "f", "g", "h", "i", "t", "u", "w"]),
  enclise_mesoclise_Flags: new Set(["k", "m", "n", "o", "p", "q", "r", "s", "v"]),
  // estados_Flags: new Set(["5", "8", "9" ])
};

const pfxFlags = "ÀÁÂÃÄÈÉÊËÌÍÎÏÒÓÔÕÖÙÚÛÜÑÝàáâãäèéêëìíîïòóôõöùúûüñÿ";
const sfxFlags = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

// Processamento de prefixos e sufixos
for (const line of affLines) {
  const parts = line.split(/\s+/);
  if (line.startsWith("PFX")) {
    const [, name, cross] = parts;
    if (parts.length <= 4) {
      affData.PFX[name] = { cross: cross === "Y", rules: [] };
    } else {
      affData.PFX[name].rules.push({
        strip: parts[2] === "0" ? null : parts[2],
        add: parts[3] === "0" ? null : parts[3],
        condition: parts[4] === "." ? null : parts[4],
        regex: parts[4] === "." ? null : new RegExp(`^${parts[4]}`)
      });
    }
  }

  if (line.startsWith("SFX")) {
    const [, name, cross] = parts;
    if (parts.length <= 4) {
      affData.SFX[name] = { cross: cross === "Y", rules: [] };
    } else {
      affData.SFX[name].rules.push({
        strip: parts[2] === "0" ? null : parts[2],
        add: parts[3] === "0" ? null : parts[3],
        condition: parts[4] === "." ? null : parts[4],
        regex: parts[4] === "." ? null : new RegExp(`${parts[4]}$`)
      });
    }
  }
}

// Cache para escrita posterior
const outputCache: {
  [flagGroup: string]: {
    [firstLetter: string]: {
      [word: string]: { [flag: string]: string[] }
    }
  }
} = {};

const totalDicLines = dicLines.length;

for (let i = 0; i < totalDicLines; i++) {
  
  const line = dicLines[i];
  
  if (!line || !line.includes("/") || line.includes("Ý") || line.includes("ý")) {
    continue;
  }

  // Calcular a porcentagem de progresso
  const progress = Math.round((i / totalDicLines) * 100);
  process.stdout.write(`\rProcessando linha ${i + 1}/${totalDicLines} - ${progress}%`);

  const [entry] = line.split(/\s+/);
  const [word, rawFlags] = entry.split("/");
  const flags = rawFlags ? rawFlags.split("") : [];
  const wordVariations: { [flagGroup: string]: {[word: string]: { [flag: string]: string[] }} } = {};

  // Processamento das variações de palavras para cada grupo de flag
  for (const flag of flags) {
    for (const flagGroup in allFlags) {
      if (allFlags[flagGroup].has(flag)) {
        const variations: string[] = [];

        // Processamento de prefixos
        if (affData.PFX[flag]) {
          for (const rule of affData.PFX[flag].rules) {
            let baseWord = word;
            if ((!rule.regex || rule.regex.test(word))) {
              if (rule.strip !== null) {
                baseWord = baseWord.replace(new RegExp(`^${rule.strip}`), "");
              }
              const newWord = rule.add + baseWord;
              variations.push(newWord);
            }
          }
        }

        // Processamento de sufixos
        if (affData.SFX[flag]) {
          for (const rule of affData.SFX[flag].rules) {
            let baseWord = word;
            if (!rule.regex || rule.regex.test(word)) {
              if (rule.strip !== null) {
                baseWord = baseWord.replace(new RegExp(`${rule.strip}$`), "");
              }
              const newWord = baseWord + rule.add;
              variations.push(newWord);
            }
          }
        }

        if (variations.length > 0) {
          // Adiciona as variações para o flagGroup específico
          wordVariations[flagGroup] ??= {};
          wordVariations[flagGroup][word] ??= {};
          wordVariations[flagGroup][word][flag] ??= [];
          variations.forEach(variation => {
            if (!wordVariations[flagGroup][word][flag].includes(variation)) {
              wordVariations[flagGroup][word][flag].push(variation);
            }
          });
        }
      }
    }
  }

  const flagComb = [];
  for (let i = 0; i < flags.length; i++) {
    for (let j = i + 1; j < flags.length; j++) {
      flagComb.push([flags[i], flags[j]]);
    }
  }

  const X = () => {
    return flagComb.filter(([first, second]) => {
      return ((pfxFlags.includes(first) && sfxFlags.includes(second)) ||
            (sfxFlags.includes(first) && pfxFlags.includes(second)));
    });
  };

  const flagCombFiltered = X();

  if (flagCombFiltered.length > 0) { 
    for (const [flag1, flag2] of flagCombFiltered) {
      for (const flagGroup in allFlags) {
        if (affData.PFX[flag2]?.cross && affData.SFX[flag1]?.cross && (allFlags[flagGroup].has(flag1))) {
          const pfxRules = affData.PFX[flag2].rules;
          const variations: string[] = [];

          // Processamento de prefixos
          for (const rule of pfxRules) {
            let baseWord = word;
            const regex = rule.condition ? new RegExp(`^${rule.condition}`) : null;
            if (!regex || regex.test(word)) {
              if (rule.strip !== null) {
                baseWord = baseWord.replace(new RegExp(`^${rule.strip}`), "");
              }
              const intermediateWord = rule.add + baseWord;
              const sfxRules = affData.SFX[flag1].rules;

              // Processamento de sufixos
              for (const sfxRule of sfxRules) {
                let finalWord = intermediateWord;
                const sfxRegex = sfxRule.condition ? new RegExp(`${sfxRule.condition}$`) : null;
                if (!sfxRegex || sfxRegex.test(intermediateWord)) {
                  if (sfxRule.strip !== null) {
                    finalWord = finalWord.replace(new RegExp(`${sfxRule.strip}$`), "");
                  }
                  finalWord += sfxRule.add;
                  variations.push(finalWord);
                }
              }
            }
          }
          if (variations.length > 0) {
          // Adiciona as variações para o flagGroup específico
            wordVariations[flagGroup] ??= {};
            wordVariations[flagGroup][word] ??= {};
            wordVariations[flagGroup][word][`${flag2}+${flag1}`] ??= [];
            variations.forEach(variation => {
              if (!wordVariations[flagGroup][word][`${flag2}+${flag1}`].includes(variation)) {
                wordVariations[flagGroup][word][`${flag2}+${flag1}`].push(variation);
              }
            });
          }
        }
      }
    }
  }

  // console.log(wordVariations);

  if (Object.keys(wordVariations).length > 0) {
    const firstLetter = word[0].normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    for (const flagGroup in wordVariations) {
      outputCache[flagGroup] ??= {};
      outputCache[flagGroup][firstLetter] ??= {};
      outputCache[flagGroup][firstLetter][word] = wordVariations[flagGroup][word];
    }
  }
}

// console.dir(outputCache, { depth: null });

for (const flagGroup in outputCache) {
  const flagGroupDir = path.join(outputDir, flagGroup);
  if (!fs.existsSync(flagGroupDir)) {
    fs.mkdirSync(flagGroupDir, { recursive: true });
  }

  for (const firstLetter in outputCache[flagGroup]) {
    const outputPath = path.join(flagGroupDir, `${firstLetter.toUpperCase()}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(outputCache[flagGroup][firstLetter], null, 2), "utf-8");
  }
}

console.log("\nFinalizado com sucesso!");