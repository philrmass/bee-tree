import { LocationProvider, Router, Route, useLocation } from 'preact-iso';
import { Play } from './play/Play.jsx';

function Tabs() {
  const { path } = useLocation();
  const tab = path.startsWith('/solver') ? 'solver' : path.startsWith('/lists') ? 'lists' : 'play';
  return (
    <nav class="tabs">
      <a href="/" class={tab === 'play' ? 'active' : ''}>Play</a>
      <a href="/solver" class={tab === 'solver' ? 'active' : ''}>Solver</a>
      <a href="/lists" class={tab === 'lists' ? 'active' : ''}>Lists</a>
    </nav>
  );
}

function Placeholder({ title }) {
  return (
    <main class="page">
      <p class="muted">{title} is coming next.</p>
    </main>
  );
}

function NotFound() {
  return (
    <main class="page">
      <p class="muted">
        Page not found. <a href="/">Go to today's puzzle</a>
      </p>
    </main>
  );
}

export function App() {
  return (
    <LocationProvider>
      <header class="app-header">
        <a href="/" class="brand">Bee Tree</a>
        <Tabs />
      </header>
      <Router>
        <Route path="/" component={Play} />
        <Route path="/play/:date" component={Play} />
        <Route path="/solver" component={() => <Placeholder title="Solver" />} />
        <Route path="/lists" component={() => <Placeholder title="Lists" />} />
        <Route default component={NotFound} />
      </Router>
    </LocationProvider>
  );
}
