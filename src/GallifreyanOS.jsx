import { useEffect, useMemo, useState } from "react";
import CardField from "./CardField.jsx";

const glyphs = ["(O)", "(O(OO", "OO((O", "O)OO", "OOO(O", "(O)(O", "O(OO)Y"];

export default function GallifreyanOS() {
  const [cycle, setCycle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCycle(prev => (prev + 1) % glyphs.length);
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const stateLabel = useMemo(() => glyphs[cycle], [cycle]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#02040b', color: '#f8fafc', overflow: 'hidden', fontFamily: 'Inter, system-ui' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 15% 20%, rgba(56,189,248,0.15), transparent 18%), radial-gradient(circle at 85% 30%, rgba(168,85,247,0.12), transparent 16%), radial-gradient(circle at 50% 95%, rgba(52,211,153,0.1), transparent 14%)' }} />
      <div style={{ position: 'absolute', top: 16, left: 16, right: 16, zIndex: 30, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px rgba(34,197,94,0.45)' }} />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase' }}>Gallifreyan OS</div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>System State · {stateLabel}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid rgba(148,163,184,0.18)', color: '#fff', background: 'rgba(15,23,42,0.9)', fontSize: '0.78rem' }}>Forever in Many Ways</div>
          <div style={{ padding: '8px 12px', borderRadius: 999, border: '1px solid rgba(56,189,248,0.18)', color: '#38bdf8', background: 'rgba(2,9,22,0.9)', fontSize: '0.78rem' }}>O OO OOO</div>
        </div>
      </div>
      <div style={{ position: 'absolute', top: '18%', left: '8%', width: 300, height: 300, borderRadius: '50%', border: '1px solid rgba(96,165,250,0.15)', boxShadow: '0 0 80px rgba(96,165,250,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '28%', right: '6%', width: 220, height: 220, borderRadius: '50%', border: '1px solid rgba(168,85,247,0.14)', boxShadow: '0 0 56px rgba(168,85,247,0.08)', pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 10, paddingTop: 96, paddingBottom: 48 }}>
        <CardField />
      </div>
    </div>
  );
}
