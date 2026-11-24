import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
export default function CodeEditor({ value, onChange, label, language, dark, readOnly = false, invalid = false, describedBy, placeholder }: { value: string; onChange?: (value: string) => void; label: string; language?: string; dark: boolean; readOnly?: boolean; invalid?: boolean; describedBy?: string; placeholder?: string }) {
  return <CodeMirror value={value} onChange={value => onChange?.(value)} height="var(--editor-height, 320px)" placeholder={placeholder} theme={dark ? oneDark : 'light'} editable={!readOnly} readOnly={readOnly}
    extensions={[EditorView.lineWrapping, EditorView.contentAttributes.of({ 'aria-label': label, 'aria-multiline': 'true', 'aria-readonly': String(readOnly), 'aria-invalid': String(invalid), ...(describedBy ? { 'aria-describedby': describedBy } : {}), role: 'textbox' }), ...(language === 'json' ? [json()] : language === 'sql' ? [sql()] : [])]}
    basicSetup={{ lineNumbers: true, foldGutter: true, highlightActiveLine: !readOnly, autocompletion: !readOnly }} />;
}
