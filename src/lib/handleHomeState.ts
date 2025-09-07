import { useState, useEffect, useRef } from "react";
import { ni } from "../lib/normalizedEntry";
import { GlosaEntry, GlosaData, SinData, AnalogData } from "../types";
import { getGlosaEntries, getGlosaData } from "../lib/getGlosaData";
import { getAnalogKeyData, getAnalogData } from "../lib/getAnalogData";
import { getSynonymsKeysData } from "../lib/getSynonymData";

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
  const [showSuggestion, setShowSuggestion] = useState<boolean>(true);
  const [activeSug, setActiveSug] = useState<string | null>(null);

  const keys = ["exp", "conj", "gram", "def", "dif"];
  const categories = ["sub", "verb", "adj", "adv", "phr"];
  const classes = ["sub", "verb", "adj", "adv", "phr"];
  const methods = ["s", "c", "e"];

  const previousInputNorm = useRef<string | undefined>(undefined);

  const fetchPTExtended = async (searchTerm: string, searchType: "s" | "c" | "e", full: boolean) => {
    const response = await fetch(`/api/loadData?searchTerm=${searchTerm}&searchType=${searchType}&full=${full}`);
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
      const result = await fetchPTExtended("orla", "e", false);
      // console.log(result);
      return result;
    };
    fetchData();
  }, []);

  useEffect(() => {

    const timer = setTimeout(async () => {

      if (
        input !== undefined && 
        (input.endsWith("ar") || 
        input.endsWith("er") ||
        input.endsWith("ir") ||
        input.endsWith("por") ||
        input.endsWith("pôr")) &&
        input.length >= 5
      ) {
        if (method === null) {
          setMethod("e");
          setActiveSug("e");
        }
        const ptBRDataS = await fetchPTExtended(input, method, true);
        const ptBRDataC = await fetchPTExtended(input, method, true);
        const ptBRDataE = await fetchPTExtended(input, method, true);
        setptBRExtendedS(ptBRDataS);
        setptBRExtendedC(ptBRDataC);
        setptBRExtendedE(ptBRDataE);
        setShowSuggestion(false);
      } else if (input !== undefined){
        if (method === null) {
          setMethod("e");
          setActiveSug("e");
        }
        const ptBRDataS = await fetchPTExtended(input, method, false);
        const ptBRDataC = await fetchPTExtended(input, method, false);
        const ptBRDataE = await fetchPTExtended(input, method, false);
        setptBRExtendedS(ptBRDataS);
        setptBRExtendedC(ptBRDataC);
        setptBRExtendedE(ptBRDataE);
        setShowSuggestion(false);
      }
      if(input === undefined || ni(input) !== ni(inputNorm)) {
        setShowSuggestion(true);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [input, method, inputNorm]);

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
    showSuggestion,
    activeSug,
    handleInputChange,
    handleKeyDown,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick,
    handleSuggestionClick
  };
}
