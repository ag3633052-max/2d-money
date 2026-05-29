import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // keep a console copy
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'Inter, system-ui', color: '#fff', background: '#111', minHeight: '100vh' }}>
          <h2 style={{ marginTop: 0 }}>LeyDownlines — Runtime Error</h2>
          <div style={{ color: '#f87171', marginBottom: 12 }}>{String(this.state.error)}</div>
          <details style={{ whiteSpace: 'pre-wrap', color: '#cbd5e1' }}>
            {this.state.info?.componentStack}
          </details>
          <div style={{ marginTop: 16 }}>
            <button onClick={() => location.reload()} style={{ padding: '8px 12px', borderRadius: 8 }}>Reload</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
