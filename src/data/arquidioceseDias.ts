import bruto from "./arquidiocese-dias.json";
import type { Quando } from "../calendario/indulgencias";

/**
 * As festas titulares das igrejas da Arquidiocese, por data.
 *
 * É o mesmo documento de `indulgencias-arquidiocese.json`, visto por dia em
 * vez de por igreja: as 129 igrejas reunidas nas 75 datas em que se pode
 * lucrar a indulgência visitando-as. "Tem como fazer um calendário da mesma
 * forma com as paróquias, santuários e ordens da arquidiocese, pra que também
 * possa ser adicionado no calendário geral pra quem quiser", pediu o Perez.
 *
 * Gerado, como o outro, por `ferramentas/arquidiocese/gerar.py`: **não se
 * edita à mão**, senão a próxima remessa do Perez apaga o conserto.
 */
export interface DiaDaArquidiocese {
  id: string;
  /** A festa titular: "São Sebastião", "Nossa Senhora das Neves". */
  titulo: string;
  quando: Quando;
  /** A data como o documento a escreve, inclusive quando é móvel. */
  quandoPorExtenso: string;
  /** Em que seção da página ela está: paroquias, santuarios, basilica, ordens. */
  secao: string;
  /** Os nomes das igrejas, como o Anuário os traz. */
  igrejas: string[];
  /** Só nas Ordens: "Fundador da Companhia de Jesus (Jesuítas)". */
  instituicao?: string;
}

export const diasDaArquidiocese = (
  bruto as unknown as { dias: DiaDaArquidiocese[] }
).dias;
