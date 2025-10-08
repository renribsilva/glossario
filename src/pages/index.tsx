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
    flags,
    state,
    handleInputChange,
    handleKeyDown,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick,
    handleSuggestionClick,
    handleFlagsClick
  } = handleHomeState();

  console.log("input:", state.input)
  console.log("inputNorm:", state.inputNorm)
  // console.log("activeFlag:", state.activeFlag)
  // console.log("activeSug:", state.activeSug)
  // console.log("method:", state.method)
  // console.log("isSugDisabled:", state.isSugDisabled)

  return (
    <div className={styles.home}>
      <section className={styles.navbar}>
        <div className={styles.navbar_left}>
          {state.inputNorm === undefined || state.inputNorm === '' ? (
            <div>glos·sá·rio</div>
          ) : (
            (state.inputNorm.length < 3 || state.silaba?.replace(/·/g,"") !== state.input) ? (
            <div>. . .</div>
          ) : (
            <>
              {state.silaba && (
                <div>{state.silaba}</div>
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
                spellCheck={false}
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
                    className={`${styles.flag_box_child} ${state.activeFlag === item ? styles.active : styles.inactive}`}
                    onClick={() => handleFlagsClick(item)}
                    title={item}
                    disabled={state.isSugDisabled}
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
                      className={`${styles.suggestions_button_child} ${state.activeSug === item ? styles.active : styles.inactive}`}
                      onClick={() => handleSuggestionClick(item)}
                      title={item}
                      disabled={state.isSugDisabled}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className={styles.suggestions_list_container}>
                  <div className={styles.suggestions_list}>
                    {state.esperar && state.activeSug !== null && state.inputNorm.length >= 3? (
                      <div>aguarde...</div>
                    ) : (
                      <>
                        {state.inputNorm && state.inputNorm.length < 3 && (
                          <div>
                            <i>Sugestões para termos com três letras ou mais</i>
                          </div>
                        )}
                        {(state.inputNorm === '' || state.inputNorm === undefined) && (
                          <div>
                            Digite o texto para ver palavras que contêm a última unidade digitada
                          </div>
                        )}
                        {state.inputNorm && state.inputNorm.length >= 3 && state.activeSug === null && (
                          <div>Escolha uma forma de sugestão: s, c, e</div>
                        )}
                        {state.inputNorm && state.inputNorm.length >= 3 && ["s", "c", "e"].map((type) => {
                          const suggestions = {
                            s: state.ptBRExtendedS,
                            c: state.ptBRExtendedC,
                            e: state.ptBRExtendedE,
                          }[type];
                          const label = {
                            s: "palavras que começam com",
                            c: "palavras que contêm",
                            e: "palavras que terminam em",
                          }[type];
                          if (state.activeSug !== type) return null;
                          if (suggestions && suggestions.length > 0) {
                            return suggestions.map((entry, index) => (
                              <div key={index}>{entry}</div>
                            ));
                          }
                          return (
                            <div key={type}>
                              <span>Sem sugestões para {label} </span>
                              <i>{state.input}</i>
                              {state.activeFlag !== null && (
                                <span> na flag <i>{state.activeFlag}</i></span>
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
                  {!state.hasInput && (
                    <div>Aqui são listados os grupos de sinônimos da última palavra digitada</div>
                  )} 
                  {state.hasInput && state.synonymKeyData.length === 0 && (
                    <div>Não há sinônimos para a palavra: &quot;{state.inputNorm}&quot;</div>
                  )}  
                  {state.hasInput && state.synonymKeyData && state.synonymKeyData.map((item, index) => {
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
                    {state.hasInput && state.synonymKeyData.length > 0 && state.synonymData.entries.length === 0 && (
                      <div>Clique em algum item para ver seus sinônimos</div>
                    )}
                    {state.hasInput && state.synonymData && Array.from(state.synonymData.entries).map((item, index) => (
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
                  {state.hasInput && state.synonymData && (
                    <div>{state.synonymData.plain_text}</div>
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
                  {!state.hasInput && (
                    <div>Digite o texto para ver expressões relacionadas a cada palavra digitada</div>
                  )}
                  {state.hasInput && state.glosaEntries.length === 0 && (
                    <>
                      <div>Nenhuma glosa que contém:</div>
                      <span><strong>{state.inputNorm}</strong></span>
                    </>
                  )}
                </div>
                <div>
                  {state.hasInput && state.glosaEntries.length > 0 && (
                    state.glosaEntries.map((entry, index) => {
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
                <strong>Glosa</strong>
                {(state.hasInput && state.showGlosaDef) && <span><strong>&nbsp;de &quot;{state.glosaData.original}&quot;</strong></span>}
              </div>
              <div className={styles.definitions_panel}>
                {state.hasInput && !state.showGlosaDef && state.glosaEntries.length !== 0 && (
                  <div>Clique em algum item para ver a sua glosa</div>
                )}
                {state.showGlosaDef && (
                  <>
                    <div>
                      {keys.map((key) => 
                        state.glosaData[key] && (
                          <div key={key} className={styles.definitions_dicio}>
                            <strong>{key.charAt(0).toUpperCase() 
                            + key.slice(1)}:</strong> {state.glosaData[key]}
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
                    {!state.hasInput && state.inputNorm === "" && (
                      <div>Aqui são listados os grupos analógicos para cada palavra digitada</div>
                    )}
                    {state.hasInput && state.analogKeyData === null && (
                      <div>Não há grupos analógicos para a palavra &quot;{state.inputNorm}&quot;</div>
                    )}
                    {state.hasInput && state.analogKeyData && state.analogKeyData.length > 0 
                    && state.analogKeyData.map((item: string, index) => (
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
                    {state.hasInput && state.analogKeyData !== null && !state.showAnalogDef && (
                      <div>Clique em algum item para ver o seu campo analógico</div>
                    )}
                    {state.hasInput && state.analogData && state.showAnalogDef && state.analogData.group && (
                      <>
                        <strong>{state.analogData.original}: </strong>
                        <span>
                          {state.analogData.group.sub0}{" "}
                          {state.analogData.group.sub1}{" "}
                          {state.analogData.group.sub2}{" "}
                          {state.analogData.group.sub3}{" "}
                          {state.analogData.group.sub4}
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
              <div className={styles.analog_button}>
                <div>
                  {classes.map((list) => {
                    return (
                      <button
                        key={list}
                        className={`${styles.analog_button_child} ${(state.activeList === list && state.hasInput && state.showAnalogDef) ? styles.active : styles.inactive}`}
                        onClick={() => handleNavbarClick(list)}
                        disabled={!state.hasInput || !state.showAnalogDef}
                      >
                        {list}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className={styles.analog_plain}>
                {categories.map((category) =>
                  state.activeList === category && state.analogData !== null && state.analogData[category] && (
                    <div key={category}>
                      {state.hasInput && state.analogData[category].map((item, index) => (
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
    </div>
  );
}
