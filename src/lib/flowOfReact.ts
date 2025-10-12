import { useState, useEffect, useRef } from "react";
import { ni } from "./normalizedEntry";
import { getGlosaEntries, getGlosaData } from "./getGlosaData";
import { getAnalogKeyData, getAnalogData } from "./getAnalogData";
import { getSynonymsKeysData } from "./getSynonymData";
import { initialFlowObject } from "./initialFlow";
import { initialFlowType } from "../types";
import { getDicioData } from "./getDicioData";

export function handleHomeState() {
  
  const [state, setState] = useState<initialFlowType>(initialFlowObject)
  const previousInputNorm = useRef<string | undefined>(undefined);
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

  const fetchHifenizador = async (word: string): Promise<{ word: string }> => {
    if (hifenizadorCache.current[word]) {
      const cachedResult = hifenizadorCache.current[word];
      setState(prev => ({
        ...prev,
        lastHifenized: ni(word)
      }))
      return { word: cachedResult };
    }
    const response = await fetch(`/api/loadHifenizador?word=${encodeURIComponent(word)}`);
    const data = await response.json();
    hifenizadorCache.current[word] = data.word;
    setState(prev => ({
      ...prev,
      lastHifenized: ni(word)
    }))
    return data;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const fullText = e.target.value;
    const words = fullText
      .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
      .split(/\s+/);
    const validWords = words.filter(word => word.trim() !== "");
    // console.log(validWords[validWords?.length - 1])
    if((validWords[validWords?.length - 1])?.trim().length >= 3 ) {
      setState(prev => ({
        ...prev,
        input: (validWords[validWords.length - 1]).toLowerCase()
      }))
    }
    setState(prev =>({
      ...prev,
      inputRaw: (validWords[validWords.length - 1]),
      inputNorm: ni(validWords[validWords.length - 1]),
      inputFullText: fullText
    }))
  };

  const handlePalavrasClick = () => {
    if (state.showSuggestion && !state.showDicio)
    setState(prev =>({
      ...prev,
      showSuggestion: false,
      showDicio: true
    }))
    if (!state.showSuggestion && state.showDicio)
    setState(prev =>({
      ...prev,
      showSuggestion: true,
      showDicio: false
    }))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const fullText = e.currentTarget.value;
    if (fullText.endsWith(" ") || fullText.endsWith(".") || e.key === "Enter") {
      const words = fullText
        .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
        .split(/\s+/);
      const validWords = words.filter(word => word.trim() !== "");
      // console.log((validWords[validWords?.length - 1]))
      if((validWords[validWords?.length - 1])?.trim().length >= 3 ) {
        setState(prev => ({
          ...prev,
          input: (validWords[validWords.length - 1]).toLowerCase()
        }))
      }
      setState(prev =>({
        ...prev,
        inputNorm: ni(validWords[validWords.length - 1]),
        inputFullText: fullText,
      }))
    }
  };

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

  const processSugList = async () => {

    if (state.inputNorm === '' || state.inputNorm === undefined) {
      setState (prev => ({
        ...prev,
        isSugDisabled: true,
        method: undefined,
        activeFlag: null,
        activeSug: null
      }))
    }

    if (state.inputNorm !== undefined && state.inputNorm !== '') {

      if (state.inputNorm.length < 3) {
        setState (prev => ({
          ...prev,
          isSugDisabled: true,
          activeFlag: null,
          activeSug: null,
          esperar: false
        }))
      } else if (state.inputNorm.length >= 3) {

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
          E = await fetchPTExtended(state.flagGroup, String(state.input), "e", state.activeFlag ? true : false);
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
          E = await fetchPTExtended(state.flagGroup, String(state.input), "e", state.activeFlag ? true : false);
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
          S = await fetchPTExtended(state.flagGroup, String(state.input), "s", state.activeFlag ? true : false);
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
          C = await fetchPTExtended(state.flagGroup, String(state.input), "c", state.activeFlag ? true : false);
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
        const silabas = await fetchHifenizador(state.input)
        setState (prev => ({
          ...prev,
          silaba: silabas.word.replace(/-/g, "·"),
        }))
      }
    }
  }

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
  }, [state.input, state.method, state.activeSug, state.flagGroup, state.activeFlag]);

  useEffect(() => {

    if (state.inputNorm === undefined || state.inputNorm === '') {
      setState (prev => ({
        ...prev,
        hasInput: false,
        showGlosaDef: false,
        isSugDisabled: true,
        activeSug: null
      }))
    } else {
      setState (prev => ({
        ...prev,
        hasInput: true
      }))
    }

    if (!state.inputNorm || state.inputNorm === previousInputNorm.current) {
      return;
    }

    previousInputNorm.current = state.inputNorm;

    const timer = setTimeout(() => {

      const entries = getGlosaEntries(state.inputNorm, state.inputFullText);
      setState (prev => ({
        ...prev,
        glosaEntries: entries
      }))
      const analog = getAnalogKeyData(ni(state.inputNorm));
      setState (prev => ({
        ...prev,
        analogKeyData: analog
      }))
      const synonymKeyData = getSynonymsKeysData(ni(state.inputNorm));
      setState (prev => ({
        ...prev,
        synonymKeyData: synonymKeyData,
        showAnalogDef: false,
        showGlosaDef: false,
        activeList: null,
        synonymData: { plain_text: "", entries: [] }
      }))
      const dicioData = getDicioData(state.inputRaw)
      setState (prev => ({
        ...prev,
        dicioData: dicioData
      }))
      // console.log(dicioData)

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
  }, [state.inputNorm, state.input, state.inputRaw]);

  return {
    keys,
    categories,
    state,
    classes,
    methods,
    flags,
    setState,
    handleInputChange,
    handleKeyDown,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick,
    handleSuggestionClick,
    handleFlagsClick,
    handlePalavrasClick
  };
}
