import { useState, useEffect, useRef } from "react";
import { ni } from "../lib/normalizedEntry";
import { GlosaEntry, GlosaData, SinData, AnalogData } from "../types";
import { getGlosaEntries, getGlosaData } from "../lib/getGlosaData";
import { getAnalogKeyData, getAnalogData } from "../lib/getAnalogData";
import { getSynonymsKeysData } from "../lib/getSynonymData";

export function handleHomeState() {
  const [inputValue, setInputValue] = useState<string | undefined>(undefined);
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

  const keys = ["exp", "conj", "gram", "def", "dif"];
  const categories = ["sub", "verb", "adj", "adv", "phr"];
  const classes = ["sub", "verb", "adj", "adv", "phr"];

  const previousInputValue = useRef<string | undefined>(undefined);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const fullText = e.target.value;
    const words = ni(fullText)
      .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
      .split(/\s+/);
    const validWords = words.filter(word => word.trim() !== "");
    setInputValue(validWords[validWords.length - 1]);
    setInputFullText(fullText);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const fullText = e.currentTarget.value;
    if (fullText.endsWith(" ") || fullText.endsWith(".") || e.key === "Enter") {
      const words = ni(fullText)
        .replace(/[!"#$%&'()*+,.ºª/:;¨´<=>?´@[\\\]^_`{|}~]+/g, "")
        .split(/\s+/);
      const validWords = words.filter(word => word.trim() !== "");
      setInputValue(validWords[validWords.length - 1]);
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

    if (inputValue === undefined) {
      sethasInput(false);
      setShowGlosaDef(false);
    } else {
      sethasInput(true);
    }

    if (!inputValue || inputValue === previousInputValue.current) {
      return;
    }

    previousInputValue.current = inputValue;

    const timer = setTimeout(() => {

      const entries = getGlosaEntries(inputValue, inputFullText);
      setGlosaEntries(entries);

      const analog = getAnalogKeyData(ni(inputValue));
      setAnalogKeyData(analog);

      const synonymKeyData = getSynonymsKeysData(ni(inputValue));
      setSynonymKeyData(synonymKeyData);

      setShowAnalogDef(false);
      setShowGlosaDef(false);
      setActiveButton(null);
      setSynonymData({ plain_text: "", entries: [] });

      for (const entrie of entries) {
        if (ni(inputFullText).endsWith(ni(entrie.original))) {
          setShowGlosaDef(true);
          const data = getGlosaData(ni(entrie.original));
          if (data) {
            setGlosaData(data);
          }
        }
        console.log(showGlosaDef);
        console.log(glosaData);
      }

    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);
  
  return {
    keys,
    categories,
    classes,
    inputValue,
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
    handleInputChange,
    handleKeyDown,
    handleAnalogClick,
    handleSynonymClick,
    handleShowGlosaDef,
    handleNavbarClick
  };
}
