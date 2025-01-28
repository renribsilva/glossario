import React, { useState } from "react";

interface DefinicaoEntry {
  word: string;
  xml: string;
}

const parseXmlDefinition = (xmlString: string): string => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, "text/xml");

  // Extrair a definição
  const definition = xmlDoc.querySelector("def")?.textContent || "Definição não encontrada.";

  // Extrair a etimologia (se existir)
  const etymology = xmlDoc.querySelector("etym")?.textContent || "";

  // Retornar a definição formatada
  return `${definition} ${etymology ? `\n(Etimologia: ${etymology})` : ""}`;
};

export default function Home() {
  const [palavra, setPalavra] = useState("");
  const [definicao, setDefinicao] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const buscarDefinicao = async () => {
    try {
      const response = await fetch(`/api/getWord?palavra=${palavra}`);
      if (!response.ok) {
        throw new Error("Palavra não encontrada");
      }

      const data: DefinicaoEntry[] = await response.json();
      if (data.length > 0) {
        // Extrair e formatar a definição do XML
        const definicaoFormatada = parseXmlDefinition(data[0].xml);
        setDefinicao(definicaoFormatada);
      } else {
        setDefinicao("Nenhuma definição encontrada.");
      }
      setError(null);
    } catch (err) {
      setError(`${err}: Erro ao buscar a definição da palavra`);
      setDefinicao(null);
    }
  };

  return (
    <div>
      <h1>Buscar Definição de Palavra</h1>
      <input
        type="text"
        value={palavra}
        onChange={(e) => setPalavra(e.target.value)}
        placeholder="Digite uma palavra"
      />
      <button onClick={buscarDefinicao}>Buscar</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {definicao && (
        <div>
          <h2>Definição de {palavra}:</h2>
          <pre>{definicao}</pre> {/* Usamos <pre> para manter a formatação */}
        </div>
      )}
    </div>
  );
}