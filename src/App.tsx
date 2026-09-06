import { useCallback, useMemo, useState } from "react";
import { BarraSuperior } from "./components/BarraSuperior";
import { Cabecalho } from "./components/Cabecalho";
import { DiaDeHoje } from "./components/DiaDeHoje";
import { Rodape } from "./components/Rodape";
import { Secao } from "./components/Secao";
import { SeletorDeTema } from "./components/SeletorDeTema";
import { Sumario } from "./components/Sumario";
import { guia } from "./data/guia";
import { usarProgressoDeLeitura } from "./hooks/usarProgressoDeLeitura";
import { usarSecaoAtiva } from "./hooks/usarSecaoAtiva";
import { usarTema } from "./hooks/usarTema";

export default function App() {
  const [sumarioAberto, definirSumarioAberto] = useState(false);
  const { tema, alternar } = usarTema();
  const progresso = usarProgressoDeLeitura();

  const identificadores = useMemo(() => guia.secoes.map((secao) => secao.id), []);
  const secaoAtiva = usarSecaoAtiva(identificadores);

  const fecharSumario = useCallback(() => definirSumarioAberto(false), []);

  const tituloDaSecaoAtiva =
    guia.secoes.find((secao) => secao.id === secaoAtiva)?.titulo ?? guia.titulo;

  return (
    <>
      <a className="pular-para-conteudo" href="#conteudo">
        Pular para o conteúdo
      </a>

      <BarraSuperior marca={guia.marcaCurta} local={tituloDaSecaoAtiva} progresso={progresso}>
        <SeletorDeTema tema={tema} aoAlternar={alternar} />
        <button
          type="button"
          className="barra__botao"
          onClick={() => definirSumarioAberto((aberto) => !aberto)}
          aria-expanded={sumarioAberto}
          aria-haspopup="dialog"
        >
          Sumário
        </button>
      </BarraSuperior>

      <main className="moldura conteudo" id="conteudo">
        <Cabecalho
          chamada={guia.chamada}
          titulo={guia.titulo}
          descricao={guia.descricao}
          epigrafe={guia.epigrafe}
        />

        <DiaDeHoje />

        <Sumario secoes={guia.secoes} secaoAtiva={secaoAtiva} variante="embutido" />

        {guia.secoes.map((secao) => (
          <Secao secao={secao} key={secao.id} />
        ))}

        <Rodape paragrafos={guia.rodape} marca={guia.marca} lema={guia.lema} />
      </main>

      <Sumario
        secoes={guia.secoes}
        secaoAtiva={secaoAtiva}
        variante="flutuante"
        aberto={sumarioAberto}
        aoFechar={fecharSumario}
      />
    </>
  );
}
