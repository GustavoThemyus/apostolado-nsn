# O endereço antigo

`apostolado-nsn.gustavothemyus.workers.dev` foi o endereço do site até outubro
de 2026. Hoje o site é `ansn.com.br`, publicado de `../wrangler.toml` na conta
da Cloudflare do Apostolado.

Este diretório é o que sobrou do endereço antigo: um Worker de nove linhas que
redireciona tudo para o novo, preservando caminho e busca.

**Ele tem de viver para sempre.** O endereço velho está impresso na página 2 do
PDF do calendário de indulgências arquidiocesano que o Perez distribui, e
circula em conversas de meses atrás. Apagar o Worker transformaria todos esses
links em erro.

```
cd redirecionador
npx wrangler@4.85.0 deploy
```

## Antes de publicar

Desligue o **Workers Builds** da conta pessoal. Enquanto ele estiver ligado a
este repositório, o próximo push reconstrói o site inteiro por cima deste
redirecionamento — e o endereço antigo volta a servir uma cópia velha, que é
pior do que servir erro, porque ninguém percebe.
