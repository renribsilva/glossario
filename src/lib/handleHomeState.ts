import { useState, useEffect, useRef } from "react";
import { ni } from "../lib/normalizedEntry";
import { GlosaEntry, GlosaData, SinData, AnalogData } from "../types";
import { getGlosaEntries, getGlosaData } from "../lib/getGlosaData";
import { getAnalogKeyData, getAnalogData } from "../lib/getAnalogData";
import { getSynonymsKeysData } from "../lib/getSynonymData";
import { getPTExtended } from "./getPTExtended";

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
  const [ptBRExtended, setptBRExtended] = useState<string[]>([]);

  const keys = ["exp", "conj", "gram", "def", "dif"];
  const categories = ["sub", "verb", "adj", "adv", "phr"];
  const classes = ["sub", "verb", "adj", "adv", "phr"];

  const previousInputNorm = useRef<string | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const fullText = e.target.value;
    const words = fullText
      .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
      .split(/\s+/);
    const validWords = words.filter(word => word.trim() !== "");
    setInput(validWords[validWords.length - 1]);
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
      setInput(validWords[validWords.length - 1]);
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

      const ptBRData = getPTExtended(input, "starts");
      setptBRExtended(ptBRData);

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
  }, [inputNorm, ptBRExtended]);
  
  return {
    keys,
    categories,
    classes,
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
    ptBRExtended,
    handleInputChange,
    handleKeyDown,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick
  };
}
