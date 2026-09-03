import { secoesDeIntroducao } from "./introducao";
import { secoesDosCatecumenos } from "./missaDosCatecumenos";
import { secoesDosFieis } from "./missaDosFieis";
import { secoesDeReferencia } from "./referencia";
import type { Guia } from "./tipos";

export const guia: Guia = {
  chamada: "Apostolado NSN - Rito Romano na forma do Missal de São Pio V",
  titulo: "A Missa Tridentina, parte por parte",
  descricao:
    "Tudo o que acontece numa Missa rezada ou cantada, em ordem cronológica: nome de cada peça, o que é dito, quem diz, o que muda conforme o dia e o que nunca muda.",
  epigrafe: "Introibo ad altare Dei.",
  lema: "Iter para tutum",
  secoes: [
    ...secoesDeIntroducao,
    ...secoesDosCatecumenos,
    ...secoesDosFieis,
    ...secoesDeReferencia,
  ],
  marca: "Apostolado NSN",
  rodape: [
    "Guia descritivo do rito romano na forma do Missal de 1962. Os textos latinos citados são do próprio Missal; as traduções para o português são de trabalho, feitas para este guia, e não substituem uma edição bilíngue aprovada.",
  ],
};
