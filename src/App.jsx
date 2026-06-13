import ErrorBoundary from './ErrorBoundary.jsx';
import GallifreyanOS from './GallifreyanOS.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <GallifreyanOS />
    </ErrorBoundary>
  );
}
