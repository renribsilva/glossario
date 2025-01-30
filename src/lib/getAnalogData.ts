import { ni } from "./normalizedEntry";
import Analógico from "../json/analog.json";

export function getAnalogKeyData(searchTerm: string) {
  const normSearchTerm = ni(searchTerm);
  const results: string[] = [];

  for (const [, data] of Object.entries(Analógico)) {
    if (
      (data.sub?.some(word => ni(word) === normSearchTerm) ||
      data.adj?.some(word => ni(word) === normSearchTerm) ||
      data.verb?.some(word => ni(word) === normSearchTerm) ||
      data.adv?.some(word => ni(word) === normSearchTerm) ||
      data.phrase?.some(word => ni(word) === normSearchTerm))
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