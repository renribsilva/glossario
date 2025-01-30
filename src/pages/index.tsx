import React, { useEffect, useState } from "react";
import styles from "../styles/index.module.css";
import { ni } from "../lib/normalizedEntry";
import { AnalogData, GlosaData, GlosaEntry, SinData } from "../types";
import { getGlosaData, getGlosaEntries } from "../lib/getGlosaData";
import { getAnalogData, getAnalogKeyData } from "../lib/getAnalogData";
import { getSynonymsKeysData } from "../lib/getSynonymData";

export default function HomePage() {

  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
  const [showGlosaDef, setShowGlosaDef] = useState<boolean>(false);
  const [showAnalogDef, setShowAnalogDef] = useState<boolean>(false);
  const [showSin, setShowSin] = useState<boolean>(false);
  const [glosaEntries, setGlosaEntries] = useState<GlosaEntry[]>([]);
  const [glosaData, setGlosaData] = useState<GlosaData>({});
  const [synonymKeyData, setSynonymKeyData] = useState<SinData[]>([]);
  const [analogKeyData, setAnalogKeyData] = useState<string[] | null>(null);
  const [analogData, setAnalogData] = useState<AnalogData>(null);
  const [activeList, setActiveButton] = useState<string | null>(null);
  const [synonymData, setSynonymData] = useState<SinData>({ plain_text: "", entries: [] });

  const keys = ["exp", "conj", "gram", "def", "dif"];
  const categories = ["sub", "verb", "adj", "adv"];

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
    setAnalogData(null);
    const analogData = getAnalogData(ni(input));
    setAnalogData(analogData);
    setActiveButton("sub");
    setShowAnalogDef(true);
  };

  const handleSynonymClick = (input: string) => {
    const inputArray = input.split(",").map((item) => item.trim());
    const filteredData = synonymKeyData.filter((entry) => {
      return JSON.stringify(entry.entries) === JSON.stringify(inputArray);
    });  
    if (filteredData.length > 0) {
      setSynonymData({
        plain_text: filteredData[0].plain_text,
        entries: filteredData[0].entries
      });
    } else {
      setSynonymData({ plain_text: "", entries: [] });
    }
  };

  const handleShowGlosaDef = (input: string) => {
    setShowGlosaDef(true);
    const data = getGlosaData(ni(input));
    if (data) {
      setGlosaData(data);
    }
  };

  const handleNavbarClick = (list: string) => {
    setActiveButton(list);
  };

  useEffect(() => {
    if (!inputValue) {
      setGlosaEntries([]);
      setSynonymKeyData([]);
      setShowSin(false);
      setSynonymData({ plain_text: "", entries: [] });
      setShowAnalogDef(false);
      setShowGlosaDef(false);
      setActiveButton(null);
      return;
    }
  
    const entries = getGlosaEntries(inputValue);
    setGlosaEntries(entries);
  
    const analog = getAnalogKeyData(ni(inputValue));
    setAnalogKeyData(analog);
  
    const synonymKeyData = getSynonymsKeysData(ni(inputValue));
    setSynonymKeyData(synonymKeyData);
  
    setShowAnalogDef(false);
    setShowGlosaDef(false);
    setActiveButton(null);
  
    if (inputValue === "") {
      setShowSin(false);
    } else {
      setShowSin(true);
    }
  
    setSynonymData({ plain_text: "", entries: [] });
  }, [inputValue]);

  return (
    <section className={styles.home}>
      <section className={styles.home_left}>
        <div className={styles.textarea_container}>
          <textarea
            className={styles.textarea}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Digite o texto..."
          />
        </div>
        <div>
          <div className={styles.glossario_title}>
            <strong>Lista de expressões e conjunções</strong>
          </div>
          <div className={styles.glossario_content}>
            <div className={styles.expressions_container}>
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
                          title={entry.original}
                        >
                          {truncatedText}
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
                  <p>Clique em algum item para ver a sua glosa</p>
                )}
                {showGlosaDef && (
                  <>
                    <div className={styles.definitions_title}>
                      <span>Glosa de </span>
                      <span><strong>&quot;{glosaData.original}&quot;</strong></span>
                    </div>
                    <div>
                      {keys.map((key) => 
                        glosaData[key] && (
                          <div key={key}>
                            <strong>{key.charAt(0).toUpperCase() 
                            + key.slice(1)}:</strong> {glosaData[key]}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className={styles.home_rigth}>
        <div className={styles.synonym_container}>
          <div className={styles.synonym_container_1}>
            <div className={styles.synonym_header}>
              <div className={styles.synonym_header_1}><strong>Grupos</strong></div>
              <div className={styles.synonym_header_2}><strong>Sinônimos</strong></div>
              <div className={styles.synonym_header_3}><strong>Texto</strong></div>
            </div>
            <div className={styles.synonym_groups}>
              <div className={styles.synonym_groups_1}>
                {showSin && synonymKeyData.length === 0 && (
                  <p>Não há sinônimos para a palavra: &quot;{inputValue}&quot;</p>
                )}
                {!showSin && synonymKeyData.length === 0 && (
                  <p>Aqui são listadas grupos de sinônimos da última palavra digitada</p>
                )}   
                {synonymKeyData && synonymKeyData.map((item, index) => {
                  const entriesString = item.entries.join(", ");
                  return (
                    <div key={index}>
                      <button 
                        key={index}
                        className={styles.button}
                        onClick={() => handleSynonymClick(entriesString)}
                        title={entriesString}
                      >{entriesString}
                      </button>
                    </div>
                  );
                })}
              </div>
              <div className={styles.synonym_groups_2}>
                {synonymKeyData.length > 0
                && synonymData.entries.length === 0 && (
                  <p>Clique em algum item para ver seus sinônimos</p>
                )}
                {synonymData
                && showSin
                && Array.from(synonymData.entries).map((item, index) => (
                  <div key={index}>{item}</div>
                ))}
              </div>
              <div className={styles.synonym_groups_3}>
                {synonymData
                && showSin
                && (
                  <div>{synonymData.plain_text}</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.analog_container}>
          <div className={styles.analog_container_1}>
            <div className={styles.analog_header}>
              <div className={styles.analog_header_1}><strong>Grupos analógicos</strong></div>
              <div className={styles.analog_header_2}><strong>Campo analógico</strong></div>
            </div>
            <div className={styles.analog_groups}>
              <div className={styles.analog_groups_1}>
                {analogKeyData 
                && analogKeyData.length > 0 
                && analogKeyData.map((item: string, index: number) => (
                  <>
                    <button 
                      key={index} 
                      className={styles.button}
                      onClick={() => handleAnalogClick(item)}
                      title={item}
                    >{item}
                    </button>
                  </>
                ))}
                {analogKeyData === null && (
                  <p>Aqui são listados os grupos analógicos para cada palavra digitada</p>
                )}
              </div>
              <div className={styles.analog_groups_2}>
                {analogKeyData !== null && !showAnalogDef && (
                  <p>Clique em algum item para ver o seu campo analógico</p>
                )}
                {analogData && showAnalogDef && analogData.group && (
                  <>
                    <strong>{analogData.original}: </strong>
                    <span>
                      {analogData.group.sub0}{" "}
                      {analogData.group.sub1}{" "}
                      {analogData.group.sub2}{" "}
                      {analogData.group.sub3}{" "}
                      {analogData.group.sub4}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className={styles.analog_container_2}>
            <div className={styles.analog_header}>
              <div className={styles.analog_header_3}>
                {["sub", "verb", "adj", "adv", "phr"].map((list) => {
                  return (
                    <button
                      key={list}
                      className={`${styles.analog_button} ${
                        activeList === list ? styles.active : styles.inactive
                      }`}
                      onClick={() => handleNavbarClick(list)}
                    >
                      {list}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className={styles.analog_groups}>
            <div className={styles.analog_groups_3}>
              {categories.map((category) =>
                activeList === category && analogData[category] && (
                  <div key={category}>
                    {analogData[category].map((item, index) => (
                      <div key={index}>{item}</div>
                    ))}
                  </div>
                )
              )}
            </div>
            </div>
          </div>
        </div>
      </section>
    </section>
  );
}
