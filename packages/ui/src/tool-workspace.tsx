import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, Check, Copy, Download, FileText, LoaderCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { Button } from './components/ui/button';
import type { ToolDefinition, Values } from './registry';
const initialValues = (tool: ToolDefinition) => Object.fromEntries(tool.fields?.map(field => [field.key, field.defaultValue]) ?? []);
const CodeEditor = lazy(() => import('./code-editor'));
export interface ToolWorkspaceProps { tool: ToolDefinition; dark: boolean; notify: (message: string) => void }
export function ToolWorkspace({ tool, dark, notify }: ToolWorkspaceProps) {
  const [input, setInput] = useState('');
  const [second, setSecond] = useState('');
  const [values, setValues] = useState<Values>(() => initialValues(tool));
  const [output, setOutput] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const controller = useRef<AbortController | null>(null);
  const revision = useRef(0);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const invalidate = useCallback(() => {
    revision.current++; controller.current?.abort(); setBusy(false); setOutput(null); setError(''); setCopied(false);
  }, []);
  const reset = useCallback(() => { invalidate(); setInput(''); setSecond(''); setValues(initialValues(tool)); notify('Inputs and results cleared.'); }, [invalidate, tool, notify]);
  const run = useCallback(async () => {
    controller.current?.abort();
    const abort = new AbortController(); controller.current = abort;
    const version = ++revision.current;
    setBusy(true); setError(''); setOutput(null); setCopied(false);
    try {
      const result = await tool.run(input, values, second, abort.signal);
      if (revision.current === version) { setOutput(result); notify('Done. Result is ready.'); }
    } catch (failure) {
      if (revision.current === version) setError(failure instanceof Error ? failure.message : 'Something went wrong. Check your input and try again.');
    } finally { if (revision.current === version) setBusy(false); }
  }, [tool, input, values, second, notify]);
  useEffect(() => {
    const execute = () => { void run(); };
    window.addEventListener('devkit:run', execute); window.addEventListener('devkit:reset', reset);
    return () => { window.removeEventListener('devkit:run', execute); window.removeEventListener('devkit:reset', reset); };
  }, [run, reset]);
  useEffect(() => () => { revision.current++; controller.current?.abort(); clearTimeout(copyTimer.current); }, []);
  async function copy() {
    try { await navigator.clipboard.writeText(output ?? ''); setCopied(true); notify('Copied to clipboard.'); clearTimeout(copyTimer.current); copyTimer.current = setTimeout(() => setCopied(false), 2000); }
    catch { notify('Clipboard access failed. Select and copy the result manually.'); }
  }
  const language = tool.id.startsWith('json') || ['jwt', 'timestamp', 'cron', 'regex', 'color', 'word-count'].includes(tool.id) ? 'json' : tool.id === 'sql-formatter' ? 'sql' : undefined;
  const edit = (value: string, secondary = false) => { invalidate(); (secondary ? setSecond : setInput)(value); };
  const errorId = `tool-error-${tool.id}`;
  return <section className="workspace" aria-label={`${tool.name} workspace`}>
    <div className="workspace-toolbar">
      <span className={`workspace-caption ${busy ? 'is-busy' : ''}`}>{busy ? 'Processing locally' : output !== null ? 'Result ready' : 'Local workspace'}</span>
      <div className="toolbar-actions">
        {tool.sample && <Button variant="ghost" size="small" onClick={() => { invalidate(); setInput(tool.sample!); setSecond(tool.secondSample ?? ''); setValues(initialValues(tool)); notify('Example loaded.'); }}><FileText size={15} /> Load example</Button>}
        <Button variant="ghost" size="small" onClick={reset}><RotateCcw size={15} /> Reset</Button>
      </div>
    </div>
    {tool.fields && <div className="field-grid">{tool.fields.map(field => <label className="field" key={field.key}><span>{field.label}</span>{field.kind === 'select' ? <select value={values[field.key]} onChange={e => { invalidate(); setValues({ ...values, [field.key]: e.target.value }); }}>{field.options!.map(option => <option key={option}>{option}</option>)}</select> : <input type={field.kind ?? 'text'} value={values[field.key]} min={field.min} max={field.max} maxLength={4096} spellCheck={false} autoComplete="off" onChange={e => { invalidate(); setValues({ ...values, [field.key]: e.target.value }); }} />}</label>)}</div>}
    <div className={`workspace-body ${tool.input && !tool.secondInput ? 'split-workspace' : ''}`}>
      <div className="workspace-input">
        <div className={tool.secondInput ? 'editor-grid' : ''}>
          {tool.input && <div className={`editor-panel ${error ? 'has-error' : ''}`}><div className="panel-heading"><span>{tool.input}</span><span className="character-count">{input.length.toLocaleString()} chars</span></div><Suspense fallback={<textarea aria-label={tool.input} value={input} aria-invalid={!!error} aria-describedby={error ? errorId : undefined} onChange={e => edit(e.target.value)} />}><CodeEditor label={tool.input} value={input} onChange={edit} dark={dark} language={language} invalid={!!error} describedBy={error ? errorId : undefined} placeholder="Paste or type your input here…" /></Suspense></div>}
          {tool.secondInput && <div className="editor-panel"><div className="panel-heading"><span>{tool.secondInput}</span><span className="character-count">{second.length.toLocaleString()} chars</span></div><Suspense fallback={<textarea aria-label={tool.secondInput} value={second} onChange={e => edit(e.target.value, true)} />}><CodeEditor label={tool.secondInput} value={second} onChange={value => edit(value, true)} dark={dark} placeholder="Paste or type the changed text…" /></Suspense></div>}
        </div>
        {error && <div className="error-message" id={errorId} role="alert"><AlertCircle size={18} /><div><strong>Check your input or settings</strong><p>{error}</p></div></div>}
        <div className="run-row"><Button onClick={() => void run()} disabled={busy}>{busy ? <LoaderCircle className="spinner" size={17} /> : null}{busy ? 'Working…' : tool.action}{!busy && <ArrowRight size={17} />}</Button><span className="shortcut-hint"><kbd>⌘ / Ctrl</kbd> + <kbd>Enter</kbd></span></div>
        {tool.note && <p className="tool-note"><ShieldCheck size={17} /><span>{tool.note}</span></p>}
      </div>
      <div className="output-panel" aria-busy={busy}>
        <div className="panel-heading"><span className="output-label">Output{output !== null && <span className="result-indicator"><Check size={13} /> Ready</span>}</span><div className="toolbar-actions">
          {tool.preview === 'qr' && output !== null && <Button variant="ghost" size="small" asChild><a href={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(output)}`} download="devkit-qr.svg"><Download size={15} /> SVG</a></Button>}
          <Button variant="ghost" size="small" disabled={output === null} title={output === null ? 'Run the tool to create a result' : 'Copy result'} onClick={() => void copy()}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? 'Copied' : 'Copy'}</Button>
        </div></div>
        {output === null ? <div className="empty-output"><span className="empty-icon">{busy ? <LoaderCircle className="spinner" size={23} /> : <ArrowRight size={23} />}</span><p>{busy ? 'Processing your input…' : 'Your result will appear here'}</p><span>{busy ? 'Everything is running on your device.' : tool.input ? 'Add your input, then run the tool.' : 'Choose your settings, then run the tool.'}</span></div> : <>
          {tool.preview === 'qr' && <div className="qr-preview"><img width="260" height="260" alt="Generated QR code" src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(output)}`} /></div>}
          {tool.preview === 'color' && <div className="color-preview" style={{ background: (JSON.parse(output) as { hex: string }).hex }} role="img" aria-label="Color preview" />}
          {tool.preview === 'gradient' && <div className="color-preview" style={{ background: output.replace(/^background: /, '').replace(/;$/, '') }} role="img" aria-label="Gradient preview" />}
          <Suspense fallback={<pre className="plain-output">{output}</pre>}><CodeEditor label="Tool result" value={output} readOnly dark={dark} language={tool.outputLanguage ?? language} /></Suspense>
        </>}
      </div>
    </div>
  </section>;
}
