import { useMemo, useState, useDeferredValue } from 'react';
import { Search } from 'lucide-react';
import { DynamicIcon } from 'lucide-react/dynamic';
import dynamicIconImports from 'lucide-react/dynamicIconImports';

interface Props {
  value: string | null;
  width: number;
  height: number;
  onPick: (name: string, url: string) => void;
  onError?: (msg: string) => void;
}

const NAMES = Object.keys(dynamicIconImports).sort();
const LIMIT = 60;

async function buildMask(name: string, w: number, h: number): Promise<string> {
  const [{ renderToStaticMarkup }, mod, { createElement }] = await Promise.all([
    import('react-dom/server'),
    (dynamicIconImports as Record<string, () => Promise<{ default: React.ComponentType<Record<string, unknown>> }>>)[name](),
    import('react'),
  ]);
  const size = Math.min(w, h);
  const icon = renderToStaticMarkup(
    createElement(mod.default, { size, stroke: '#fff', fill: '#fff', strokeWidth: 2.5, x: (w - size) / 2, y: (h - size) / 2 })
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${icon}</svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
}

export default function IconPicker({ value, width, height, onPick, onError }: Props) {
  const [query, setQuery] = useState('');
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const results = useMemo(
    () => (deferred ? NAMES.filter((n) => n.includes(deferred)) : NAMES).slice(0, LIMIT),
    [deferred]
  );

  const pick = async (name: string) => {
    try {
      onPick(name, await buildMask(name, width, height));
    } catch {
      onError?.('Failed to load icon.');
    }
  };

  return (
    <div className="icon-picker">
      <div className="icon-search">
        <Search size={14} aria-hidden="true" />
        <input
          type="search"
          placeholder={`Search ${NAMES.length.toLocaleString()} icons…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search icons"
        />
      </div>
      <div className="icon-grid" role="listbox" aria-label="Mask icon">
        {results.map((n) => (
          <button
            key={n}
            type="button"
            role="option"
            aria-selected={n === value}
            className={`icon-cell ${n === value ? 'selected' : ''}`}
            title={n}
            onClick={() => pick(n)}
          >
            <DynamicIcon name={n as never} size={20} />
          </button>
        ))}
        {results.length === 0 && <div className="icon-empty">No icons match.</div>}
      </div>
      {value && <div className="icon-selected">Selected: {value}</div>}
    </div>
  );
}
