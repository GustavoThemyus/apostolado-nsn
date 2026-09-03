import type { ItemDeLegenda } from "../data/tipos";
import { TextoRico } from "./TextoRico";

export function Legenda({ itens }: { itens: ItemDeLegenda[] }) {
  return (
    <dl className="legenda">
      {itens.map((item) => (
        <div className="legenda__item" key={item.chave}>
          <dt className={`legenda__chave legenda__chave--${item.etiqueta}`}>{item.chave}</dt>
          <dd className="legenda__texto">
            <TextoRico texto={item.texto} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
