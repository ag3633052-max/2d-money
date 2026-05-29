import ErrorBoundary from './ErrorBoundary.jsx';
import CardField from './CardField.jsx';

export default function App() {
  return (
    <ErrorBoundary>
      <CardField />
    </ErrorBoundary>
  );
}
