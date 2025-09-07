import { NextApiRequest, NextApiResponse } from "next";
import { getPTExtended } from "../../lib/getPTExtended";

// Expondo a função de busca como uma API
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { searchTerm, searchType, full } = req.query;

  // Validação dos parâmetros
  if (
    !searchTerm || 
    !searchType || 
    typeof searchTerm !== "string" || 
    typeof searchType !== "string" || 
    !["s", "c", "e"].includes(searchType) ||
    typeof full !== "string"
  ) {
    return res.status(400).json({ error: "Parâmetros inválidos" });
  }

  // Convertendo 'full' para booleano
  const isFull = full === "true";

  const result = getPTExtended(searchTerm, searchType as "s" | "c" | "e", isFull);
    return res.status(200).json(result);
}