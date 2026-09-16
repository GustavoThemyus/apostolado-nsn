import bruto from "../data/brasao.json";
import { BrasaoComentado, type ParteDoBrasao } from "../components/BrasaoComentado";
import { Cabecalho } from "../components/Cabecalho";
import { CartoesDeSecao } from "../components/CartoesDeSecao";
import { Moldura } from "../components/Moldura";
import { TextoRico } from "../components/TextoRico";

interface Brasao {
  titulo: string;
  descricao: string;
  abertura: string;
  partes: ParteDoBrasao[];
  fecho: string;
}

const brasao = bruto as Brasao;

/**
 * O brasão do Apostolado, explicado elemento por elemento.
 *
 * Os dois textos de fora — a abertura e o fecho — são fixos, como o Perez
 * pediu; os quatro de dentro abrem sob demanda, a partir do próprio brasão.
 */
export default function ApostoladoBrasao() {
  return (
    <Moldura titulo={brasao.titulo}>
      <Cabecalho titulo={brasao.titulo} descricao={brasao.descricao} />
      <article className="brasao-pagina">
        <p className="brasao-pagina__abertura">
          <TextoRico texto={brasao.abertura} />
        </p>
        <BrasaoComentado partes={brasao.partes} />
        <p className="brasao-pagina__fecho">
          <TextoRico texto={brasao.fecho} />
        </p>
        <CartoesDeSecao padrao="/apostolado/brasao" />
      </article>
    </Moldura>
  );
}
