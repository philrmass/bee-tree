import { LocationProvider, Router, Route, useLocation } from 'preact-iso';
import { Play } from './play/Play.jsx';
import { Lists } from './lists/Lists.jsx';
import { Stats } from './stats/Stats.jsx';

function Tabs() {
  const { path } = useLocation();
  const tab = path.startsWith('/stats') ? 'stats' : path.startsWith('/lists') ? 'lists' : 'play';
  return (
    <nav class="tabs">
      <a href="/" class={tab === 'play' ? 'active' : ''}>Play</a>
      <a href="/stats" class={tab === 'stats' ? 'active' : ''}>Stats</a>
      <a href="/lists" class={tab === 'lists' ? 'active' : ''}>Lists</a>
    </nav>
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
        <Route path="/stats" component={Stats} />
        <Route path="/stats/:date" component={Stats} />
        <Route path="/lists" component={Lists} />
        <Route default component={NotFound} />
      </Router>
    </LocationProvider>
  );
}
