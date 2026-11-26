import { useEffect, useRef, useState } from "react";

export interface Contribuicao {
  titulo: string;
  banco: { instituicao: string; agencia: string; conta: string; titular: string };
  pix: string;
}

const DURACAO = 3000;

export function Contribuir({ dados }: { dados: Contribuicao }) {
  const [copiado, definirCopiado] = useState(false);
  const relogio = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(relogio.current), []);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(dados.pix);
      definirCopiado(true);
      window.clearTimeout(relogio.current);
      relogio.current = window.setTimeout(() => definirCopiado(false), DURACAO);
    } catch {
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
          <button
            type="button"
            className={`botao-agenda botao-copiar${copiado ? " botao-copiar--feito" : ""}`}
            onClick={copiar}
          >
            {copiado ? "Chave copiada" : "Copiar a chave"}
            {copiado && <Visto />}
          </button>
          <p className="apenas-leitores" role="status">
            {copiado ? "Chave Pix copiada." : ""}
          </p>
        </div>
      </div>
    </section>
  );
}

function Visto() {
  return (
    <svg className="visto" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle className="visto__roda" cx="12" cy="12" r="10" />
      <path className="visto__risco" d="M7 12.4l3.3 3.3L17 9" />
    </svg>
  );
}
