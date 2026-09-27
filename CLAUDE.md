# Kaiju No. 8 — teaser de fã da 3ª temporada

Site estático (sem backend, sem requests, sem CMS) em pt-BR, en e ja. Nesta etapa só existe a base:
estrutura, configuração e placeholders das seções. O conteúdo visual ainda não foi criado.

## Como rodar

```bash
nvm use        # Node 24.21.0 (via .nvmrc, a mesma do build na Cloudflare). Astro 7 não roda em Node 20
npm install
npm run dev    # http://localhost:4321 — "/" redireciona para /pt-BR/, /en/ ou /ja/
```

| Script                                | O que faz                                                          |
| ------------------------------------- | ------------------------------------------------------------------ |
| `npm run dev`                         | servidor de desenvolvimento                                        |
| `npx astro dev --background`          | mesmo servidor em background (`astro dev status`, `logs`, `stop`)  |
| `npm run build`                       | `astro check` + build estático em `dist/` (inclui `dist/_headers`) |
| `npm run preview`                     | serve o `dist/` (não aplica o `_headers`)                          |
| `npm run validate`                    | Prettier (check) + ESLint + `astro check`. Rode antes de concluir  |
| `npm run test:e2e`                    | build + testes E2E (Playwright), ver "Testes E2E"                  |
| `npm run lint:fix` / `npm run format` | correções automáticas                                              |
| `npm run subset-fonts`                | gera o subset do Noto Sans JP (ver "Subset da fonte japonesa")     |
| `npm run generate-favicons`           | gera favicons e ícones do manifest em `public/` (ver "Favicons")   |
| `npm run generate-og-images`          | gera as imagens de compartilhamento em `public/og/`                |

Se o console do dev mostrar `504 (Outdated Optimize Dep)`, o Vite re-otimizou dependências com o
servidor rodando: pare o servidor, apague `node_modules/.vite` e suba de novo. Dependências novas que
a página importa no navegador devem entrar em `vite.optimizeDeps.include` no `astro.config.ts`.

## Stack

- Astro 7 (`output: 'static'`), TypeScript 6 com `astro/tsconfigs/strictest`.
- CSS puro com custom properties e cascade layers. Sem Tailwind, sem framework de UI.
- GSAP 3 + ScrollTrigger, @astrojs/sitemap, Fontaine (fallback de fonte com métricas ajustadas).
- ESLint 10 (typescript-eslint, eslint-plugin-astro, jsx-a11y-x, @eslint/css, check-file) + Prettier 3.
- Interatividade em TS vanilla, carregada por `<script src="./X.client.ts"></script>`.

## Estrutura

```text
src/
  middleware.ts   só no dev: serve a 404 do idioma, como o host
  pages/          index.astro (redirect de idioma) · [locale]/index.astro · 404.astro · [locale]/404.astro
                  robots.txt.ts · site.webmanifest.ts
  layouts/        BaseLayout/ (html, head, preloader, skip link, header, <main>, slot "footer")
                  NotFoundLayout/ (documento da 404: sem preloader, cabeçalho nem JS)
  components/
    head/         BaseHead · SeoHead (title, description, canonical, hreflang, OG, JSON-LD) · JsonLd
                  SiteIcons (favicons, manifest, theme-color) · FontPreloads · ImagePreloads · LocaleRedirect
    layout/       SkipLink · SiteHeader · LanguageSwitcher · LanguageLabel · LanguageFallback
    sections/     Hero · Synopsis · Recap · Characters · Trailer · WhereToWatch · SiteFooter
    hero/         HeroArtwork (armadura) · HeroEye (olho interativo) · HeroLockup (logo e textos)
                  HeroScrollCue (indicador de scroll)
    synopsis/     StoryStage (arte fixa e mira) · StoryBeats (premissa) · OriginFile (ficha)
                  StatBoard (números) · AnimeSeasons (linha das temporadas)
    characters/   CharacterSpotlight (painel em foco) · CharacterRoster (carrossel) · CharacterCard
    recap/        RecapGate (aviso de spoiler) · RecapCover · RecapDossier · RecapWaves · RecapFronts
                  RecapFront (card "vs.") · RecapFinale
    footer/       FooterSignoff (linha de HUD, "fim do relatório", voltar ao topo) · FooterCredits
                  FooterLanguages (links de idioma)
    ui/           Button (design system de botões) · Preloader · CriticalImage
                  YouTubeFacade (player do trailer) · SuitNumber (badge "08" de kaiju e trajes)
                  Readout (leitor numérico em <dl>)
  i18n/           config.ts · dictionaries/{pt-BR,en,ja}.json · dictionary.ts · routing.ts · locale-redirect.ts
                  locale-choice.ts (grava a escolha manual de idioma; usado no cabeçalho e no rodapé)
  seo/            metadata.ts · structured-data.ts (JSON-LD) · web-manifest.ts · robots.ts
  lib/            motion/ (GSAP, core-pulse, pointer-follow, odometer)
                  recap/ (dados, arte do final, portão de spoiler, animações de scroll)
                  suits/ (formatDesignation: código de dois dígitos; rótulo dos trajes)
                  synopsis/ (conteúdo, arte, câmera, etapas e mira, números)
                  images/ (hero-images, where-to-watch-images, preload, locale-flags, loader-mark)
                  characters/ (dados dos personagens, DOM e transição do painel em foco)
                  page/ (reveal, first-view: o que o preloader espera, focus)
                  video/youtube.ts (URLs de embed, watch e thumbnail)
                  dom/images.ts · storage/ (local-storage, session-storage) · fonts/
                  not-found/ (idiomas, textos e arte da 404)
  config/         site.ts (URL, cor do tema, OG) · site-icons.ts (favicons e ícones do manifest) · fonts.ts
                  anchors.ts (ids das seções) · youtube.ts (id do trailer, origens)
  styles/         global.css → reset · tokens · button-tokens · fonts · base · odometer · utilities
  assets/images/  imagens processadas pelo Astro (flags/: bandeiras SVG; characters/: fotos 4:5)
  assets/icons/   ícones SVG, importados como componente
  assets/fonts/   fontes processadas pelo Astro (noto-sans-jp/ é gerada por `subset-fonts`)
public/           gerados por script: og/ (imagens de compartilhamento) · favicon.ico · favicon-*.png
                  apple-touch-icon.png · icon-192.png · icon-512.png
tooling/          integrations/ (security-headers, font-files, not-found-pages)
                  eslint/ (conventions, local-plugin)
scripts/          subset-fonts.ts · generate-favicons.ts · generate-og-images.ts
                  fonts-source/ (fontes completas, fora do git)
tests/            e2e/ (specs do Playwright) · support/ (servidor que imita a Cloudflare Pages,
                  setup global, fixture com a rede isolada, helpers)
```

## Convenções de código

- Uma pasta por componente; todo arquivo leva o nome da pasta (o ESLint confere):

  | Arquivo       | Conteúdo                                                          |
  | ------------- | ----------------------------------------------------------------- |
  | `X.astro`     | só estrutura + imports; `interface Props` simples pode ficar aqui |
  | `X.css`       | estilos, importados no frontmatter com `import './X.css'`         |
  | `X.client.ts` | lógica do navegador                                               |
  | `X.types.ts`  | tipos complexos                                                   |

- Lógica de build (rotas, SEO, dados) mora em módulos de domínio (`src/i18n`, `src/seo`, `src/lib`).
- Proibido em `.astro` (erro de lint): `<style>`, atributo `style`, `define:vars`, `is:inline`,
  `<script>` sem `src` e `set:html` (exceções: `LocaleRedirect.astro` e o `set:html` do
  `JsonLd.astro`); texto literal no
  template ou em `alt`, `title`, `placeholder` e `aria-*`; e lógica no frontmatter (`function`,
  arrow atribuída a variável, `if`, `switch`, `try`, laços). `.map()` no template é permitido.
  Variável que guarda componente (`const Flag = LOCALE_FLAGS[locale]`) pode ser PascalCase em
  `.astro`, porque o Astro só renderiza como componente um nome com maiúscula.
- Código em inglês. Pastas e arquivos de componente em PascalCase; demais pastas e arquivos em
  kebab-case. Variáveis em camelCase, constantes em UPPER_CASE, tipos em PascalCase. Uma pasta de
  grupo nova em `src/components/` precisa entrar em `COMPONENT_GROUPS`
  (`tooling/eslint/conventions.js`), senão o lint a rejeita.
- Texto visível só nos dicionários JSON. O tipo `Dictionary` vem do pt-BR, então uma chave ausente
  em `en` ou `ja` é erro de tipo. Nomes nativos dos idiomas ficam em `LOCALE_METADATA`.
- Textos sem travessão (— ou –, inclusive o `——` japonês): use vírgula, dois-pontos, ponto ou 「、」.
  Os textos passaram pela skill humanizer; ao escrever novos, evite contraste encenado ("não é X,
  é Y") e frases de efeito soltas. O sentido do aviso legal do rodapé não muda.
- Sem comentários, exceto para explicar decisão não óbvia. Máximo de 200 linhas por arquivo,
  inclusive CSS (regra local `local/max-css-lines`).
- Imports com alias `@/` (= `src/`) e sem extensão `.ts`. Arquivos que o `astro.config.ts` importa
  (`src/config/*`, `src/i18n/config.ts`) usam apenas imports relativos.
- IDs de seção vêm de `ANCHORS` (`src/config/anchors.ts`).

## CSS

- Ordem das layers: `@layer reset, tokens, base, components, utilities;`. Todo CSS de componente e
  de layout começa com essa linha (regra `local/css-layer-order`). O Astro não garante a ordem dos
  chunks de CSS, e a primeira declaração que o navegador lê fixa a prioridade das layers.
- Regras de componente ficam dentro de `@layer components { }`, com classes BEM (`.hero__cta`,
  `.character-card--unknown`). O CSS não é escopado.
- Valores sempre via tokens de `src/styles/tokens.css`; cores em hex ou `rgb()`/`oklch()` etc. só
  são aceitas nesse arquivo. Use propriedades e unidades lógicas (`inline-size`, `svb`, `vi`); o
  lint exige recursos Baseline 2024.
- `--color-bg` e `SITE.themeColor` precisam ter o mesmo valor. O `theme-color`, o manifest e o
  fundo dos ícones opacos usam `SITE.themeColor` (ver "Favicons e imagem de compartilhamento").
- Scrollbar (`base.css`): fina (`scrollbar-width: thin`), polegar ciano (`--color-scrollbar-thumb`,
  o `--color-kaiju-cyan`) sobre trilha cinza escura (`--color-scrollbar-track`), cerca de 10:1 entre
  os dois. O Chrome ignora `::-webkit-scrollbar` quando `scrollbar-color` existe, então o fallback
  (10 px, cantos retos) fica em `@supports not (scrollbar-color: auto)`.

## Botões

Todo botão e CTA do site é o `ui/Button` (tokens em `src/styles/button-tokens.css`). Com `href` ele
renderiza `<a>`; sem `href`, `<button type="button">`. Aceita qualquer atributo (`aria-*`, `data-*`,
`disabled`) e `class` para o layout do consumidor.

| Variante    | Visual                                        | Quando usar                                  |
| ----------- | --------------------------------------------- | -------------------------------------------- |
| `primary`   | ciano, texto escuro, canto cortado (Numbers)  | a ação principal do bloco (uma por bloco)    |
| `secondary` | fundo translúcido, borda cinza que vira ciano | ação de apoio ou navegação                   |
| `ghost`     | sem fundo nem borda, texto suave              | a saída de menor peso ao lado de uma primary |

- Onde cada uma está: primary em onde assistir, revelar relatório, play do trailer e voltar da
  404; secondary em voltar ao topo e nas setas do carrossel; ghost em pular o spoiler.
- Tamanhos (altura mínima): `sm` 44 px, `md` 48 px (padrão), `lg` 56 px. Nenhum fica abaixo de
  44×44 px. `iconOnly` deixa o botão quadrado; o nome acessível vem de `aria-label`.
- Estados: hover só com `(hover: hover)` (no toque ele ficaria preso), `active` escurece,
  `focus-visible` com anel amarelo de 3 px afastado 3 px, `disabled`/`aria-disabled="true"` com
  opacidade 0,4. Nenhum estado usa `transform` (evita salto de subpixel) nem sublinhado.
- Ícones: slots `icon-start`/`icon-end` (o `svg` recebe `--button-icon-size`). `newTabLabel` abre em
  nova aba (`target`, `rel`), acrescenta o aviso em `.visually-hidden` e o ícone externo. O rótulo
  fica num `.button__label` separado: por ser um flex item à parte, o nome acessível ganha o espaço
  antes do aviso ("Assistir na Crunchyroll (abre em nova aba)").
- Os seletores do `Button.css` ficam dentro de `:where()`, então a classe do consumidor (posição,
  grid area, `display: none`) ganha independentemente da ordem dos chunks. Um escopo muda o visual
  sobrescrevendo tokens: a 404 (fundo branco) põe borda preta, anel de foco preto e tira o corte.
- O corte é um gradiente em `background-image` (um `clip-path` cortaria o anel de foco) com
  `background-origin: border-box` e `no-repeat`. Na caixa de padding (o padrão), o gradiente se
  repete na borda transparente e desenha filetes retos nas bordas direita e de baixo.
- Fora do design system: os cards de personagem (seleção com foto, não botão de ação), o
  `<summary>` do seletor de idioma (precisa ser `<summary>` para funcionar sem JS), o skip link, os
  links de texto do rodapé e o indicador de scroll do hero.

## Internacionalização

- `src/pages/[locale]/index.astro` gera `/pt-BR/`, `/en/` e `/ja/` (i18n nativo com
  `prefixDefaultLocale: true`). URLs diferenciam maiúsculas: sempre `/pt-BR/`. Por isso os helpers
  de `astro:i18n` usam `normalizeLocale: false`; sem isso eles geram `/pt-br/`, que dá 404.
- A raiz `/` roda um script inline bloqueante logo após o `<meta charset>`: idioma salvo no
  `localStorage` (`kaiju8-teaser:locale`), depois `navigator.languages` (primeiro o código exato,
  depois o idioma base), depois `pt-BR`. Redireciona com `location.replace`, mantendo query e hash.
  A página também traz links para os três idiomas (`LanguageFallback`). O script marca
  `html[data-redirecting]` para escondê-los enquanto redireciona; se ele falhar ou for bloqueado,
  os links ficam visíveis e ninguém cai numa página em branco. Sem JS, um meta refresh leva a
  `/pt-BR/`.
- `src/i18n/locale-redirect.ts` guarda essa lógica. Ela vira string via `Function.toString()`, então
  a função precisa ser autocontida: tudo chega por parâmetro, sem imports nem variáveis externas.
- O seletor de idioma é um `<details>` nativo: o `<summary>` mostra bandeira + código do idioma
  atual (`shortName` em `LOCALE_METADATA`: PT, EN, JP) e a lista traz links comuns para os outros
  dois. Tudo funciona sem JS. O nome acessível inclui o nome nativo ("PT Português"). O
  `LanguageSwitcher.client.ts` grava a escolha manual com `rememberLocaleChoice`
  (`src/i18n/locale-choice.ts`, o mesmo usado pelos links do rodapé; a detecção automática nunca
  é gravada) e fecha o menu com Esc (devolvendo o foco), clique fora ou quando o foco sai dele. O
  Safari (macOS e iOS) não foca o link clicado: o foco vai para o ancestral focável mais próximo (o
  `<header tabindex="-1">`) ou para lugar nenhum, e nenhum dos dois fecha o menu, senão o link some
  antes de o clique chegar. Bandeiras em `src/lib/images/locale-flags.ts`; en usa a dos EUA,
  coerente com `openGraphLocale: en_US`.
- Skills genéricas de i18n (como `internationalization-i18n`) sugerem i18next e troca de idioma sem
  recarregar a página. Aqui não: cada idioma é uma rota estática e nenhum texto é trocado via JS
  depois da pintura, para não haver layout shift.

## Fontes

| Família      | Pesos    | Uso                                      | Arquivos                         |
| ------------ | -------- | ---------------------------------------- | -------------------------------- |
| Paladins     | 400      | títulos (h1–h3) em todos os idiomas      | `src/assets/fonts/paladins/`     |
| Exo 2        | 400, 600 | corpo, labels e botões em pt-BR e en     | `src/assets/fonts/exo2/`         |
| Noto Sans JP | 400, 500 | corpo, labels e botões em ja (subsetada) | `src/assets/fonts/noto-sans-jp/` |

- As fontes ficam em `src/assets/fonts/` e o Vite as publica com hash em `/_astro/` (cache
  `immutable`, sem precisar versionar o nome). `src/styles/fonts.css` declara os `@font-face` com
  URL relativa e `font-display: block`. Nunca são inlinadas (`assetsInlineLimit`).
- Por que `block`: o preloader cobre a página até as fontes da rota carregarem, então o período de
  bloqueio (até ~3 s de texto invisível) passa por baixo do overlay e ninguém vê texto sumido nem
  troca de fonte. Onde não há overlay (sem JS, 404), o texto aparece direto na fonte certa se ela
  chegar em até ~3 s; só depois disso cai no fallback do Fontaine. Se o preloader soltar por
  timeout com uma fonte pendente, `data-fonts="fallback"` fixa os fallbacks (ver "Preloader,
  imagens e animação"), e o fim do bloqueio não troca nada na tela.
- Não use `optional`: no Chrome, a fonte que chega depois de ~100 ms fica de fora da página até a
  próxima visita, mesmo com o preloader ainda cobrindo a tela.
- `src/config/fonts.ts` (`FONT_FILES`) lista cada arquivo com família, peso e idiomas. Dali saem o
  aviso de arquivo ausente (`[font-files]`) e os preloads: `FontPreloads` pré-carrega só as fontes
  do idioma da página (Noto não entra em pt-BR/en, Exo 2 não entra em ja). A URL com hash vem de
  `src/lib/fonts/font-files.ts` via `import.meta.glob`, que ignora arquivo ausente. Ao adicionar
  fonte, mexa em `fonts.css` e `FONT_FILES` juntos.
- Arquivo ausente não quebra o build: o `[font-files]` e o Vite avisam, o preload some e o navegador
  usa o fallback.
- Tokens: use `--font-title` e `--font-body`. Em `:root:lang(ja)` eles trocam para
  `--font-title-ja` / `--font-body-ja`, e `--font-weight-strong` cai de 600 para 500 (a Noto não
  tem 600). Pesos sempre via `--font-weight-*`: um peso sem arquivo gera negrito falso.
- A Paladins não tem kana nem kanji. Em ja, os títulos usam Paladins nos caracteres latinos e Noto
  Sans JP no resto. Ela também é muito larga: títulos grandes em telas estreitas precisam de tamanho
  menor (h1–h3 têm `overflow-wrap: anywhere` só como proteção contra rolagem horizontal).
  Conferido de 320 a 1920 px, em várias alturas: nenhum título quebra palavra no meio.
- O Fontaine gera `"<família> fallback"` com `size-adjust` e overrides de métricas: lê o arquivo da
  Paladins e usa a base do Capsize para Exo 2 e Noto Sans JP. Como ele não reescreve custom
  properties, os tokens `--font-stack-*` já listam o fallback.

## Subset da fonte japonesa

O Noto Sans JP completo tem milhares de kanji e cerca de 1 MB por peso. `npm run subset-fonts`
(`scripts/subset-fonts.ts`, com `subset-font`, sem Python) lê `NotoSansJP-Regular` e
`NotoSansJP-Medium` (`.woff2` ou `.ttf`) de `scripts/fonts-source/noto-sans-jp/` e grava em
`src/assets/fonts/noto-sans-jp/` (`.woff2`, mesmo nome) uma versão só com os caracteres de
`dictionaries/ja.json`, dos `nativeName` de `LOCALE_METADATA` e do ASCII imprimível. Ao final,
mostra o tamanho antes e depois.

- **Rode à mão sempre que `ja.json` mudar.** O build não gera o subset. Um caractere novo que fique
  de fora não tem glifo no arquivo e aparece na fonte do sistema, misturado ao resto do texto.
- **Download automático.** Para cada peso, o script procura o arquivo local e, se achar, pula o
  download (e avisa no terminal). Se não achar, baixa do jsDelivr o arquivo `japanese` completo do
  Fontsource (`@fontsource/noto-sans-jp`, versão fixada em `DOWNLOAD_BASE_URL`), que é a Noto Sans
  JP do Google Fonts já em pesos estáticos. Numa máquina nova basta rodar o comando.
- Por que Fontsource e não o arquivo do repositório do Google Fonts: lá só existe a fonte variável.
  Gerar os pesos estáticos a partir dela leva cerca de 40 s por peso e produz um subset quase duas
  vezes maior (~60 KB contra 34 KB, medidos antes da seção de personagens), porque ela traz glifos
  alternativos (formas verticais, variantes JIS) que entram na closure do subset. Com os textos
  de personagens (três frases cada) e do rodapé, o subset do Fontsource tem cerca de 92 KB por peso (651
  caracteres). Os arquivos do Fontsource geram exatamente o resultado atual. Ao trocar a versão
  fixada, confira o tamanho do resultado.
- Se o download falhar (rede ou HTTP), o script sai com código 1 e sugere baixar o ZIP em
  fonts.google.com e copiar `NotoSansJP-Regular.ttf` / `NotoSansJP-Medium.ttf` (pasta `static`)
  para `scripts/fonts-source/noto-sans-jp/`. Funciona, mas o subset fica maior pelo motivo acima.
- O script avisa e sai com código 1 se faltar algum caractere na fonte de origem. As fatias
  numeradas do Fontsource (`noto-sans-jp-0-*` etc.) não servem de origem: cada uma cobre só um
  pedaço do Unicode.
- `scripts/fonts-source/` está no `.gitignore`: é só matéria-prima (cerca de 2 MB), nada no site
  importa esses arquivos e o script os baixa de novo quando faltam. O que se versiona é o resultado
  em `src/assets/fonts/`, que é o que os componentes e o CSS referenciam.

## Preloader, imagens e animação

- Imagem crítica: `<CriticalImage>` (eager, `fetchpriority="high"`). As demais usam
  `<Image>`/`<Picture>` de `astro:assets` (lazy por padrão) com `sizes` definido por imagem. O
  preloader espera toda imagem que não é lazy, então uma `eager` fora da primeira dobra atrasa a
  revelação (hoje, a foto do Kafka em Personagens).
- Preload de imagem: descreva a imagem uma vez como `ResponsiveImage` (`src`, `widths`, `sizes`, em
  `src/lib/images/`) e use o mesmo objeto no `<img>` e em `<ImagePreloads slot="head">`. O `getImage()`
  gera as mesmas URLs para as mesmas opções, então o `imagesrcset` do preload bate com o `srcset`.
- Visual: overlay `--color-bg` em tela cheia (`position: fixed; inset: 0`, `--z-preloader`) com o
  `number.webp` no centro, respirando (opacidade 0,2 ↔ 1 em `--preloader-breath-duration`). A
  respiração é keyframe CSS, então roda desde o primeiro paint, antes do JS. Sem texto visível: o
  `role="status"` leva `a11y.loading` em `.visually-hidden`, e a imagem é decorativa (`alt=""`).
- O `number.webp` é um JPEG de 31 KB. `lib/images/loader-mark.ts` o recodifica no build com o
  serviço de imagem do Astro (webp q80, tamanho original, ~3,9 KB) e o põe no HTML como data URI
  (~5,3 KB). O logo sai no primeiro paint, sem requisição e sem disputar banda com fontes e hero,
  o que um preload com `fetchpriority="high"` não garante. O `img-src` da CSP já aceita `data:`.
  O JPEG tem fundo preto chapado; `mix-blend-mode: screen` o funde com o fundo. Se trocar por uma
  imagem grande, volte a servir por URL com preload.
- O que o preloader espera (`lib/page/first-view.ts`), tudo em paralelo:
  - as fontes da rota: `document.fonts.load()` para cada item de `FONT_FILES` do idioma (Paladins +
    Exo 2 em pt-BR/en, Paladins + Noto Sans JP em ja; o mesmo conjunto do `FontPreloads`), depois
    `document.fonts.ready`;
  - toda `<img>` do conteúdo que não é `loading="lazy"`: load ou erro, depois `decode()`, para ela
    já estar pronta para pintar e não só baixada;
  - o `DOMContentLoaded`, que só dispara depois de todos os módulos da página rodarem (as seções já
    registraram as animações de entrada). `readyState` não serve: já vale `interactive` enquanto os
    módulos rodam.
- O que ele não espera: imagens `loading="lazy"`, que só carregam perto do scroll (esperar por elas
  prenderia o loader para sempre) e continuam carregando depois; e o trailer, que é um facade: o
  iframe do YouTube só entra no clique, então não há vídeo para esperar. O loader não adia nenhum
  asset: tudo começa a baixar em paralelo desde o `<head>`.
- Nenhuma falha trava o loader: imagem ou fonte com erro conta como resolvida, e um timeout libera a
  página aos 7,5 s contados do início da navegação (8 s menos o fade de saída de 0,5 s), para o fade
  terminar antes do failsafe de CSS, que o cortaria no meio. Se uma fonte ainda estiver carregando nesse
  momento, o script marca `html[data-fonts="fallback"]` e os tokens passam a usar só os fallbacks
  do Fontaine, para a fonte não trocar (nem deslocar o layout) depois que a página aparece.
- Enquanto espera, `[data-page-content]` fica `inert` e `aria-busy="true"` (postos pelo JS, para
  quem está sem JS nunca ficar preso). Na saída: fade de opacidade com GSAP (0,25 s se tudo ficou
  pronto antes de 600 ms, senão 0,5 s), o overlay sai do DOM, o conteúdo perde `inert` e
  `aria-busy`, e o foco volta ao início do documento (`lib/page/focus.ts`: o próximo Tab cai no
  skip link), exceto quando a URL tem fragmento. Com reduced motion, o logo fica parado e a saída é
  instantânea.
- A rolagem trava via CSS desde o primeiro paint (`:root:has(.preloader)`), sem depender do JS. O
  overlay só aparece com `@media (scripting: enabled)`; se não estiver visível (sem JS ou navegador
  antigo), o script libera a página na hora. Se o JS falhar, as animações CSS `preloader-failsafe`
  e `preloader-unlock` escondem o overlay e destravam a rolagem 8 s depois do primeiro paint
  (`--preloader-failsafe-delay`); o script também trata isso como liberação e, nesse caso, não
  mexe no foco. Em Slow 3G é esse failsafe que costuma liberar a página (~13 s), porque o JS
  depende da cadeia de módulos com o GSAP e chega depois dele.
- GSAP só entra por `@/lib/motion` (o lint bloqueia `gsap` em outros lugares). Em animação pontual,
  consulte `prefersReducedMotion()` e troque movimento por fade. Em animação contínua ou de scroll,
  use `withMotionPreference(({ reduceMotion }) => …)`, que reverte se a preferência mudar.
- ScrollTrigger: `import { ScrollTrigger } from '@/lib/motion/scroll-trigger'`. O módulo registra o
  plugin, chama `refresh()` quando o preloader libera a página e restaura a rolagem após trocas de
  media query (o ScrollTrigger a perde quando cria ou destrói triggers nesse momento, e a página
  voltaria ao topo ao alternar reduced motion). Só entra no bundle quando alguma seção o importar.
- Transições CSS usam `--duration-*`, que valem 0 com `prefers-reduced-motion: reduce`.

## Hero

- A armadura (`background.webp`) fica num "palco" com a proporção da imagem, dimensionado em
  `HeroArtwork.css` com unidades de container (`cqi`/`cqb`). As constantes `--socket-x`/`--socket-y`
  (centro da fenda em cruz, medido no canal alfa) e `--artwork-aspect` valem só para essa imagem:
  **se trocar a arte, meça de novo**. O olho é posicionado em porcentagem do palco, então acompanha
  o soquete em qualquer tela.
- O palco usa o menor zoom possível: largura de `100cqi / (2 × (1 − socket-x))` (para o eixo da cruz
  cair no centro) ou `--min-fill` da altura. Em telas altas a arte não cobre tudo e as bordas somem
  no preto (`mask-image`). O soquete fica em `--socket-target` da altura (0,5; 0,45 em retrato).
- `STAGE_SIZES`, `EYE_SIZES` e `LOGO_SIZES` em `src/lib/images/hero-images.ts`
  espelham esse CSS. Ao mudar tamanhos no CSS, atualize os `sizes`.
- O `h1` é visualmente oculto (`.visually-hidden`) e o bloco visual (logo + temporada + "em breve")
  leva `aria-hidden`, para o leitor de tela não ler o título duas vezes. Em ja, "3rd Season" fica em inglês e em Paladins (`seasonLang: "en"`), e "em breve" é
  「近日公開」 em Noto Sans JP (`.hero-lockup__status:lang(ja)`).
- Camadas, de trás para a frente: fundo preto → luz vermelha (`.hero-eye__seam-light` e o halo) →
  olho → armadura. Luz e olho têm `z-index: -1` e pintam atrás da armadura porque o palco isola o
  contexto de empilhamento; só aparecem pela fenda em cruz. Não crie contexto de empilhamento em
  `.hero-eye`.
- Indicador de scroll (`HeroScrollCue`, no lugar do antigo logo da Crunchyroll): um `<a>` para
  `#synopsis` com o texto `sections.hero.scrollCue` e uma linha em que um traço ciano desce. O traço
  cai três vezes (4,8 s, abaixo dos 5 s do WCAG 2.2.2), só depois de `data-page-state="revealed"` e
  do delay de 1,2 s da ignição, e para no topo da linha; com reduced motion fica parado. O
  `.client.ts` marca `data-away` quando a página passa de 16 px de rolagem, e o CSS o esconde com
  fade (`opacity` + `visibility`, `--duration-base`); ele volta no topo e não some enquanto tem foco.
- `HeroEye.client.ts`: ignição na primeira revelação, batimento em loop só na luz atrás do olho
  (`createCorePulse`, pausa fora da tela; o olho não escala) e olhar que segue o mouse
  (`followPointer` com `quickTo`, até metade do diâmetro do olho), este só com
  `(hover: hover) and (pointer: fine)` e sem reduced motion. Com reduced motion não há movimento nem
  escala, só uma variação lenta de opacidade da luz. As opacidades de repouso vêm do CSS.
- Sinal do loader (`lib/page/reveal.ts`): o preloader chama `markPageRevealed()` só no
  `onComplete` do fade, com o overlay já fora do DOM; ela marca `html[data-page-state="revealed"]`
  e dispara `page:revealed`. O hero espera por `whenPageRevealed()` (Promise), e o CSS por
  `:root[data-page-state='revealed']`. A ignição só é preparada se `isPageCovered()` for verdadeiro
  quando o script roda: se o failsafe de CSS já tiver descoberto a página (JS atrasado), o olho
  fica aceso em vez de apagar e reacender. Conferido quadro a quadro (normal, reduced motion,
  timeout e JS atrasado): a luz do olho só sobe no quadro seguinte ao sinal.

## O que é

- `synopsis__story` põe na mesma célula de grid a arte fixa (`StoryStage`, `position: sticky`,
  100lvb) e as cinco etapas da premissa (`StoryBeats`, 100svb cada): título, mundo, promessa
  ("Mina virou capitã. / Kafka ficou para trás."), a mudança e o codinome. Depois, em fundo liso,
  vem o arquivo: `OriginFile` (ficha em `<dl>` e texto), `StatBoard` e `AnimeSeasons`.
- Câmera (`lib/synopsis/story-camera.ts`): um timeline com scrub move o canvas da arte (só `x`, `y`
  e `scale`) entre os `STORY_SHOTS`, um por etapa depois do título, e cada enquadramento é
  atingido quando a etapa enche a tela. Os pontos são frações da arte e `frameShot` limita o
  movimento para a arte sempre cobrir o palco. Onde o sujeito cai na tela vem do CSS
  (`--camera-anchor-x/y` em `StoryStage.css`, por layout), então o JS não repete breakpoint. O
  título usa o enquadramento do CSS (`--focus-x/y`), o mesmo de quem está sem JS.
- Mira: cantos em % da arte (figura medida em x 76,5–88,5%, y 11–71%). **Se trocar a arte, meça de
  novo** e revise `--art-ratio`, `STORY_ART_SIZES` e `STORY_SHOTS`. O estado travado é o padrão
  do CSS; o JS o esconde e o anima (cantos fecham, piscam duas vezes, entra o `SuitNumber` "08")
  quando o texto do codinome entra (`top 95%`), e solta ao rolar de volta.
- Etapas (`lib/synopsis/story-beats.ts`): cada texto entra e sai com opacity + y em scrub, para
  ler uma de cada vez; o título chega junto com a arte e a última etapa sai junto com ela. "Kafka
  ficou para trás" desce um pouco em relação ao resto da etapa (`lagBehind`).
- Legibilidade: em tela estreita, degradê no pé do palco e uma faixa escura atrás de cada texto.
  Em `(orientation: landscape) and (width >= 56em)` (o breakpoint de Personagens, repetido em
  `StoryStage.css` e `StoryBeats.css`) o texto vai para uma coluna à esquerda com degradê lateral,
  e o codinome e as frases da virada podem avançar sobre a arte. Em qualquer paisagem a placa
  fica ao lado da mira, porque a tela é baixa.
- O codinome vem de `hunted` com `{codename}`: `splitCodenameSentence` quebra a frase e ele vira um
  `<strong>` em bloco onde quer que caia na frase do idioma. Em ja, 「怪獣8号」 usa Noto Sans JP (a
  Paladins não tem kanji e o 8 dela vira bloco). Em ja, a frase chega ao codinome por um 「、」, sem
  travessão.
- A seção é o alvo do skip link ("Pular para o conteúdo principal") e do indicador de scroll do
  hero: `id="synopsis"` com `tabindex="-1"`, então o foco vai de fato para ela e o próximo Tab segue
  dali. Ela não desenha anel de foco (não é um controle). O `BaseLayout` recebe o alvo pela prop
  `skipTargetId`.
- Reduced motion: o palco deixa de ser sticky (bloco de 100svb com o título e a mira travada) e o
  resto da premissa vira uma coluna de leitura, sem animação. Sem JS: o layout com a arte fixa,
  todos os textos visíveis e a mira travada.
- Números: o HTML traz o valor final formatado no build (`Intl.NumberFormat`) e esconde figura e
  legenda (`aria-hidden`); uma frase `.visually-hidden` por item (`spoken`) leva o valor inteiro
  ao leitor de tela. Valores e unidades ficam no dicionário porque mudam por idioma (2,000万部).
  A rolagem usa o `createOdometer` compartilhado (`lib/motion/odometer.ts`, estilos em
  `styles/odometer.css`): os rolos nascem em `top bottom` e rolam em `top 88%`, então quem
  renderiza sem rolar só vê os valores finais. A colocação (`award`) não rola.
- A arte `assets/images/Story/background.webp` (3452×2160, webp q95 de 725 KB, convertida de um
  JPEG de 4,5 MB) é o original de onde o Astro gera webp de 52–256 KB (`STORY_ART` em
  `lib/synopsis/story-art.ts`, lazy). A largura 2880 existe para celulares de 1,75× a 2×: o
  `sizes` (180vh) pede ~2600 a 2900 px de dispositivo, e sem ela o navegador pulava de 2560 para
  o original de 3452 (249 KiB contra 190 KiB). Celulares de 2,6× ou mais pedem acima de 3452 e
  recebem o original.

## A história até aqui

- É a seção com spoilers, até o episódio 23 ("Second Wave"). Só entra o que o anime já mostrou:
  nada do mangá, e nenhuma luta contra os kaiju 11 a 15 tem desfecho (todas "Em andamento").
- Textos em `sections.recap` dos dicionários. Números (fortitude, 84%, 73%, 20 km, kaiju e traje
  de cada frente) em `lib/recap/recap.ts`. A fortitude sai como "9.0" nos três idiomas, como no
  texto original. A Paladins não tem "ª": evite ordinais em títulos (por isso "segunda temporada").
- Portão (`lib/recap/recap-gate.ts`): o relatório inteiro está no HTML (SEO e sem JS). O JS o marca
  `inert` e põe `data-recap-state` na seção (`veiled` → `revealing` → `revealed`). O aviso fica
  sticky por cima do relatório velado. O véu (`.recap__veil`) é um bloco sticky de uma tela de
  altura com `backdrop-filter`, então o blur só processa uma viewport. O botão tem `aria-expanded`
  e `aria-controls`. Ao revelar, o foco vai para a primeira frase do relatório (`data-recap-start`)
  e o status "Relatório revelado" ocupa a mesma célula do botão (sem layout shift). A escolha fica
  em `sessionStorage` (`kaiju8-teaser:recap-revealed`).
- Revelação: uma linha de varredura ciano desce pela parte visível do véu (só transform). Com
  reduced motion, troca na hora. Quem clica no meio do relatório volta ao ponto em que o aviso
  está no fluxo (o mesmo lugar na tela), e a leitura começa do início.
- Sem JS (`scripting: none`) não há véu nem botão: o aviso e o link para pular ficam acima do
  relatório. Se o script falhar com scripting ligado, uma animação CSS (`--preloader-failsafe-delay`)
  levanta o véu e esconde o botão, para o relatório não ficar trancado.
- Animações (`lib/recap/recap-motion.ts`) só começam depois da revelação, via
  `withMotionPreference`: a espinha da cronologia enche com o scroll (scaleY), os marcadores
  acendem (`data-dim`), os leitores numéricos rolam ao chegar a 88% da viewport, os medidores de %
  enchem (scaleX) e a frase final sobe. Só transform e opacity.
- Odômetro (`createOdometer` em `lib/motion/odometer.ts`, CSS em `styles/odometer.css`): cobre o
  número real, que continua no DOM (transparente enquanto rola), com rolos de dígitos `aria-hidden`
  e os remove no fim. O host precisa de `position` e `--odometer-color`. A sinopse também usa: não
  mude a assinatura nem as classes sem ajustar as duas seções.
- Capa: key art da 2ª temporada (`2ndSeason/background.webp`), inteira em 16:9 a partir de 48em e
  quadrada no mobile, sem texto por cima.
- Final: loop do Reno (`2ndSeason/reno.webp`, WebP animado de 7,5 MB, ~2,2 MB recodificado a q70
  em `lib/recap/finale-art.ts`), girado 90° para ficar vertical. O HTML leva só o quadro parado
  `reno-still.webp` (quadro 21 do loop; se trocar o loop, exporte outro). O JS troca pelo loop
  depois da revelação, com movimento permitido e depois de o quadro parado carregar: o navegador
  mantém o parado na tela enquanto o loop baixa. Quem não revela, usa reduced motion ou está sem JS
  nunca baixa o loop. No dev, a primeira requisição do loop leva ~10 s (o Astro recodifica 130
  quadros); o build guarda em cache.
- Cores: ciano para a Força de Defesa, vermelho para os kaiju. Cada frente usa a aura do
  personagem (`--color-aura-shinonome` é nova). No registro, a Numbers 2 fica vermelha
  (`--suit-color`), porque está com o Nº9.
- Em ja, os títulos do relatório usam Noto Sans JP (`--recap-heading-font`), porque os dígitos da
  Paladins viram blocos ao lado de kanji (第2期, 9号).
- Breakpoints: 48em (aviso em duas colunas, capa 16:9, leitores das ondas à direita), 56em (dossiê
  e final em duas colunas), 60em (frentes em 2×2, com a de Shinonome na linha inteira, logo antes
  do final).
- Abaixo de 22.5em (360 px), o número do kaiju deixa menos de seis caracteres ao lado do nome e
  「四ノ宮キコル」 quebraria no meio: o `.recap-front__matchup` vira `display: contents` e o título
  da frente desce para baixo do número, com o badge do traje ao lado dele.

## Personagens

- Dados em `src/lib/characters/characters.ts` (`CHARACTER_ART`: ordem do roster, foto, número do
  traje, `unknown`) e textos em `sections.characters.list` dos dicionários (nome, `alias` opcional,
  descrição, alt). O id do personagem é a chave do dicionário (`CharacterId`), então um personagem
  sem texto em algum idioma é erro de tipo. `FEATURED_CHARACTER` (Kafka) começa em foco.
- Badges dos trajes (e todo código de kaiju ou traje no site): só o número, com dois dígitos ("08",
  "04", "10"), via `formatDesignation` (`lib/suits/designation.ts`) dentro do `SuitNumber`. Texto
  corrido ("Kaiju Nº8", "Numerada 10") usa o número puro. A armadura do hero traz "00 10" pintado na
  própria imagem.
- As descrições têm três frases. No layout estreito o bloco de texto cresce com a altura do painel
  (`clamp(4lh, 32cqb, 7lh)`, o painel é um size container) e rola por dentro quando não cabe, com
  esmaecimento embaixo (`data-more`) e foco por teclado. Em tela larga elas cabem inteiras.
- Todo personagem tem nome e descrição no HTML estático: cada card do roster traz o nome visível e
  a descrição em `.visually-hidden`; o card do personagem em foco fica `hidden` e o texto dele
  aparece no painel. Sem JS a página mostra Kafka em foco e o roster inteiro.
- Troca de foco (`Characters.client.ts` + `lib/characters/spotlight-dom.ts`): o JS lê o texto do
  card clicado e o escreve no painel, cujo bloco de texto tem `aria-live="polite"` (trocar o texto
  é o que faz o leitor anunciar). O personagem anterior ocupa o slot do card clicado, então o
  carrossel não se reorganiza, e o foco do teclado passa para esse card. Clique novo durante a
  transição vence (`progress(1)` na anterior).
- Crossfade em `lib/characters/spotlight-transition.ts`: a foto nova entra por cima da anterior
  (0,8 s, scale 1,06 → 1), o texto sai, é trocado e volta. Com reduced motion tudo troca de uma
  vez. As fotos do painel ficam `hidden` + lazy; quando o roster entra na tela o JS as passa para
  eager, para o clique não esperar download. Não pisque a opacidade da foto nova: a anterior
  aparece por baixo.
- Título: fica num `.characters__heading` com `container-type: inline-size` e usa
  `min(var(--font-size-xl), 8.75cqi)` da própria célula. No layout largo a coluna ao lado da foto é
  estreita (~350 px em 900×800), e "Personagens" mede ~11em em Paladins. O nome em foco usa o
  mesmo limite no layout largo, para nunca passar do título.
- Layout: `(orientation: landscape) and (width >= 56em)` põe a foto à esquerda e título, texto e
  roster à direita (o painel vira `display: contents` e entra no grid da seção). Abaixo disso,
  tudo empilha e o painel é um size container que mantém a foto em 4:5 com o texto por cima. A
  seção tem no mínimo `100svb` sempre. O breakpoint se repete em `Characters.css`,
  `CharacterSpotlight.css`, `CharacterRoster.css` e nos `sizes` de `characters.ts`.
- Roster: `scroll-snap-type: x mandatory`, cards com `scroll-snap-align: center` e largura de 40%
  (29% em tela larga) para o vizinho sempre aparecer cortado; no mobile ele vai até a borda da
  tela. As bordas esmaecem só quando há mais cards daquele lado (`data-at-start`/`data-at-end`,
  do `CharacterRoster.client.ts`). Botões de passo só com `(hover: hover) and (pointer: fine)`;
  no fim do scroll o botão some e o foco passa para o outro.
- Aura: `--color-aura-*` em `tokens.css`, ligadas a `--character-aura` por `[data-character]`.
  A propriedade é registrada com `@property`, por isso a cor faz transição na troca. Kaiju Nº9
  (`unknown`) tem foto em cinza com scanlines no card e no painel, e um glitch no hover do card.
- Fotos com `will-change`: sem isso, em posição subpixel (x = 776,5), o fim do zoom do card e do
  crossfade salta 1 px quando a camada composta é desfeita.
- O anel de foco do card é desenhado no `::after`: o outline do botão fica atrás da foto, que é
  absoluta.
- O badge do traje fica fora do `<button>`, sobreposto ao card (`pointer-events: none`), para o
  texto visível do botão ser só o nome, que o `aria-label` contém (WCAG 2.5.3, regra
  `label-content-name-mismatch` do axe). `aria-hidden` não resolve: a regra compara o texto
  visível. O rótulo do traje ("Armadura Numerada 10") passa a ser lido depois do botão.

## Trailer

- O player é um facade (`ui/YouTubeFacade`): thumbnail `maxresdefault` do YouTube (webp com fallback
  jpg, `loading="lazy"`, 1280×720 declarados), um `Button` primary de play por cima e o `<iframe>` guardado
  num `<template>`. Conteúdo de `<template>` é inerte, então nada do YouTube (script, CSS, iframe)
  carrega antes do clique. No clique, o `.client.ts` troca o botão pelo iframe
  (`youtube-nocookie.com`, `autoplay=1`, `hl` = idioma da página), move o foco para ele e remove a
  thumbnail quando o player carrega.
- O play é um item de grid centralizado (não posicionado) e o `::after` dele cobre o facade inteiro:
  um clique em qualquer ponto do vídeo toca, e o hover no vídeo acende o botão.
- Sem JS, o botão some e aparece um link para o vídeo no YouTube (`@media (scripting: none)`).
- Em Safari/iOS e em alguns navegadores mobile o autoplay com som é bloqueado mesmo após o clique: o
  player abre e a pessoa toca play de novo. Resolver isso exige a IFrame API do YouTube (script de
  `www.youtube.com` na página e na CSP), o que foi evitado de propósito.
- Só `maxresdefault` (1280×720) e `mqdefault` (320×180) são 16:9; `hq`/`sd` são 4:3 com tarjas. Nem
  todo vídeo tem `maxresdefault`: ao trocar `TRAILER_VIDEO_ID`, confira as duas URLs da thumbnail.
- `Trailer.client.ts` decide tudo por `gsap.matchMedia` (o breakpoint existe só lá, `width >= 64em`):
  - Tela larga: marca `data-layout="theater"` na seção (100svb de altura, título centralizado, palco
    com `container-type: size`) e, sem reduced motion, faz pin + scrub. A animação muda só
    `--trailer-progress` (0 → 1); o CSS calcula a largura, de `--trailer-start-ratio` (0,55) até a
    maior caixa 16:9 que cabe no palco (`min(100cqi, 100cqb × 16/9)`). A altura vem do
    `aspect-ratio`.
  - Distâncias em alturas de viewport: `GROW_DISTANCE` (1, crescimento) + `HOLD_DISTANCE` (0,2,
    parado no tamanho final antes de soltar). Ease `power1.inOut`, `scrub: true`.
  - Tela estreita: sem pin; fade + scale (0,94 → 1) quando o topo do vídeo passa de 85% da viewport.
    Usa `opacity` e não `autoAlpha`, para o botão continuar focável por teclado antes de aparecer.
  - Reduced motion: nenhuma animação; o vídeo já aparece no tamanho final (`--trailer-progress`
    vale 1 por padrão).

## Onde assistir

- Textos e links em `sections.whereToWatch` dos dicionários (`cta.label`, `cta.url`). pt-BR e en
  apontam para a série na Crunchyroll; ja aponta para a página de streaming do site oficial
  (`kaiju-no8.net/streaming/`, que lista os serviços), porque a Crunchyroll não opera no Japão. O logo por idioma vem de `PLATFORM_LOGOS`
  (`lib/images/where-to-watch-images.ts`): ja não tem logo, e por isso seu `logoAlt` fica vazio.
- O CTA é um `Button` primary `lg` com `newTabLabel={a11y.opensInNewTab}` (nova aba, aviso oculto
  e ícone externo; ver "Botões").
- A arte de fundo é decorativa (`alt=""`, lazy) e usa `object-fit: cover`. Como ela sempre fica
  mais larga que a viewport, um único arquivo no tamanho original (~40 KB) serve todas as telas.
- O desenho fica à esquerda da arte, então o texto nunca fica sobre ele. Com `width >= 56em`, a
  arte cobre a seção (`object-position: 25%`, que empurra o desenho para a esquerda em telas
  médias), o texto fica na metade direita e o `::before` escurece só esse lado (`--color-scrim`).
  Abaixo disso, a arte vira uma faixa no topo (`--where-to-watch-band`) que some num `mask-image`,
  e o texto fica abaixo dela, sobre o fundo da página. Medido de 320 px a 2560 px: texto ≥ 10:1,
  título ≥ 7,9:1, logo ≥ 4:1. Se trocar a arte ou clarear o scrim, meça de novo.
- `WhereToWatch.client.ts` só faz um fade (opacity, não `autoAlpha`) quando a seção chega a 70% da
  viewport, via `withMotionPreference`. Com reduced motion ou sem JS, o conteúdo aparece direto.
- Em ja, `line-break: strict` evita linha começando com 「ー」 ou kana pequeno.

## Rodapé

- "Fim do relatório": uma linha de HUD sai de uma luz vermelha (o olho do hero em miniatura) e
  termina no `SuitNumber` "08". A linha inteira é `aria-hidden`; o texto "Fim do relatório" é
  um `<p>`, não um título, para não entrar no sumário de headings.
- Textos em `footer` dos dicionários. `disclaimer` e `rights` são os dois parágrafos do aviso
  legal. Os créditos da obra seguem a grafia oficial: em ja,
  「松本直也（集英社「少年ジャンプ＋」連載）」, 「怪獣デザイン＆ワークス：スタジオカラー」 e o
  copyright japonês 「©防衛隊第3部隊 ©松本直也／集英社」. Créditos do projeto: `@byduuds.design`
  (Instagram) e `petrecaLeo` (GitHub), iguais nos três dicionários (`footer.credits.project`).
- O ano sai de `new Date().getFullYear()` no build (`signature`, com `{year}`).
- Voltar ao topo: `Button` secondary `sm` com `href="#top"`, e o alvo é o `<header id="top" tabindex="-1">` (`ANCHORS.top`).
  O foco vai para o cabeçalho, então o próximo Tab cai no seletor de idioma e o anterior no skip
  link, como ao abrir a página. O cabeçalho não desenha anel de foco (não é um controle).
- Idiomas: `<nav aria-label>` própria ("Idiomas disponíveis", diferente do rótulo do cabeçalho),
  links com `lang`, `hreflang` e `aria-current="page"` no atual. A luz do idioma atual é cheia e
  as outras são vazadas, então o estado não depende só da cor.
- Animação (`FooterSignoff.client.ts`), uma vez, quando a linha chega a 85% da viewport: a luz
  acende com o piscar da ignição do hero, a linha cresce (scaleX), o selo pisca e trava e a luz
  bate duas vezes. Termina em ~3,6 s (abaixo dos 5 s do WCAG 2.2.2) e não repete. Só transform e
  opacity. O estado final é o do CSS: com reduced motion ou sem JS, tudo já aparece aceso. Um
  marquee foi descartado por ser movimento contínuo ao lado do aviso legal.
- Contraste medido sobre `--color-bg`: aviso legal, rótulos e copyright 8,55:1; nomes e links
  17:1; códigos vermelhos (PT/EN/JP, "08") 5,45:1.
- Layout: empilhado no mobile; com `width >= 56em`, aviso legal à esquerda (máx. 62ch) e créditos
  à direita, com a linha de idiomas e o ano embaixo.

## Página 404

- `/404.html` (inglês) é a versão principal, porque todo host estático serve esse arquivo para URL
  inexistente. `src/pages/[locale]/404.astro` gera também `/pt-BR/404.html` e `/ja/404.html`
  (`getLocalizedNotFoundPaths`: todos os idiomas menos `ROOT_NOT_FOUND_LOCALE`, em
  `lib/not-found/not-found-page.ts`). As três usam `layouts/NotFoundLayout`, um documento próprio
  sem preloader, cabeçalho nem JS. Nenhum texto muda depois da pintura.
- O Astro só grava `404.html` direto na raiz; numa pasta, a 404 sairia como `pt-BR/404/index.html`.
  A integração `tooling/integrations/not-found-pages.ts` move, no fim do build, cada
  `<pasta>/404/index.html` para `<pasta>/404.html`. O @astrojs/sitemap já exclui `404` e
  `<idioma>/404` sozinho.
- Como cada host se comporta:
  - **Cloudflare Pages**: procura o `404.html` mais próximo da pasta pedida e sobe até a raiz.
    `/pt-BR/qualquer/coisa` → `/pt-BR/404.html`, `/ja/…` → ja, `/en/…` e o resto → `/404.html`,
    sempre com status 404. Conferido com `wrangler pages dev dist` (wrangler 4.140). URLs
    diferenciam maiúsculas: `/PT-BR/x` cai na inglesa.
  - **Netlify**: só usa o `/404.html` da raiz, então todo idioma vê a inglesa (ver `pendencies.md`).
  - **`astro dev`** imita o host: `/pt-BR/teste` mostra a 404 pt-BR com status 404. Por padrão ele
    não faria isso: com `trailingSlash: 'always'`, recusa URL sem barra com uma página do próprio
    Astro, e para qualquer URL inexistente renderiza só a 404 da raiz. O plugin Vite da integração
    (só no dev) acrescenta a barra por dentro, sem redirecionar, e o `src/middleware.ts` (só com
    `import.meta.env.DEV`; no build ele não faz nada) troca a 404 da raiz pela da pasta do idioma.
    Efeito colateral: o dev não acusa mais link interno sem barra (o host o redireciona).
- Textos em `notFound` dos dicionários. O título da aba vem do template `documentTitle`
  (`{status}: {title} | {siteName}`; em ja, `{status}: {title}｜{siteName}`). O `h1` mostra só
  "404" e completa o sentido com `: {title}` em `.visually-hidden` (o leitor de tela lê "404: Page
  not found").
- Fundo branco (`--color-white`, com `color-scheme: light` via `:root:has(.not-found)`) para
  combinar com o meme. O "404" é Paladins ciano com contorno preto: `-webkit-text-stroke` de 0,1em
  com `paint-order: stroke fill` (o traço fica por baixo do preenchimento e não afina a letra) e,
  sem suporte, um contorno de oito `text-shadow`. Uma margem negativa o põe sobre o topo vazio da
  arte, como legenda de meme.
- Tamanho do "404": `clamp(4.5rem, min(27vi, 22svb), 13rem)`. Com o contorno, os três dígitos da
  Paladins medem ~3,05em; maior que isso, ele não cabe em 320–375 px e o navegador o alinha pelo
  início, fora do centro.
- A arte (`assets/images/404/meme.webp`, 435×459) é recortada no build para 435×300
  (`fit: 'cover'` em `NOT_FOUND_IMAGE`), sem as faixas brancas acima e abaixo do desenho (y
  86–343). Ela é eager, com `fetchpriority="high"`; como o original tem 435 px, um arquivo serve
  todas as telas.
- Só a Paladins tem preload (prop `fontFamilies` do `BaseHead`). A fonte do corpo pode chegar
  depois da primeira pintura e mudar a quebra da mensagem; por isso ela reserva duas linhas
  (`min-block-size: 2lh`) e a coluna centralizada não se move. CLS medido com a fonte atrasada em
  1,5 s: ≤ 0,001 (corpo) e ~0,01 (Paladins; o "404" muda de largura e se recentraliza).
- Em ja, `word-break: keep-all` só permite quebra depois do 「、」 (「このページは、／怪獣に…」);
  `overflow-wrap: anywhere` protege se a frase não couber.
- Link: `Button` primary `lg`. `.not-found` sobrescreve os tokens: borda preta, sem o corte e anel
  de foco preto (o amarelo `--color-focus` não tem contraste sobre branco). Texto escuro sobre
  ciano: 13:1. O "404" treme uma vez ao carregar (0,6 s,
  `translate` e `rotate`), só com `prefers-reduced-motion: no-preference`.
- Cabe numa tela sem rolagem de 320×568 a 1440×900. Em celular deitado (844×390 e 740×360), um
  ajuste em `(orientation: landscape) and (height < 30rem)` diminui a arte e usa a altura `md` no
  botão.

## Favicons e imagem de compartilhamento

- **Exceção à regra do `src/assets/`**: favicons, ícones do manifest e imagens OG ficam em
  `public/`, sem hash. Navegadores e buscadores procuram `/favicon.ico`, `/apple-touch-icon.png`
  etc. em caminhos fixos, e o `og:image` precisa de uma URL estável. São arquivos gerados: não
  edite à mão, rode o script de novo e versione o resultado.
- `npm run generate-favicons` (`scripts/generate-favicons.ts`, com sharp) lê
  `src/assets/images/logo/favicon.png` (o "8" do logo, 297×521, transparente) e grava em `public/`:
  `favicon.ico` (32×32, um PNG dentro do ICO), `favicon-16x16.png` e `favicon-32x32.png`
  (transparentes), `apple-touch-icon.png` (180×180, fundo sólido, porque o iOS não aceita
  transparência) e `icon-192.png`/`icon-512.png` (opacos, com o "8" dentro dos 80% centrais, a
  zona segura de ícone maskable). Tamanhos, margens e fundo ficam em `src/config/site-icons.ts`,
  que também alimenta os `<link>` (`SiteIcons`) e o manifest.
- `/site.webmanifest` sai de `src/pages/site.webmanifest.ts` (`src/seo/web-manifest.ts`): textos do
  idioma padrão, `display: standalone`, `start_url: /`, cores do tema e cada ícone como `any` e
  `maskable`. A CSP já tem `manifest-src 'self'`.
- Cor: `theme-color`, `background_color`/`theme_color` do manifest e o fundo dos ícones opacos
  usam `SITE.themeColor` (`#0b0d10`, igual ao `--color-bg`), não `#000`, para a barra do navegador
  e a splash emendarem na página.
- `npm run generate-og-images` (`scripts/generate-og-images.ts`) gera `public/og/{pt-BR,en,ja}.jpg`
  (1200×630, JPEG de ~45 KB; em PNG seriam ~440 KB, e há apps que não mostram prévia acima de
  ~300 KB): armadura do
  hero, luz e olho no soquete, degradê, logo do idioma (`ENLogo` em pt-BR e en, `JPLogo` em ja) e
  a temporada (`sections.hero.season`) em Paladins. As cores vêm de `tokens.css`; a posição do
  soquete é copiada de `HeroArtwork.css` (**se trocar a arte do hero, meça de novo nos dois
  lugares**). O sharp não lê woff2, então o script converte a Paladins para TTF com `subset-font`
  numa pasta temporária. Rode de novo ao mudar a arte, os logos ou o texto da temporada. Caminho em
  `getOpenGraphImagePath` (`src/config/site.ts`), alt em `meta.openGraphImageAlt`.

## SEO, segurança e hospedagem

- **Domínio:** a opção `site` do `astro.config.ts` (`https://kaiju-no-8-fansite.pages.dev`) é a
  única fonte das URLs absolutas. Canonical, hreflang (inclusive x-default), `og:url`, `og:image`,
  JSON-LD, sitemap e robots.txt saem dela (via `Astro.site`); nenhum outro arquivo escreve o
  domínio. Para trocar, ver "Deploy". Para testar local com URLs absolutas corretas:
  `npx astro build --site http://localhost:8790 --outDir <pasta>`.
- Todo o `<head>` de SEO sai de `components/head/SeoHead`, com os dados montados em
  `src/seo/metadata.ts` e `src/seo/structured-data.ts`; nenhum layout escreve meta tag. Textos em
  `meta` dos dicionários: `title` (aba, `og:title`, `twitter:title` e `name` do manifest),
  `description` (até ~155 caracteres; em ja, ~70), `fanSiteName` (`og:site_name` e nome do WebSite),
  `seriesCreator` e `openGraphImageAlt`. `siteName` é o nome da obra (TVSeries, `short_name` do
  manifest e título da 404).
- Página indexável: title, description, canonical absoluto, hreflang (pt-BR, en, ja e x-default →
  `/`, a raiz que escolhe o idioma), Open Graph (`og:locale` e `og:locale:alternate` com os outros
  dois), Twitter card `summary_large_image` e JSON-LD. O `lang` do `<html>` vem da rota.
- JSON-LD: um `WebSite` (`fanSiteName`, description, URL canônica, `inLanguage`) com `about` →
  `TVSeries` (nome da obra, os nomes dos outros idiomas em `alternateName`, `creator` e
  `productionCompany` Production I.G) e `author` → as duas `Person` dos créditos do rodapé (nome e
  link lidos de `footer.credits.project`). Para não parecer site oficial: nome e descrição dizem
  "site de fã", a obra só aparece como assunto (`about`), os autores são os fãs e não há
  `publisher`, `sameAs` nem link para propriedades oficiais. `serializeJsonLd` troca `<` por `<`, para o JSON não fechar o
  `<script>`. Tipos e propriedades conferidos com o vocabulário do schema.org.
- O bloco `application/ld+json` é dado, não script: o navegador não o executa e a CSP não se aplica
  a ele. `inline-code.ts` o ignora (não gera hash em `script-src`) e `JsonLd.astro` é a exceção de
  lint ao `set:html`. Conferido no Chrome com a CSP do `_headers`: nenhum erro nem aviso.
- Sitemap: `/sitemap-index.xml` → `sitemap-0.xml` com as três rotas de idioma, cada uma com
  `xhtml:link` para pt-BR, en, ja e x-default (`serialize` no `astro.config.ts`, o mesmo conjunto
  do `<head>`). Ficam fora `/` (é só redirect, `EXCLUDED_FROM_SITEMAP`)
  e as 404 (o plugin as exclui sozinho). O `robots.txt` libera tudo e aponta o sitemap.
- As 404 (ver "Página 404") usam `BaseHead` com `indexable={false}` (`noindex`, sem canonical nem
  hreflang) e ficam fora do sitemap. O `404.html` da raiz é necessário: sem ele, a Cloudflare Pages
  trata o site como SPA e responde 200 com a raiz para qualquer URL.
- Os headers saem em `dist/_headers` (formato da Cloudflare Pages), gerado no fim de todo build por
  `tooling/integrations/security-headers`. Tudo o que vai nele (CSP, headers, cache) é declarado em
  `policy.ts`. Não existe `public/_headers`: o build falha se ele for criado, porque seria
  sobrescrito e os hashes ficariam velhos.
- Hashes da CSP: a integração calcula o SHA-256 de cada `<script>` e `<style>` inline do HTML final
  e os põe em `script-src`/`style-src`, então acompanham qualquer mudança sem passo manual. Nonce
  exige servidor por requisição; num site estático o hash é o equivalente seguro. Nada de
  `'unsafe-inline'`. O build falha se o HTML tiver atributos `style=` ou `on*=`.
- CSP: `default-src 'none'` e só o necessário. Scripts, estilos, fontes e manifest de `'self'` (mais
  os hashes); `img-src 'self' data: https://i.ytimg.com`; `frame-src
https://www.youtube-nocookie.com`; `frame-ancestors`, `base-uri`, `form-action` e `object-src`
  em `'none'`. O código do site não faz requisição nenhuma, mas `connect-src 'self'` fica: o
  Lighthouse e o PageSpeed baixam o robots.txt de dentro da página e, sem ele, acusam "robots.txt
  is not valid". `script-src` e `connect-src` liberam também o Cloudflare Web Analytics (ver
  "Deploy").
- Demais headers: HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, COOP `same-origin` e um `Permissions-Policy`
  que desliga câmera, microfone, geolocalização, pagamento, USB, MIDI, sensores, captura de tela,
  wake lock, XR, idle detection e Topics. Autoplay, clipboard-write, encrypted-media,
  picture-in-picture e web-share continuam liberados porque o iframe do trailer os pede.
  `bluetooth`, `serial` e `hid` ficaram de fora: o Chrome registra "Unrecognized feature" no
  console onde a API não existe (bluetooth no Linux). Ao incluir um recurso, confira o console.
- Cache (`Cache-Control`): o padrão (`/*`) é `public, max-age=0, must-revalidate`, então HTML,
  robots e sitemap revalidam e um deploy novo aparece na hora. As 404 saem da Cloudflare com
  `no-store`, que ela impõe por cima do `_headers`. `/_astro/*` (nome com hash) usa
  `public, max-age=31536000, immutable`; favicons, `site.webmanifest` e `/og/*` (sem hash), um dia.
  A Cloudflare aplica todas as regras que casam, na ordem do arquivo, e junta com vírgula um header
  repetido; por isso as regras específicas começam com `! Cache-Control`, que desanexa o padrão.
  Conferido no `wrangler pages dev`.
- Scripts nunca são inlinados (`vite.build.assetsInlineLimit`). CSS pequeno pode ser inlinado, e o
  hash cobre. O único script inline executável é o redirect da raiz.
- Em outro host, converta o `_headers` para o formato dele (o `! Cache-Control` é sintaxe da
  Cloudflare). Recurso externo novo (vídeo, iframe, fonte) exige ajuste em `policy.ts`.
- Origens externas liberadas: `img-src https://i.ytimg.com` (thumbnail do trailer) e
  `frame-src https://www.youtube-nocookie.com` (player). As duas vêm de `YOUTUBE_ORIGINS`
  (`src/config/youtube.ts`), que o `policy.ts` importa, então a CSP acompanha qualquer troca de
  origem. O embed do YouTube exige o header `Referer` (sem ele, erro 153): não troque o
  `Referrer-Policy` por `no-referrer`. Além delas, as duas do Web Analytics (ver "Deploy").

## Deploy (Cloudflare Pages)

Site estático, sem Functions nem adapter (`output: 'static'`). A Cloudflare roda `npm run build` e
publica `dist/`, que já traz o `_headers` e as 404 por idioma.

| Campo no painel        | Valor                                                                      |
| ---------------------- | -------------------------------------------------------------------------- |
| Project name           | `kaiju-no-8-fansite` (vira `https://kaiju-no-8-fansite.pages.dev`)         |
| Repositório / branch   | `petrecaLeo/kaiju-no-8-3rd-season-fansite`, produção em `main`             |
| Framework preset       | Astro                                                                      |
| Build command          | `npm run build`                                                            |
| Build output directory | `dist`                                                                     |
| Root directory         | vazio (raiz do repositório)                                                |
| Node                   | `.nvmrc` (`24.21.0`); sem ele, o build image v3 usaria Node 22.16 e npm 10 |

- Nenhuma variável de ambiente é necessária. Não defina `NODE_ENV=production`: a instalação
  deixaria de fora as devDependencies, e o build (`astro check`) precisa delas. Se quiser fixar o
  Node também pelo painel, `NODE_VERSION` precisa ter o mesmo valor do `.nvmrc`.
- O build não acessa a rede nem roda script auxiliar: subset da Noto, favicons e imagens OG são
  arquivos versionados; `site.webmanifest`, `robots.txt`, sitemap e `_headers` saem do próprio
  build. Conferido com uma cópia só dos arquivos do git (sem `scripts/fonts-source/`), `npm ci` e
  `npm run build` com a rede cortada (`unshare -rn`).
- Antes de um deploy, rode à mão e comite o resultado quando a origem mudar:

  | Mudou                                                        | Rode                         | Comite                               |
  | ------------------------------------------------------------ | ---------------------------- | ------------------------------------ |
  | texto em `ja.json` (ou um `nativeName`)                      | `npm run subset-fonts`       | `src/assets/fonts/noto-sans-jp/`     |
  | `logo/favicon.png` ou `src/config/site-icons.ts`             | `npm run generate-favicons`  | `public/favicon.ico`, `public/*.png` |
  | arte do hero, logos, `sections.hero.season` ou cores do tema | `npm run generate-og-images` | `public/og/`                         |

  Os três são determinísticos: rodar sem mudança na origem não altera nada no git.

- Headers: nada a fazer por deploy. Os hashes da CSP são recalculados a cada build; para mudar
  header, origem ou cache, edite `tooling/integrations/security-headers/policy.ts`.
- **Subdomínio ocupado:** se `kaiju-no-8-fansite` já existir, a Cloudflare acrescenta um sufixo
  aleatório (ex.: `kaiju-no-8-fansite-4x7.pages.dev`). Troque `site` no `astro.config.ts` pela URL
  que o painel mostrar, comite e faça um novo deploy.
- **Domínio próprio:** adicione-o em Custom domains, no painel do projeto, troque `site` no
  `astro.config.ts` (`https://dominio`, sem caminho) e faça um novo deploy. O `*.pages.dev`
  continua no ar, com canonical apontando para o domínio novo. As imagens OG não mudam.
- Deploys de preview (outros branches) saem em `<hash>.kaiju-no-8-fansite.pages.dev`, com canonical
  para a produção.
- Cloudflare Web Analytics está ligado no painel: a Cloudflare injeta em todo HTML um
  `<script defer src="https://static.cloudflareinsights.com/beacon.min.js">`, e o beacon envia a
  visita para `cloudflareinsights.com`. O `policy.ts` (`CLOUDFLARE_WEB_ANALYTICS`) libera as duas
  origens, em `script-src` e `connect-src`. Sem isso, a CSP bloqueia o beacon e todo carregamento
  loga um erro no console (achado pelos testes E2E contra o site no ar). Se desligar o analytics,
  tire as duas origens.
- Limites do plano grátis: 20.000 arquivos por deploy e 25 MiB por arquivo. Hoje: 171 arquivos,
  12 MB no total, maior arquivo 2,1 MiB (o loop do Reno).
- Testar local como na Cloudflare: `npx wrangler pages dev dist` aplica o `_headers` e as 404 por
  pasta. Reinicie depois de cada build (ele só lê o `_headers` ao subir). `npm run preview` não
  aplica headers.

## Testes E2E

- `npm run test:e2e` roda `npm run build` e depois o Playwright (`playwright.config.ts`, specs em
  `tests/e2e/`, só Chromium). É a revisão final antes de um deploy. Numa máquina nova, baixe o
  navegador uma vez: `npx playwright install --only-shell chromium`.
- `tests/support/global-setup.ts` serve o `dist/` com `tests/support/pages-server.ts`, que imita a
  Cloudflare Pages: aplica o `dist/_headers` (inclusive o `! Cache-Control`), redireciona pasta sem
  barra (308) e responde com a 404 mais próxima, status 404. Sem `dist/_headers` ele para e pede o
  build. `npx playwright test` sozinho reaproveita o `dist/` atual.
- `BASE_URL=https://kaiju-no-8-fansite.pages.dev npx playwright test` roda a mesma bateria contra o
  site publicado, sem servidor local.
- Nada sai para a rede: o fixture de `tests/support/test.ts` responde o YouTube (thumbnail e player)
  e o beacon do Web Analytics (que só existe no site publicado) com stubs e aborta qualquer outra
  origem. A CSP age antes do roteamento, então uma origem
  bloqueada ainda aparece como violação no console.
- Cobertura: redirect da raiz (idioma do navegador, escolha salva, query e hash, links quando o
  script não roda, meta refresh sem JS); headers e cache; CSP no navegador (cada idioma percorrido
  até o fim, relatório revelado e trailer tocado, sem erro nem violação no console); preloader
  (fontes e imagens da primeira dobra prontas na revelação, Tab no skip link, fragmento, timeout
  com fonte travada, failsafe de CSS sem os módulos, reduced motion, sem JS); seletor de idioma
  (nome acessível, Esc, clique fora, foco saindo, escolha lembrada, rodapé, sem JS); 404 por idioma;
  SEO (canonical, hreflang, OG, JSON-LD com os autores, sitemap).
- Rolagem nos testes usa `behavior: 'instant'`: o `base.css` liga `scroll-behavior: smooth`.

## Decisões técnicas

- Node 24 LTS: Astro 7 exige Node ≥ 22.12 e eslint-plugin-astro exige ^22.22.3 ou ^24.16.
- TypeScript 6 em vez de 7: `@astrojs/check` e `typescript-eslint` ainda não aceitam o TS 7.
- `eslint-plugin-jsx-a11y-x`: o `eslint-plugin-jsx-a11y` original não suporta ESLint 10.
- Fontaine em vez da Fonts API do Astro: a Fonts API exige o arquivo no build, e a Noto Sans JP
  pode faltar até o subset ser gerado.
- CSP própria em vez de `security.csp`: sem adapter, o Astro só emite `<meta>`, e meta CSP não
  aceita `frame-ancestors`.
- Lint com tipos (`strictTypeChecked`) nos `.ts`; `.astro` usa regras sem tipos porque a lógica
  mora nos `.ts`.
- Uma rota dinâmica `[locale]` em vez de três páginas iguais.

## Git e GitHub

- Repositório: `github.com/petrecaLeo/kaiju-no-8-3rd-season-fansite` (público, branch `main`).
- **Autor de commits e PRs: sempre e só petrecaLeo** (`leopetrecca@gmail.com`, definido no
  `.git/config` local). Nunca acrescente `Co-Authored-By`, "Generated with Claude Code" ou outra
  menção ao Claude em mensagem de commit, descrição de PR ou arquivo do repositório.
- Tudo que aparece no GitHub fica em inglês: README, descrição e tópicos do repositório e
  mensagens de commit e de PR. `CLAUDE.md` e `pendencies.md` continuam em pt-BR.
- Os prints do README ficam em `.github/readme/`. Se o visual mudar, refaça-os com o build de
  produção (o dev mostra a barra de ferramentas do Astro).

## Pendências

Lista viva em [`pendencies.md`](./pendencies.md). Ao resolver um item, marque-o lá.
