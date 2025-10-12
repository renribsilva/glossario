import fs from 'fs';
import path from 'path';

function editarArquivoComPipe() {

  const inputTxt = "txt_original"
  const outputTxt = "txt_modificado"
  const letra = "A"

  const inputPath = path.join(process.cwd(), "public", "dicio", inputTxt, `${letra}.txt`);
  const outputPath = path.join(process.cwd(), "public", "dicio", outputTxt, `${letra}.txt`);
  const corrPath = path.join(process.cwd(), "public", "dicio", "correções_manuais.txt");

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
      const novoConteudo = match[2];           
      const index = linhaNum - 1;

      if (index >= 0 && index < linhas.length) {
        linhas[index] = novoConteudo;
      }
    }
  });

  //SEGUNDO TRATAMENTO

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

    const comecaComA = /^[aáàãâäAÁÀÃÂÄ]/.test(linhaAtual);
    // const comecaComA = /^[bB]/.test(linhaAtual);
    // const comecaComA = /^[cC]/.test(linhaAtual);
    // const comecaComA = /^[dD]/.test(linhaAtual);
    // const comecaComA = /^[eéèẽêëEÉÈẼÊË]/.test(linhaAtual);
    // const comecaComA = /^[fF]/.test(linhaAtual);
    // const comecaComA = /^[gG]/.test(linhaAtual);
    // const comecaComA = /^[hH]/.test(linhaAtual);
    // const comecaComA = /^[iíìĩîïIÍÌĨÎÏ]/.test(linhaAtual);
    // const comecaComA = /^[jJ]/.test(linhaAtual);
    // const comecaComA = /^[kK]/.test(linhaAtual);
    // const comecaComA = /^[lL]/.test(linhaAtual);
    // const comecaComA = /^[mM]/.test(linhaAtual);
    // const comecaComA = /^[nN]/.test(linhaAtual);
    // const comecaComA = /^[oóòõôöOÓÒÕÔÖ]/.test(linhaAtual);
    // const comecaComA = /^[pP]/.test(linhaAtual);
    // const comecaComA = /^[qQ]/.test(linhaAtual);
    // const comecaComA = /^[rR]/.test(linhaAtual);
    // const comecaComA = /^[sS]/.test(linhaAtual);
    // const comecaComA = /^[tT]/.test(linhaAtual);
    // const comecaComA = /^[uúùũûüUÚÙÛÜ]/.test(linhaAtual);
    // const comecaComA = /^[vV]/.test(linhaAtual);
    // const comecaComA = /^[wW]/.test(linhaAtual);
    // const comecaComA = /^[xX]/.test(linhaAtual);
    // const comecaComA = /^[yY]/.test(linhaAtual);
    // const comecaComA = /^[zZ]/.test(linhaAtual);

    // Se NÃO começa com "letra"
    if (!comecaComA) {
      linhas[i - 1] = linhas[i - 1].trimEnd() + ' ' + linhaAtual;
      linhas.splice(i, 1);
      i--;
    }
  }

  //TERCEIRO TRATAMENTO

  const prefixosList = [
    ' loc. adv. ', ' loc. conj. ', ' loc. prep. ', ' loc. pron. ',
    ' loc. interj. ', ' m. ', ' f. ', ' v. t. e i. ', ' v. t. ', ' v. i. ', ' v. p. ',
    ' v. pron. ', ' adj. ', ' adv. ', ' interj. ', ' mús. ', ' prov. ',
    ' gram. ', ' pref. ', ' abrev. ', ' prep. ', ' pron. ',
    ' art. ', ' fem. ', ' adj. f. ', ' art. def. ', ' aum. ',
    ' conj. ', ' dem. ', ' n. p. ', ' num. ', ' suf. ', ' el. comp. '
  ];

  const prefixos = [
    ...prefixosList.filter(p => p.includes('loc.')),
    ...prefixosList.filter(p => !p.includes('loc.'))
  ];

  const linhasEditadas = linhas.map(linha => {
    // Ignorar linhas sem espaço OU já processadas (contêm "|")
    if (!linha.includes(' ')) return linha;

    const primeiroEspaco = linha.indexOf(' ');
    const antes = linha.slice(0, primeiroEspaco + 1).replace("...", "");
    let depois = linha.slice(primeiroEspaco);

    // Colocar os pipes
    for (const prefixo of prefixos) {
      const prefixTrim = prefixo.toLocaleLowerCase().trim();
      const regex = new RegExp(`(?<!\\|)\\s${prefixTrim}\\s(?!\\|)`, 'gi');
      depois = depois.replace(regex, ` |${prefixTrim}| `);
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
    // Regex:
    // (.*?)           → tudo antes
    // \|([^|]+)\|     → primeira categoria
    // [ ]*e[ ]*       → apenas espaços + 'e' + espaços
    // \|([^|]+)\|     → segunda categoria
    // (.*)            → definição (resto da linha)
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

editarArquivoComPipe();