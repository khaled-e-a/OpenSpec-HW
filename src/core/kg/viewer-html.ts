/**
 * Self-contained HTML viewer for the SynergySpec Knowledge Graph.
 *
 * Rendered by the `synergyspec-hw kg view` command. Fetches `./data.json`
 * from the same origin (served by the CLI's local HTTP server) and draws
 * it with vis-network from a CDN.
 */
export const KG_VIEWER_HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>SynergySpec KG Viewer</title>
  <script src="https://unpkg.com/vis-network@9.1.9/standalone/umd/vis-network.min.js"></script>
  <style>
    :root { color-scheme: light dark; }
    html, body { margin: 0; padding: 0; height: 100%; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; overflow: hidden; }
    #app { display: grid; grid-template-columns: 280px 1fr 320px; grid-template-rows: 1fr; height: 100vh; width: 100vw; }
    aside { overflow-y: auto; padding: 12px; border-right: 1px solid #ddd; background: #fafafa; min-width: 0; }
    aside.right { border-right: none; border-left: 1px solid #ddd; }
    #net { background: #fff; width: 100%; height: 100%; min-width: 0; min-height: 0; position: relative; }
    #err { position: absolute; top: 0; left: 0; right: 0; background: #fee; color: #900; padding: 12px; font-family: monospace; font-size: 12px; white-space: pre-wrap; border-bottom: 1px solid #fcc; display: none; z-index: 10; }
    h2 { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 16px 0 6px; }
    h2:first-child { margin-top: 0; }
    label { display: flex; align-items: center; gap: 6px; padding: 2px 0; cursor: pointer; font-size: 13px; }
    label input { accent-color: currentColor; }
    .legend-dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; }
    .count { color: #888; margin-left: auto; font-size: 12px; }
    input[type=search] { width: 100%; padding: 6px 8px; box-sizing: border-box; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; }
    .stats { font-size: 12px; color: #666; margin-bottom: 8px; }
    pre { background: #f4f4f4; padding: 8px; border-radius: 4px; font-size: 11px; overflow: auto; max-height: 40vh; }
    .empty { color: #aaa; font-style: italic; font-size: 12px; }
    button { font-size: 12px; padding: 4px 8px; border: 1px solid #ccc; background: #fff; border-radius: 4px; cursor: pointer; }
    button:hover { background: #f0f0f0; }
    @media (prefers-color-scheme: dark) {
      aside { background: #1a1a1a; border-color: #333; color: #eee; }
      #net { background: #111; }
      pre { background: #222; color: #eee; }
      input[type=search] { background: #222; color: #eee; border-color: #444; }
      button { background: #222; color: #eee; border-color: #444; }
      button:hover { background: #333; }
    }
  </style>
</head>
<body>
<div id="app">
  <aside>
    <h2>Search</h2>
    <input type="search" id="search" placeholder="filter by name or id…" />
    <h2>Stats</h2>
    <div class="stats" id="stats">loading…</div>
    <h2>Types</h2>
    <div id="types"></div>
    <h2>Relationships</h2>
    <div id="relTypes"></div>
    <h2>Layout</h2>
    <button id="refit">Refit</button>
    <button id="togglePhysics">Toggle physics</button>
  </aside>
  <div id="net"><div id="err"></div></div>
  <aside class="right">
    <h2>Selection</h2>
    <div id="detail"><div class="empty">Click a node or edge.</div></div>
  </aside>
</div>
<script>
function showErr(msg) {
  const el = document.getElementById('err');
  if (!el) return;
  el.style.display = 'block';
  el.textContent = (el.textContent ? el.textContent + '\\n' : '') + msg;
}
window.addEventListener('error', (ev) => showErr('Error: ' + (ev.error ? ev.error.stack || ev.error.message : ev.message)));
window.addEventListener('unhandledrejection', (ev) => showErr('Unhandled rejection: ' + (ev.reason ? ev.reason.stack || ev.reason.message || ev.reason : 'unknown')));

(async function () {
  if (typeof vis === 'undefined' || !vis.Network || !vis.DataSet) {
    showErr('vis-network library did not load. Check your network connection or browser console for CSP/extension blocks. CDN: https://unpkg.com/vis-network/standalone/umd/vis-network.min.js');
    return;
  }
  const TYPE_COLORS = {
    Change: '#ef4444', Spec: '#3b82f6', DesignDoc: '#8b5cf6', Artifact: '#64748b',
    TestCase: '#f59e0b', CodeFile: '#10b981', UseCase: '#06b6d4', UseCaseStep: '#0891b2',
    Requirement: '#6366f1', Task: '#14b8a6', DesignDecision: '#a855f7'
  };
  const fallbackColor = (t) => {
    let h = 0; for (let i = 0; i < t.length; i++) h = (h * 31 + t.charCodeAt(i)) & 0xffffffff;
    return 'hsl(' + (h % 360) + ', 55%, 55%)';
  };
  const colorFor = (t) => TYPE_COLORS[t] || fallbackColor(t || 'Unknown');

  let raw;
  try {
    const r = await fetch('./data.json', { cache: 'no-store' });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    raw = await r.json();
  } catch (e) {
    document.getElementById('net').innerHTML = '<div style="padding:24px;color:#c00">Failed to load data.json: ' + e.message + '</div>';
    return;
  }

  const entities = raw.entities || [];
  const relationships = raw.relationships || [];

  const typeCounts = {};
  for (const e of entities) typeCounts[e.type || 'Unknown'] = (typeCounts[e.type || 'Unknown'] || 0) + 1;
  const relTypeCounts = {};
  for (const r of relationships) relTypeCounts[r.type || 'unknown'] = (relTypeCounts[r.type || 'unknown'] || 0) + 1;

  const stats = document.getElementById('stats');
  stats.textContent = entities.length + ' entities · ' + relationships.length + ' relationships';

  const visibleTypes = new Set(Object.keys(typeCounts));
  const visibleRelTypes = new Set(Object.keys(relTypeCounts));

  const typesEl = document.getElementById('types');
  Object.keys(typeCounts).sort().forEach(t => {
    const row = document.createElement('label');
    row.innerHTML = '<input type="checkbox" checked data-type="' + t + '" /><span class="legend-dot" style="background:' + colorFor(t) + '"></span>' + t + '<span class="count">' + typeCounts[t] + '</span>';
    row.querySelector('input').addEventListener('change', (ev) => {
      const type = ev.target.dataset.type;
      if (ev.target.checked) visibleTypes.add(type); else visibleTypes.delete(type);
      rebuild();
    });
    typesEl.appendChild(row);
  });

  const relTypesEl = document.getElementById('relTypes');
  Object.keys(relTypeCounts).sort().forEach(t => {
    const row = document.createElement('label');
    row.innerHTML = '<input type="checkbox" checked data-rel="' + t + '" />' + t + '<span class="count">' + relTypeCounts[t] + '</span>';
    row.querySelector('input').addEventListener('change', (ev) => {
      const type = ev.target.dataset.rel;
      if (ev.target.checked) visibleRelTypes.add(type); else visibleRelTypes.delete(type);
      rebuild();
    });
    relTypesEl.appendChild(row);
  });

  const searchInput = document.getElementById('search');
  let searchQuery = '';
  searchInput.addEventListener('input', (e) => { searchQuery = e.target.value.toLowerCase(); rebuild(); });

  const nodes = new vis.DataSet();
  const edges = new vis.DataSet();
  const network = new vis.Network(document.getElementById('net'), { nodes, edges }, {
    nodes: { shape: 'box', font: { size: 13, color: '#fff', multi: false, face: 'monospace' }, borderWidth: 2, margin: 8, widthConstraint: { maximum: 220 } },
    edges: { arrows: 'to', font: { size: 10, align: 'middle' }, color: { color: '#999' }, smooth: { enabled: true, type: 'dynamic' } },
    physics: { solver: 'forceAtlas2Based', stabilization: { iterations: 150 } },
    interaction: { hover: true, dragNodes: true, tooltipDelay: 200 }
  });

  function rebuild() {
    const q = searchQuery;
    const keepEntity = (e) => visibleTypes.has(e.type || 'Unknown') && (q === '' || (e.name || '').toLowerCase().includes(q) || (e.id || '').toLowerCase().includes(q));
    const entityIds = new Set(entities.filter(keepEntity).map(e => e.id));
    const newNodes = entities.filter(keepEntity).map(e => ({
      id: e.id,
      label: (e.id || '?') + '\\n[' + (e.type || '?') + ']',
      color: { background: colorFor(e.type), border: colorFor(e.type) },
      title: e.name || e.id
    }));
    const newEdges = relationships.filter(r => visibleRelTypes.has(r.type) && entityIds.has(r.sourceId) && entityIds.has(r.targetId)).map((r, i) => ({
      id: 'e' + i, from: r.sourceId, to: r.targetId, label: r.type, arrows: 'to'
    }));
    nodes.clear(); edges.clear();
    nodes.add(newNodes); edges.add(newEdges);
  }

  rebuild();

  const detail = document.getElementById('detail');
  function showEntity(id) {
    const e = entities.find(x => x.id === id);
    if (!e) return;
    detail.innerHTML = '<div><b>' + (e.name || e.id) + '</b><br><small>' + (e.type || '') + '</small></div><pre>' + escapeHtml(JSON.stringify(e, null, 2)) + '</pre>';
  }
  function showEdge(from, to, type) {
    const s = entities.find(x => x.id === from);
    const t = entities.find(x => x.id === to);
    detail.innerHTML = '<div><b>' + type + '</b></div><pre>' + escapeHtml((s ? s.name : from) + '\\n  → ' + (t ? t.name : to)) + '</pre>';
  }
  function escapeHtml(s) { return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }

  network.on('click', (params) => {
    if (params.nodes.length) showEntity(params.nodes[0]);
    else if (params.edges.length) {
      const eid = params.edges[0];
      const e = edges.get(eid);
      if (e) showEdge(e.from, e.to, e.label);
    } else detail.innerHTML = '<div class="empty">Click a node or edge.</div>';
  });

  document.getElementById('refit').addEventListener('click', () => network.fit({ animation: { duration: 300 } }));
  let physicsOn = true;
  document.getElementById('togglePhysics').addEventListener('click', () => {
    physicsOn = !physicsOn;
    network.setOptions({ physics: { enabled: physicsOn } });
  });
})();
</script>
</body>
</html>
`;
