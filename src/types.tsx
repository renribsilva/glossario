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