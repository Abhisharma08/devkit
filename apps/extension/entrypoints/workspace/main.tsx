import React from 'react';
import { createRoot } from 'react-dom/client';
import { DevKitApp } from '@devkit/ui';
import '@devkit/ui/styles.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><DevKitApp surface="workspace" /></React.StrictMode>);
