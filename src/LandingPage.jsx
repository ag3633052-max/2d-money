import BusinessTracker from './BusinessTracker.jsx';

export default function LandingPage({ onStartDemo }) {
  return (
    <div style={{ minHeight: '100vh', background: '#050816', color: '#f8fafc', padding: '40px', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '3rem', margin: '0 0 16px', lineHeight: '1.05' }}>LeyDownlines</h1>
            <p style={{ fontSize: '1.05rem', color: '#cbd5e1', maxWidth: '680px' }}>
              A visual money-flow system with branches, growth pressure, and emergent token behavior. Now with RPG-style rank progression, recruiting, and commission flow. Build fast, test concepts, and show users a working demo in minutes.
            </p>
          </div>
          <button
            onClick={onStartDemo}
            style={{ background: '#2563eb', color: '#fff', border: 'none', borderRadius: '10px', padding: '14px 22px', cursor: 'pointer', fontSize: '0.95rem' }}
          >
            Start Demo
          </button>
        </div>

        <section style={{ display: 'grid', gap: '24px', marginBottom: '40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '18px' }}>
            <div style={{ padding: '20px', background: '#0f172a', borderRadius: '18px', border: '1px solid #334155' }}>
              <h2 style={{ margin: '0 0 12px', color: '#fff' }}>Validate quickly</h2>
              <p style={{ margin: 0, color: '#cbd5e1' }}>Show the idea to people and collect feedback from the first interactive prototype.</p>
            </div>
            <div style={{ padding: '20px', background: '#0f172a', borderRadius: '18px', border: '1px solid #334155' }}>
              <h2 style={{ margin: '0 0 12px', color: '#fff' }}>Keep it simple</h2>
              <p style={{ margin: 0, color: '#cbd5e1' }}>Focus on a single value: flow simulation, money pressure, or decision discovery.</p>
            </div>
            <div style={{ padding: '20px', background: '#0f172a', borderRadius: '18px', border: '1px solid #334155' }}>
              <h2 style={{ margin: '0 0 12px', color: '#fff' }}>Iterate faster</h2>
              <p style={{ margin: 0, color: '#cbd5e1' }}>Use the demo as your MVP and improve from real use, not guesses.</p>
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gap: '18px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '12px', color: '#fff' }}>What the product is</h2>
          <p style={{ margin: 0, color: '#cbd5e1' }}>
            This is a prototype for a system where entities carry balance, share value across links, and react to pressure inside a zone. It can become a teaching tool, an economic sandbox, or a novel finance game.
          </p>
          <ul style={{ margin: '16px 0 0 20px', color: '#cbd5e1' }}>
            <li>Visual card nodes with balances and link-based flows.</li>
            <li>Branch history for state exploration.</li>
            <li>Keyboard interaction and automated spawn behavior.</li>
          </ul>
        </section>

        <section style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div style={{ padding: '20px', background: '#0f172a', borderRadius: '18px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 10px', color: '#fff' }}>First step</h3>
            <p style={{ margin: 0, color: '#cbd5e1' }}>Use the demo to show an interactive prototype to your first users and ask whether they would want this as a tool or product.</p>
          </div>
          <div style={{ padding: '20px', background: '#0f172a', borderRadius: '18px', border: '1px solid #334155' }}>
            <h3 style={{ margin: '0 0 10px', color: '#fff' }}>Next step</h3>
            <p style={{ margin: 0, color: '#cbd5e1' }}>Capture feedback, refine the UX, and decide whether to position it as a demo engine, educational kit, or finance experiment.</p>
          </div>
        </section>

        <BusinessTracker />
      </div>
    </div>
  );
}
