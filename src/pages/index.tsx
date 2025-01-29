import React, { useEffect, useState } from "react";
import styles from "../styles/index.module.css";
import Glossario from "../json/glossary.json";
import { ni } from "../lib/normalizedEntry";

interface GlosaValues {
  exp: string | undefined;
  conj: string | undefined;
  gram: string | undefined;
  def: string | undefined;
  dif: string | undefined;
}

interface GlosaEntry {
  original: string;
}

export default function HomePage() {
  const [inputValue, setInputValue] = useState<string>("");
  const [showDefinition, setShowDefinition] = useState<boolean>(false);
  const [glosaEntries, setGlosaEntries] = useState<GlosaEntry[]>([]);
  const [glosaValues, setGlosaValues] = useState<GlosaValues>({
    exp: undefined,
    conj: undefined,
    gram: undefined,
    def: undefined,
    dif: undefined,
  });

  function getGlosaEntries() {
    if (!inputValue.trim()) {
      setGlosaEntries([]);
      setGlosaValues({
        exp: undefined,
        conj: undefined,
        gram: undefined,
        def: undefined,
        dif: undefined,
      });
      return;
    }

    const entries: GlosaEntry[] = [];
    let glosaValues = {
      exp: undefined,
      conj: undefined,
      gram: undefined,
      def: undefined,
      dif: undefined,
    };

    for (const [chave, valor] of Object.entries(Glossario)) {
      // Verifica se a chave contém o inputValue
      if (ni(chave).includes(ni(inputValue))) {
        entries.push({
          original: valor.original,
        });
      }

      if (ni(inputValue).endsWith(ni(chave))) {
        glosaValues = {
          exp: valor.exp?.plain_text?.[1] || undefined,
          conj: valor.conj?.plain_text?.[1] || undefined,
          gram: valor.gram?.plain_text?.[1] || undefined,
          def: valor.def?.plain_text?.[1] || undefined,
          dif: valor.dif?.plain_text?.[1] || undefined,
        };
      }
    }

    setGlosaEntries(entries);
    setGlosaValues(glosaValues);
  }

  useEffect(() => {
    getGlosaEntries();
  }, [inputValue]);

  const handleShowDefinition = () => {
    setShowDefinition(true);
  };

  return (
    <div>
      <div className={styles.input_container}>
        <textarea
          className={styles.input}
          onChange={(e) => {
            const fullText = e.target.value.trim();
            if (fullText === "") {
              setInputValue("");
              setGlosaEntries([]);
              setGlosaValues({
                exp: undefined,
                conj: undefined,
                gram: undefined,
                def: undefined,
                dif: undefined,
              });
              return;
            }
            const words = fullText.split(/\s+/);
            const lastWord = words[words.length - 1] || "";
            setInputValue(lastWord);
          }}
          placeholder="Digite o texto..."
        />
      </div>
      <div>
        <h2>Glossário</h2>
        {/* Renderizando as entradas de glossário */}
        <div>
          {glosaEntries.length > 0 ? (
            glosaEntries.map((entry, index) => (
              <div key={index}>
                <button
                  onClick={handleShowDefinition}
                  style={{ cursor: "pointer" }}
                  className={styles.button}
                >
                  {entry.original}
                </button>
              </div>
            ))
          ) : (
            <p>Nenhuma entrada encontrada.</p>
          )}
        </div>
        <div>
          {showDefinition && (
            <>
              {glosaValues.exp && (
                <div>
                  <strong>Exp:</strong> {glosaValues.exp}
                </div>
              )}
              {glosaValues.conj && (
                <div>
                  <strong>Conj:</strong> {glosaValues.conj}
                </div>
              )}
              {glosaValues.gram && (
                <div>
                  <strong>Gram:</strong> {glosaValues.gram}
                </div>
              )}
              {glosaValues.def && (
                <div>
                  <strong>Def:</strong> {glosaValues.def}
                </div>
              )}
              {glosaValues.dif && (
                <div>
                  <strong>Dif:</strong> {glosaValues.dif}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
