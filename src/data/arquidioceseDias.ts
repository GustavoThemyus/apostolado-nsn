import bruto from "./arquidiocese-dias.json";
import type { Quando } from "../calendar/indulgencias";

export interface DiaDaArquidiocese {
  id: string;
  titulo: string;
  quando: Quando;
  quandoPorExtenso: string;
  secao: string;
  igrejas: string[];
  instituicao?: string;
}

export const diasDaArquidiocese = (
  bruto as unknown as { dias: DiaDaArquidiocese[] }
).dias;
