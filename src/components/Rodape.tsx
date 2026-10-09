import { Estrela } from "./Estrela";
import { TextoRico } from "./TextoRico";

export function Rodape({
  paragrafos,
  marca,
  lema,
  credito,
}: {
  paragrafos: string[];
  marca: string;
  lema: string;
  credito?: string;
}) {
  return (
    <footer className="rodape">
      <p className="filete" aria-hidden="true">
        <Estrela />
      </p>
      {paragrafos.map((paragrafo, indice) => (
        <p key={indice}>
          <TextoRico texto={paragrafo} />
        </p>
      ))}
      {/*
        O selo que fecha a página, em silhueta, como a marca do impressor no
        fim de um livro. É o único lugar do site onde o brasão aparece em uma
        cor só: aqui ele assina, não identifica, e a versão colorida já está
        no alto de toda página.

        Decorativo de verdade, então vai como fundo e fica fora da árvore de
        acessibilidade: quem usa leitor de tela já ouviu o brasão no
        cabeçalho, e ouvi-lo de novo no rodapé seria repetição. Fundo também
        é o que faz o navegador baixar só a versão do tema em uso.
      */}
      <span className="rodape__selo" aria-hidden="true" />
      <p className="rodape__marca">
        {marca}
        <span className="rodape__lema" lang="la">
          {lema}
        </span>
      </p>
      {credito && (
        <p className="rodape__credito">
          <TextoRico texto={credito} />
        </p>
      )}
    </footer>
  );
}
