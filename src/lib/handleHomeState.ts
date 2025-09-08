import { useState, useEffect, useRef } from "react";
import { ni } from "../lib/normalizedEntry";
import { GlosaEntry, GlosaData, SinData, AnalogData } from "../types";
import { getGlosaEntries, getGlosaData } from "../lib/getGlosaData";
import { getAnalogKeyData, getAnalogData } from "../lib/getAnalogData";
import { getSynonymsKeysData } from "../lib/getSynonymData";
import { hifenizador } from "./hifenizador";

export function handleHomeState() {
  const [input, setInput] = useState<string | undefined>(undefined);
  const [inputNorm, setInputNorm] = useState<string | undefined>(undefined);
  const [inputFullText, setInputFullText] = useState<string | undefined>(undefined);
  const [showGlosaDef, setShowGlosaDef] = useState<boolean>(false);
  const [showAnalogDef, setShowAnalogDef] = useState<boolean>(false);
  const [hasInput, sethasInput] = useState<boolean>(false);
  const [glosaEntries, setGlosaEntries] = useState<GlosaEntry[]>([]);
  const [glosaData, setGlosaData] = useState<GlosaData>({});
  const [synonymKeyData, setSynonymKeyData] = useState<SinData[]>([]);
  const [analogKeyData, setAnalogKeyData] = useState<string[] | null>(null);
  const [analogData, setAnalogData] = useState<AnalogData>(null);
  const [activeList, setActiveButton] = useState<string | null>(null);
  const [synonymData, setSynonymData] = useState<SinData>({ plain_text: "", entries: [] });
  const [ptBRExtendedS, setptBRExtendedS] = useState<string[] | null>(null);
  const [ptBRExtendedC, setptBRExtendedC] = useState<string[] | null>(null);
  const [ptBRExtendedE, setptBRExtendedE] = useState<string[] | null>(null);
  const [method, setMethod] = useState<"s" | "c" | "e" | null>(null);
  const [isSugDisabled, setIsSugDisabled] = useState<boolean>(true);
  const [activeSug, setActiveSug] = useState<string | null>(null);
  const [activeFlag, setActiveFlag] = useState<string | null>(null);
  const [flagGroup, setFlagGroup] = useState<string>("adv_adj_sub_Flags");
  const [silaba, setSilaba] = useState<string>(null)

  const keys = ["exp", "conj", "gram", "def", "dif"];
  const categories = ["sub", "verb", "adj", "adv", "phr"];
  const classes = ["sub", "verb", "adj", "adv", "phr"];
  const methods = ["s", "c", "e"];
  const flags = [
    "num_gen_Flags", "superlativo_Flags", "adv_adj_sub_Flags",
    "aum_dim_Flags", "verbos_conj_Flags"
  ];

  const previousInputNorm = useRef<string | undefined>(undefined);

  const fetchPTExtended = async (
    flagGroup: string, 
    searchTerm: string, 
    searchType: "s" | "c" | "e", 
    full: boolean
  ) => {
    const response = await fetch(`/api/loadData?flagGroup=${flagGroup}&searchTerm=${searchTerm}&searchType=${searchType}&full=${full}`);
    const data = await response.json();
    return data;
  };

  const fetchHifenizador = async (word: string) => {
    const response = await fetch(`/api/loadHifenizador?word=${encodeURIComponent(word)}`);
    const data = await response.json();
    return data;
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const fullText = e.target.value;
    const words = fullText
      .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
      .split(/\s+/);
    const validWords = words.filter(word => word.trim() !== "");
    if((validWords[validWords?.length - 1])?.trim().length >= 3 ) {
        setInput((validWords[validWords.length - 1]).toLowerCase());
      }
      setInputNorm(ni(validWords[validWords.length - 1]));
      setInputFullText(fullText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const fullText = e.currentTarget.value;
    if (fullText.endsWith(" ") || fullText.endsWith(".") || e.key === "Enter") {
      const words = fullText
        .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
        .split(/\s+/);
      const validWords = words.filter(word => word.trim() !== "");
      if((validWords[validWords?.length - 1]).trim().length >= 3 ) {
        setInput((validWords[validWords.length - 1]).toLowerCase());
      }
      setInputNorm(ni(validWords[validWords.length - 1]));
      setInputFullText(fullText);
    }
  };

  const handleAnalogClick = (input: string) => {
    setAnalogData(null);
    const analogData = getAnalogData(ni(input));
    setAnalogData(analogData);
    setActiveButton("sub");
    setShowAnalogDef(true);
  };

  const handleSuggestionClick = (input: "s"|"c"|"e") => {
    setMethod(input);
    setActiveSug(input);
  };

  const handleFlagsClick = (input: string) => {
  if (activeFlag === input) {
    setActiveFlag(null);
  } else {
    // ativa novo
    setFlagGroup(input);
    setActiveFlag(input);
  }
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
    const fetchData = async () => {
      const result = await fetchPTExtended("num_gen_Flags", "orla", "e", false);
      // console.log(result);
      return result;
    };
    fetchData();
  }, []);

  useEffect(() => {

    const timer = setTimeout(async () => {

      if (
        input !== undefined && 
        (input.length >= 3 || inputNorm.length >= 3)
      ) {
        if (method === null) {
          setMethod("e");
        }
        const ptBRDataS = await fetchPTExtended(flagGroup, input, "s", activeFlag ? true : false);
        const ptBRDataC = await fetchPTExtended(flagGroup, input, "c", activeFlag ? true : false);
        const ptBRDataE = await fetchPTExtended(flagGroup, input, "e", activeFlag ? true : false);
        setptBRExtendedS(ptBRDataS);
        setptBRExtendedC(ptBRDataC);
        setptBRExtendedE(ptBRDataE);
        if (ptBRDataE?.length > 0 || ptBRDataS?.length > 0 || ptBRDataC?.length > 0) {
          setActiveSug(method)
          setIsSugDisabled(false);
        }
      }
      if (input?.length < 3 || inputNorm?.length < 3) {
        setIsSugDisabled(true)
        setActiveSug(null)
      }
      const silabas = await fetchHifenizador(input)
      setSilaba(silabas.word.replace(/-/g, "·"))
    }, 400);
    return () => clearTimeout(timer);
  }, [input, method, inputNorm, flagGroup, activeFlag]);

  useEffect(() => {

    if (inputNorm === undefined) {
      sethasInput(false);
      setShowGlosaDef(false);
    } else {
      sethasInput(true);
    }

    if (!inputNorm || inputNorm === previousInputNorm.current) {
      return;
    }

    previousInputNorm.current = inputNorm;

    const timer = setTimeout(() => {

      const entries = getGlosaEntries(inputNorm, inputFullText);
      setGlosaEntries(entries);

      const analog = getAnalogKeyData(ni(inputNorm));
      setAnalogKeyData(analog);

      const synonymKeyData = getSynonymsKeysData(ni(inputNorm));
      setSynonymKeyData(synonymKeyData);

      setShowAnalogDef(false);
      setShowGlosaDef(false);
      setActiveButton(null);
      setSynonymData({ plain_text: "", entries: [] });

      let longestOriginal = "";

      for (const entrie of entries) {
        if (ni(inputFullText).endsWith(ni(entrie.original))) {
          if (entrie.original.length > longestOriginal.length) {
            longestOriginal = entrie.original;
          }
        }
      }

      if (longestOriginal) {
        setShowGlosaDef(true);
        const data = getGlosaData(ni(longestOriginal));
        if (data) {
          setGlosaData(data);
        }
      }

    }, 300);
    return () => clearTimeout(timer);
  }, [inputNorm, input]);

  return {
    keys,
    categories,
    classes,
    method,
    methods,
    input,
    inputNorm,
    flags,
    showGlosaDef,
    showAnalogDef,
    hasInput,
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
    flagGroup,
    activeFlag,
    silaba,
    handleInputChange,
    handleKeyDown,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick,
    handleSuggestionClick,
    handleFlagsClick
  };
}
