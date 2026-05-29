import { useEffect, useState } from 'react';

const categories = [
  { value: 'problem', label: 'Problem' },
  { value: 'customer', label: 'Customer' },
  { value: 'value', label: 'Value' },
  { value: 'price', label: 'Price model' },
  { value: 'feedback', label: 'Feedback' }
];

export default function BusinessTracker() {
  const [insights, setInsights] = useState(() => {
    const saved = localStorage.getItem('business_insights');
    return saved ? JSON.parse(saved) : [];
  });
  const [category, setCategory] = useState('problem');
  const [text, setText] = useState('');

  useEffect(() => {
    localStorage.setItem('business_insights', JSON.stringify(insights));
  }, [insights]);

  const addInsight = () => {
    if (!text.trim()) return;
    const next = [
      { id: `i_${Date.now()}`, category, text: text.trim(), created: new Date().toLocaleString() },
      ...insights
    ];
    setInsights(next);
    setText('');
  };

  const stats = insights.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <section style={{ marginTop: '42px', padding: '24px', background: '#0f172a', borderRadius: '20px', border: '1px solid #334155' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div>
          <h2 style={{ margin: '0 0 10px', color: '#fff' }}>Business Data Tracker</h2>
          <p style={{ margin: 0, color: '#cbd5e1' }}>Capture the core product insights investors care about and keep them as structured data.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(100px, 1fr))', gap: '10px', width: '100%', maxWidth: '420px' }}>
          {categories.slice(0, 3).map(cat => (
            <div key={cat.value} style={{ padding: '12px', background: '#08101f', borderRadius: '14px', color: '#cbd5e1', fontSize: '0.82rem' }}>
              <div style={{ color: '#fff', fontWeight: 700 }}>{cat.label}</div>
              <div>{stats[cat.value] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: '20px', display: 'grid', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: '1 1 220px', padding: '12px', borderRadius: '12px', border: '1px solid #334155', background: '#020617', color: '#fff' }}>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
          <button onClick={addInsight} style={{ padding: '12px 18px', borderRadius: '12px', border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer' }}>
            Save insight
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter a product insight, customer note, pricing thought, or feedback log"
          style={{ minHeight: '100px', width: '100%', padding: '14px', borderRadius: '14px', border: '1px solid #334155', background: '#020617', color: '#fff', fontSize: '0.95rem' }}
        />

        <div style={{ display: 'grid', gap: '10px' }}>
          {insights.slice(0, 6).map((item) => (
            <div key={item.id} style={{ padding: '14px', background: '#020617', borderRadius: '14px', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginBottom: '8px', color: '#fff', fontSize: '0.9rem', fontWeight: 700 }}>
                <span>{categories.find(c => c.value === item.category)?.label || item.category}</span>
                <span style={{ color: '#94a3b8' }}>{item.created}</span>
              </div>
              <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.92rem' }}>{item.text}</p>
            </div>
          ))}
          {insights.length === 0 && (
            <div style={{ padding: '14px', background: '#020617', borderRadius: '14px', border: '1px solid #334155', color: '#94a3b8' }}>
              No insights saved yet. Add one to capture your product thinking.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
