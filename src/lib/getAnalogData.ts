import { ni } from "./normalizedEntry";
import Analógico from "../json/analog.json";

export function getAnalogKeyData(searchTerm: string) {
  const normalizedSearchTerm = ni(searchTerm);
  const results: string[] = [];

  for (const [, data] of Object.entries(Analógico)) {
    if (
      data.sub?.some(word => ni(word) === normalizedSearchTerm) ||
      data.adj?.some(word => ni(word) === normalizedSearchTerm) ||
      data.verb?.some(word => ni(word) === normalizedSearchTerm) ||
      data.adv?.some(word => ni(word) === normalizedSearchTerm) ||
      data.phrase?.some(word => ni(word) === normalizedSearchTerm)
    ) {
      results.push(data.original);
    }
  }
  return results.length > 0 ? results : null;
}

export function getAnalogData(searchTerm: string) {
  const normalizedSearchTerm = ni(searchTerm);
  
  for (const [normOriginal, data] of Object.entries(Analógico)) {
    if (
      data.sub?.some(word => ni(word) === normalizedSearchTerm) ||
      data.adj?.some(word => ni(word) === normalizedSearchTerm) ||
      data.verb?.some(word => ni(word) === normalizedSearchTerm) ||
      data.adv?.some(word => ni(word) === normalizedSearchTerm) ||
      data.phrase?.some(word => ni(word) === normalizedSearchTerm)
    ) {
      const result = { normOriginal, ...data };
      return result;
    }
  }
  
  return null;
}