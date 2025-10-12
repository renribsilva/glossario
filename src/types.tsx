export type GlosaData = {
  original?: string;
  exp?: string;
  conj?: string;
  gram?: string;
  def?: string;
  dif?: string;
}

export type AnalogData = {
  original: string;
  num_ref: string;
  group: {
      sub0: string;
      sub1: string;
      sub2: string;
      sub3: string;
      sub4: string;
  };
  sub: string[];
  adj: string[];
  verb: string[];
  adv: string[];
  phr: string[];
}

export type GlosaEntry = {
  original: string;
}

export type SinData = {
  plain_text: string;
  entries: string[];
}

export type ExtendedWordMap = {
  [word: string]: {
    [flag: string]: string[];
  };
};

export type initialFlowType = {
  input: string | undefined,
  inputNorm: string | undefined,
  inputRaw: string | undefined,
  inputPrevRaw: string | undefined,
  inputFullText: string | undefined,
  showGlosaDef: boolean,
  showAnalogDef: boolean,
  hasInput: boolean,
  glosaEntries: GlosaEntry[],
  glosaData: GlosaData,
  synonymKeyData: SinData[],
  analogKeyData: string[] | null,
  analogData: AnalogData | null,
  activeList: string | null,
  synonymData: SinData,
  ptBRExtendedS: string[] | null,
  ptBRExtendedC: string[] | null,
  ptBRExtendedE: string[] | null,
  method: "s" | "c" | "e" | null | undefined,
  isSugDisabled: boolean,
  activeSug: string | null,
  activeFlag: string | null,
  flagGroup: string,
  silaba: string | null,
  esperar: boolean | null,
  lastHifenized: string | null
  showSuggestion: boolean;
  showDicio: boolean;
  dicioData: dicioData | null
}

export type dicioData = {
  verbete: string,
  definição: string
}