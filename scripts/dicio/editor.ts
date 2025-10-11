import fs from 'fs';
import path from 'path';

function editarArquivoComPipe() {
  const txtPath = path.join(process.cwd(), "public", "dicio", "A.txt");
  const conteudo = fs.readFileSync(txtPath, 'utf-8');
  const linhas = conteudo.split('\n').filter(linha => {
    const conteudo = linha.trim();
    return !/^\d+$/.test(conteudo);
  });

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

    // Regex para detectar se o primeiro caractere é "a" ou "á" (maiúsculo ou minúsculo)
    const comecaComA = /^[aáàãâäAÁÀÃÂÄ]/.test(linhaAtual);

    // Se NÃO começa com "a" (com ou sem acento)
    if (!comecaComA) {
      linhas[i - 1] = linhas[i - 1].trimEnd() + ' ' + linhaAtual;
      linhas.splice(i, 1);
      i--;
    }
  }

  const prefixosList = [
    ' loc. adv. ', ' loc. conj. ', ' loc. prep. ', ' loc. pron. ',
    ' m. ', ' f. ', ' v. t. ', ' v. i. ', ' v. p. ',
    ' adj. ', ' adv. ', ' interj. ', ' mús. ', ' prov. ',
    ' gram. ', ' pref. ', ' abrev. ', ' prep. ', ' pron. ',
    ' art. '
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

      while (indice !== -1) {
        // Substitui na string original (com a capitalização original)
        const originalPrefix = depois.slice(indice, indice + prefixo.length).trim();
        
        depois =
          depois.slice(0, indice) +
          `|${originalPrefix}|` +
          depois.slice(indice + prefixo.length);

        // Atualiza a string "depoisLower" para manter sincronizado
        depoisLower =
          depoisLower.slice(0, indice) +
          `|${prefixTrim}|` +
          depoisLower.slice(indice + prefixo.length);

        // Continua a busca após a nova inserção
        indice = depoisLower.indexOf(prefixo, indice + prefixTrim.length + 2);
      }
    }

    let linhaFinal = antes + depois
    linhaFinal = linhaFinal
    .replace(/\s{2,}/g, ' ')
    .replace(/([^\s,]+),(?:\s(\([^)]*?\))|(\d))/, (match, p1, parens, numero) => {
      if (parens) {
        // Parênteses: espaço antes da vírgula
        return `${p1}# ,${parens}#`;
      } else if (numero) {
        // Número: sem espaço
        return `${p1}# ,${numero}#`.replace(' # ,', '#,');
      } else {
        return match; // fallback de segurança
      }
    })
    .replace(/\s+\)/g, ')')

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
      linhaFinal = `${prefixo} |${cat1}| ${definicao} |${cat2}|${definicao}`;
    }

    return linhaFinal
  });

  const novoConteudo = linhasEditadas.join('\n');
  fs.writeFileSync(txtPath, novoConteudo, 'utf-8');
}

editarArquivoComPipe();