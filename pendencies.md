# Pendências

Itens que dependem de decisão ou material externo. Marque `[x]` ao concluir.

## Antes de publicar

- [x] **Domínio**: `site` no `astro.config.ts` é `https://kaiju-no-8-fansite.pages.dev`.
- [x] **Hospedagem**: Cloudflare Pages, projeto `kaiju-no-8-fansite` (ver "Deploy" no CLAUDE.md).
- [x] **Conectar o repositório na Cloudflare Pages** com a configuração da seção "Deploy" do
      CLAUDE.md. No ar em `https://kaiju-no-8-fansite.pages.dev`, sem sufixo, então o `site`
      ficou como estava.
- [x] Depois do primeiro deploy: conferir os headers na URL real (`curl -I`, securityheaders.com),
      o console sem erros de CSP e o PageSpeed Insights nas três rotas.
- [x] **Imagem de Open Graph**: uma por idioma em `public/og/<idioma>.jpg` (1200×630), gerada por
      `npm run generate-og-images` a partir da arte do hero e do logo do idioma.
- [x] **Favicon**: `favicon.ico`, PNGs 16/32, `apple-touch-icon.png` e ícones 192/512 do manifest,
      gerados de `src/assets/images/logo/favicon.png` por `npm run generate-favicons`.
- [x] Depois de publicar: conferir as prévias de compartilhamento (Facebook Sharing Debugger, card
      do X, WhatsApp) e o JSON-LD no Rich Results Test / validator.schema.org com a URL real.
- [x] Quando os créditos do projeto estiverem definidos, avaliar `author` (Person) no JSON-LD do
      WebSite, sempre como pessoas fãs, nunca como os detentores dos direitos. Feito: `author` com
      `byduuds.design` e `petrecaLeo`, lidos dos créditos do rodapé.
- [x] **Repositório git**: `github.com/petrecaLeo/kaiju-no-8-3rd-season-fansite` (público).
- [x] **404 por idioma fora da Cloudflare Pages.** Lá `/pt-BR/…` e `/ja/…` já recebem a 404 do
      idioma. Na Netlify só o `/404.html` (inglês) é usado; para as outras, seria preciso um
      `_redirects` com `/pt-BR/* /pt-BR/404.html 404` e `/ja/* /ja/404.html 404`. Gerar esse
      arquivo só depois de escolher o host e confirmar que ele aceita status 404 no `_redirects`.
      Decidido: não se aplica, o host é a Cloudflare Pages.
- [x] **Créditos do rodapé**: `byduuds.design` (link para o Instagram) e `petrecaLeo` (link para o
      GitHub) em `footer.credits.project`, nos três dicionários.

## Fontes

- [x] Fontes escolhidas e configuradas: Paladins (títulos), Exo 2 (corpo pt-BR/en), Noto Sans JP
      com subset (corpo ja).
- [x] **Remover a página `/test-fonts/`**: saíram a página, `components/dev/`, `lib/fonts/specimen.ts`,
      `'dev'` em `COMPONENT_GROUPS`, o filtro do sitemap e a prop `fontLocales` do `BaseHead`.
- [x] Hero: trocar `font-weight: 700` do CTA por `var(--font-weight-strong)`. (O CTA saiu do hero.)
- [x] Decidir se os títulos em japonês ficam em Paladins + Noto Sans JP (a Paladins não tem
      kana/kanji, então o texto japonês aparece em Noto, com contraste bem menor). Decidido: fica como está.

## Conteúdo e design

- [x] Paleta e tokens finais em `src/styles/tokens.css` (`--color-bg` precisa continuar igual a
      `SITE.themeColor`). Manter contraste WCAG AA. Decidido: a paleta atual é a final.
- [x] **Hero**: arte da armadura com o olho interativo, logo, "3rd Season", "em breve" e indicador
      de scroll (o logo da Crunchyroll saiu; "Onde assistir" cumpre esse papel).
- [x] Hero: decidir se o logo da Crunchyroll vira link. (O logo saiu do hero.)
- [x] Hero: a armadura (`assets/images/hero/background.png`) traz "00 10" pintado na própria arte.
      O resto do site mostra só o número ("10"); mudar a arte exige editar a imagem. Decidido: fica como está.
- [x] Hero: o pulso do olho roda sem parar. Para WCAG 2.2.2 (pausar animação que dura mais de 5 s),
      avaliar um botão de pausa; hoje ele só para fora da tela e com reduced motion vira uma variação
      lenta de opacidade. Decidido: sem botão de pausa.
- [x] **O que é**: premissa contada em etapas sobre a arte fixa (câmera com scrub, mira que trava
      no Kaiju Nº8), ficha do autor, números com rolos e linha das temporadas.
- [x] O que é: revisar os textos em en/ja com falantes nativos (premissa, ficha e legendas dos
      números) e conferir os números de sucesso numa fonte oficial antes de publicar.
- [x] O que é: `assets/images/Story/background.webp` era um JPEG de 4,5 MB com extensão `.webp`. O
      site só baixa as variantes (52–256 KB), mas o original ia para o `dist/`. Convertido para
      webp q95 (725 KB, sem diferença visível).
- [x] **A história até aqui**: relatório com spoilers até o ep. 23 da 2ª temporada, velado por um
      aviso de spoiler (portão acessível, sessionStorage), capa, dossiê do Nº9 e das Numbers,
      cronologia das ondas, 5 frentes "vs." e final com o loop do Reno.
- [x] História até aqui: o loop do Reno (~2,2 MB) roda sem parar. Com reduced motion e sem JS ele
      nem é baixado, mas para WCAG 2.2.2 falta um botão de pausa (trocar pelo quadro parado).
      Decidido: sem botão de pausa.
- [x] História até aqui: o loop do Reno como vídeo (WebM/MP4 em `<video muted loop playsinline>`)
      ficaria bem menor que o WebP animado. Exige ffmpeg completo para gerar os arquivos.
      Decidido: continua WebP animado.
- [x] História até aqui: o loop do Reno tem a marca d'água (coelho) de quem editou o GIF.
      Confirmar a origem e, se possível, creditar no rodapé. Decidido: sem crédito.
- [x] História até aqui: confirmar "fortitude 9.0" em pt-BR (a norma seria "9,0"; mantido como no
      texto original e na tela do anime). Decidido: fica "9.0".
- [x] **Personagens principais**: painel em foco + carrossel com os 7 personagens, textos em
      pt-BR (placeholders enviados) e rascunhos em en/ja.
- [x] Personagens: as descrições definitivas em pt-BR chegaram; revisar com falantes nativos as
      versões en e ja e os alts das fotos.
- [x] Personagens: formato do badge. Só o número, com dois dígitos ("04", "10", "08"), em todo o
      site, via `formatDesignation`.
- [x] **Trailer**: facade do YouTube (thumbnail + botão, iframe só no clique), pin + scrub no
      desktop, fade no mobile, sem animação com reduced motion e link para o YouTube sem JS.
- [x] Trailer: autoplay com som não funciona em Safari/iOS (e alguns mobile) após o clique; a pessoa
      toca play de novo no player. Avaliar se vale carregar a IFrame API (amplia a CSP).
      Decidido: fica como está, sem a IFrame API.
- [x] Trailer: a thumbnail vem de `i.ytimg.com` e o navegador faz esse request ao chegar perto da
      seção (expõe o IP ao Google antes do clique). Alternativa: baixar a imagem no build com
      `astro:assets` e servir local, o que também dispensa `img-src i.ytimg.com`. Decidido: fica
      como está.
- [x] **Onde assistir**: arte de fundo, texto, logo e CTA para a Crunchyroll (pt-BR, en) e para o
      site oficial (ja).
- [x] Onde assistir: a arte de fundo é a mascote da Crunchyroll (Hime), também na rota ja, onde o
      logo e o texto não citam a plataforma. Decidir se ja usa outra arte.
      Decidido: fica a mesma arte por ora.
- [x] Onde assistir: apontar o CTA ja para `https://kaiju-no8.net/streaming/`, a página do site
      oficial que lista os serviços (antes apontava para a home, que tem só um resumo).
- [x] Hero: o logo da Crunchyroll aparecia também em ja. (O logo saiu do hero.)
- [x] **Rodapé**: "fim do relatório" com linha de HUD animada (luz, linha, selo "00 08"), aviso
      legal, créditos da obra e do projeto, links de idioma e voltar ao topo.
- [x] Rodapé: revisar com falante nativo o aviso legal em en e ja (tom formal de fan site).
- [x] Revisar as traduções em inglês e japonês com falantes nativos.
- [x] **Página 404**: meme com "404" em Paladins, uma versão por idioma (`/404.html` em inglês,
      `/pt-BR/404.html`, `/ja/404.html`), sem JS e fora do sitemap.
- [x] 404: confirmar a origem do meme (`assets/images/404/meme.webp`) e, se possível, creditar.
      Decidido: sem crédito.
- [x] 404: a `theme-color` segue `SITE.themeColor` (escura), então no Android a barra do navegador
      fica escura sobre a página branca. Se incomodar, dar ao `BaseHead` uma prop de cor.
      Decidido: fica escura.

## Revisão final (último passo do projeto)

- [x] Transformar em testes automatizados (Playwright) a verificação E2E feita na configuração:
      redirect por idioma, CSP, preloader e seletor de idioma. Essa bateria serve de revisão final
      do site antes do deploy. Feito: `npm run test:e2e` (ver "Testes E2E" no CLAUDE.md), que
      também cobre a 404 por idioma e as tags de SEO.
- [x] Títulos das seções em telas estreitas: conferir nessa revisão. A Paladins é larga e quebra
      palavras longas no meio em 390 px. Personagens já usa `--font-size-xl` e quebra entre as
      palavras; as outras seções ainda usam `--font-size-2xl`. Conferido de 320 a 1920 px: só
      "Personagens principais" ainda quebrava (320–340 px e o layout largo em ~900 px), e os nomes
      das frentes em ja abaixo de 360 px. Os dois foram corrigidos (ver Personagens e A história
      até aqui no CLAUDE.md).
