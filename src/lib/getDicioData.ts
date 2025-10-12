import A from "../json/dicioJson/A.json";
import B from "../json/dicioJson/B.json";
import C from "../json/dicioJson/C.json";
import D from "../json/dicioJson/D.json";
import E from "../json/dicioJson/E.json";
import F from "../json/dicioJson/F.json";
import G from "../json/dicioJson/G.json";
import H from "../json/dicioJson/H.json";
import I from "../json/dicioJson/I.json";
import J from "../json/dicioJson/J.json";
import K from "../json/dicioJson/K.json";
import L from "../json/dicioJson/L.json";
import M from "../json/dicioJson/M.json";
import N from "../json/dicioJson/N.json";
import O from "../json/dicioJson/O.json";
import P from "../json/dicioJson/P.json";
import Q from "../json/dicioJson/Q.json";
import R from "../json/dicioJson/R.json";
import S from "../json/dicioJson/S.json";
import T from "../json/dicioJson/T.json";
import U from "../json/dicioJson/U.json";
import V from "../json/dicioJson/V.json";
import W from "../json/dicioJson/W.json";
import X from "../json/dicioJson/X.json";
import Y from "../json/dicioJson/Y.json";
import Z from "../json/dicioJson/Z.json";

const DICIO_JSON: Record<string, Record<string, string>> = {
  A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z,
};

// Cache para resultados já buscados
const cache: Record<string, string | null> = {};

export function getDicioData(termo: string): string | null {
  const termoNormalizado = termo.normalize("NFC").trim();

  // Verifica cache primeiro
  if (cache[termoNormalizado] !== undefined) {
    return cache[termoNormalizado];
  }

  // percorre cada letra
  for (const letraObj of Object.values(DICIO_JSON)) {
    // percorre cada entrada dentro da letra
    for (const [entrada, valor] of Object.entries(letraObj)) {
      const entradaNorm = entrada.normalize("NFC").trim();
      if (entradaNorm === termoNormalizado) {
        cache[termoNormalizado] = valor; // salva no cache
        console.log(valor)
        return valor;
      }
    }
  }
  cache[termoNormalizado] = null; // salva no cache
  return null;
}

// 🔍 Exemplo de uso
getDicioData("amar");
