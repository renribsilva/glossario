import fs from 'fs';
import path from 'path';

// Função auxiliar para remover tudo entre #...#
function limparHashes(linha: string) {
  return linha.replace(/#.*?#/g, '').trim();
}

function editarArquivoComPipe() {

  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "A.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "B.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "C.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "D.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "E.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "F.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "G.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "H.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "I.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "J.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "K.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "L.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "M.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "N.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "O.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "P.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "Q.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "R.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "S.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "T.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "U.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "V.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "W.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "X.txt");
  // const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "Y.txt");
  const txtPath = path.join(process.cwd(), "public", "dicio", "txt_modificado", "Z.txt");

  const conteudo = fs.readFileSync(txtPath, 'utf-8');
  const linhas = conteudo.split('\n').filter(linha => {
    const conteudo = linha.trim();
    return !/^\d+$/.test(conteudo);
  });

  // if (linhas.map(linha => {if (!linha.includes('|')) return true;})) return

  for (let i = 0; i < linhas.length; i++) {
    let linhaAtual = linhas[i].trim();

    // IF independente: remove "..." do início da linha
    if (linhaAtual.startsWith('...')) {
      linhas[i] = linhaAtual.slice(3).trim();
    }
  }

  // Etapa 1: Juntar linhas que terminam com "-"
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

  // Etapa 2: Subir linhas que começam com ( e terminam com ) ou ).
  for (let i = 1; i < linhas.length; i++) {
    const linhaAtual = linhas[i].trim();
    if (
      linhaAtual.startsWith('(') ||
      linhaAtual.startsWith('*') ||
      linhaAtual.startsWith('+') ||
      (linhaAtual.startsWith('(') &&
      (linhaAtual.endsWith(')') || linhaAtual.endsWith(').')))
    ) {
      // Junta com a linha anterior, adicionando espaço
      linhas[i - 1] = linhas[i - 1].trimEnd() + ' ' + linhaAtual;
      // Remove a linha atual
      linhas.splice(i, 1);
      // Volta uma posição para verificar a próxima linha após a junção
      i--;
    }
  }

  for (let i = 1; i < linhas.length; i++) {
    const linhaAtual = linhas[i].trim();
    if (linhaAtual.length === 0) continue;

    // const comecaComA = /^[aáàãâäAÁÀÃÂÄ]/.test(linhaAtual);
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
    const comecaComA = /^[zZ]/.test(linhaAtual);

    // Se NÃO começa com "letra"
    if (!comecaComA) {
      linhas[i - 1] = linhas[i - 1].trimEnd() + ' ' + linhaAtual;
      linhas.splice(i, 1);
      i--;
    }
  }

  const prefixosList = [
    ' loc. adv. ', ' loc. conj. ', ' loc. prep. ', ' loc. pron. ',
    ' loc. interj. ', ' m. ', ' f. ', ' v. t. ', ' v. i. ', ' v. p. ',
    ' v. pron. ', ' adj. ', ' adv. ', ' interj. ', ' mús. ', ' prov. ',
    ' gram. ', ' pref. ', ' abrev. ', ' prep. ', ' pron. ',
    ' art. ', ' fem. ', ' adj. f. ', ' art. def. ', ' aum. ',
    ' conj. ', ' dem. ', ' n. p. ', ' num. ', ' suf. '
  ];

  const prefixos = [
    ...prefixosList.filter(p => p.includes('loc.')),
    ...prefixosList.filter(p => !p.includes('loc.'))
  ];

  const linhasEditadas = linhas.map(linha => {
    // Ignorar linhas sem espaço OU já processadas (contêm "|")
    if (!linha.includes(' ')) return linha;

    const primeiroEspaco = linha.indexOf(' ');
    const antes = linha.slice(0, primeiroEspaco + 1);
    let depois = linha.slice(primeiroEspaco);
    let depoisLower = depois.toLowerCase();

    for (const prefixo of prefixos) {
      const prefixTrim = prefixo.trim().toLowerCase();
      let indice = depoisLower.indexOf(prefixo);

      let pipeInserido = false;

      while (indice !== -1) {
        if (pipeInserido) break; 
        // Verifica se o prefixo está dentro de parênteses em 'depois'
        const antesDoPrefixo = depois.slice(0, indice);
        const abreAntes = (antesDoPrefixo.match(/\(/g) || []).length;
        const fechaAntes = (antesDoPrefixo.match(/\)/g) || []).length;
        const dentroDeParenteses = abreAntes > fechaAntes;

        if (!dentroDeParenteses) {
          // Substitui na string original (mantendo capitalização)
          const originalPrefix = depois.slice(indice, indice + prefixo.length).trim();

          // console.log("1:", depois.slice(0, indice))
          // console.log("2:", ` |${originalPrefix}| `)
          // console.log("3:", depois.slice(indice + prefixo.length))

          depois =
            depois.slice(0, indice) +
            ` |${originalPrefix}| ` +
            depois.slice(indice + prefixo.length);

          // Atualiza a string "depoisLower" para manter busca case-insensitive
          depoisLower =
            depoisLower.slice(0, indice) +
            ` |${prefixTrim}| ` +
            depoisLower.slice(indice + prefixo.length);
        }

        pipeInserido = true; // marca que já inseriu
      // break; 
      }
    }

    let linhaFinal = antes + depois
    linhaFinal = linhaFinal
    .replace(/\s{2,}/g, ' ')
    .replace(/\s\)/g, ')')
    .replace(/\(\s/g, '(')
    .replace(
      /^([\p{L}\p{M}0-9-]+),(\s*\d+\s*)?\s*(\(\s*[^)]*?\s*\))?/gu,
      (match, p1, numero, parens) => {
        // console.log(match)
        if (numero && parens) {
          // Número + parênteses
          return `${p1} #,${numero} ${parens}# `;
        } else if (numero) {
          // Só número
          return `${p1} #,${numero}# `;
        } else if (parens) {
          // Só parênteses
          return `${p1} #,${parens}# `;
        } else {
          // fallback
          return match;
        }
      }
    )
    .normalize('NFC')

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

  for (let i = 1; i < linhasEditadas.length; i++) {
    // Pega tudo antes do primeiro pipe e limpa hashes
    const antesPipeAtual = limparHashes(linhasEditadas[i].split('|')[0]);
    const antesPipeAnterior = limparHashes(linhasEditadas[i - 1].split('|')[0]);

    if (antesPipeAtual === antesPipeAnterior) {
      // Pega a parte **após o prefixo repetido**, incluindo o pipe
      const aposPrefixo = linhasEditadas[i].substring(linhasEditadas[i].indexOf('|'));

      // Concatena na linha anterior
      linhasEditadas[i - 1] = linhasEditadas[i - 1].trimEnd() + ' ' + aposPrefixo.trim();

      // Remove a linha atual
      linhasEditadas.splice(i, 1);
      i--; // volta uma posição para continuar checando
    }
  }

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

  // for (let i = 1; i < linhasEditadas.length; i++) {
  //   // Remove #coisa# e reduz espaços duplos antes de testar
  //   const linhaAtual = linhasEditadas[i].replace(/#.*?#/g, '').replace(/\s{2,}/g, ' ').trim();
  //   if (!linhaAtual) continue;

  //   const primeiroEspaco = linhaAtual.indexOf(' ');
  //   // Se não contém espaço, ou o caractere após o primeiro espaço NÃO é '|', sobe a linha
  //   if (primeiroEspaco === -1 || linhaAtual[primeiroEspaco + 1] !== '|') {
  //     linhasEditadas[i - 1] = linhasEditadas[i - 1].trimEnd() + ' ' + linhasEditadas[i].trim();
  //     linhasEditadas.splice(i, 1);
  //     i--; // volta uma posição para continuar checando
  //   }
  // }


  const novoConteudo = linhasEditadas.join('\n');
  fs.writeFileSync(txtPath, novoConteudo, 'utf-8');
}

editarArquivoComPipe();