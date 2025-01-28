import fs from "fs";
import path from "path";
import anaData from "./utils/anaData";

const srcDir = path.join(process.cwd(), "src");
const anaPath = path.join(srcDir, "json", "ana.json");
const analogPath = path.join(srcDir, "json", "analog.json");

function createAnalog() {
  // Lendo o arquivo ana.json
  fs.readFile(anaPath, "utf8", (err, expDataRaw) => {
    if (err) {
      console.error("Erro ao ler o arquivo ana.json:", err);
      return;
    }

    try {
      // Parsing o conteúdo do arquivo
      const anaDataParsed = JSON.parse(expDataRaw);
      
      // Processando os dados com a função anaData
      const expDataProcessed = anaData(anaDataParsed);

      // Salvando os dados processados no arquivo analog.json
      fs.writeFile(analogPath, JSON.stringify(expDataProcessed, null, 2), (err) => {
        if (err) {
          console.error("Erro ao salvar o arquivo analog.json:", err);
          return;
        }
        console.log("Arquivo analog.json criado com sucesso!");
      });

    } catch (parseError) {
      console.error("Erro ao processar o conteúdo do arquivo:", parseError);
    }
  });
}

createAnalog();
