import { Prec } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { color, oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark';

export const codeTheme = [
  oneDarkTheme,
  syntaxHighlighting(HighlightStyle.define(oneDarkHighlightStyle.specs.map(spec => ({
    ...spec,
    color: spec.color === color.stone ? '#abb2bf' : spec.color === color.coral ? '#f08e97' : spec.color,
  })))),
  Prec.highest(EditorView.theme({
    '.cm-gutters': { color: '#abb2bf' },
    '.cm-activeLineGutter': { color: '#e5e7eb' },
  }, { dark: true })),
];
