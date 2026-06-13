import { useEffect, useMemo, useRef, useState } from "react";
import SocialPanel from './SocialPanel.jsx';

const initialCards = [
  { id: "A1", x: 80, y: 80, base: 5, balance: 5, xp: 0, potential: 1.2, resilience: 1.0, variables: [], ancestral: [], stallCount: 0, links: ["B2"], history: [], tags: [] },
  { id: "B2", x: 260, y: 140, base: 2, balance: 2, xp: 0, potential: 0.9, resilience: 0.9, variables: [], ancestral: [], stallCount: 0, links: ["A1", "C3"], history: [], tags: [] },
  { id: "C3", x: 180, y: 280, base: 1, balance: 1, xp: 0, potential: 0.7, resilience: 0.8, variables: [], ancestral: [], stallCount: 0, links: ["B2"], history: [], tags: [] }
];

const ERROR_TAG = "xcghft";
const UPLIFT_TAG = "fortclift";

const rankTitles = ["Associate", "Coordinator", "Manager", "Director", "Executive", "Legend"];

function getRank(card) {
  // Emergent rank based on local centrality, resources and experience.
  const centrality = card.links.length;
  const resourceScore = Math.log1p(Math.max(0, card.balance));
  const score = Math.min(rankTitles.length - 1, Math.floor(centrality * 1.2 + resourceScore + (card.xp || 0) / 10));
  return rankTitles[score];
}

function hashState(cards) {
  const normalized = JSON.stringify(cards.map(c => ({
    id: c.id,
    x: Math.round(c.x),
    y: Math.round(c.y),
    base: c.base,
    balance: c.balance,
    xp: Math.round(c.xp || 0),
    potential: Number(((c.potential ?? 0)).toFixed(2)),
    resilience: Number(((c.resilience ?? 0)).toFixed(2)),
    stallCount: c.stallCount,
    links: c.links,
    tags: c.tags
  })));

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return hash.toString(16);
}

function getDirection(a, b) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  const threshold = 140;
  if (dist > threshold || !isFinite(dist)) return "Q";

  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "R" : "L";
  return dy > 0 ? "D" : "U";
}

const SPAWN_DELAY = 2500;

const spawnZone = {
  x1: 120,
  y1: 120,
  x2: 300,
  y2: 300
};

function inZone(c) {
  return c.x > spawnZone.x1 && c.x < spawnZone.x2 && c.y > spawnZone.y1 && c.y < spawnZone.y2;
}

function getUiShift(value, scale = 10) {
  return Math.round(Math.sin(value / 18) * scale);
}

function createVariable(source, label) {
  return {
    id: `V${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    x: source.x + (Math.random() - 0.5) * 120,
    y: source.y + (Math.random() - 0.5) * 120,
    base: Math.max(1, Math.floor(source.base * 0.6)),
    balance: Math.max(0.4, source.potential * source.base * 0.25),
    xp: 0,
    potential: Math.max(0.4, source.potential * 0.8),
    resilience: Math.max(0.4, source.resilience * 0.8),
    variables: [],
    links: [source.id],
    history: [`variable:${label}`],
    tags: [label],
    ancestral: [...(source.ancestral || []), { time: Date.now(), event: label, state: { balance: source.balance, xp: source.xp, potential: source.potential, resilience: source.resilience } }],
    stallCount: 0
  };
}

function computePolarity(card) {
  // Simple polarity heuristic: uppercase tag counts as +1, lowercase as -1
  if (!card.tags || card.tags.length === 0) return 0;
  let score = 0;
  card.tags.forEach(t => {
    if (!t) return;
    const first = t[0];
    if (first >= 'A' && first <= 'Z') score += 1;
    else score -= 1;
  });
  return score / Math.max(1, card.tags.length);
}

function averageLinks(cards) {
  if (!cards || cards.length === 0) return 1;
  return cards.reduce((s, c) => s + (c.links?.length || 0), 0) / cards.length || 1;
}

function Card({ card, onDrag, onSelect, selected, cipher }) {
  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const origX = card.x;
    const origY = card.y;

    const onMove = (moveEvent) => {
      onDrag(card.id, origX + (moveEvent.clientX - startX), origY + (moveEvent.clientY - startY));
    };

    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const wobbleX = getUiShift(card.balance + (card.xp || 0) + card.links.length * 3, 5);
  const wobbleY = getUiShift((card.xp || 0) * 2 + card.links.length * 4, 5);

    return (
    <g transform={`translate(${card.x + wobbleX}, ${card.y + wobbleY})`} onMouseDown={handleMouseDown} onClick={(e) => onSelect(card.id, e.ctrlKey || e.metaKey)} style={{ cursor: "grab" }}>
      <rect width="130" height="96" rx="10" fill={selected ? "#1e3a8a" : "#0b1220"} stroke={selected ? "#60a5fa" : "#6b7280"} />
      <text x="10" y="18" fill="white" fontSize="13">{card.id}</text>
      <text x="10" y="30" fill="#60a5fa" fontSize="10">rank:{getRank(card)}</text>
      <text x="10" y="42" fill="#22c55e" fontSize="12">${(card.balance ?? 0).toFixed(2)}</text>
      <text x="10" y="56" fill="#9ca3af" fontSize="10">xp:{card.xp || 0}</text>
      <text x="10" y="68" fill="#9ca3af" fontSize="10">base:{card.base}</text>
      <text x="10" y="80" fill="#fbbf24" fontSize="9">links:{card.links.length}</text>
      <text x="10" y="92" fill="#facc15" fontSize="9">cipher:{cipher}</text>
    </g>
  );
}

export default function CardField() {
  const [branches, setBranches] = useState(() => {
    const saved = localStorage.getItem("card_branches");
    return saved
      ? JSON.parse(saved)
      : [{ id: "root", parent: null, cards: initialCards, timestamp: Date.now() }];
  });

  const [currentBranch, setCurrentBranch] = useState("root");
  const current = branches.find(b => b.id === currentBranch) || branches[0];

  const [draft, setDraft] = useState(current.cards);
  const [selectedIds, setSelectedIds] = useState(() => (current.cards[0] ? [current.cards[0].id] : []));
  const [privacyMode, setPrivacyMode] = useState(false);
  const [publicSave, setPublicSave] = useState(true);
  const [multiverseStatus, setMultiverseStatus] = useState('idle');
  const [multiverseSavedAt, setMultiverseSavedAt] = useState(null);
  const pendingRef = useRef([]);
  const errorRef = useRef([]);

  useEffect(() => {
    setDraft(current.cards);
    setSelectedIds(current.cards[0] ? [current.cards[0].id] : []);
  }, [currentBranch]);

  useEffect(() => {
    if (!privacyMode || publicSave) {
      localStorage.setItem("card_branches", JSON.stringify(branches));
    }
  }, [branches, privacyMode, publicSave]);

  // Load anonymized snapshot from URL fragment if present
  useEffect(() => {
    try {
      const hash = location.hash || '';
      if (hash.startsWith('#anon=')) {
        const payload = decodeURIComponent(hash.slice(6));
        const json = JSON.parse(atob(payload));
        if (json && Array.isArray(json.cards)) {
          setDraft(json.cards);
          setPrivacyMode(true);
          setSelectedIds(json.cards[0] ? [json.cards[0].id] : []);
        }
      }
    } catch (e) {
      // ignore
    }
  }, []);

  function obfuscateId(id) {
    // lightweight deterministic obfuscation
    let h = 2166136261 >>> 0;
    for (let i = 0; i < id.length; i++) {
      h = Math.imul(h ^ id.charCodeAt(i), 16777619) >>> 0;
    }
    return ('V' + (h >>> 0).toString(36).toUpperCase()).slice(0, 6);
  }

  function anonymizeCards(cards) {
    const idMap = {};
    cards.forEach(c => { idMap[c.id] = obfuscateId(c.id); });
    return cards.map(c => ({
      id: idMap[c.id],
      x: Math.round(c.x),
      y: Math.round(c.y),
      base: Math.round(c.base),
      balance: Number((Math.max(0, c.balance) * (0.9 + Math.random() * 0.2)).toFixed(2)),
      xp: Math.round((c.xp || 0) * (0.9 + Math.random() * 0.2)),
      potential: Number(((c.potential || 0) * (0.9 + Math.random() * 0.2)).toFixed(2)),
      resilience: Number(((c.resilience || 0) * (0.9 + Math.random() * 0.2)).toFixed(2)),
      links: (c.links || []).map(l => idMap[l]).filter(Boolean),
      tags: (c.tags || []).map(t => (t ? (t[0] ? '*' : '*') : '*')),
    }));
  }

  const MULTIVERSE_KEY = 'card_multiverse_snapshot_v1';

  function serializeMultiverse() {
    return JSON.stringify({ branches, currentBranch, draft, selectedIds, timestamp: Date.now() });
  }

  function saveMultiverse() {
    try {
      localStorage.setItem(MULTIVERSE_KEY, serializeMultiverse());
      setMultiverseSavedAt(Date.now());
      setMultiverseStatus('saved');
    } catch (e) {
      setMultiverseStatus('error');
    }
  }

  function loadMultiverse() {
    try {
      const raw = localStorage.getItem(MULTIVERSE_KEY);
      if (!raw) {
        setMultiverseStatus('none');
        return;
      }
      const json = JSON.parse(raw);
      if (json?.branches && Array.isArray(json.branches)) {
        setBranches(json.branches);
        setCurrentBranch(json.currentBranch || json.branches[0]?.id || 'root');
        setDraft(json.draft || json.branches[0]?.cards || current.cards);
        setSelectedIds(json.selectedIds?.length ? json.selectedIds : [json.draft?.[0]?.id || current.cards[0]?.id]);
        setMultiverseStatus('loaded');
      }
    } catch (e) {
      setMultiverseStatus('error');
    }
  }

  function makeAnonSnapshotUrl() {
    const cards = anonymizeCards(draft);
    const payload = btoa(JSON.stringify({ cards }));
    return `${location.origin}${location.pathname}#anon=${encodeURIComponent(payload)}`;
  }

  function handleError(error, context, nodes) {
    const entry = {
      time: Date.now(),
      error: String(error),
      context,
      tag: ERROR_TAG
    };

    errorRef.current.push(entry);

    if (nodes?.length) {
      nodes.forEach(n => {
        n.tags = [...new Set([...(n.tags || []), ERROR_TAG, UPLIFT_TAG])];
        n.history.push(`error:${ERROR_TAG}`);
      });
    }

    try {
      nodes?.forEach(n => {
        n.balance = Math.min(n.base * 3, n.balance + n.base);
      });
    } catch (e) {}
  }

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if ((e.ctrlKey || e.metaKey) && key === 's') {
        e.preventDefault();
        saveMultiverse();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && key === 'v') {
        e.preventDefault();
        loadMultiverse();
        return;
      }

      setDraft(prev => {
        try {
          let updated = prev.map(c => ({ ...c }));

          if (key === "f") {
            updated.forEach(c => {
              c.balance = Math.min(c.base * 3, c.balance + c.base);
              c.links = c.links.filter(l => updated.find(x => x.id === l));
              c.history.push("regen:f");
            });
            return updated;
          }

          let target = updated.find(c => c.id.toLowerCase().includes(key));
          if (!target) target = updated[Math.floor(Math.random() * updated.length)];

          if (target) {
            target.balance += 1;
            target.history.push(`glyph:${key}`);

            if (!target.tags.includes(key) && key.match(/[a-z0-9]/)) {
              target.tags = [...target.tags, key];
            }

            const pressure = target.balance * target.links.length;
            if (pressure > target.base * 4) {
              pendingRef.current.push({ time: Date.now(), source: target });
            }
          }

          return updated;
        } catch (err) {
          handleError(err, "keyboard", prev);
          return prev;
        }
      });
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const hash = useMemo(() => hashState(draft), [draft]);
  const selectedList = draft.filter(c => selectedIds.includes(c.id));
  const selected = selectedList[0] || draft[0];

  // Manual controls for selected leaders
  const [manual, setManual] = useState({
    balance: selected?.balance ?? 0,
    xp: selected?.xp ?? 0,
    potential: selected?.potential ?? 0,
    resilience: selected?.resilience ?? 0,
    base: selected?.base ?? 1
  });

  useEffect(() => {
    setManual({
      balance: selected?.balance ?? 0,
      xp: selected?.xp ?? 0,
      potential: selected?.potential ?? 0,
      resilience: selected?.resilience ?? 0,
      base: selected?.base ?? 1
    });
  }, [selectedIds, selected]);

  const applyManualToSelected = (mode = 'set') => {
    setDraft(prev => prev.map(c => {
      if (!selectedIds.includes(c.id)) return c;
      const updated = { ...c };
      if (mode === 'set') {
        updated.balance = Number(manual.balance) || 0;
        updated.xp = Number(manual.xp) || 0;
        updated.potential = Number(manual.potential) || 0;
        updated.resilience = Number(manual.resilience) || 0;
        updated.base = Number(manual.base) || 1;
      }
      return updated;
    }));
  };
  const totalXp = useMemo(() => draft.reduce((sum, c) => sum + (c.xp || 0), 0), [draft]);
  const totalBalance = useMemo(() => draft.reduce((sum, c) => sum + c.balance, 0), [draft]);
  const topOffsetX = getUiShift(totalXp + totalBalance, 18);
  const topOffsetY = getUiShift(totalBalance - totalXp, 10);
  const controlOffsetX = getUiShift((pendingRef.current.length + draft.length) * 3, 12);
  const controlOffsetY = getUiShift(totalXp * 2 + draft.length, 8);
  const branchOffsetX = getUiShift(branches.length * 5 + (selected?.links.length || 0) * 3, 12);
  const branchOffsetY = getUiShift((selected?.xp || 0) * 2, 14);
  const selectedPanelX = 12 + getUiShift(selected?.balance || 0, 16);
  const selectedPanelY = 94 + getUiShift(selected?.xp || 0, 10);

  const topStatsStyle = {
    position: 'absolute',
    top: 12,
    left: 12,
    transform: `translate(${topOffsetX}px, ${topOffsetY}px)`,
    transition: 'transform 0.22s ease',
    display: 'flex',
    flexWrap: 'wrap',
    gap: '14px',
    padding: '12px',
    fontSize: '0.75rem',
    color: '#94a3b8',
    background: 'rgba(7, 10, 23, 0.95)',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.18)'
  };

  const controlsStyle = {
    position: 'fixed',
    bottom: 12 + controlOffsetY,
    left: 12 + controlOffsetX,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    transition: 'left 0.22s ease, bottom 0.22s ease'
  };

  const selectedPanelStyle = {
    position: 'fixed',
    top: selectedPanelY,
    left: selectedPanelX,
    width: '320px',
    padding: '14px',
    background: 'rgba(15, 23, 42, 0.92)',
    borderRadius: '18px',
    border: '1px solid #334155',
    color: '#cbd5e1',
    fontSize: '0.85rem',
    transition: 'left 0.22s ease, top 0.22s ease',
    zIndex: 2
  };

  const branchPanelStyle = {
    position: 'fixed',
    right: 12 + branchOffsetX,
    top: 80 + branchOffsetY,
    fontSize: '0.75rem',
    color: '#94a3b8',
    maxHeight: '80vh',
    overflow: 'auto',
    transition: 'right 0.22s ease, top 0.22s ease',
    zIndex: 2
  };

  const leaderStatsStyle = {
    marginTop: '10px',
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap'
  };

  const buttonStyle = {
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer'
  };

  const trainButtonStyle = { ...buttonStyle, background: '#2563eb', color: '#fff' };
  const recruitButtonStyle = { ...buttonStyle, background: '#16a34a', color: '#fff' };
  const promoteButtonStyle = { ...buttonStyle, background: '#f59e0b', color: '#000' };

  const commit = () => {
    const newId = "b" + Math.random().toString(36).slice(2, 8);
    setBranches(prev => [...prev, {
      id: newId,
      parent: currentBranch,
      cards: draft,
      timestamp: Date.now()
    }]);
    setCurrentBranch(newId);
  };

  const moveCard = (id, x, y) => {
    setDraft(prev => prev.map(c => c.id === id ? { ...c, x, y } : c));
  };

  const handleSelect = (id, append = false) => {
    setSelectedIds(prev => {
      if (!append) return [id];
      if (prev.includes(id)) return prev.filter(x => x !== id);
      return [...prev, id];
    });
  };

  const recruitMember = () => {
    if (!selected) return;
    const newChildren = selectedIds.map(id => {
      const src = draft.find(c => c.id === id) || selected;
      const newId = "R" + Math.random().toString(36).slice(2, 6).toUpperCase();
      return {
        id: newId,
        x: src.x + 140 + (Math.random() - 0.5) * 40,
        y: src.y + 20 + (Math.random() - 0.5) * 40,
        base: Math.max(1, Math.floor((src.base || 1) * 0.75)),
        balance: Math.max(0.4, (src.potential || 0.5) * (src.base || 1) * 0.25),
        xp: 0,
        potential: Math.max(0.4, (src.potential || 0.5) * 0.8),
        resilience: Math.max(0.4, (src.resilience || 0.5) * 0.8),
        variables: [],
        links: [src.id],
        history: [`recruited by ${src.id}`],
        tags: [],
        ancestral: [...(src.ancestral || []), { time: Date.now(), event: 'recruit', state: { balance: src.balance, xp: src.xp, potential: src.potential } }],
        stallCount: 0
      };
    });
    setDraft(prev => [...prev, ...newChildren]);
  };

  const trainMember = () => {
    if (!selectedIds.length) return;
    setDraft(prev => prev.map(c => selectedIds.includes(c.id) ? {
      ...c,
      xp: (c.xp || 0) + 3,
      balance: c.balance + Math.max(0.5, (c.base || 1) * 0.2) + (c.potential || 0) * 0.1,
      potential: (c.potential || 0) + 0.08,
      resilience: Math.min(5, (c.resilience || 0) + 0.05),
      history: [...(c.history || []), `trained`]
    } : c));
  };

  const promoteMember = () => {
    if (!selectedIds.length) return;
    const cost = 12;
    setDraft(prev => prev.map(c => {
      if (!selectedIds.includes(c.id)) return c;
      if ((c.xp || 0) < cost) return c;
      return {
        ...c,
        xp: (c.xp || 0) - cost,
        base: (c.base || 0) + 1,
        balance: (c.balance || 0) + 2 + (c.potential || 0) * 0.2,
        potential: (c.potential || 0) + 0.15,
        resilience: (c.resilience || 0) + 0.1,
        history: [...(c.history || []), `promoted`],
        ancestral: [...(c.ancestral || []), { time: Date.now(), event: 'promote', state: { balance: c.balance, xp: c.xp, potential: c.potential } }]
      };
    }));
  };

  const spawnNode = (source) => {
    const id = "N" + Math.random().toString(36).slice(2, 7);
    const offset = (Math.random() - 0.5) * 80;

    return {
      id,
      x: source.x + offset,
      y: source.y + offset,
      base: Math.max(1, Math.floor(source.base * 0.5)),
      balance: source.balance * 0.5,
      xp: 0,
      potential: Math.max(0.4, (source.potential || 1) * 0.7),
      resilience: Math.max(0.4, (source.resilience || 1) * 0.7),
      variables: [],
      links: [source.id],
      history: [`spawned from ${source.id}`],
      tags: [],
      ancestral: [...(source.ancestral || []), { time: Date.now(), event: 'spawn', state: { balance: source.balance, xp: source.xp, potential: source.potential } }],
      stallCount: 0
    };
  };

  const tick = () => {
    const now = Date.now();

    setDraft(prev => {
      try {
        let updated = prev.map(c => ({ ...c }));

        updated.forEach(c => {
          if (c.links.length) {
            // Non-hierarchical resource sharing: distribute based on local centrality and potential,
            // not by a strict parent/child hierarchy. This allows emergent influence.
            const nonlinearShare = c.balance * (0.08 + Math.tanh(c.potential / 10) * 0.05 + Math.random() * 0.06);
            c.balance -= nonlinearShare;

            const avg = averageLinks(updated);
            const weights = c.links.map(l => {
              const t = updated.find(x => x.id === l);
              if (!t) return 0.01;
              // weight based on target potential and relative centrality
              return 1 + (t.potential || 0) * 0.04 + ((t.links.length || 0) / Math.max(1, avg)) * 0.12;
            });
            const totalW = weights.reduce((s, x) => s + x, 0) || 1;

            c.links.forEach((l, i) => {
              const target = updated.find(t => t.id === l);
              if (target) {
                const gain = nonlinearShare * (weights[i] / totalW);
                target.balance += gain;
                target.history.push(`+${(gain ?? 0).toFixed(2)} from ${c.id}`);
                target.xp = (target.xp || 0) + 0.3;
              }
            });
          }

          const recruitBonus = updated.reduce((sum, member) => member.links.includes(c.id) ? sum + member.balance * 0.02 * (1 + member.potential * 0.05) : sum, 0);
          if (recruitBonus > 0) {
            c.balance += recruitBonus;
            c.xp = (c.xp || 0) + 1;
          }

          const drift = Math.sin(c.xp + c.balance) * (0.02 + c.potential * 0.01);
          c.balance += drift;

          const stability = c.balance / Math.max(1, c.base);
          if (Math.abs(stability - 1) < 0.12) {
            c.stallCount += 1;
          } else {
            c.stallCount = 0;
          }

          if (c.stallCount >= 3) {
            const variable = createVariable(c, 'a');
            c.variables = [...(c.variables || []), variable.id];
            c.balance += c.resilience * 0.4;
            c.potential += 0.06;
            updated.push(variable);
            c.stallCount = 0;
          }

          if (c.balance < c.base * 0.5) {
            c.balance += c.resilience * 0.5 + c.potential * 0.2;
          }

          if (c.balance > c.base * 4 || Math.random() < 0.025) {
            if (inZone(c)) {
              pendingRef.current.push({ time: now, source: c });
            }
          }

          const pressure = c.balance * (c.links.length + 1);
          const chaos = Math.random() * (1 + c.potential * 0.5);

          const hasInstability = pressure > c.base * 3 + c.potential * 2;
          const softFailure = chaos < 0.03;
          const overflowFailure = c.balance > c.base * 5;

          if (hasInstability || softFailure || overflowFailure) {
            if (inZone(c)) {
              pendingRef.current.push({ time: now, source: c });
            }
          }
        });

        const ready = [];
        const remaining = [];

        pendingRef.current.forEach(p => {
          if (now - p.time > SPAWN_DELAY) ready.push(p);
          else remaining.push(p);
        });

        pendingRef.current = remaining;
        const newNodes = ready.map(p => spawnNode(p.source));

        // Detect contradictions in the network and spawn synthesis variables instead of destroying nodes.
        try {
          const avg = averageLinks(updated);
          updated.forEach(c => {
            (c.links || []).forEach(lid => {
              const other = updated.find(x => x.id === lid);
              if (!other) return;
              const p1 = computePolarity(c);
              const p2 = computePolarity(other);
              // contradiction when polarities are opposite and relatively strong
              if (p1 * p2 < 0 && Math.abs(p1 - p2) > 0.6 && Math.random() < 0.12) {
                const synth = createVariable(c, 'synth');
                // position synth between the two
                synth.x = (c.x + other.x) / 2 + (Math.random() - 0.5) * 30;
                synth.y = (c.y + other.y) / 2 + (Math.random() - 0.5) * 30;
                synth.links = [...new Set([c.id, other.id])];
                synth.history.push(`synth from ${c.id}+${other.id}`);
                synth.tags = [...(synth.tags || []), 'synth'];
                updated.push(synth);
                c.history.push(`synthed:${synth.id}`);
                other.history.push(`synthed:${synth.id}`);
                c.potential = Math.min(5, (c.potential || 0.5) + 0.06);
                other.potential = Math.min(5, (other.potential || 0.5) + 0.06);
              }
            });
          });
        } catch (e) {
          // ignore synthesis errors
        }

        return [...updated, ...newNodes];
      } catch (err) {
        handleError(err, "tick", prev);
        return prev;
      }
    });
  };

  const getTarget = (id) => draft.find(c => c.id === id);

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#000', color: '#fff', position: 'relative', overflow: 'auto' }}>
      <div style={topStatsStyle}>
        <div>branch: {currentBranch}</div>
        <div>hash: {hash}</div>
        <div>nodes: {draft.length}</div>
        <div>pending: {pendingRef.current.length}</div>
        <div>errors: {errorRef.current.length}</div>
        <div>system: XCGHFT + FORTCLIFT ACTIVE</div>
      </div>

      <div style={{ position: 'absolute', top: 12, right: 12 }}>
        <SocialPanel youtube="https://www.youtube.com/@AndrewGarcia-o6f" facebook="https://www.facebook.com/AndyDavisStory/" privacyMode={privacyMode} />
      </div>

      <div style={{ minWidth: '1200px', minHeight: '900px' }}>
        <svg style={{ width: '100%', minHeight: '900px' }}>
        {draft.map(card =>
          card.links.map(l => {
            const target = getTarget(l);
            if (!target) return null;
            return (
              <line
                key={card.id + l}
                x1={card.x + 55}
                y1={card.y + 35}
                x2={target.x + 55}
                y2={target.y + 35}
                stroke="#1f2937"
              />
            );
          })
        )}

        {draft.map(card => {
          const cipher = card.links.map(l => {
            const t = getTarget(l);
            if (!t) return "Q";
            return getDirection(card, t);
          }).join("");

          return (
            <Card key={card.id} card={card} onDrag={moveCard} onSelect={handleSelect} selected={selectedIds.includes(card.id)} cipher={cipher} />
          );
        })}
      </svg>
      </div>

      <div style={controlsStyle}>
        <button className="px-2 py-1 bg-gray-800" onClick={commit}>commit branch</button>
        <button className="px-2 py-1 bg-gray-800" onClick={tick}>tick $ + delayed spawn zone</button>
        <button className="px-2 py-1 bg-gray-800" onClick={() => setCurrentBranch(current.parent || "root")}>revert</button>
        <button className="px-2 py-1 bg-gray-800" onClick={() => { setPrivacyMode(p => !p); }}>{privacyMode ? 'Privacy ON' : 'Privacy OFF'}</button>
        <button className="px-2 py-1 bg-gray-800" onClick={() => { setPublicSave(s => !s); }}>{publicSave ? 'Public Save ON' : 'Public Save OFF'}</button>
        <button className="px-2 py-1 bg-gray-800" onClick={saveMultiverse}>Save CTRL+S</button>
        <button className="px-2 py-1 bg-gray-800" onClick={loadMultiverse}>Load CTRL+V</button>
        <button className="px-2 py-1 bg-gray-800" onClick={() => {
          const url = makeAnonSnapshotUrl();
          navigator.clipboard?.writeText(url).catch(() => {});
          alert('Anonymized snapshot URL copied to clipboard');
        }}>Share anonymized snapshot</button>
        <span style={{ color: '#94a3b8', padding: '12px 0' }}>Multiverse: {multiverseStatus} {multiverseSavedAt ? `(saved ${new Date(multiverseSavedAt).toLocaleTimeString()})` : ''}</span>
      </div>

      <div style={selectedPanelStyle}>
        <div style={{ marginBottom: '10px', color: '#fff', fontWeight: 700 }}>Selected Leaders ({selectedIds.length})</div>
        <div>primary id: {selected?.id || 'none'}</div>
        <div>rank: {selected ? getRank(selected) : 'n/a'}</div>
        <div>links: {selected?.links.length || 0}</div>
        <div>variables: {selected?.variables?.length || 0}</div>
        <div>ancestors: {selected?.ancestral?.length || 0}</div>

        <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>Balance
            <input type="number" step="0.01" value={manual.balance} onChange={(e) => setManual(m => ({ ...m, balance: e.target.value }))} style={{ width: '100%' }} />
          </label>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>XP
            <input type="number" step="1" value={manual.xp} onChange={(e) => setManual(m => ({ ...m, xp: e.target.value }))} style={{ width: '100%' }} />
          </label>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>Potential
            <input type="number" step="0.01" value={manual.potential} onChange={(e) => setManual(m => ({ ...m, potential: e.target.value }))} style={{ width: '100%' }} />
          </label>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>Resilience
            <input type="number" step="0.01" value={manual.resilience} onChange={(e) => setManual(m => ({ ...m, resilience: e.target.value }))} style={{ width: '100%' }} />
          </label>
          <label style={{ fontSize: 12, color: '#94a3b8' }}>Base
            <input type="number" step="1" value={manual.base} onChange={(e) => setManual(m => ({ ...m, base: e.target.value }))} style={{ width: '100%' }} />
          </label>
        </div>

        <div style={leaderStatsStyle}>
          <button style={trainButtonStyle} onClick={trainMember}>train</button>
          <button style={recruitButtonStyle} onClick={recruitMember}>recruit</button>
          <button style={promoteButtonStyle} onClick={promoteMember}>promote</button>
          <button style={{ ...buttonStyle, background: '#10b981', color: '#fff' }} onClick={() => applyManualToSelected('set')}>Apply to selected</button>
        </div>

        <div style={{ marginTop: '10px', fontSize: '0.75rem', color: '#94a3b8' }}>
          Use Ctrl/Cmd+click to multi-select. "Apply to selected" sets the manual fields across all selected leaders.
        </div>
      </div>

      <div style={branchPanelStyle}>
        {branches.map(b => (
          <div
            key={b.id}
            onClick={() => setCurrentBranch(b.id)}
            className={`cursor-pointer p-1 ${b.id === currentBranch ? "text-white" : "text-gray-500"}`}
          >
            {b.id} ← {b.parent || "none"}
          </div>
        ))}
      </div>
    </div>
  );
}
