import { useState, useEffect, useRef } from "react";
import { ni } from "../lib/normalizedEntry";
import { GlosaEntry, GlosaData, SinData, AnalogData } from "../types";
import { getGlosaEntries, getGlosaData } from "../lib/getGlosaData";
import { getAnalogKeyData, getAnalogData } from "../lib/getAnalogData";
import { getSynonymsKeysData } from "../lib/getSynonymData";

export function handleHomeState() {
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
    if (!inputValue || inputValue === previousInputValue.current) {
      return; // Não faz nada se o input não mudou
    }

    previousInputValue.current = inputValue; // Atualiza o valor anterior

    const timer = setTimeout(() => {
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
    }, 300);

    return () => clearTimeout(timer); // Limpa o timer se inputValue mudar antes de 500ms
  }, [inputValue]);

  return {
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
  };
}
