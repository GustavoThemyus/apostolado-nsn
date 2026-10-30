# Ferramentas

## previa.html

Gera `public/previa.png`, a imagem que o WhatsApp e o Google mostram ao
compartilhar o link. Fica fora de `public/` de propósito: é ferramenta, não
página do site, e publicada viraria uma URL alcançável.

Para regerar depois de mudar o texto:

    cp ferramentas/previa.html public/_previa.html
    npm run build
    npx vite preview --port 4173 &
    google-chrome --headless --window-size=1200,630 \
      --screenshot=public/previa.png http://localhost:4173/_previa.html
    rm public/_previa.html dist/_previa.html

1200x630 é a medida que o WhatsApp e o Open Graph esperam.

**Depois de gerar, renomeie com a impressão do conteúdo** e aponte o
`og:image` do `index.html` para o nome novo:

    cd public && cp previa.png previa-$(sha256sum previa.png | cut -c1-8).png

Sem isso o WhatsApp continua servindo a prévia velha por semanas, porque ele
guarda por URL. `previa.png` fica no lugar, com o conteúdo novo, para as
prévias já em cache que apontam para lá não ficarem sem imagem.

## COMO-GERAR.md e PROVENIENCIA.md

Cada pasta de estampas tem a sua: `capas/`, `cartoes/`, `folhetos/`,
`padroeiros/` e `retratos/`, ao lado do `gerar.py` que as produz. Dizem de
onde veio cada figura, sob que licença, e com que comando se faz outra.

Moraram em `public/`, junto dos `.webp` que descrevem, e é por isso que
saíram: tudo que está em `public/` é copiado para `dist/` e servido. A nota
de procedência das figuras ficava pública em
`ansn.com.br/folhetos/PROVENIENCIA.md`, e nenhuma página do site a pede. Vale
aqui o mesmo motivo do `previa.html`.

## arquidiocese/ e proprios/

As duas pastas que produzem **dados**, e não figuras — cada uma com o seu
`LEIA-ME.md`:

- `arquidiocese/` transcreve o calendário de indulgências da Arquidiocese que
  o Perez mandou e grava dois arquivos: o documento da página e as 75 datas
  que a grade do mês calcula.
- `proprios/` lê os PDFs dos próprios da Missa que o Ordo anexa a cada dia e
  os grava como folhetos, com a conferência que garante que nenhuma palavra
  se perdeu no caminho.

Em ambas vale a mesma regra das estampas, e com mais força: **não edite os
JSON gerados à mão**, nem pelo painel. Corrija a transcrição e rode de novo.
