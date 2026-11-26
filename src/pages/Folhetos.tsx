import { Cabecalho } from "../components/Cabecalho";
import { CartoesDeSecao } from "../components/CartoesDeSecao";
import { ListaDeFolhetos } from "../components/ListaDeFolhetos";
import { Moldura } from "../components/Moldura";
import { colecao, publicados } from "../data/folhetos";
import { NOME_DA_CATEGORIA, type CategoriaDeFolheto } from "../data/tipos";

const SEM_PAGINA: CategoriaDeFolheto[] = ["canto", "oficio"];

export default function Folhetos() {
  const lista = publicados();

  return (
    <Moldura titulo={colecao.titulo}>
      <Cabecalho titulo={colecao.titulo} descricao={colecao.descricao} />
      <CartoesDeSecao padrao="/folhetos" />
      {SEM_PAGINA.filter((cat) => lista.some((f) => f.categoria === cat)).map((cat) => (
        <section key={cat}>
          <h2 className="folhetos__genero">{NOME_DA_CATEGORIA[cat]}</h2>
          <ListaDeFolhetos categoria={cat} />
        </section>
      ))}
    </Moldura>
  );
}
