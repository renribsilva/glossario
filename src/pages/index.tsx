import React from "react";
import styles from "../styles/index.module.css";
import { handleHomeState } from "../lib/handleHomeState";

export default function HomePage() {

  const {
    keys,
    categories,
    classes,
    inputValue,
    showGlosaDef,
    showAnalogDef,
    showSin,
    glosaEntries,
    glosaData,
    synonymKeyData,
    analogKeyData,
    analogData,
    activeList,
    synonymData,
    handleInputChange,
    handleKeyDown,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick
  } = handleHomeState();

  // console.log(analogData);

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
                  <p>Aqui são listados os grupos de sinônimos da última palavra digitada</p>
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
                {classes.map((list) => {
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
