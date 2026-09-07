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
            {/* a moldura é elemento próprio: é ela que leva o filete dourado
                e a margem de papel, e a estampa fica dentro, sem raio */}
            <span className="padroeiro__moldura">
              {p.imagem ? (
                <img
                  className="padroeiro__imagem"
                  src={p.imagem}
                  alt={p.nome}
                  width={480}
                  height={640}
                  loading="lazy"
                />
              ) : (
                <span className="padroeiro__imagem padroeiro__falta" aria-hidden="true" />
              )}
            </span>
            <span className="padroeiro__nome">{p.nome}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
