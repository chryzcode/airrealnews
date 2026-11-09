import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Safety net for syndicated wire images: some external sources return 401/403
// (hotlink protection) or go offline, which would otherwise show a broken-image
// icon. Swap any failed image for a neutral ARN placeholder exactly once.
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';

window.addEventListener(
  'error',
  (event) => {
    const target = event.target as HTMLImageElement | null;
    if (target && target.tagName === 'IMG' && target.src !== FALLBACK_IMAGE) {
      target.src = FALLBACK_IMAGE;
    }
  },
  true,
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

