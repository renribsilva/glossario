import fs from "fs";
import path from "path";
import expData from "./utils/expData"; 
import conjData from "./utils/conjData"; 
import defData from "./utils/defData"; 
import gramData from "./utils/gramData"; 
import difData from "./utils/difData"; // Importando difData.ts

type GlossaryEntry = {
  original: string;
  exp?: {
    plain_text: Record<number, string>;
  };
  conj?: {
    plain_text: Record<number, string>;
  };
  def?: {
    plain_text: Record<number, string>;
  };
  gram?: {
    plain_text: Record<number, string>;
  };
  dif?: {
    plain_text: Record<number, string>;
  };
};

const srcDir = path.join(process.cwd(), "src");
const expPath = path.join(srcDir, "json", "glossaryJson", "exp.json");
const conjPath = path.join(srcDir, "json", "glossaryJson", "conj.json");
const defPath = path.join(srcDir, "json", "glossaryJson", "def.json");
const gramPath = path.join(srcDir, "json", "glossaryJson", "gram.json");
const difPath = path.join(srcDir, "json", "glossaryJson", "dif.json"); 
const glossaryPath = path.join(srcDir, "json", "glossary.json");

function createGlossary() {
  
  fs.readFile(expPath, "utf8", (err, expDataRaw) => {
    if (err) {
      console.error("Erro ao ler o arquivo exp.json:", err);
      return;
    }

    const expDataParsed = JSON.parse(expDataRaw);
    const expDataProcessed = expData(expDataParsed); 

    // Lê o arquivo conj.json
    fs.readFile(conjPath, "utf8", (err, conjDataRaw) => {
      if (err) {
        console.error("Erro ao ler o arquivo conj.json:", err);
        return;
      }

      const conjDataParsed = JSON.parse(conjDataRaw);
      const conjDataProcessed = conjData(conjDataParsed); 
      
      fs.readFile(defPath, "utf8", (err, defDataRaw) => {
        if (err) {
          console.error("Erro ao ler o arquivo def.json:", err);
          return;
        }

        const defDataParsed = JSON.parse(defDataRaw);
        const defDataProcessed = defData(defDataParsed);

        // Lê o arquivo gram.json
        fs.readFile(gramPath, "utf8", (err, gramDataRaw) => {
          if (err) {
            console.error("Erro ao ler o arquivo gram.json:", err);
            return;
          }

          const gramDataParsed = JSON.parse(gramDataRaw);
          const gramDataProcessed = gramData(gramDataParsed);

          // Lê o arquivo dif.json
          fs.readFile(difPath, "utf8", (err, difDataRaw) => {
            if (err) {
              console.error("Erro ao ler o arquivo dif.json:", err);
              return;
            }

            const difDataParsed = JSON.parse(difDataRaw);
            const difDataProcessed = difData(difDataParsed);

            const glossary: Record<string, GlossaryEntry> = {};

            // Processa os dados de exp
            for (const term in expDataProcessed) {
              glossary[term] = expDataProcessed[term];
            }

            // Processa os dados de conj
            for (const term in conjDataProcessed) {
              if (glossary[term]) {
                glossary[term].conj = conjDataProcessed[term].conj;
              } else {
                glossary[term] = {
                  original: conjDataProcessed[term].original,
                  conj: conjDataProcessed[term].conj,
                };
              }
            }

            // Processa os dados de def (definições)
            for (const term in defDataProcessed) {
              if (glossary[term]) {
                glossary[term].def = defDataProcessed[term].def;
              } else {
                glossary[term] = {
                  original: defDataProcessed[term].original,
                  def: defDataProcessed[term].def,
                };
              }
            }

            // Processa os dados de gram
            for (const term in gramDataProcessed) {
              if (glossary[term]) {
                glossary[term].gram = gramDataProcessed[term].gram;
              } else {
                glossary[term] = {
                  original: gramDataProcessed[term].original,
                  gram: gramDataProcessed[term].gram,
                };
              }
            }

            // Processa os dados de dif
            for (const term in difDataProcessed) {
              if (glossary[term]) {
                glossary[term].dif = difDataProcessed[term].dif;
              } else {
                glossary[term] = {
                  original: difDataProcessed[term].original,
                  dif: difDataProcessed[term].dif,
                };
              }
            }

            const orderedGlossary: Record<string, GlossaryEntry> = {};
            Object.keys(glossary)
              .sort()
              .forEach((key) => {
                orderedGlossary[key] = glossary[key];
              });

            // Gera o novo arquivo de glossário
            fs.writeFile(glossaryPath, JSON.stringify(orderedGlossary, null, 2), (err) => {
              if (err) {
                console.error("Erro ao salvar o arquivo newglossary.json:", err);
                return;
              }
              console.log("Arquivo glossary.json criado com sucesso!");
            });
          });
        });
      });
    });
  });
}

createGlossary();
