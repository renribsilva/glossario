import { useState, useEffect, useRef } from "react";
import { ni } from "./normalizedEntry";
import { getGlosaEntries, getGlosaData } from "./getGlosaData";
import { getAnalogKeyData, getAnalogData } from "./getAnalogData";
import { getSynonymsKeysData } from "./getSynonymData";
import { initialFlowObject } from "./initialFlow";
import { initialFlowType, WikcioResult } from "../types";
import { getDicioData } from "./getDicioData";
import { parseWiktionaryPT } from "./wikcionarioAPI";

export function handleHomeState() {
  
  const [state, setState] = useState<initialFlowType>(initialFlowObject)
  const previousInputLastNorm = useRef<string | undefined>(undefined);
  const ptExtendedCache = useRef<Record<string, any>>({});
  const hifenizadorCache = useRef<Record<string, string>>({});

  const keys = ["exp", "conj", "gram", "def", "dif"];
  const categories = ["sub", "verb", "adj", "adv", "phr"];
  const classes = ["sub", "verb", "adj", "adv", "phr"];
  const methods = ["s", "c", "e"];
  const flags = [
    "num_gen_Flags", "superlativo_Flags", "adv_adj_sub_Flags",
    "aum_dim_Flags", "verbos_conj_Flags"
  ];

  const getPTExtendedCacheKey = (
    flagGroup: string,
    searchTerm: string,
    searchType: "s" | "c" | "e",
    full: boolean
  ): string => {
    return `${flagGroup}::${searchTerm}::${searchType}::${full}`;
  };

  const fetchPTExtended = async (
    flagGroup: string, 
    searchTerm: string, 
    searchType: "s" | "c" | "e", 
    full: boolean
  ) => {
    const cacheKey = getPTExtendedCacheKey(flagGroup, searchTerm, searchType, full);
    if (ptExtendedCache.current[cacheKey]) {
      return ptExtendedCache.current[cacheKey];
    }
    const response = await fetch(`/api/loadData?flagGroup=${flagGroup}&searchTerm=${searchTerm}&searchType=${searchType}&full=${full}`);
    const data = await response.json();
    ptExtendedCache.current[cacheKey] = data;
    return data;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const fullText = e.currentTarget.value;
     // Normalizado
    const norm = fullText
      .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
      .toLowerCase()
      .split(/\s+/)
    const lastNorm = norm[norm.length - 1] ?? "";
    const lastPrevNorm = norm[norm.length - 2] ?? "";

    setState(prev => ({
      ...prev,
      inputFullText: fullText,
      inputLastNorm: lastNorm,
      inputPrevNorm: lastPrevNorm
    }));
  };

  const handlePalavrasClick = (tag: string) => {
    if (tag === "palavras")
    setState(prev =>({
      ...prev,
      showSuggestion: true,
      showDicio: false,
      showWikcio: false
    }))
    if (tag === "wikcionario")
    setState(prev =>({
      ...prev,
      showSuggestion: false,
      showWikcio: true,
      showDicio: false
    }))
    if (tag === "dicionario")
    setState(prev =>({
      ...prev,
      showSuggestion: false,
      showWikcio: false,
      showDicio: true
    }))
  }

  const handleAnalogClick = (input: string) => {
    setState(prev =>({
        ...prev,
        analogData: null
      }))
    const analogData = getAnalogData(ni(input));
    setState(prev =>({
      ...prev,
      analogData: analogData,
      activeList: "sub",
      showAnalogDef: true
    }))
  };

  const handleSuggestionClick = async (input: "s"|"c"|"e") => {
    if (state.activeSug === input) {
      setState(prev =>({
        ...prev,
        activeSug: null,
        method: null,
      }))
    } else {
      setState(prev =>({
        ...prev,
        method: input,
        activeSug: input,
        esperar: true,
      }))
    }
  };

  const handleFlagsClick = (input: string) => {
    if (state.activeFlag === input) {
      setState(prev =>({
        ...prev,
        activeFlag: null,
        flagGroup: "adv_adj_sub_Flags"
      }))
    } else {
      setState(prev =>({
        ...prev,
        esperar: true,
        flagGroup: input,
        activeFlag: input
      }))
    }
  };

  const handleSynonymClick = (input: string) => {
    const inputArray = input.split(",").map((item) => item.trim());
    const filteredData = state.synonymKeyData.filter((entry) => {
      return JSON.stringify(entry.entries) === JSON.stringify(inputArray);
    });
    if (filteredData.length > 0) {
      setState(prev =>({
        ...prev,
        synonymData: {
          plain_text: filteredData[0].plain_text,
          entries: filteredData[0].entries
        }
      }))
    } else {
      setState(prev =>({
        ...prev,
        synonymData: { plain_text: "", entries: [] }
      }))
    }
  };

  const handleShowGlosaDef = (input: string) => {
    setState (prev => ({
      ...prev,
      showGlosaDef: true
    }))
    const data = getGlosaData(ni(input));
    if (data) {
      setState (prev => ({
        ...prev,
        glosaData: data
      }))
    }
  };

  const handleNavbarClick = (list: string) => {
    setState (prev => ({
      ...prev,
      activeList: list
    }))
  };

  const fetchHifenizador = async (word: string): Promise<{ word: string }> => {
    if (hifenizadorCache.current[word]) {
      return { word: hifenizadorCache.current[word] };
    }
    const response = await fetch(`/api/loadHifenizador?word=${encodeURIComponent(word)}`);
    const data = await response.json();
    // validação
    if (!data || typeof data.word !== "string") {
      console.error("API retornou valor inválido:", data);
      return { word: null }; // evita loop infinito
    }
    // grava no cache
    hifenizadorCache.current[word] = data.word;
    return { word: data.word };
  };

  const waitForSilabaMatch = async (input: string) => {
    if (!input || input === undefined) return
    const delay = 800;
    while (true) {
      const silabas = await fetchHifenizador(input);
      if (!silabas.word) {
        console.warn("Silaba retornou vazia para", input);
        break; // ou await timeout
      }
      const formattedSilaba = silabas.word?.replace(/-/g, "·") ?? "";
      setState(prev => ({
        ...prev,
        silaba: formattedSilaba,
      }));
      // interrompe quando silaba original, sem hífens, bater com input
      // console.log({
      //   inputLastNorm: state.inputLastNorm,
      //   inputPrevNorm: state.inputPrevNorm,
      //   original: input,
      //   rawFromAPI: formattedSilaba,
      //   sanitizedInput: ni(input),
      //   sanitizedFromAPI: ni(silabas.word?.replace(/-/g, "") ?? ""),
      // });
      if (silabas.word?.replace(/-/g, "") ?? "" === input) {
        // console.log("Correspondência atingida:", formattedSilaba);
        // chamada extra para garantir atualização final
        const finalSilabas = await fetchHifenizador(input);
        const finalFormatted = finalSilabas.word?.replace(/-/g, "·") ?? "";
        setState(prev => ({
          ...prev,
          silaba: finalFormatted,
        }));
        break; // sai do loop
      }
      await new Promise(res => setTimeout(res, delay));
    }
  };

  const waitForWikcioMatch = async (input: string) => {
    if (!input || input === undefined) return
    const delay = 800;
    while (true) {
      const wikcioDataObj: WikcioResult | null = await parseWiktionaryPT(input);
      setState(prev => ({
          ...prev,
          wikcioData: wikcioDataObj,
        }));
      // interrompe quando silaba original, sem hífens, bater com input
      console.log({
        inputLastNorm: state.inputLastNorm,
        inputPrevNorm: state.inputPrevNorm,
        original: input,
        sanitizedInput: input.trim().toLowerCase(),
        sanitizedFromAPI: wikcioDataObj?.word?.replace(/[.]/g, "").trim().toLowerCase(),
      });
      if (!wikcioDataObj || (wikcioDataObj && !wikcioDataObj.word)) return
      if (wikcioDataObj.word.replace(/[.]/g, "").trim().toLowerCase() ?? "" === input.trim().toLowerCase()) {
        const wikcioDataObj: WikcioResult | null = await parseWiktionaryPT(input);
        setState(prev => ({
          ...prev,
          wikcioData: wikcioDataObj,
        }));
        break; // sai do loop
      }
      await new Promise(res => setTimeout(res, delay));
    }
  };

  const processSugList = async () => {

    if (state.inputLastNorm === '') {
      await waitForSilabaMatch(state.inputPrevNorm);
      await waitForWikcioMatch(state.inputPrevNorm);
    } else {
      await waitForSilabaMatch(state.inputLastNorm);
      await waitForWikcioMatch(state.inputLastNorm);
    }
    if (state.inputLastNorm !== undefined && state.inputLastNorm !== '') {

      if (state.inputLastNorm.length < 3) {
        setState (prev => ({
          ...prev,
          isSugDisabled: true,
          activeFlag: null,
          activeSug: null,
          esperar: false
        }))
      } else if (state.inputLastNorm.length >= 3) {

        // console.log(state.method)

        let S: string[] | null = null
        let C: string[] | null = null
        let E: string[] | null = null

        if (state.method === undefined) {
          setState (prev => ({
            ...prev,
            method: "e",
            activeSug: "e"
          }))
          E = await fetchPTExtended(state.flagGroup, String(state.inputLastNorm), "e", state.activeFlag ? true : false);
          setState (prev => ({
            ...prev,
            ptBRExtendedE: E,
            isSugDisabled: false,
          }))
          return
        }
        if (state.method === "e") {
          setState (prev => ({
            ...prev,
            method: "e",
            activeSug: "e"
          }))
          E = await fetchPTExtended(state.flagGroup, String(state.inputLastNorm), "e", state.activeFlag ? true : false);
          setState (prev => ({
            ...prev,
            ptBRExtendedE: E,
            isSugDisabled: false,
          }))
        }
        if (state.method === "s") {
          setState (prev => ({
            ...prev,
            method: "s",
            activeSug: "s"
          }))
          S = await fetchPTExtended(state.flagGroup, String(state.inputLastNorm), "s", state.activeFlag ? true : false);
          setState (prev => ({
            ...prev,
            ptBRExtendedS: S,
            isSugDisabled: false,
          }))
        }
        if (state.method === "c") {
          setState (prev => ({
            ...prev,
            method: "c",
            activeSug: "c"
          }))
          C = await fetchPTExtended(state.flagGroup, String(state.inputLastNorm), "c", state.activeFlag ? true : false);
          setState (prev => ({
            ...prev,
            ptBRExtendedC: C,
            isSugDisabled: false,
          }))
        }
        if (E?.length > 0 || S?.length > 0 || C?.length > 0) {
          setState (prev => ({
            ...prev,
            isSugDisabled: false
          }))
        }
        if (E?.length === 0 && S?.length === 0 && C?.length === 0) {
          setState (prev => ({
            ...prev,
            isSugDisabled: false
          }))
        }
      }
    }
  }

  useEffect(() => {
    setTimeout(() => {
      const fetchData = async () => {
        const result = await fetchPTExtended("adv_adj_sub_Flags", "orla", "e", false);
        // console.log(result);
        return result;
      };
      void fetchData();
    }, 2000)
  }, []);

  useEffect(() => {
    (async () => {
      setState (prev => ({
        ...prev,
        esperar: true,
      })) 
      await processSugList();
      setState (prev => ({
        ...prev,
        esperar: false,
      }))
    })();
  }, [state.inputFullText, state.method, state.activeSug, state.flagGroup, state.activeFlag]);

  useEffect(() => {

    const dicioData = getDicioData(state.inputLastNorm, state.inputPrevNorm)
    setState (prev => ({
      ...prev,
      dicioData: dicioData
    }));

    if (state.inputLastNorm === undefined || state.inputLastNorm === '') {
      setState (prev => ({
        ...prev,
        hasInput: false,
        showGlosaDef: false,
        isSugDisabled: true,
        activeSug: null,
        wikcioData: null
      }))
    } else {
      setState (prev => ({
        ...prev,
        hasInput: true
      }))
    }

    if (!state.inputLastNorm || state.inputLastNorm === previousInputLastNorm.current) {
      return;
    }

    previousInputLastNorm.current = state.inputLastNorm;

    const timer = setTimeout(() => {

      const entries = getGlosaEntries(ni(state.inputLastNorm), state.inputFullText);
      setState (prev => ({
        ...prev,
        glosaEntries: entries
      }))
      const analog = getAnalogKeyData(ni(state.inputLastNorm));
      setState (prev => ({
        ...prev,
        analogKeyData: analog
      }))
      const synonymKeyData = getSynonymsKeysData(ni(state.inputLastNorm));
      setState (prev => ({
        ...prev,
        synonymKeyData: synonymKeyData,
        showAnalogDef: false,
        showGlosaDef: false,
        activeList: null,
        synonymData: { plain_text: "", entries: [] }
      }))

      let longestOriginal = "";

      for (const entrie of entries) {
        if (ni(state.inputFullText).endsWith(ni(entrie.original))) {
          if (entrie.original.length > longestOriginal.length) {
            longestOriginal = entrie.original;
          }
        }
      }

      if (longestOriginal) {
        setState (prev => ({
        ...prev,
        showGlosaDef: true
      }))
        const data = getGlosaData(ni(longestOriginal));
        if (data) {
          setState (prev => ({
            ...prev,
            glosaData: data
          }))
        }
      }

    }, 300);
    return () => clearTimeout(timer);
  }, [state.inputFullText]);

  return {
    keys,
    categories,
    state,
    classes,
    methods,
    flags,
    setState,
    handleInputChange,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick,
    handleSuggestionClick,
    handleFlagsClick,
    handlePalavrasClick
  };
}