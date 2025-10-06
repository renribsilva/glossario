import styles from "../styles/index.module.css";
import { handleHomeState } from "../lib/flowOfReact";
import Theme from "../components/theme";
import InstallPWA from "../components/install";

export default function HomePage() {

  const {
    keys,
    categories,
    classes,
    methods,
    input,
    flags,
    showGlosaDef,
    showAnalogDef,
    hasInput,
    inputNorm,
    glosaEntries,
    glosaData,
    synonymKeyData,
    analogKeyData,
    analogData,
    activeList,
    synonymData,
    ptBRExtendedS,
    ptBRExtendedC,
    ptBRExtendedE,
    isSugDisabled,
    activeSug,
    activeFlag,
    silaba,
    esperar,
    handleInputChange,
    handleKeyDown,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick,
    handleSuggestionClick,
    handleFlagsClick
  } = handleHomeState();

  return (
    <div>
      <section className={styles.navbar}>
        <div className={styles.navbar_left}>
          {inputNorm === undefined || inputNorm === '' ? (
            <div>glos·sá·rio</div>
          ) : (
            (inputNorm.length < 3 || silaba?.replace(/·/g,"") !== input) ? (
            <div>. . .</div>
          ) : (
            <>
              {silaba && (
                <div>{silaba}</div>
              )}
            </>
          )
          )}
        </div>
        <div className={styles.navbar_right}>
          <InstallPWA/>
          <Theme/>
        </div>
      </section>
      <section className={styles.grid_container}>
        <div className={styles.grid_item}>
          <div className={styles.textarea_container_first}>
            <div className={styles.textarea_container}>
              <textarea
                  className={styles.textarea}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite o texto..."
                />
            </div>
          </div>
          <div className={styles.textarea_container_second}>
            <div className={styles.suggestion_title}>
              <strong>Sugestões de palavras</strong>
            </div>
            <div className={styles.suggestion_box}>
              <div className={styles.flag_box}>
                {flags.map((item, index) => (
                  <button 
                    key={item}
                    className={`${styles.flag_box_child} ${activeFlag === item ? styles.active : styles.inactive}`}
                    onClick={() => handleFlagsClick(item)}
                    title={item}
                    disabled={isSugDisabled}
                  >
                    {String(index+1)}
                  </button>
                ))}
              </div>
              <div className={styles.suggestion_list_box}>
                <div className={styles.suggestions_button}>
                  {methods.map((item: "s" | "c" | "e") => (
                    <button 
                      key={item}
                      className={`${styles.suggestions_button_child} ${activeSug === item ? styles.active : styles.inactive}`}
                      onClick={() => handleSuggestionClick(item)}
                      title={item}
                      disabled={isSugDisabled}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className={styles.suggestions_list_container}>
                  <div className={styles.suggestions_list}>
                    {esperar ? (
                      <div>aguarde...</div>
                    ) : (
                      <>
                        {!esperar && inputNorm && inputNorm.length < 3 && (
                          <div>
                            <i>Sugestões para palavras com três letras ou mais</i>
                          </div>
                        )}
                        {!esperar && (inputNorm === '' || inputNorm === undefined) && (
                          <div>
                            Digite o texto para ver palavras que contêm a última unidade digitada
                          </div>
                        )}
                        {inputNorm && inputNorm.length >= 3 && ["s", "c", "e"].map((type) => {
                          const suggestions = {
                            s: ptBRExtendedS,
                            c: ptBRExtendedC,
                            e: ptBRExtendedE,
                          }[type];
                          const label = {
                            s: "palavras que começam com",
                            c: "palavras que contêm",
                            e: "palavras que terminam em",
                          }[type];
                          if (!esperar && activeSug !== type) return null;
                          if (!esperar && suggestions && suggestions.length > 0) {
                            return suggestions.map((entry, index) => (
                              <div key={index}>{entry}</div>
                            ));
                          }
                          return (
                            <div key={type}>
                              <span>Sem sugestões para {label} </span>
                              <i>{input}</i>
                              {!esperar && activeFlag !== null && (
                                <span> na flag <i>{activeFlag}</i></span>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.grid_item}>
          <div className={styles.synonym_container}>
            <div className={styles.synonym_container_first}>
              <div className={styles.synonym_container_first_left}>
                <div className={styles.shared_synonym_title}>
                  <strong>Grupos</strong>
                </div>
                <div className={styles.shared_synonym_itens}>
                  {!hasInput && (
                    <p>Aqui são listados os grupos de sinônimos da última palavra digitada</p>
                  )} 
                  {hasInput && synonymKeyData.length === 0 && (
                    <p>Não há sinônimos para a palavra: &quot;{inputNorm}&quot;</p>
                  )}  
                  {hasInput && synonymKeyData && synonymKeyData.map((item, index) => {
                    const entriesString = item.entries.join(", ");
                    return (
                      <div className={styles.shared_synonym_div} key={index}>
                        <button 
                          key={index}
                          className={styles.synonym_itens}
                          onClick={() => handleSynonymClick(entriesString)}
                          title={entriesString}
                        >{entriesString}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className={styles.synonym_container_first_right}>
                <div className={styles.shared_synonym_title}>
                  <strong>Sinônimos</strong>
                </div>
                <div className={styles.shared_synonym_div}>
                  <div className={styles.shared_synonym_itens}>
                    {hasInput && synonymKeyData.length > 0 && synonymData.entries.length === 0 && (
                      <p>Clique em algum item para ver seus sinônimos</p>
                    )}
                    {hasInput && synonymData && Array.from(synonymData.entries).map((item, index) => (
                      <div key={index}>{item}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.synonym_container_second}>
              <div className={styles.shared_synonym_title}>
                <strong>Texto</strong>
              </div>
              <div className={styles.shared_synonym_div}>
                <div className={styles.synonym_plain_text}>
                  {hasInput && synonymData && (
                    <div>{synonymData.plain_text}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.grid_item}>
          <div className={styles.glossario_container}>
            <div className={styles.glossario_container_first}>
              <div className={styles.glossario_title}>
                <strong>Lista de expressões e conjunções</strong>
              </div>
              <div className={styles.expressions_container}>
                <div>
                  {!hasInput && (
                    <p>Digite o texto para ver expressões relacionadas a cada palavra digitada</p>
                  )}
                  {hasInput && glosaEntries.length === 0 && (
                    <>
                      <p>Nenhuma glosa que contém:</p>
                      <span><strong>{inputNorm}</strong></span>
                    </>
                  )}
                </div>
                <div>
                  {hasInput && glosaEntries.length > 0 && (
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
                            className={styles.expression_itens}
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
            </div>
            <div className={styles.glossario_container_second}>
              <div className={styles.glossario_title}>
                <strong>Glosa de </strong>
                <span><strong>&quot;{glosaData.original}&quot;</strong></span>
              </div>
              <div className={styles.definitions_panel}>
                {hasInput && !showGlosaDef && glosaEntries.length !== 0 && (
                  <p>Clique em algum item para ver a sua glosa</p>
                )}
                {showGlosaDef && (
                  <>
                    <div>
                      {keys.map((key) => 
                        glosaData[key] && (
                          <div key={key} className={styles.definitions_dicio}>
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
        <div className={styles.grid_item}>
          <div className={styles.analog_container}>
            <div className={styles.analog_container_first}>
              <div className={styles.analog_container_first_left}>
                <div className={styles.shared_analog_title}>
                  <strong>Grupos analógicos</strong>
                </div>
                <div className={styles.shared_analog_div}>
                  <div className={styles.shared_analog_itens}>
                    {!hasInput && inputNorm === "" && (
                      <p>Aqui são listados os grupos analógicos para cada palavra digitada</p>
                    )}
                    {hasInput && analogKeyData === null && (
                      <p>Não há grupos analógicos para a palavra &quot;{inputNorm}&quot;</p>
                    )}
                    {hasInput && analogKeyData && analogKeyData.length > 0 
                    && analogKeyData.map((item: string, index) => (
                      <>
                        <button 
                          key={index}
                          className={styles.analog_itens}
                          onClick={() => handleAnalogClick(item)}
                          title={item}
                        >{item}
                        </button>
                      </>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.analog_container_first_right}>
                <div className={styles.shared_analog_title}>
                  <strong>Campo analógico</strong>
                </div>
                <div className={styles.shared_analog_div}>
                  <div className={styles.shared_analog_itens}>
                    {hasInput && analogKeyData !== null && !showAnalogDef && (
                      <p>Clique em algum item para ver o seu campo analógico</p>
                    )}
                    {hasInput && analogData && showAnalogDef && analogData.group && (
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
            </div>
            <div className={styles.analog_container_second}>
              <div className={styles.shared_analog_title}>
                <strong>Lista por classe de palavras</strong>
              </div>
              <div className={styles.analog_lists}>
                <div className={styles.analog_button}>
                  <div>
                    {classes.map((list) => {
                      return (
                        <button
                          key={list}
                          className={`${styles.analog_button_child} ${(activeList === list && hasInput && showAnalogDef) ? styles.active : styles.inactive}`}
                          onClick={() => handleNavbarClick(list)}
                          disabled={!hasInput || !showAnalogDef}
                        >
                          {list}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className={styles.analog_plain}>
                  {categories.map((category) =>
                    activeList === category && analogData !== null && analogData[category] && (
                      <div key={category}>
                        {hasInput && analogData[category].map((item, index) => (
                          <div key={index}>{item}</div>
                        ))}
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
