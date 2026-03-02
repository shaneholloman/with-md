import { describe, expect, it } from 'vitest';

import { evaluateMarkdownQuality } from '@/lib/with-md/web2md/quality-gate';

describe('evaluateMarkdownQuality', () => {
  it('accepts reasonable markdown with source context', () => {
    const sourceText = 'This article explains a test plan. It has steps and expected outcomes. '.repeat(10);
    const markdown = [
      '# Test Plan',
      '',
      'This article explains a test plan and expected outcomes in detail.',
      'It covers preparation, execution checkpoints, rollback handling, and validation criteria.',
      'The goal is to make sure each step has observable outcomes and minimal ambiguity.',
      '',
      '- Step one',
      '- Step two',
      '- Step three',
      '- Step four',
      '- Step five',
      '',
      '## Notes',
      '',
      'Further implementation details are included for validation.',
      'This includes expected logs, sample assertions, and success/failure interpretation.',
      'The document should be sufficient for someone else to execute the plan without extra context.',
    ].join('\n');

    const result = evaluateMarkdownQuality({
      markdown,
      sourceText,
      sourceTitle: 'Test Plan',
      structure: {
        linkCount: 2,
        listItemCount: 6,
        codeBlockCount: 0,
        tableCount: 0,
      },
    });

    expect(result.passed).toBe(true);
    expect(result.score).toBeGreaterThan(0.6);
  });

  it('rejects very short markdown', () => {
    const result = evaluateMarkdownQuality({
      markdown: '# Hi\n\nshort',
      sourceText: 'Long source text '.repeat(100),
      sourceTitle: 'Long source text',
      structure: {
        linkCount: 3,
        listItemCount: 8,
        codeBlockCount: 0,
        tableCount: 0,
      },
    });

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain('markdown_too_short');
  });

  it('rejects blocked/captcha pages even if markdown is long', () => {
    const result = evaluateMarkdownQuality({
      markdown: [
        '# Example',
        '',
        'Warning: This page maybe not yet fully loaded.',
        'Warning: This page maybe requiring CAPTCHA, please make sure you are authorized to access this page.',
        '',
        'We had to rate limit your IP address.',
        '',
        'Content content content content content content content content content content.',
        'Content content content content content content content content content content.',
        'Content content content content content content content content content content.',
        'Content content content content content content content content content content.',
      ].join('\n'),
    });

    expect(result.passed).toBe(false);
    expect(result.reasons).toContain('blocked_or_captcha_page');
  });

  it('does not mark long normal content as blocked when warning words appear later', () => {
    const intro = [
      '# Building a search engine',
      '',
      'This is a long technical write-up that explains architecture, indexing, chunking, and ranking.',
      'It includes implementation details, tradeoffs, and lessons learned from experimentation.',
      'The beginning of the post is normal article content and does not represent an access challenge page.',
    ].join('\n');
    const filler = 'Detailed content about indexing and retrieval quality. '.repeat(140);
    const warningMentions = [
      '',
      'In a later section, we discuss handling captcha systems and rate limits in crawlers.',
      'These are normal mentions in prose, not a blocked page response.',
    ].join('\n');

    const result = evaluateMarkdownQuality({
      markdown: `${intro}\n\n${filler}\n${warningMentions}`,
      sourceText: `${intro} ${filler} ${warningMentions}`,
      sourceTitle: 'Building a search engine',
      structure: {
        linkCount: 10,
        listItemCount: 5,
        codeBlockCount: 0,
        tableCount: 0,
      },
    });

    expect(result.reasons).not.toContain('blocked_or_captcha_page');
    expect(result.score).toBeGreaterThan(0.6);
    expect(result.passed).toBe(true);
  });
});
