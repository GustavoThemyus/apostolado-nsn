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
