import React, { useEffect, useState } from "react";
import styles from "../styles/index.module.css";
import Glossario from "../json/glossary.json";
import Analógico from "../json/analog.json";
import { ni } from "../lib/normalizedEntry";

interface GlosaData {
  original?: string;
  exp?: string;
  conj?: string;
  gram?: string;
  def?: string;
  dif?: string;
}

interface AnalogData {
  original: string;
  num_ref: string;
  group: {
      sub0: string;
      sub1: string;
      sub2: string;
      sub3: string;
      sub4: string;
  };
  sub: string[];
  adj: string[];
  verb: string[];
  adv: string[];
  phrase: string[];
}

interface GlosaEntry {
  original: string;
}

export default function HomePage() {

  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [showGlosaDef, setShowGlosaDef] = useState<boolean>(false);
  const [showAnalogDef, setShowAnalogDef] = useState<boolean>(false);
  const [glosaEntries, setGlosaEntries] = useState<GlosaEntry[]>([]);
  const [glosaData, setGlosaData] = useState<GlosaData>({});
  const [analogKeyData, setAnalogKeyData] = useState<string[] | null>(null);
  const [analogData, setAnalogData] = useState<AnalogData>(null);
  const [activeList, setActiveButton] = useState<string | null>(null);

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

  function getAnalogKeyData(searchTerm: string) {

    const normalizedSearchTerm = ni(searchTerm);
    const results: string[] = [];

    for (const [, data] of Object.entries(Analógico)) {

        if (
            data.sub?.some(word => ni(word) === normalizedSearchTerm) ||
            data.adj?.some(word => ni(word) === normalizedSearchTerm) ||
            data.verb?.some(word => ni(word) === normalizedSearchTerm) ||
            data.adv?.some(word => ni(word) === normalizedSearchTerm) ||
            data.phrase?.some(word => ni(word) === normalizedSearchTerm)
        ) {
            results.push(data.original);
        }
    }
    setAnalogKeyData(results.length > 0 ? results : null);
  }

  function getAnalogData(searchTerm: string) {

    setAnalogData(null);
  
    const normalizedSearchTerm = ni(searchTerm);
  
    for (const [normOriginal, data] of Object.entries(Analógico)) {
      if (
        data.sub?.some(word => ni(word) === normalizedSearchTerm) ||
        data.adj?.some(word => ni(word) === normalizedSearchTerm) ||
        data.verb?.some(word => ni(word) === normalizedSearchTerm) ||
        data.adv?.some(word => ni(word) === normalizedSearchTerm) ||
        data.phrase?.some(word => ni(word) === normalizedSearchTerm)
      ) {
        const result = { normOriginal, ...data };
        setAnalogData(result);
        return;
      }
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

  const handleAnalogClick = (input: string) => {
    getAnalogData(ni(input));
    setActiveButton("sub");
    setShowAnalogDef(true);
  };

  const handleShowGlosaDef = (input: string) => {
    setShowGlosaDef(true);
    getGlosaData(ni(input));
  };

  const handleListClick = (list: string) => {
    setActiveButton(list);
  };

  useEffect(() => {
    getGlosaEntries();
    getAnalogKeyData(ni(inputValue));
    setShowAnalogDef(false);
    setShowGlosaDef(false);
    setActiveButton(null);
  }, [inputValue]);

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
            <div>
              {
              inputValue === undefined
              && glosaEntries.length === 0 
              && (
                <p>Digite o texto para ver expressões relacionadas a cada palavra digitada</p>
              )}
              {(inputValue !== undefined && inputValue.length > 0) && glosaEntries.length === 0 && (
                <>
                  <p>Nenhuma glosa que contém:</p>
                  <span><strong>{inputValue}</strong></span>
                </>
              )}
            </div>
            <div>
              {glosaEntries.length > 0 && (
                glosaEntries.map((entry, index) => {
                  // Limita o texto a um certo número de caracteres (por exemplo, 15)
                  const maxLength = 100;
                  const truncatedText = entry.original.length > maxLength
                    ? entry.original.slice(0, maxLength) + "..."
                    : entry.original;

                  return (
                    <div key={index}>
                      <button
                        onClick={() => handleShowGlosaDef(entry.original)}
                        style={{ cursor: "pointer" }}
                        className={styles.button}
                        title={entry.original} // Exibe o texto completo ao passar o mouse
                      >
                        <strong>{truncatedText}</strong>
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className={styles.definitions_container}>
            <div className={styles.definitions_panel}>
              {
              !showGlosaDef 
              && glosaEntries.length !== 0 
              && (
                <p>Clique em algum item ao lado para ver a sua glosa</p>
              )}
              {
              !showGlosaDef 
              && glosaEntries.length === 0 
              && (
                <p>Neste campo são exibidas as glosas de cada expressão arrolada ao lado</p>
              )}
              {showGlosaDef && (
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
      <div className={styles.home_rigth}>
        <div className={styles.synonim_container} />
        <div className={styles.analog_container}>
          <div className={styles.analog_header}>
            <div className={styles.analog_header_1}><strong>Grupos</strong></div>
            <div className={styles.analog_header_2}><strong>Campo analógico</strong></div>
            <div className={styles.analog_header_3}>
              {["sub", "verb", "adj", "adv", "phr"].map((list) => {
                return (
                  <button
                    key={list}
                    className={`${styles.analog_button} ${
                      activeList === list ? styles.active : styles.inactive
                    }`}
                    onClick={() => handleListClick(list)}
                  >
                    {list}
                  </button>
                );
              })}
            </div>
          </div>
          <div className={styles.analog_groups}>
            <div>
              {analogKeyData 
              && analogKeyData.length > 0 
              && analogKeyData.map((item: string, index: number) => (
                <>
                  <button 
                    key={index} 
                    className={styles.button}
                    onClick={() => handleAnalogClick(item)}
                    title={item}
                  ><strong>{item}</strong>
                  </button>
                </>
              ))}
              <p>(clique para ver as palavras do campo analógico)</p>
            </div>
            <div>
              {analogData && showAnalogDef && analogData.group && (
                <div>
                  {analogData.group.sub0}{" "}
                  {analogData.group.sub1}{" "}
                  {analogData.group.sub2}{" "}
                  {analogData.group.sub3}{" "}
                  {analogData.group.sub4}
                </div>
              )}
            </div>
            <div>
              <div>
                {activeList === "sub" 
                && analogData 
                && analogData.sub.map((item: string, index: number) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
              <div>
                {activeList === "verb" 
                && analogData 
                && analogData.verb.map((item: string, index: number) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
              <div>
                {activeList === "adj" 
                && analogData 
                && analogData.adj.map((item: string, index: number) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
              <div>
                {activeList === "adv" 
                && analogData 
                && analogData.adv.map((item: string, index: number) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
