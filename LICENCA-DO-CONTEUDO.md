# Licença do conteúdo

O [LICENSE](LICENSE) na raiz é MIT e cobre **o código-fonte** deste
repositório: `src/`, `worker/`, `ferramentas/`, a folha de estilo e os
arquivos de configuração.

**Não cobre o conteúdo publicado nem as imagens.** Boa parte deles não é nossa
para licenciar, e uma licença que dissesse o contrário estaria concedendo um
direito que não temos. Abaixo, item por item.

## O que fica de fora do MIT

### Os textos do Apostolado

`src/data/*.json`, com exceção do que for estrutura. São escritos de Pedro
Perez Lerones Neto para o Apostolado Nossa Senhora das Neves: a apresentação,
os comentários do brasão, o calendário de indulgências arquidiocesano, as
páginas da Missa e das indulgências. Direitos reservados ao autor e ao
Apostolado. Para reusar, peça a ele.

### Enchiridion Indulgentiarum

`src/data/indulgencias-enchiridion.json`. É a transcrição da **tradução
aprovada pela CNBB** da quarta edição, de 16 de julho de 1999. O direito sobre
a tradução é de quem a fez. O arquivo está aqui para ser lido no site do
Apostolado, e não para ser redistribuído: nem o Apostolado nem o autor do
código podem sublicenciá-lo.

### O brasão

`public/brasao.png`, `public/brasao-pequeno.png`, `public/brasao-*.webp` e as
fotografias de `design_system/`. O brasão é a identidade do Apostolado, não é
código, e não está sob o MIT em circunstância nenhuma. Quem reaproveitar o
código tem de trocá-lo pelo seu.

### Os retratos

`public/retratos/`. A fotografia oficial do Papa Leão XIV e a fotografia do
Arcebispo Metropolitano da Paraíba são de terceiros, e a procedência delas não
está documentada aqui. O recorte e a vinheta feitos por
`ferramentas/retratos/gerar.py` não criam direito novo sobre elas.

### O ícone de Nossa Senhora das Neves

`public/padroeiros/neves-*.webp`. Fotografia do *Salus Populi Romani*
restaurado, enviada pelo Apostolado, de procedência não documentada.

## O que já é livre

`public/cartoes/` e as demais estampas de `public/padroeiros/` estão em
**domínio público**, da Wikimedia Commons. Domínio público foi critério na
escolha, e não acaso: obra sob licença que exige atribuição obrigaria o site a
carregar o crédito em toda página onde a imagem aparece. A lista está em
[PROVENIENCIA.md](public/cartoes/PROVENIENCIA.md) e em
[COMO-GERAR.md](public/padroeiros/COMO-GERAR.md).

`public/capas/` é composição feita aqui, no desenho do site, mas traz o brasão
dentro: vale a ressalva do brasão.

## Para quem quiser reaproveitar o código

O motor do calendário de 1962 (`src/calendario/`), o roteador escrito à mão
(`src/routes/`), os componentes, o painel de edição e as ferramentas de
importação estão sob o MIT e servem a outro site sem pedir nada a ninguém.

Para isso, três coisas têm de ser trocadas: o conteúdo de `src/data/`, as
imagens de `public/` e o brasão.
