import { Component, type ReactNode } from 'react';
export class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="mx-auto max-w-xl px-6 py-16"><h1>The workspace could not load.</h1><p className="subtitle">Reload DevKit to start a fresh workspace. Unsaved inputs will be cleared.</p><button className="button button-primary mt-6" onClick={() => location.reload()}>Reload DevKit</button></main>;
    return this.props.children;
  }
}
