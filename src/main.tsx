// Initialize MobX configuration before anything else
import './config/mobx.config';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { FocusBehaviorProvider } from './contexts/FocusBehaviorContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FocusBehaviorProvider>
      <App />
    </FocusBehaviorProvider>
  </React.StrictMode>
);