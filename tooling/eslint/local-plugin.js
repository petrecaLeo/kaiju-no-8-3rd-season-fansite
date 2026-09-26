const maxCssLines = {
  meta: {
    type: 'suggestion',
    docs: { description: 'Limit the number of non-blank lines in a CSS file' },
    schema: [
      {
        type: 'object',
        properties: { max: { type: 'integer', minimum: 1 } },
        additionalProperties: false,
      },
    ],
    defaultOptions: [{ max: 200 }],
    messages: {
      tooLong: 'File has {{actual}} non-blank lines. Maximum allowed is {{max}}; split it.',
    },
  },
  create(context) {
    const [{ max }] = context.options;
    return {
      'StyleSheet:exit'(node) {
        const actual = context.sourceCode.lines.filter((line) => line.trim() !== '').length;
        if (actual > max) {
          context.report({ node, messageId: 'tooLong', data: { actual, max } });
        }
      },
    };
  },
};

const normalizeLayerList = (text) =>
  text
    .split(',')
    .map((name) => name.trim())
    .join(', ');

const cssLayerOrder = {
  meta: {
    type: 'problem',
    docs: { description: 'Require CSS entry files to open with the canonical @layer order' },
    schema: [
      {
        type: 'object',
        properties: { order: { type: 'array', items: { type: 'string' }, minItems: 1 } },
        required: ['order'],
        additionalProperties: false,
      },
    ],
    messages: {
      missing:
        'Start the file with "@layer {{expected}};" so layer priority never depends on bundle order.',
    },
  },
  create(context) {
    const expected = context.options[0].order.join(', ');
    return {
      StyleSheet(node) {
        const [first] = node.children;
        const declaresOrder =
          first?.type === 'Atrule' &&
          first.name === 'layer' &&
          first.block === null &&
          normalizeLayerList(context.sourceCode.getText(first.prelude)) === expected;
        if (!declaresOrder) {
          context.report({ node: first ?? node, messageId: 'missing', data: { expected } });
        }
      },
    };
  },
};

export default {
  meta: { name: 'local' },
  rules: {
    'css-layer-order': cssLayerOrder,
    'max-css-lines': maxCssLines,
  },
};
