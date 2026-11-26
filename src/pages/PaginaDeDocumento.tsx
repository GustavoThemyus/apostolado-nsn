import { Fragment, useCallback, useMemo, useState } from "react";
import { Cabecalho } from "../components/Cabecalho";
import { AtalhosDaSecao, CartoesDeSecao } from "../components/CartoesDeSecao";
import { ProvedorDeNumeracao } from "../components/NumeracaoDePassos";
import { Secao } from "../components/Secao";
import { Sumario } from "../components/Sumario";
import { Vazia } from "../components/Vazia";
import type { ReactNode } from "react";
import type { Conteudo } from "../data/tipos";
import { usarRota } from "../routes/usarRota";
import { usarSecaoAtiva } from "../hooks/usarSecaoAtiva";
import { Moldura } from "../components/Moldura";
import { ProvedorDeNotas } from "../components/Notas";
import { ProvedorDeSecoes } from "../components/IndiceDoDocumento";

export function PaginaDeDocumento({
  conteudo,
  antes,
  depoisDaSecao,
  children,
}: {
  conteudo: Conteudo;
  antes?: ReactNode;
  depoisDaSecao?: (id: string) => ReactNode;
  children?: ReactNode;
}) {
  const [sumarioAberto, definirSumarioAberto] = useState(false);
  const fecharSumario = useCallback(() => definirSumarioAberto(false), []);
  const { rota } = usarRota();

  const secoesReais = useMemo(
    () => conteudo.secoes.filter((s) => s.id !== "em-preparacao"),
    [conteudo],
  );
  const identificadores = useMemo(
    () => secoesReais.map((s) => s.id),
    [secoesReais],
  );
  const secoesIndexadas = useMemo(
    () => secoesReais.filter((s) => !s.foraDoIndice),
    [secoesReais],
  );
  const secaoAtiva = usarSecaoAtiva(identificadores);

  const temSumario = secoesIndexadas.length > 3;

  const local = useMemo(
    () => secoesReais.find((s) => s.id === secaoAtiva)?.titulo,
    [secoesReais, secaoAtiva],
  );

  const corpo = useMemo(() => {
    let contador = 0;
    return secoesReais.map((secao) => {
      const numero = secao.foraDoIndice ? undefined : (contador += 1);
      return (
        <Fragment key={secao.id}>
          <Secao secao={secao} numero={numero} />
          {depoisDaSecao?.(secao.id)}
        </Fragment>
      );
    });
  }, [secoesReais, depoisDaSecao]);

  return (
    <ProvedorDeNotas notas={conteudo.notas}>
    <ProvedorDeSecoes secoes={secoesIndexadas}>
    <ProvedorDeNumeracao secoes={secoesReais}>
      <Moldura
        titulo={conteudo.titulo}
        local={temSumario ? local : undefined}
        sumario={
          temSumario
            ? {
                aberto: sumarioAberto,
                alternar: () => definirSumarioAberto((a) => !a),
              }
            : undefined
        }
        comProgresso={temSumario}
      >
        <Cabecalho
          titulo={conteudo.titulo}
          descricao={conteudo.descricao}
        />

        {conteudo.emPreparacao && (
          <Vazia o_que="Esta seção ainda está sendo preparada e vai receber acréscimos." />
        )}
        {conteudo.rascunho && <Vazia variante="rascunho" />}

        {conteudo.epigrafe && (
          <p className="epigrafe" lang="la">
            {conteudo.epigrafe}
          </p>
        )}

        {rota && <AtalhosDaSecao padrao={rota.padrao} />}

        {antes}

        <div
          className={`documento${temSumario ? " documento--com-sumario" : ""}`}
        >
          {temSumario && (
            <Sumario
              secoes={secoesIndexadas}
              secaoAtiva={secaoAtiva}
              variante="embutido"
            />
          )}

          <div className="documento__corpo">
            {corpo}

            {rota && <CartoesDeSecao padrao={rota.padrao} />}

            {children}
          </div>
        </div>

        {temSumario && (
          <Sumario
            secoes={secoesIndexadas}
            secaoAtiva={secaoAtiva}
            variante="flutuante"
            aberto={sumarioAberto}
            aoFechar={fecharSumario}
          />
        )}
      </Moldura>
    </ProvedorDeNumeracao>
    </ProvedorDeSecoes>
    </ProvedorDeNotas>
  );
}
