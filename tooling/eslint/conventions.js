export const MAX_LINES = 200;

export const CSS_LAYER_ORDER = ['reset', 'tokens', 'base', 'components', 'utilities'];

export const COMPONENT_GROUPS = [
  'characters',
  'footer',
  'head',
  'hero',
  'layout',
  'recap',
  'sections',
  'synopsis',
  'ui',
];

export const INLINE_REDIRECT_COMPONENT = 'src/components/head/LocaleRedirect/LocaleRedirect.astro';

// A JSON-LD data block never runs, so the CSP does not apply to it; set:html keeps its JSON unescaped.
export const JSON_LD_COMPONENT = 'src/components/head/JsonLd/JsonLd.astro';

export const NAMING_CONVENTION = [
  { selector: 'default', format: ['camelCase'] },
  { selector: 'import', format: ['camelCase', 'PascalCase'] },
  { selector: 'variable', format: ['camelCase', 'UPPER_CASE'] },
  { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
  { selector: 'typeLike', format: ['PascalCase'] },
  {
    selector: ['objectLiteralProperty', 'objectLiteralMethod', 'typeProperty'],
    modifiers: ['requiresQuotes'],
    format: null,
  },
];

// Astro renders a variable as a component only when its name is capitalized (`const Flag = …`).
export const ASTRO_NAMING_CONVENTION = NAMING_CONVENTION.map((option) =>
  option.selector === 'variable' ? { ...option, format: [...option.format, 'PascalCase'] } : option,
);

export const CSP_SAFE_TEMPLATE = [
  {
    selector: "JSXElement[openingElement.name.name='style']",
    message: 'Keep styles in the component .css file imported in the frontmatter.',
  },
  {
    selector: "JSXAttribute[name.name='style']",
    message: 'Inline style attributes are blocked by the Content-Security-Policy; use a class.',
  },
  {
    selector: "JSXAttribute[name.namespace.name='define']",
    message: 'define:vars emits inline code that the Content-Security-Policy blocks.',
  },
];

export const NO_INLINE_SCRIPT = {
  selector: "JSXAttribute[name.namespace.name='is'][name.name.name='inline']",
  message: 'Load behaviour from a .client.ts file with <script src>; is:inline skips bundling.',
};

export const NO_HARDCODED_TEXT = [
  {
    selector: 'JSXText[value=/\\S/]',
    message: 'User-facing text belongs in src/i18n/dictionaries/*.json.',
  },
  {
    selector:
      'JSXAttribute[name.name=/^(alt|title|placeholder|aria-label|aria-description|aria-roledescription|aria-valuetext)$/] > Literal[value=/\\S/]',
    message: 'User-facing attribute text belongs in src/i18n/dictionaries/*.json.',
  },
];

export const TEMPLATE_LOGIC = [
  'FunctionDeclaration',
  'ClassDeclaration',
  'VariableDeclarator > :matches(ArrowFunctionExpression, FunctionExpression)',
  'IfStatement',
  'SwitchStatement',
  'TryStatement',
  'ForStatement',
  'ForInStatement',
  'ForOfStatement',
  'WhileStatement',
  'DoWhileStatement',
].map((selector) => ({
  selector,
  message: '.astro files hold structure and imports; move this logic to a .ts module.',
}));

export const RAW_COLORS = [
  { selector: 'Hash', message: 'Use a color token from src/styles/tokens.css.' },
  {
    selector: 'Function[name=/^(rgba?|hsla?|hwb|lab|lch|oklab|oklch|color|color-mix)$/i]',
    message: 'Use a color token from src/styles/tokens.css.',
  },
];

export const GSAP_ENTRY_POINT = {
  group: ['gsap', 'gsap/*'],
  message: 'Import GSAP through @/lib/motion so animations honour reduced motion.',
};
