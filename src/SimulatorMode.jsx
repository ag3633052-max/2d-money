import { useEffect, useMemo, useState } from "react";

const SIZE = 81;
const W = 9;
const H = 9;

function makeField() {
  return Array.from({ length: SIZE }, () => String(Math.floor(Math.random() * 3))).join("");
}

function idx(x, y) {
  return ((y + H) % H) * W + ((x + W) % W);
}

function step(field) {
  const arr = field.split("");
  const next = [...arr];

  const dirs = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1],  [0, 1],  [1, 1]
  ];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = idx(x, y);

      let sum = Number(arr[i]);

      for (const [dx, dy] of dirs) {
        const ni = idx(x + dx, y + dy);
        sum += Number(arr[ni]);
      }

      if (sum >= 10) next[i] = "2";
      else if (sum >= 6) next[i] = "1";
      else next[i] = "0";
    }
  }

  return next.join("");
}

function inject(field, key) {
  const arr = field.split("");

  const i = key.charCodeAt(0) % arr.length;
  arr[i] = String((Number(arr[i]) + 1) % 3);

  return arr.join("");
}

function detect(field) {
  const events = [];

  // scan horizontal + vertical bursts in flattened view
  for (let i = 0; i < field.length - 2; i++) {
    const t = field.slice(i, i + 3);
    if (t === "222") events.push({ type: "burst", i });
    if (t === "000") events.push({ type: "void", i });
  }

  return events;
}

export default function SimulatorMode() {
  const [field, setField] = useState(makeField());
  const [events, setEvents] = useState([]);
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    const onKey = (e) => {
      const key = e.key.toLowerCase();
      if (!/^[a-z0-9]$/.test(key)) return;
      setField((f) => inject(f, key));
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const runTick = () => {
    setField((f) => {
      const next = step(f);
      setEvents(detect(next));
      setTicks((t) => t + 1);
      return next;
    });
  };

  const grid = useMemo(() => field.split(""), [field]);

  const stats = useMemo(() => {
    const counts = { 0: 0, 1: 0, 2: 0 };
    grid.forEach((v) => counts[v]++);
    return counts;
  }, [grid]);

  return (
    <div className="w-full h-screen bg-black text-white flex">
      {/* FIELD */}
      <div className="p-4">
        <div className="text-xs text-gray-400 mb-2">
          simulator mode (2D torus field) | ticks: {ticks} | events: {events.length}
        </div>

        <div className="grid grid-cols-9 gap-1 w-fit">
          {grid.map((c, i) => (
            <div
              key={i}
              className={`w-6 h-6 flex items-center justify-center text-xs rounded
                ${c === "0" ? "bg-gray-800" : ""}
                ${c === "1" ? "bg-blue-600" : ""}
                ${c === "2" ? "bg-red-600" : ""}
              `}
            >
              {c}
            </div>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <button className="px-2 py-1 bg-gray-700" onClick={runTick}>
            tick
          </button>
          <button className="px-2 py-1 bg-gray-700" onClick={() => setField(makeField())}>
            reset
          </button>
        </div>
      </div>

      {/* UI PANEL */}
      <div className="w-64 p-4 border-l border-gray-800 text-xs text-gray-300">
        <div className="mb-3 text-white font-bold">SYSTEM UI</div>

        <div className="mb-2">field: {W}x{H} torus</div>
        <div className="mb-2">ticks: {ticks}</div>

        <div className="mb-2">
          <div className="text-white">state distribution</div>
          <div>0: {stats[0]}</div>
          <div>1: {stats[1]}</div>
          <div>2: {stats[2]}</div>
        </div>

        <div className="mb-2">
          <div className="text-white">events</div>
          {events.slice(0, 8).map((e, i) => (
            <div key={i}>{e.type} @ {e.i}</div>
          ))}
        </div>

        <div className="mt-4 text-gray-500">
          2D torus field eliminates edge artifacts<br />
          deterministic neighbor evolution<br />
          keyboard = localized perturbation injection
        </div>
      </div>
    </div>
  );
}
