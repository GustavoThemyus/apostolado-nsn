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

1200x630 é a medida que o WhatsApp e o Open Graph esperam. **O nome do arquivo
não muda**, então quem já compartilhou o link continua vendo a imagem antiga
até o cache dele expirar; o `_headers` guarda a prévia por uma semana.
