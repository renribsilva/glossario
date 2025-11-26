import { wikcioData, WikcioResult } from "../types";

export function parseWikiSections(lines: string[], word: string): wikcioData {

  const root: wikcioData = {
    level: 0,
    title: "ROOT",
    content: [],
    children: []
  };

  let stack: wikcioData[] = [root];
  let currentWordKey: string | null = null;       // ex: 'ter, auxiliar'
  let currentDefKey: string | null = null;        // ex: 'acompanhado de verbo...'
  let nextLineIsExample = false;

  for (let raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Detecta títulos === assim ===
    const match = line.match(/^(=+)\s*(.*?)\s*\1$/);
    if (match) {
      const equals = match[1];
      const title = match[2];
      const level = equals.length;

      const section: wikcioData = {
        level,
        title,
        content: [],
        children: []
      };

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }

      const parent = stack[stack.length - 1];
      parent.children.push(section);

      stack.push(section);
      currentWordKey = null;
      currentDefKey = null;
      continue;
    }

    const currentSection = stack[stack.length - 1];

    // inicializa content como objeto de palavras se ainda for array
    if (!currentSection.content || Array.isArray(currentSection.content)) {
      currentSection.content = {} as Record<string, Record<string, string[]>>;
    }
    const contentObj = currentSection.content as Record<string, Record<string, string[]>>;

    // 🔹 CORREÇÃO: detecção de palavra exata ou qualificada
    const sanitizedLine = line.replace(/[\.\-]/g, '').toLowerCase();
    const sanitizedWord = word.replace(/[\.\-]/g, '').toLowerCase();

    let wordMatch: RegExpMatchArray | null = null;

    if (sanitizedLine === sanitizedWord) {
      wordMatch = [sanitizedLine, sanitizedLine];
    } else if (sanitizedLine.startsWith(sanitizedWord + ',')) {
      wordMatch = [sanitizedLine, sanitizedLine];
    } else if (sanitizedLine.startsWith(sanitizedWord + ' transitivo direto,')) {
      wordMatch = [sanitizedLine, sanitizedLine];
    }

    if (wordMatch) {
      currentWordKey = line; // mantém a palavra original com pontos/hífens
      if (!contentObj[currentWordKey]) contentObj[currentWordKey] = {};
      currentDefKey = null;
      continue;
    }

    const isDefColon = /:$/.test(line);
    if (currentWordKey && isDefColon) {
      currentDefKey = line;
      contentObj[currentWordKey][currentDefKey] = [];
      nextLineIsExample = true
      continue;
    }

    // linhas que começam com minúscula ou (qualquer coisa) minúscula são definições
    const isDef = /^[a-zà-öø-ÿ]/.test(line) || /^\([^\)]*\)\s*[a-zà-öø-ÿ]/.test(line);
    const isExample = /^[A-ZÀ-Ö]/.test(line);
    if (currentWordKey) {
      if (isDef && !nextLineIsExample) {
        currentDefKey = line;
        contentObj[currentWordKey][currentDefKey] = [];
        continue;
      } else if (isDef && nextLineIsExample) {
        if (!contentObj[currentWordKey][currentDefKey!]) {
          contentObj[currentWordKey][currentDefKey!] = [];
        }
        contentObj[currentWordKey][currentDefKey].push(line);
        nextLineIsExample = false
        continue;
      }
      if (currentDefKey && isExample) {
        contentObj[currentWordKey][currentDefKey].push(line);
        continue;
      }
    }
    if (currentSection.title.toLowerCase() === 'etimologia') {
      if (!currentWordKey) {
        currentWordKey = word;
      }
      if (!contentObj[currentWordKey]) {
        contentObj[currentWordKey] = {};
      }
      currentDefKey = line;
      contentObj[currentWordKey][currentDefKey] = [];
      continue;
    }

    // linhas que não se encaixam: ignora
  }

  return root
}

export async function parseWiktionaryPT(word: string): Promise<WikcioResult | null> {

  if (!word || word === undefined || word === '') return null;

  const url = "https://pt.wiktionary.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    titles: word.toLowerCase(),
    prop: "extracts",
    format: "json",
    explaintext: "1",
    origin: "*", // 🔹 necessário para CORS
  });

  params.append("explaintext", "");

  const res = await fetch(`${url}?${params.toString()}`);
  const data = await res.json();

  const pages = data.query.pages;
  const page = pages[Object.keys(pages)[0]];

  if (!page.extract) return null;

  const lines = page.extract.split("\n").map(l => l.trim());

  const root = parseWikiSections(lines, word);
  const ptSection = root.children.find(s => s.title.toLowerCase() === "português") ?? null;
  // console.dir(ptSection?.children, { depth: null });

  return { word, ptSection }; // objeto ou null
}

// Exemplo de uso
// parseWiktionaryPT("esquecer");
