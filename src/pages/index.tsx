import React, { useEffect, useState } from "react";
import styles from "../styles/index.module.css";
import Glossario from "../json/glossary.json";
import { ni } from "../lib/normalizedEntry";

interface GlosaData {
  original?: string;
  exp?: string;
  conj?: string;
  gram?: string;
  def?: string;
  dif?: string;
}

interface GlosaEntry {
  original: string;
}

export default function HomePage() {

  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [showDefinition, setShowDefinition] = useState<boolean>(false);
  const [glosaEntries, setGlosaEntries] = useState<GlosaEntry[]>([]);
  const [glosaData, setGlosaData] = useState<GlosaData>({});

  function getGlosaEntries() {
    if (!inputValue) {
      setGlosaEntries([]);
      return;
    }

    const entries: GlosaEntry[] = [];

    const regex = new RegExp(`(^|\\s)${inputValue}($|\\s)`, "i");

    for (const [chave, valor] of Object.entries(Glossario)) {
      if (regex.test(ni(chave))) {
        entries.push({ original: valor.original });
      }
    }

    setGlosaEntries(entries);
  }

  function getGlosaData(input: string) {
    
    const valor = Glossario[input];
  
    if (valor) {
      const formatObject = (entrie?: { plain_text: { [key: string]: string } }) => 
        entrie
          ? Object.values(entrie.plain_text)
              .map((value, index) => `${index + 1}. ${value}`)
              .join("; ")
          : undefined;

      const data: GlosaData = {
        original: valor.original || undefined,
        exp: formatObject(valor.exp),
        conj: formatObject(valor.conj),
        gram: formatObject(valor.gram),
        def: formatObject(valor.def),
        dif: formatObject(valor.dif),
      };
      setGlosaData(data);
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const fullText = e.target.value;
    const words = ni(fullText)
    .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
    .split(/\s+/);
    const validWords = words.filter(word => word.trim() !== "");
    setInputValue(validWords[validWords.length - 1]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const fullText = e.currentTarget.value;
    if (fullText.endsWith(" ") || fullText.endsWith(".") || e.key === "Enter") {
      const words = ni(fullText)
      .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
      .split(/\s+/);
      const validWords = words.filter(word => word.trim() !== "");
    setInputValue(validWords[validWords.length - 1]);
    }
  };

  const handleShowDefinition = (input: string) => {
    setShowDefinition(true);
    getGlosaData(ni(input));
  };

  useEffect(() => {
    getGlosaEntries();
  }, [inputValue]);

  console.log(inputValue);

  return (
    <div className={styles.home}>
      <div className={styles.home_left}>
        <div className={styles.textarea_container}>
          <textarea
            className={styles.textarea}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite o texto..."
          />
        </div>
        <div className={styles.dynamic_content}>
          <div className={styles.glossario_container}>
            {
            inputValue === undefined
            && glosaEntries.length === 0 
            && (
              <p>Digite o texto para ver glosas relacionadas a cada palavra digitada</p>
            )}
            {(inputValue !== undefined && inputValue.length > 0) && glosaEntries.length === 0 && (
              <>
                <p>Nenhuma glosa que contém:</p>
                <span><strong>{inputValue}</strong></span>
              </>
            )}
            {glosaEntries.length > 0 && (
              glosaEntries.map((entry, index) => {
                // Limita o texto a um certo número de caracteres (por exemplo, 15)
                const maxLength = 25;
                const truncatedText = entry.original.length > maxLength
                  ? entry.original.slice(0, maxLength) + "..."
                  : entry.original;

                return (
                  <div key={index}>
                    <button
                      onClick={() => handleShowDefinition(entry.original)}
                      style={{ cursor: "pointer" }}
                      className={styles.button}
                      title={entry.original} // Exibe o texto completo ao passar o mouse
                    >
                      {truncatedText}
                    </button>
                  </div>
                );
              })
            )}
          </div>
          <div className={styles.definitions_container}>
            {showDefinition && (
              <>
                <div className={styles.definitions_title}>
                  <span>Glosa de </span>
                  <span><strong>&quot;{glosaData.original}&quot;</strong></span>
                </div>
                <div>
                  {glosaData.exp && (
                    <div>
                      <strong>Exp:</strong> {glosaData.exp}
                    </div>
                  )}
                  {glosaData.conj && (
                    <div>
                      <strong>Conj:</strong> {glosaData.conj}
                    </div>
                  )}
                  {glosaData.gram && (
                    <div>
                      <strong>Gram:</strong> {glosaData.gram}
                    </div>
                  )}
                  {glosaData.def && (
                    <div>
                      <strong>Def:</strong> {glosaData.def}
                    </div>
                  )}
                  {glosaData.dif && (
                    <div>
                      <strong>Dif:</strong> {glosaData.dif}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
