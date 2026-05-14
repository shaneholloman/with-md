import type { Components } from 'react-markdown';

export const proseMarkdownComponents: Components = {
  table: ({ node, ...props }) => (
    <div className="withmd-prose-table-scroll">
      <table {...props} />
    </div>
  ),
};
