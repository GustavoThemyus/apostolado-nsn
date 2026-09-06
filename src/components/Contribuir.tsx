import { useState } from "react";

export interface Contribuicao {
  titulo: string;
  banco: { instituicao: string; agencia: string; conta: string; titular: string };
  pix: string;
}

export function Contribuir({ dados }: { dados: Contribuicao }) {
  const [copiado, definirCopiado] = useState(false);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(dados.pix);
      definirCopiado(true);
      window.setTimeout(() => definirCopiado(false), 2500);
    } catch {
      /* sem área de transferência: a chave continua visível para copiar à mão */
    }
  };

  return (
    <section className="contribuir" aria-labelledby="contribuir-titulo">
      <h2 className="contribuir__titulo" id="contribuir-titulo">
        {dados.titulo}
      </h2>
      <div className="contribuir__vias">
        <div className="contribuir__via">
          <p className="contribuir__rotulo">Dados bancários</p>
          <dl className="contribuir__dados">
            <div><dt>Banco</dt><dd>{dados.banco.instituicao}</dd></div>
            <div><dt>Agência</dt><dd>{dados.banco.agencia}</dd></div>
            <div><dt>Conta</dt><dd>{dados.banco.conta}</dd></div>
            <div><dt>Titular</dt><dd>{dados.banco.titular}</dd></div>
          </dl>
        </div>
        <div className="contribuir__via">
          <p className="contribuir__rotulo">Chave Pix</p>
          <p className="contribuir__pix">{dados.pix}</p>
          <button type="button" className="botao-agenda" onClick={copiar}>
            {copiado ? "Chave copiada" : "Copiar a chave"}
          </button>
        </div>
      </div>
    </section>
  );
}
