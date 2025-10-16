import fs from 'fs';
import path from 'path';

function editarArquivoComPipe(letra: string) {

  const inputTxt = "txt_original"
  const outputTxt = "txt_modificado"

  const inputPath = path.join(process.cwd(), "public", "dicio", inputTxt, `${letra}.txt`);
  const outputPath = path.join(process.cwd(), "public", "dicio", outputTxt, `${letra}.txt`);
  const corrPath = path.join(process.cwd(), "public", "dicio", "correções.txt");

  const conteudo = fs.readFileSync(inputPath, 'utf-8');
  const linhas = conteudo.split('\n')
  
  const corrConteudo = fs.readFileSync(corrPath, "utf-8")
  .split('\n')
  .filter(linha => new RegExp(`^${letra}\\d+\\s`).test(linha));

   //PRIMEIRO TRATAMENTO

  // Substitui a linha original pela corrigida
  corrConteudo.forEach(linha => {
    const match = linha.match(/^A(\d+)\s+(.*)$/);
    if (match) {
      const linhaNum = parseInt(match[1], 10); 
      const novoConteudo = match[2].trim();           
      const index = linhaNum - 1;

      if (index >= 0 && index < linhas.length) {
        linhas[index] = novoConteudo;
      }
    }
  });

  //SEGUNDO TRATAMENTO


  // Remove linhas vazias
  for (let i = 0; i < linhas.length; i++) {
    let linhaAtual = linhas[i].trim();
    if (linhaAtual.trim() === '') {
      linhas.splice(i, 1);
      i--;
    }
  }

  // Remove "..."" das linhas que assim começam
  for (let i = 0; i < linhas.length; i++) {
    let linhaAtual = linhas[i].trim();
    if (linhaAtual.startsWith('...')) {
      linhas[i] = linhaAtual.slice(3).trim();
    }
  }

  // Junta linhas que terminam com "-"
  for (let i = 0; i < linhas.length - 1; i++) {
    const linhaAtual = linhas[i].trimEnd();
    if (linhaAtual.endsWith('-')) {
      const proximaLinha = linhas[i + 1].trimStart();
      // Remove o "-" do fim e concatena com a próxima linha
      linhas[i] = linhaAtual.slice(0, -1) + proximaLinha;
      // Remove a próxima linha (já foi usada)
      linhas.splice(i + 1, 1);
      // Volta uma posição para checar se ainda tem hífen (casos consecutivos)
      i--;
    }
  }

  // Sobe linhas que começam com ( e terminam com ) ou ).
  for (let i = 1; i < linhas.length; i++) {
    const linhaAtual = linhas[i].trim();
    if (
      linhaAtual.startsWith('(') ||
      linhaAtual.startsWith('*') ||
      linhaAtual.startsWith('+') ||
      (linhaAtual.startsWith('(') &&
      (linhaAtual.endsWith(')') || linhaAtual.endsWith(').')))
    ) {
      linhas[i - 1] = linhas[i - 1].trimEnd() + ' ' + linhaAtual;
      linhas.splice(i, 1);
      i--;
    }
  }

  // Sobe linha que só contém números
  for (let i = 1; i < linhas.length; i++) {
    const linhaAtual = linhas[i].trim();
    const soTemNum = /^\d+$/.test(linhaAtual);
    if (soTemNum) {
      linhas.splice(i, 1);
      i--;
    }
  }

  // Sobe todas as linhas que não começam com a letra em tratamento
  for (let i = 1; i < linhas.length; i++) {
    const linhaAtual = linhas[i].trim();
    if (linhaAtual.length === 0) continue;
    let comecaCom: boolean | null = null
    if (letra === "A") comecaCom = /^[aáàãâäAÁÀÃÂÄ]/.test(linhaAtual);
    if (letra === "B") comecaCom = /^[bB]/.test(linhaAtual);
    if (letra === "C") comecaCom = /^[cC]/.test(linhaAtual);
    if (letra === "D") comecaCom = /^[dD]/.test(linhaAtual);
    if (letra === "E") comecaCom = /^[eéèẽêëEÉÈẼÊË]/.test(linhaAtual);
    if (letra === "F") comecaCom = /^[fF]/.test(linhaAtual);
    if (letra === "G") comecaCom = /^[gG]/.test(linhaAtual);
    if (letra === "H") comecaCom = /^[hH]/.test(linhaAtual);
    if (letra === "I") comecaCom = /^[iíìĩîïIÍÌĨÎÏ]/.test(linhaAtual);
    if (letra === "J") comecaCom = /^[jJ]/.test(linhaAtual);
    if (letra === "K") comecaCom = /^[kK]/.test(linhaAtual);
    if (letra === "L") comecaCom = /^[lL]/.test(linhaAtual);
    if (letra === "M") comecaCom = /^[mM]/.test(linhaAtual);
    if (letra === "N") comecaCom = /^[nN]/.test(linhaAtual);
    if (letra === "O") comecaCom = /^[oóòõôöOÓÒÕÔÖ]/.test(linhaAtual);
    if (letra === "P") comecaCom = /^[pP]/.test(linhaAtual);
    if (letra === "Q") comecaCom = /^[qQ]/.test(linhaAtual);
    if (letra === "R") comecaCom = /^[rR]/.test(linhaAtual);
    if (letra === "S") comecaCom = /^[sS]/.test(linhaAtual);
    if (letra === "T") comecaCom = /^[tT]/.test(linhaAtual);
    if (letra === "U") comecaCom = /^[uúùũûüUÚÙÛÜ]/.test(linhaAtual);
    if (letra === "V") comecaCom = /^[vV]/.test(linhaAtual);
    if (letra === "W") comecaCom = /^[wW]/.test(linhaAtual);
    if (letra === "X") comecaCom = /^[xX]/.test(linhaAtual);
    if (letra === "Y") comecaCom = /^[yY]/.test(linhaAtual);
    if (letra === "Z") comecaCom = /^[zZ]/.test(linhaAtual);

    // Se NÃO começa com "letra"
    if (!comecaCom) {
      linhas[i - 1] = linhas[i - 1].trimEnd() + ' ' + linhaAtual;
      linhas.splice(i, 1);
      i--;
    }
  }

  //TERCEIRO TRATAMENTO

  const prefixos = [
    'loc. adv.', 'loc. conj.', 'loc. prep.', 'loc. pron.', 'loc. interj.', 'loc. fam.', 'loc.',
    'm.', 'f.', 'fem.',
    'v. t. e i.', 'v. t.', 'v. i.', 'v. p.', 'v. pron.', 
    'adj.', 'adj. f.', 'adv.', 'prep.', 'pron.', 'art. def.', 'art.', 'num.',
    'pref.', 'suf.', 'el. comp.',
    'interj.',
    'aum.', 'dem.',
    'conj.',
    'n. p.',  'gram.', 'abrev.', 'interj.', 'mús.', 'fam.', 'ext.'
  ];

  const linhasEditadas = linhas.map(linha => {
    // Ignorar linhas sem espaço OU já processadas (contêm "|")
    if (!linha.includes(' ')) return linha;

    const primeiroEspaco = linha.indexOf(' ');
    let antes = linha.slice(0, primeiroEspaco + 1).replace("...", "");
    let depois = linha.slice(primeiroEspaco);

    // Colocar os pipes
    for (const prefixo of prefixos) {
      const trimmed = prefixo.trim().replace(/\./g, '\\$&');
      // Caso 1: prefixo no meio da linha
      const regex = new RegExp(`(?<!\\|)\\s${trimmed}\\s?(?!\\|)`, 'gi');
      depois = depois.replace(regex, match => ` |${match.trim()}| `);
      // Caso 2: prefixo no início da linha
      const regexInicio = new RegExp(`^\\s*${trimmed}\\s*`, 'gi');
      // console.log(regexInicio)
      antes = antes.replace(regexInicio, match => `|${match.trim()}| `);
    }

    // Colocar os ##
    let linhaFinal = antes + depois
    linhaFinal = linhaFinal
    .replace(
      /^([\p{L}\p{M}0-9-_]+),(\s*\d+\s*)?\s*(\(\s*[^)]*?\s*\))?/gu,
      (match, p1, numero, parens) => {
        if (numero && parens) {
          return `${p1} #,${numero} ${parens}# `;
        } else if (numero) {
          return `${p1} #,${numero}# `;
        } else if (parens) {
          return `${p1} #,${parens}# `;
        } else {
          return match;
        }
      }
    )
    .normalize('NFC')
    .replace(/\s{2,}/g, ' ')

    // Duplicar casos em que há mais que uma classe de palavras no verbete
    const regex = /^(.*?)\|([^|]+)\|\s*(?:e|ou|\s)\s*\|([^|]+)\|(.*)$/i;

    const match = linhaFinal.match(regex);

    if (match) {
      const prefixo = match[1].trim();   // antes das categorias (ex: "absconso")
      const cat1 = match[2].trim();      // primeira categoria (ex: "m.")
      const cat2 = match[3].trim();      // segunda categoria (ex: "adj.")
      const definicao = match[4].trim(); // resto da linha

      // Monta a linha duplicada
      linhaFinal = `${prefixo} |${cat1}| ${definicao} |${cat2}| ${definicao}`;
    }

    return linhaFinal
  });

  // Sobe linhas sem espaço que terminam com ) ou ).
  for (let i = 1; i < linhasEditadas.length; i++) {
    const linhaAtual = linhasEditadas[i].trim();

    // Verifica se a linha não contém espaço e termina com ")" ou ")."
    if (linhaAtual && !linhaAtual.includes(' ') && (linhaAtual.endsWith(')') || linhaAtual.endsWith(').') || linhaAtual.endsWith('.'))) {
      // Sobe a linha para a anterior
      linhasEditadas[i - 1] = linhasEditadas[i - 1].trimEnd() + ' ' + linhaAtual;
      linhasEditadas.splice(i, 1); // Remove a linha atual
      i--; // Volta uma posição para continuar checando
    }
  }

  const novoConteudo = linhasEditadas.join('\n');
  fs.writeFileSync(outputPath, novoConteudo, 'utf-8');
}

const alfabeto = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

for (const letra of alfabeto) {
  editarArquivoComPipe(letra);
}