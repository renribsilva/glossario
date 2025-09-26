import { NextApiRequest, NextApiResponse } from "next";
import { hifenizador } from "../../lib/hifenizador";
import fs from 'fs';
import path from 'path';

const hyph_path = path.join(process.cwd(), 'public', 'hyph_pt_BR.dic')
const my_hyph_path = path.join(process.cwd(), 'public', 'my_hyph.dic')

const myRules = fs.readFileSync(my_hyph_path, 'utf-8')
  .split(/\r?\n/)
  .map(line => line.trim())
const libreRules = fs.readFileSync(hyph_path, 'utf-8')
  .split(/\r?\n/)
  .map(line => line.trim())
  .filter(line => line.length > 0 && !line.match("UTF-8") && !line.match("4'4"));

const allPatterns = Array.from(new Set([
  ...myRules,
  ...libreRules
]));

// Handler da API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const word = req.query.word as string;

  if (!word) {
    return res.status(400).json({ error: "Parâmetro 'word' é obrigatório" });
  }

  const result = hifenizador(word, allPatterns);

  return res.status(200).json(result);
}
