import { Definicao, EntryParseado } from "../types";

function limparWikitexto(s: string): string {
  return s
    .replace(/''+/g, "")
    .replace(/\{\{[^|}]+\|pt\|([^}]+)\}\}/gi, "($1) ")
    .replace(/\{\{[^}]+\}\}/g, "")
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function parseWiktionaryPT(word: string) {
  const url = "https://pt.wiktionary.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    titles: word,
    prop: "revisions",
    rvprop: "content",
    rvslots: "main",
    format: "json",
    origin: "*"
  });

  const res = await fetch(`${url}?${params.toString()}`);
  const data = await res.json();
  const pages = data.query.pages;

  const page = pages[Object.keys(pages)[0]];

  // Página inexistente
  if (!page || page.missing) {
    return { word, result: {}, error: "Palavra não encontrada no Wikcionário" };
  }

  // Sem revisões → nada para extrair
  if (!page.revisions || page.revisions.length === 0) {
    return { word, result: {}, error: "Nenhum conteúdo disponível" };
  }

  const slot = page.revisions[0].slots?.main;

  // Sem slot main
  if (!slot || !slot["*"]) {
    return { word, result: {}, error: "Nenhum wikitext encontrado" };
  }

  const wikitext: string = slot["*"];

  const ptMatch = wikitext.match(/={{-pt-}}=(.*?)(?=={{-[a-z]{2}-}}=|$)/s);
  const ptSection = ptMatch ? ptMatch[1] : "";
  const lines = ptSection.split("\n").map(l => l.trim()).filter(Boolean);
  console.log(lines)

  const result: Record<string, EntryParseado> = {};
  let currentKey: string | null = null;
  let ignoreBlock = false;
  let currentProp: string | null = null;
  let defCounter = 0;
  let currentDef: Definicao | null = null;

  const SECOES_IGNORAR = [
    "pronúncia",
    "{{pronúncia|pt}}",
    "ligações externas",
    "ligações",
    "anagrama",
    "anagramas",
  ];

  function deveIgnorarSecao(t: string) {
    const lower = t.toLowerCase();

    if (SECOES_IGNORAR.includes(lower)) return true;
    if (lower.startsWith("categoria")) return true;

    return false;
  }

  for (const line of lines) {
    const nivel2 = line.match(/^==([^=].*?)==$/);
    if (nivel2) {
      const title = nivel2[1].trim();

      // IGNORAR seção
      if (deveIgnorarSecao(title)) {
        currentKey = null;
        ignoreBlock = true;
        continue;
      }

      const norm = title.toLowerCase();
      currentKey = /etimologia/.test(norm) ? "etimologia" : norm;
      result[currentKey] = { props: {} };

      ignoreBlock = false;
      currentProp = null;
      defCounter = 0;
      currentDef = null;
      continue;
    }

    if (/^===/.test(line)) {
      ignoreBlock = true;
      continue;
    }

    if (currentKey && !ignoreBlock) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Nova prop
      if (trimmed.startsWith("{{")) {
        
        // Detecta flex.pt em substantivo
        // if (currentKey === "substantivo" && trimmed.includes("flex.pt")) {
        //   const flex: Record<string, string> = {};
        //   const flexMatch = trimmed.match(/\{\{flex\.pt\|([^}]+)\}\}/);
        //   if (flexMatch) {
        //     flexMatch[1].split("|").forEach(part => {
        //       const [k, v] = part.split("=");
        //       if (k && v) {
        //         const keyMap: Record<string, string> = { ms: "s", mp: "p", fs: "s", fp: "p" };
        //         flex[keyMap[k.trim()]] = v.trim();
        //       }
        //     });
        //   }
        //   currentProp = "flex";
        //   result[currentKey].props[currentProp] = flex;
        //   defCounter = 0;
        //   currentDef = null;
        //   continue; // já criamos a prop flex
        // }

        // Props normais
        currentProp = trimmed;
        result[currentKey].props[currentProp] = { definicoes: {} };
        defCounter = 0;
        currentDef = null;
      }
      // Definição
      else if (trimmed.startsWith("#") && !trimmed.startsWith("#*")) {
        if (currentProp) {
          defCounter++;
          currentDef = { def: limparWikitexto(trimmed.slice(1).trim()), ex: [] };
          result[currentKey].props[currentProp].definicoes[defCounter] = currentDef;
        }
      }
      // Exemplo
      else if (trimmed.startsWith("#*")) {
        if (currentDef) {
          currentDef.ex.push(limparWikitexto(trimmed.slice(2).trim()));
        }
      }
      // Outros → prop "others"
      else {
        const otherProp = "others";
        if (!result[currentKey].props[otherProp]) {
          result[currentKey].props[otherProp] = { definicoes: {} };
          defCounter = 0;
        }
        defCounter++;
        currentDef = { def: limparWikitexto(trimmed), ex: [] };
        result[currentKey].props[otherProp].definicoes[defCounter] = currentDef;
      }
    }
  }

  console.dir(result, { depth: null });
  return { word, result };
}

// USO
parseWiktionaryPT("comprar");