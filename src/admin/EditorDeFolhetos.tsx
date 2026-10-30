import { useState } from "react";
import { NOME_DA_CATEGORIA } from "../data/tipos";
import type { CategoriaDeFolheto, ColecaoDeFolhetos, Folheto } from "../data/tipos";
import { Botao, Campo, Linha, Texto } from "./Campos";
import { ListaDeBlocos } from "./EditorDeDocumento";
import { mover } from "./mover";
import type { NomeDeTipo } from "./tiposDeBloco";

/**
 * Os folhetos: os impressos do Apostolado servidos como página.
 *
 * O corpo usa a mesma lista de blocos das páginas de texto, menos dois. O que
 * a folha tem e as páginas não é o bloco bilíngue, que se edita em par no
 * `EditorDeBloco`, e é dele que um próprio da Missa é feito quase inteiro.
 *
 * As condições ordinárias não são de folheto nenhum: são do gênero, moram uma
 * vez na raiz da coleção, e por isso se editam a partir da lista, e não de
 * dentro de uma folha.
 */
const CATEGORIAS: CategoriaDeFolheto[] = ["indulgencia", "proprio", "canto", "oficio"];

/**
 * O índice e o passo não cabem numa folha.
 *
 * Os dois leem de cima — o índice as seções do documento, o passo a numeração
 * das peças da Missa —, e a página do folheto não traz nem uma nem outra. Na
 * folha publicada sairiam vazios.
 */
const FORA_DA_FOLHA: NomeDeTipo[] = ["indice", "passo"];

/** Id de mentira, para a lista abrir as condições pelo mesmo caminho. */
const CONDICOES = "\u0000condicoes";

/** Endereço da folha: sem acento, sem espaço, estável depois de publicada. */
const comoEndereco = (titulo: string) =>
  titulo
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);

/**
 * A medida da estampa, ou nenhuma.
 *
 * Campo vazio tem de sumir, e não gravar zero: com `largura: 0` o navegador
 * calcularia a proporção com ela e a folha sairia achatada. `undefined` o
 * `JSON.stringify` deixa de fora, que é o que se quer.
 */
const emNumero = (v: string): number | undefined => {
  const n = Number(v.replace(/[^0-9]/g, ""));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function EditorDeFolhetos({
  conteudo,
  aoMudar,
}: {
  conteudo: ColecaoDeFolhetos;
  aoMudar: (c: ColecaoDeFolhetos) => void;
}) {
  const [aberto, definirAberto] = useState<string | null>(null);
  const folheto = conteudo.folhetos.find((f) => f.id === aberto) ?? null;

  const trocar = (folhetos: Folheto[]) => aoMudar({ ...conteudo, folhetos });

  if (aberto === CONDICOES) {
    return (
      <EditorDasCondicoes
        condicoes={conteudo.condicoes}
        aoMudar={(condicoes) => aoMudar({ ...conteudo, condicoes })}
        aoVoltar={() => definirAberto(null)}
      />
    );
  }

  if (folheto) {
    return (
      <EditorDeFolheto
        folheto={folheto}
        aoMudar={(novo) =>
          trocar(conteudo.folhetos.map((f) => (f.id === folheto.id ? novo : f)))
        }
        aoVoltar={() => definirAberto(null)}
        aoRemover={() => {
          trocar(conteudo.folhetos.filter((f) => f.id !== folheto.id));
          definirAberto(null);
        }}
      />
    );
  }

  return (
    <>
      <h2 className="admin__h2">Folhetos</h2>
      <p className="admin__ajuda">
        Esta ordem é a da página: folha não tem data, tem assunto. Dentro das
        obras indulgenciadas ela é a do calendário, de 1.º de janeiro a 31 de
        dezembro, que é a ordem em que o fiel vai precisar delas.
      </p>
      <ol className="admin__secoes">
        {conteudo.folhetos.map((f, i) => (
          <li key={f.id}>
            <button type="button" className="admin__secao" onClick={() => definirAberto(f.id)}>
              <span className="admin__secao-num">{SIGLA[f.categoria]}</span>
              <span className="admin__secao-nome">
                {f.titulo}
                {f.rascunho && <span className="escolha__falta">rascunho</span>}
                {f.publicado === false && <span className="escolha__falta">escondido</span>}
              </span>
              <span className="admin__secao-conta">
                {f.blocos.length} {f.blocos.length === 1 ? "bloco" : "blocos"}
              </span>
            </button>
            <div className="admin__secao-acoes">
              <Botao aoClicar={() => trocar(mover(conteudo.folhetos, i, -1))} titulo="Subir">↑</Botao>
              <Botao aoClicar={() => trocar(mover(conteudo.folhetos, i, 1))} titulo="Descer">↓</Botao>
            </div>
          </li>
        ))}
      </ol>

      <Botao
        variante="forte"
        aoClicar={() => {
          const id = `folheto-${Date.now().toString(36)}`;
          trocar([
            ...conteudo.folhetos,
            {
              id,
              chapeu: "Obra indulgenciada",
              titulo: "Novo folheto",
              resumo: "",
              categoria: "indulgencia",
              condicoes: true,
              rascunho: true,
              publicado: false,
              blocos: [],
            },
          ]);
          definirAberto(id);
        }}
      >
        + novo folheto
      </Botao>

      <h2 className="admin__h2">As condições ordinárias</h2>
      <p className="admin__ajuda">
        Fecham toda folha de obra indulgenciada, e estão escritas uma vez só.
        O impresso as repete em cada folha porque papel não tem como fazer
        diferente; aqui, corrigir uma vírgula corrige as sete de uma vez.
      </p>
      <Botao aoClicar={() => definirAberto(CONDICOES)}>editar as condições ordinárias</Botao>
    </>
  );
}

/** Três letras na coluna do número, para dizer o gênero sem ocupar a linha. */
const SIGLA: Record<CategoriaDeFolheto, string> = {
  indulgencia: "IND",
  proprio: "MIS",
  canto: "CAN",
  oficio: "OFC",
};

function EditorDasCondicoes({
  condicoes,
  aoMudar,
  aoVoltar,
}: {
  condicoes: ColecaoDeFolhetos["condicoes"];
  aoMudar: (c: ColecaoDeFolhetos["condicoes"]) => void;
  aoVoltar: () => void;
}) {
  return (
    <>
      <button type="button" className="admin__voltar admin__voltar--corpo" onClick={aoVoltar}>
        ← todos os folhetos
      </button>

      <p className="admin__ajuda admin__ajuda--atencao">
        Isto não é de um folheto: é o fecho de todas as obras indulgenciadas de
        uma vez. Esvaziá-lo deixaria cada folha prometendo uma plenária sem
        dizer o que ela exige, e é por isso que o site recusa gravação que o
        perca.
      </p>

      <Campo rotulo="Título">
        <Linha valor={condicoes.titulo} aoMudar={(titulo) => aoMudar({ ...condicoes, titulo })} />
      </Campo>

      <h2 className="admin__h2">Blocos</h2>
      <ListaDeBlocos
        blocos={condicoes.blocos}
        excluir={FORA_DA_FOLHA}
        aoMudar={(blocos) => aoMudar({ ...condicoes, blocos })}
      />
    </>
  );
}

function EditorDeFolheto({
  folheto,
  aoMudar,
  aoVoltar,
  aoRemover,
}: {
  folheto: Folheto;
  aoMudar: (f: Folheto) => void;
  aoVoltar: () => void;
  aoRemover: () => void;
}) {
  const troca = (parte: Partial<Folheto>) => aoMudar({ ...folheto, ...parte });
  const novo = folheto.blocos.length === 0 && folheto.publicado === false;

  return (
    <>
      <button type="button" className="admin__voltar admin__voltar--corpo" onClick={aoVoltar}>
        ← todos os folhetos
      </button>

      {folheto.categoria === "proprio" && (
        <p className="admin__ajuda admin__ajuda--atencao">
          Este próprio não foi digitado: sai do PDF que o Ordo anexa ao dia,
          pela ferramenta que mora em ferramentas/proprios. Pode mexer à
          vontade na ordem e nos títulos — mas saiba que uma remessa nova de
          PDFs apaga o que estiver mudado aqui, sem avisar. Gralha de texto,
          então, é melhor corrigir no PDF ou na lista de erratas do gerador:
          lá vale para sempre.
        </p>
      )}

      <Campo rotulo="Chapéu" dica="A linha acima do título: “Obra indulgenciada”, “Próprio da Missa”.">
        <Linha valor={folheto.chapeu ?? ""} aoMudar={(chapeu) => troca({ chapeu })} />
      </Campo>

      <Campo rotulo="Título">
        <Linha valor={folheto.titulo} aoMudar={(titulo) => troca({ titulo })} />
      </Campo>

      <Campo
        rotulo="Endereço"
        dica={
          novo
            ? "Vai na URL. Depois de publicado, mudar isto quebra os links já compartilhados."
            : "ATENÇÃO: esta folha já tem endereço. Mudá-lo quebra os links já compartilhados, e os do calendário, que aponta para os próprios."
        }
      >
        <Linha valor={folheto.id} aoMudar={(id) => troca({ id })} />
      </Campo>
      {novo && folheto.id.startsWith("folheto-") && folheto.titulo !== "Novo folheto" && (
        <Botao aoClicar={() => troca({ id: comoEndereco(folheto.titulo) })}>
          usar “{comoEndereco(folheto.titulo)}”
        </Botao>
      )}

      <Campo rotulo="Resumo" dica="Uma ou duas linhas. Aparece no cartão da lista e na prévia ao compartilhar.">
        <Texto valor={folheto.resumo} linhas={2} aoMudar={(resumo) => troca({ resumo })} />
      </Campo>

      <Campo rotulo="Gênero" dica="Agrupa a folha na lista, e decide se ela pede obra e concessão.">
        <select
          className="campo__linha"
          value={folheto.categoria}
          onChange={(e) => troca({ categoria: e.target.value as CategoriaDeFolheto })}
        >
          {CATEGORIAS.map((c) => (
            <option key={c} value={c}>
              {NOME_DA_CATEGORIA[c]}
            </option>
          ))}
        </select>
      </Campo>

      {folheto.categoria === "indulgencia" && (
        <>
          <h2 className="admin__h2">A indulgência</h2>
          <p className="admin__ajuda">
            Na ordem do impresso: o que se tem de fazer, quem concedeu, e então
            a oração.
          </p>
          <Campo
            rotulo="Obra"
            dica="O que se tem de fazer para lucrar a indulgência. Sai no alto da folha, no registro da rubrica."
          >
            <Texto valor={folheto.obra ?? ""} linhas={3} aoMudar={(obra) => troca({ obra })} />
          </Campo>
          <Campo
            rotulo="Concessão"
            dica="De onde ela vem: “Concessão nº 26 do Enchiridion Indulgentiarum”. Sem isto a folha afirmaria a indulgência sem dizer quem a concedeu."
          >
            <Linha valor={folheto.concessao ?? ""} aoMudar={(concessao) => troca({ concessao })} />
          </Campo>
          <label className="campo campo--inline">
            <input
              type="checkbox"
              checked={Boolean(folheto.condicoes)}
              onChange={(e) => troca({ condicoes: e.target.checked })}
            />
            <span>Fecha com as condições ordinárias da plenária</span>
          </label>
        </>
      )}

      <h2 className="admin__h2">O impresso</h2>
      <Campo
        rotulo="Arquivo no Drive"
        dica="O endereço inteiro, como o Drive o dá, para quem quiser baixar e imprimir. Sem ele a folha continua inteira: o que esta página serve é o texto."
      >
        <Linha valor={folheto.arquivo ?? ""} aoMudar={(arquivo) => troca({ arquivo })} />
      </Campo>
      <Campo
        rotulo="Estampa"
        dica="Caminho de um arquivo em /public/folhetos, como /folhetos/cristo-rei-8d2a1f04.webp. Sai de ferramentas/folhetos."
      >
        <Linha valor={folheto.imagem ?? ""} aoMudar={(imagem) => troca({ imagem })} />
      </Campo>
      <div className="dupla">
        <Campo rotulo="Largura da estampa" dica="Em pixels, como ela está no arquivo.">
          <Linha
            valor={folheto.largura ? String(folheto.largura) : ""}
            aoMudar={(v) => troca({ largura: emNumero(v) })}
          />
        </Campo>
        <Campo rotulo="Altura da estampa" dica="Sem as duas medidas o texto salta quando a figura carrega.">
          <Linha
            valor={folheto.altura ? String(folheto.altura) : ""}
            aoMudar={(v) => troca({ altura: emNumero(v) })}
          />
        </Campo>
      </div>

      <label className="campo campo--inline">
        <input
          type="checkbox"
          checked={folheto.publicado !== false}
          onChange={(e) => troca({ publicado: e.target.checked })}
        />
        <span>Publicado (desmarcado, some do site inteiro)</span>
      </label>
      <label className="campo campo--inline">
        <input
          type="checkbox"
          checked={Boolean(folheto.rascunho)}
          onChange={(e) => troca({ rascunho: e.target.checked })}
        />
        <span>Texto provisório (mostra o aviso de rascunho)</span>
      </label>

      <h2 className="admin__h2">A folha</h2>
      <ListaDeBlocos
        blocos={folheto.blocos}
        excluir={FORA_DA_FOLHA}
        aoMudar={(blocos) => troca({ blocos })}
      />

      <div className="admin__perigo">
        <Botao aoClicar={aoRemover} variante="risco">
          Remover este folheto
        </Botao>
      </div>
    </>
  );
}
