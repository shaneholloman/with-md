import { Node } from '@tiptap/core';

export const MermaidBlock = Node.create({
  name: 'mermaidBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: false,
  markdownTokenName: 'code',

  addAttributes() {
    return {
      code: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-mermaid-block]' }];
  },

  renderHTML({ node }) {
    return ['div', { 'data-mermaid-block': '', 'data-mermaid-source': node.attrs.code }];
  },

  parseMarkdown(token, helpers) {
    if (token.type !== 'code') return [];
    if ((token.lang || '').trim().toLowerCase() !== 'mermaid') return [];
    return helpers.createNode('mermaidBlock', { code: token.text || '' }, []);
  },

  renderMarkdown(node) {
    const code = (node.attrs?.code as string) || '';
    return ['```mermaid', code, '```'].join('\n');
  },
});
