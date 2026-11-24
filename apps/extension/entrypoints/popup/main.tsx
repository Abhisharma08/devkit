import React from 'react';
import { createRoot } from 'react-dom/client';
import { DevKitApp } from '@devkit/ui';
import '@devkit/ui/styles.css';
import { browser } from 'wxt/browser';
const openWorkspace = () => {
  void browser.tabs.create({ url: browser.runtime.getURL('/workspace.html') }).catch(() => {
    window.alert('Unable to open the workspace. Please reopen DevKit and try again.');
  });
};
async function mount() {
  // Resolve the concrete window before displaying the button. The click handler
  // calls sidePanel.open synchronously to retain Chrome's user gesture.
  let windowId: number | undefined;
  try { windowId = (await browser.windows.getCurrent()).id; } catch { /* Native menu remains available. */ }
  const openSidePanel = () => {
    if (windowId === undefined) { window.alert('Use Chrome’s side panel menu to select DevKit.'); return; }
    void browser.sidePanel.open({ windowId }).catch(() => {
      window.alert('Unable to open the side panel. Use Chrome’s side panel menu to select DevKit.');
    });
  };
  createRoot(document.getElementById('root')!).render(<React.StrictMode><DevKitApp surface="popup" openWorkspace={openWorkspace} openSidePanel={openSidePanel} /></React.StrictMode>);
}
void mount();
