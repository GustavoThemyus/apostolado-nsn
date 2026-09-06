export interface Padroeiro {
  id: string;
  nome: string;
  /** Vazio enquanto a imagem não chega. */
  imagem: string;
}

export function Padroeiros({ padroeiros }: { padroeiros: Padroeiro[] }) {
  return (
    <section className="padroeiros" aria-labelledby="padroeiros-titulo">
      <h2 className="padroeiros__titulo" id="padroeiros-titulo">
        Os nossos padroeiros
      </h2>
      <ul className="padroeiros__lista">
        {padroeiros.map((p) => (
          <li className="padroeiro" key={p.id}>
            {p.imagem ? (
              <img className="padroeiro__imagem" src={p.imagem} alt={p.nome} loading="lazy" />
            ) : (
              <span className="padroeiro__falta" aria-hidden="true" />
            )}
            <span className="padroeiro__nome">{p.nome}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
