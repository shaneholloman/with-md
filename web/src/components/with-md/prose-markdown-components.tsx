'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { Components } from 'react-markdown';
import { renderMermaidSVG } from 'beautiful-mermaid';

function MermaidPreview({ code }: { code: string }) {
  const { svg, error } = useMemo(() => {
    try {
      return {
        svg: renderMermaidSVG(code, {
          bg: 'var(--background, #ffffff)',
          fg: 'var(--foreground, #27272a)',
          transparent: true,
          font: 'Geist, ui-sans-serif, system-ui, sans-serif',
        }),
        error: null as string | null,
      };
    } catch (err) {
      return { svg: null, error: err instanceof Error ? err.message : String(err) };
    }
  }, [code]);

  const [scale, setScale] = useState(1);
  const [showLabel, setShowLabel] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(null);

  const onWheel = useCallback((e: React.WheelEvent) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    e.stopPropagation();
    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.min(3, Math.max(0.15, s * factor)));
    setShowLabel(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setShowLabel(false), 1200);
  }, []);

  if (error) {
    return (
      <pre className="withmd-mermaid-error">{`Mermaid render error:\n${error}\n\n${code}`}</pre>
    );
  }
  return (
    <div className="withmd-mermaid-block" onWheel={onWheel}>
      <div className="withmd-mermaid-viewport">
        <div className="withmd-mermaid-zoom" style={{ transform: `scale(${scale})` }}>
          <div className="withmd-mermaid-svg" dangerouslySetInnerHTML={{ __html: svg ?? '' }} />
        </div>
      </div>
      {showLabel && <span className="withmd-mermaid-zoom-label">{Math.round(scale * 100)}%</span>}
    </div>
  );
}

function isMermaidFence(node: unknown): { mermaid: boolean; source: string } {
  // node is a hast Element from rehype; `pre > code` for fenced blocks.
  const root = node as {
    children?: Array<{
      type?: string;
      tagName?: string;
      properties?: { className?: string[] | string };
      children?: Array<{ type?: string; value?: string }>;
    }>;
  } | null;
  const code = root?.children?.find((child) => child?.tagName === 'code');
  if (!code) return { mermaid: false, source: '' };
  const rawClass = code.properties?.className;
  const classList = Array.isArray(rawClass) ? rawClass : typeof rawClass === 'string' ? [rawClass] : [];
  const hasMermaid = classList.some((c) => typeof c === 'string' && c.toLowerCase() === 'language-mermaid');
  if (!hasMermaid) return { mermaid: false, source: '' };
  const source = (code.children || [])
    .filter((c) => c?.type === 'text')
    .map((c) => c.value ?? '')
    .join('')
    .replace(/\n$/, '');
  return { mermaid: true, source };
}

export const proseMarkdownComponents: Components = {
  table: ({ node, ...props }) => (
    <div className="withmd-prose-table-scroll">
      <table {...props} />
    </div>
  ),
  pre: ({ node, children, ...props }) => {
    const detected = isMermaidFence(node);
    if (detected.mermaid) {
      return <MermaidPreview code={detected.source} />;
    }
    return <pre {...props}>{children}</pre>;
  },
};
