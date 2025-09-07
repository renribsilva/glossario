import { ni } from "./normalizedEntry";
import Analógico from "../json/analog.json";

function ru (input: string) {
  const result = input
  .replace("(-se)", "")
  .replace(/\(.*?\)/g, "")
  .trim();
  return result;
}

// function ss(word: string, search: string): boolean {
//   if (search.length > 3) {
//     return (
//       word.includes(` ${search} `) || 
//       word.startsWith(`${search} `) || 
//       word.endsWith(` ${search}`)
//     );
//   } else if (search.length <= 3) {
//     return false;
//   }
// }

export function getAnalogKeyData(searchTerm: string) {
  const normSearchTerm = ni(searchTerm);
  const results: string[] = [];

  for (const [, data] of Object.entries(Analógico)) {
    if (
      data.sub?.some(word => ru(ni(word)) === normSearchTerm) ||
      // data.sub?.some(word => ss(ru(ni(word)), normSearchTerm)) ||
      data.adj?.some(word => ru(ni(word)) === normSearchTerm) ||
      // data.adj?.some(word => ss(ru(ni(word)), normSearchTerm)) ||
      data.verb?.some(word => ru(ni(word)) === normSearchTerm) ||
      // data.verb?.some(word => ss(ru(ni(word)), normSearchTerm)) ||
      data.adv?.some(word => ru(ni(word)) === normSearchTerm) ||
      // data.adv?.some(word => ss(ru(ni(word)), normSearchTerm)) ||
      // data.phr?.some(word => ss(ru(ni(word)), normSearchTerm)) ||
      data.phr?.some(word => ru(ni(word)) === normSearchTerm) 
    ) {
      results.push(data.original);
    }
  }
  return results.length > 0 ? results : null;
}

export const getAnalogData = (searchTerm: string) => {
  const normSearchTerm = ni(searchTerm);

  for (const [, data] of Object.entries(Analógico)) {
    if (ni(data.original) === normSearchTerm) {
      return data;
    }
  }
  return null;
};