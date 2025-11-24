function limparWikitexto(s: string): string {
  return s
    .replace(/''+/g, "") // Remove as ênfases ('' e '''')
    .replace(/{{/g, "[")
    .replace(/}}/g, "]")
    .replace(/\]\]/g, "")
    .replace(/\[\[/g, "")
    .replace(/<[^>]+>/g, "") // Remove tags HTML
    .replace(/\s+/g, " ") // Remove espaços extras
    .trim(); // Remove espaços no começo e no final
}

export async function parseWiktionaryPT(word: string) {
  if (!word) return;

  const url = "https://pt.wiktionary.org/w/api.php";
  const params = new URLSearchParams({
    action: "query",
    titles: word.toLowerCase(),
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
  // console.log(lines)

  // Objeto de resultado, cujas chaves são as linhas com '=='
  const result: Record<string, Record<string, any>> = {};

  let Key: string | null = null;
  let IKey: string | null = null;
  let IIKey: string | null = null;
  let IIIKey: string | null = null;
  let IVKey: string | null = null;
  let accKey: string = '';
  let num: number = 1;

  // Percorre as linhas e organiza as chaves e o conteúdo
  for (const line of lines) {
    const nivel1 = line.match(/^==([^=].*?)==$/);
    if (nivel1) {
      // Encontrei uma chave de primeiro nível (==)
      const title = nivel1[1].trim().toLowerCase();
      
      // Se já houver uma chave anterior, não precisa adicionar conteúdo
      if (Key) {
        result[Key] = result[Key] || {};
      }

      // Atualiza a chave atual
      Key = limparWikitexto(title);

      // Cria uma nova chave no result, mas com conteúdo vazio por enquanto
      result[Key] = {};
      IKey = null; // Reset para a subchave
      continue;
    }

    const nivel2 = line.match(/^===([^=].*?)===$/);
    if (nivel2) {
      // Encontrei uma subchave de terceiro nível (===)
      IKey = nivel2[1].trim().toLowerCase();

      // Se a subchave já estiver presente, não precisa criar
      if (!result[Key]) {
        result[Key] = {}; // Cria chave principal caso não exista
      }

      // Cria a subchave dentro da chave principal
      result[Key][IKey] = {};
      IKey = limparWikitexto(IKey); // Atualiza a subchave
      continue;
    }

    // Se encontrar qualquer outra linha (não == ou ===), ela é o conteúdo da chave ou subchave atual
    if (Key) {
      if (IKey) {
        // Se a linha começar com '{{', trata-se de um template
        if (line.startsWith("{{")) {
          num = 1
          IIKey = limparWikitexto(line.trim()); // Aqui, você usa o conteúdo como a chave de IIKey
          if (!result[Key][IKey]) {
            result[Key][IKey] = {}; // Se IKey não existe, cria
          }          
          // Agora inicializamos o IIKey corretamente
          if (!result[Key][IKey][IIKey]) {
            result[Key][IKey][IIKey] = {}; // Cria o array para o IIKey
          }
          continue; // Pula para a próxima iteração
        }        
        if (IIKey) {
          if (!result[Key][IKey][IIKey]) {
            result[Key][IKey][IIKey] = {};
          }
          if (!result[Key][IKey][IIKey][num]) {
            result[Key][IKey][IIKey][num] = {};
          }
          if (line.startsWith("#") && !line.startsWith("#*")) {
            IIIKey = limparWikitexto(line.slice(1).trim());
            if (!result[Key][IKey][IIKey][num][IIIKey]) {
              result[Key][IKey][IIKey][num][IIIKey] = []; // Inicializa como um array
            }
            continue
          }
        }
        if (IIIKey) {
          if (!result[Key][IKey]) {
            result[Key][IKey] = {}; // Inicializa como um objeto
          }
          if (!result[Key][IKey][IIKey]) {
            result[Key][IKey][IIKey] = {}; // Inicializa como um objeto
          }
          if (!result[Key][IKey][IIKey][num]) {
            result[Key][IKey][IIKey][num] = {}; // Inicializa como um objeto
          }
          if (!result[Key][IKey][IIKey][num][IIIKey]) {
            result[Key][IKey][IIKey][num][IIIKey] = []; // Inicializa como um objeto
          }
          if (line.startsWith("#") && line.startsWith("#*")) {
            IVKey = limparWikitexto(line.slice(2).trim());
            if (!result[Key][IKey][IIKey][num][IIIKey]) {
              result[Key][IKey][IIKey][num][IIIKey] = []; // Inicializa como um objeto
            }
            result[Key][IKey][IIKey][num][IIIKey].push(IVKey);
          }
        }
      } else if (!IKey) {
        IKey = 'def'
        IIKey = null;
        if (line.startsWith("{{")) {
          num = 1
          IIKey = limparWikitexto(line.trim()); // Aqui, você usa o conteúdo como a chave de IIKey
          if (!result[Key][IKey]) {
            result[Key][IKey] = {}; // Se IKey não existe, cria
          }          
          // Agora inicializamos o IIKey corretamente
          if (!result[Key][IKey][IIKey]) {
            result[Key][IKey][IIKey] = {}; // Cria o array para o IIKey
          }
          continue; // Pula para a próxima iteração
        }        
        if (IIKey) {
          if (!result[Key][IKey][IIKey]) {
            result[Key][IKey][IIKey] = {};
          }
          if (!result[Key][IKey][IIKey][num]) {
            result[Key][IKey][IIKey][num] = {};
          }
          if (line.startsWith("#") && !line.startsWith("#*")) {
            IIIKey = limparWikitexto(line.slice(1).trim());
            if (!result[Key][IKey][IIKey][num][IIIKey]) {
              result[Key][IKey][IIKey][num][IIIKey] = []; // Inicializa como um array
            }
            continue
          }
        }
        if (IIIKey) {
          if (!result[Key][IKey]) {
            result[Key][IKey] = {}; // Inicializa como um objeto
          }
          if (!result[Key][IKey][IIKey]) {
            result[Key][IKey][IIKey] = {}; // Inicializa como um objeto
          }
          if (!result[Key][IKey][IIKey][num]) {
            result[Key][IKey][IIKey][num] = {}; // Inicializa como um objeto
          }
          if (!result[Key][IKey][IIKey][num][IIIKey]) {
            result[Key][IKey][IIKey][num][IIIKey] = []; // Inicializa como um objeto
          }
          if (line.startsWith("#") && line.startsWith("#*")) {
            IVKey = limparWikitexto(line.slice(2).trim());
            if (!result[Key][IKey][IIKey][num][IIIKey]) {
              result[Key][IKey][IIKey][num][IIIKey] = []; // Inicializa como um objeto
            }
            result[Key][IKey][IIKey][num][IIIKey].push(IVKey);
          }
        }
      }
    }
  }

  console.dir(result, { depth: null });
  return { word, result };
}

// USO
// parseWiktionaryPT("ser");
