import fs from 'fs';
import path from 'path';

function dicioJsonCreator() {
  const baseInputDir = path.join(process.cwd(), "public", "dicio", "txt_modificado");
  const baseOutputDir = path.join(process.cwd(), "src", "json", "dicioJson");

  // Cria o diretório de saída se não existir
  fs.mkdirSync(baseOutputDir, { recursive: true });

  // Loop de A a Z
  for (let i = 65; i <= 90; i++) {
    const letra = String.fromCharCode(i);
    const inputPath = path.join(baseInputDir, `${letra}.txt`);
    const outputPath = path.join(baseOutputDir, `${letra}.json`);

    if (!fs.existsSync(inputPath)) {
      console.warn(`⚠️ Arquivo não encontrado: ${inputPath}`);
      continue;
    }

    // ✅ Normaliza o conteúdo completo do arquivo (para corrigir diacríticos)
    const conteudo = fs.readFileSync(inputPath, 'utf-8').normalize('NFC');

    const linhas = conteudo
      .split(/\r?\n/)
      .map(l => l.normalize('NFC')) // ✅ normaliza cada linha individualmente
      .filter(l => l.trim() !== '');

    for (let i = 0; i < linhas.length; i++) {
      const linhaAtual = linhas[i].trim();
      if (!linhaAtual.includes("|")) {
        linhas[i - 1] = linhas[i - 1].trimEnd() + ' ' + linhaAtual;
        linhas.splice(i, 1);
        i--;
      }
    }

    const resultado: Record<string, string> = {};

    for (const linhaBruta of linhas) {
      const linha = linhaBruta.normalize('NFC'); // ✅ garante normalização dentro do loop
      const indicePipe = linha.indexOf('|');
      if (indicePipe === -1) continue; // ignora se não tiver '|'

      // Tudo antes do primeiro pipe é a "entrada"
      let entrada = linha.slice(0, indicePipe).trim();

      // Remove o conteúdo entre ##
      entrada = entrada.replace(/#.*?#/g, '').trim().normalize('NFC');

      // Tudo a partir do pipe (inclusive) é o texto
      const texto = linha.slice(indicePipe).trim().normalize('NFC');

      resultado[entrada] = texto;
    }

    // ✅ Escreve o JSON com strings já normalizadas
    fs.writeFileSync(outputPath, JSON.stringify(resultado, null, 2), 'utf-8');
    console.log(`✅ Gerado: ${outputPath}`);
  }

  console.log("🎉 Todos os arquivos de A a Z foram processados!");
}

// Executa
dicioJsonCreator();
