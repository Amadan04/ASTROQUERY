import { graphAPI } from './api-client.js';

// Load Cytoscape.js from CDN
function loadCytoscape() {
  return new Promise((resolve, reject) => {
    if (window.cytoscape) {
      resolve(window.cytoscape);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/cytoscape@3.26.0/dist/cytoscape.min.js';
    script.onload = () => resolve(window.cytoscape);
    script.onerror = () => reject(new Error('Failed to load Cytoscape.js'));
    document.head.appendChild(script);
  });
}


export async function renderGraph(host) {
  host.innerHTML = `
    <div class="page-shell">
      <h2 class="card-title" style="margin-bottom:10px;">Knowledge Graph</h2>
      <div class="full-grid">
        <aside class="panel" style="position:sticky; top:86px;">
          <h3 style="margin-top:0;">Graph Controls</h3>
          <label>Node Types</label>
          <div class="row" style="flex-wrap:wrap; gap:10px;">
            ${['Concepts','Organisms','Processes','Structures','Chemicals','Equipment'].map((t,i)=>`
              <label class="pill"><span class="dot" style="background:${['#46e','#2ecc71','#f39c12','#e74c3c','#9b59b6','#34495e'][i]}"></span>
                <input type="checkbox" checked> ${t}
              </label>`).join('')}
          </div>
          <div style="height:12px;"></div>
          <label>Filter by Entity Type</label>
          <select id="entityTypeFilter" class="input" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--stroke); background:#0b1428; color:#eaf6ff;">
            <option value="">All Types</option>
          </select>
          <div style="height:12px;"></div>
          <label>Max Nodes to Display</label>
          <select id="nodeLimit" class="input" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--stroke); background:#0b1428; color:#eaf6ff;">
            <option value="100">100 nodes</option>
            <option value="300" selected>300 nodes</option>
            <option value="500">500 nodes</option>
            <option value="1000">1000 nodes</option>
            <option value="all">All nodes</option>
          </select>
          <div style="height:12px;"></div>
          <label>Search Nodes</label>
          <input id="nodeSearch" class="input" placeholder="Search by name…" style="width:100%; padding:10px 12px; border-radius:10px; border:1px solid var(--stroke); background:#0b1428; color:#eaf6ff;">
          <div style="height:12px;"></div>
          <div class="stat">
            <div style="margin-bottom:6px;"><strong>Graph Statistics</strong></div>
            <div class="muted" id="gStats">Loading...</div>
          </div>
        </aside>

        <section class="panel" style="position:relative;">
          <div class="toolbar" style="position:absolute; right:12px; top:12px; display:flex; flex-direction:column; gap:8px; z-index:10;">
            <button id="zoomIn" class="btn" title="Zoom in">+</button>
            <button id="zoomOut" class="btn" title="Zoom out">-</button>
            <button id="resetView" class="btn" title="Reset view">↻</button>
          </div>
          <div id="graphContainer" style="width:100%; height:540px; background:#0b1a30; border:1px dashed var(--stroke); border-radius:12px; position:relative;">
            <div id="graphLoading" class="loading-state" style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%);">
              <div class="spinner"></div>
              <p>Loading knowledge graph...</p>
            </div>
            <div id="graphError" class="error-state" style="display:none; position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); text-align:center;">
              <p>Failed to load graph data</p>
              <button id="retryGraph" class="btn">Retry</button>
            </div>
            <div id="cytoscape-graph" style="display:none; width:100%; height:100%;"></div>
          </div>
          <div class="muted" id="graphStatus" style="margin-top:8px;">Loading graph data...</div>
        </section>
      </div>
    </div>
  `;

  // Load graph data
  await loadGraphData();
}

async function loadGraphData() {
  const loadingEl = document.getElementById('graphLoading');
  const errorEl = document.getElementById('graphError');
  const graphEl = document.getElementById('cytoscape-graph');
  const statsEl = document.getElementById('gStats');
  const statusEl = document.getElementById('graphStatus');

  try {
    console.log('🕸️ Graph: Loading graph data...');
    
    // Load Cytoscape.js first
    console.log('🕸️ Graph: Loading Cytoscape.js...');
    const cytoscape = await loadCytoscape();
    console.log('🕸️ Graph: Cytoscape.js loaded successfully');
    
    // Fetch all graph data from backend
    console.log('🕸️ Graph: Fetching data from backend...');
    const [entities, triples, stats] = await Promise.all([
      graphAPI.getEntities(),
      graphAPI.getTriples(),
      graphAPI.getStats()
    ]);

    console.log('🕸️ Graph: Data received:', { entities: entities.length, triples: triples.length, stats });

    // Update statistics
    statsEl.innerHTML = `
      <strong>Database:</strong><br/>
      Entities: ${stats.entities}<br/>
      Triples: ${stats.triples}<br/>
      Publications: ${stats.publications}<br/>
      <br/>
      <strong>Graph Display:</strong><br/>
      <span id="displayStats">Loading...</span>
    `;

    // Update status
    statusEl.textContent = `${stats.entities} entities • ${stats.triples} relationships • ${stats.publications} publications`;

    // Populate entity type filter
    const entityTypes = [...new Set(entities.map(e => e.type).filter(t => t))];
    const typeFilter = document.getElementById('entityTypeFilter');
    entityTypes.forEach(type => {
      const option = document.createElement('option');
      option.value = type;
      option.textContent = type;
      typeFilter.appendChild(option);
    });

    // Hide loading, show graph
    loadingEl.style.display = 'none';
    graphEl.style.display = 'block';

    // Render the interactive graph with Cytoscape
    renderCytoscapeGraph(cytoscape, entities, triples);

  } catch (error) {
    console.error('🕸️ Graph: Error loading graph data:', error);
    
    loadingEl.style.display = 'none';
    errorEl.style.display = 'block';
    statusEl.textContent = 'Failed to load graph data: ' + error.message;
    
    // Add retry functionality
    const retryBtn = document.getElementById('retryGraph');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        errorEl.style.display = 'none';
        loadingEl.style.display = 'block';
        loadGraphData();
      });
    }
  }
}

function renderCytoscapeGraph(cytoscape, entities, triples) {
  console.log('🕸️ Graph: Rendering Cytoscape graph with', entities.length, 'entities and', triples.length, 'triples');
  
  // Debug: Show sample entities and triples
  if (entities.length > 0) {
    console.log('🕸️ Graph: Sample entity:', entities[0]);
  }
  if (triples.length > 0) {
    console.log('🕸️ Graph: Sample triple:', triples[0]);
  }
  
  // Create nodes from entities
  const nodes = entities.map(entity => ({
    data: {
      id: `entity_${entity.id}`,
      label: entity.text,
      type: entity.type || 'unknown',
      entity: entity
    }
  }));

  // Create a mapping from entity text to entity ID
  const entityTextToId = new Map();
  entities.forEach(entity => {
    entityTextToId.set(entity.text.toLowerCase(), `entity_${entity.id}`);
  });

  console.log('🕸️ Graph: Entity text to ID mapping:', entityTextToId);

  // Create edges from triples, matching subject and object text to entity IDs
  const edges = [];
  triples.forEach(triple => {
    const sourceId = entityTextToId.get(triple.subject.toLowerCase());
    const targetId = entityTextToId.get(triple.object.toLowerCase());
    
    if (sourceId && targetId) {
      edges.push({
        data: {
          id: `triple_${triple.id}`,
          source: sourceId,
          target: targetId,
          label: triple.relation,
          triple: triple
        }
      });
    } else {
      console.log('🕸️ Graph: Skipping triple - missing entities:', {
        subject: triple.subject,
        object: triple.object,
        sourceId,
        targetId
      });
    }
  });

  console.log('🕸️ Graph: Created', edges.length, 'edges from', triples.length, 'triples');

  // Smart filtering: Show most connected entities and their relationships
  // Count connections for each entity
  const entityConnectionCounts = new Map();
  edges.forEach(edge => {
    const source = edge.data.source;
    const target = edge.data.target;
    
    entityConnectionCounts.set(source, (entityConnectionCounts.get(source) || 0) + 1);
    entityConnectionCounts.set(target, (entityConnectionCounts.get(target) || 0) + 1);
  });

  // Sort entities by connection count (most connected first)
  const sortedNodes = nodes.sort((a, b) => {
    const aConnections = entityConnectionCounts.get(a.data.id) || 0;
    const bConnections = entityConnectionCounts.get(b.data.id) || 0;
    return bConnections - aConnections;
  });

  // Get node limit from selector (default to 300)
  const nodeLimitSelect = document.getElementById('nodeLimit');
  const nodeLimit = nodeLimitSelect ? parseInt(nodeLimitSelect.value) || 300 : 300;
  
  // Take top N most connected entities
  const limitedNodes = nodeLimit === 'all' ? sortedNodes : sortedNodes.slice(0, nodeLimit);
  const connectedEntityIds = new Set();
  limitedNodes.forEach(node => connectedEntityIds.add(node.data.id));
  
  // Filter edges to only include those connecting visible nodes
  const limitedEdges = edges.filter(edge => 
    connectedEntityIds.has(edge.data.source) && connectedEntityIds.has(edge.data.target)
  );

  console.log('🕸️ Graph: Smart filtering - showing top', limitedNodes.length, 'most connected entities');
  console.log('🕸️ Graph: After limiting -', limitedNodes.length, 'nodes,', limitedEdges.length, 'edges');
  console.log('🕸️ Graph: Total available -', nodes.length, 'nodes,', edges.length, 'edges');
  
  // Update display statistics
  const displayStatsEl = document.getElementById('displayStats');
  if (displayStatsEl) {
    displayStatsEl.innerHTML = `
      Nodes: ${limitedNodes.length}<br/>
      Edges: ${limitedEdges.length}<br/>
      Coverage: ${Math.round((limitedNodes.length / nodes.length) * 100)}% of entities
    `;
  }
  
  // Show top connected entities for debugging
  const topConnected = limitedNodes.slice(0, 5).map(node => ({
    text: node.data.label,
    connections: entityConnectionCounts.get(node.data.id) || 0
  }));
  console.log('🕸️ Graph: Top connected entities:', topConnected);

  console.log('🕸️ Graph: Limited to', limitedNodes.length, 'nodes and', limitedEdges.length, 'edges');

  // Initialize Cytoscape
  const cy = cytoscape({
    container: document.getElementById('cytoscape-graph'),
    elements: [...limitedNodes, ...limitedEdges],
    style: [
      {
        selector: 'node',
        style: {
          'background-color': '#46e',
          'label': 'data(label)',
          'text-valign': 'center',
          'text-halign': 'center',
          'color': '#eaf6ff',
          'font-size': '12px',
          'text-wrap': 'wrap',
          'text-max-width': '100px',
          'width': '60px',
          'height': '60px',
          'border-width': '2px',
          'border-color': '#2ecc71'
        }
      },
      {
        selector: 'node[type="concept"]',
        style: {
          'background-color': '#46e',
          'border-color': '#46e'
        }
      },
      {
        selector: 'node[type="organism"]',
        style: {
          'background-color': '#2ecc71',
          'border-color': '#2ecc71'
        }
      },
      {
        selector: 'node[type="process"]',
        style: {
          'background-color': '#f39c12',
          'border-color': '#f39c12'
        }
      },
      {
        selector: 'node[type="structure"]',
        style: {
          'background-color': '#e74c3c',
          'border-color': '#e74c3c'
        }
      },
      {
        selector: 'node[type="chemical"]',
        style: {
          'background-color': '#9b59b6',
          'border-color': '#9b59b6'
        }
      },
      {
        selector: 'node[type="equipment"]',
        style: {
          'background-color': '#34495e',
          'border-color': '#34495e'
        }
      },
      {
        selector: 'edge',
        style: {
          'width': '2px',
          'line-color': '#bcd7ff',
          'target-arrow-color': '#bcd7ff',
          'target-arrow-shape': 'triangle',
          'curve-style': 'bezier',
          'label': 'data(label)',
          'font-size': '10px',
          'color': '#bcd7ff',
          'text-rotation': 'autorotate',
          'text-margin-y': '-10px'
        }
      },
      {
        selector: 'node:selected',
        style: {
          'border-width': '4px',
          'border-color': '#ff6b6b'
        }
      },
      {
        selector: 'edge:selected',
        style: {
          'line-color': '#ff6b6b',
          'target-arrow-color': '#ff6b6b',
          'width': '4px'
        }
      }
    ],
    layout: {
      name: 'cose',
      idealEdgeLength: 100,
      nodeOverlap: 20,
      refresh: 20,
      fit: true,
      padding: 30,
      randomize: false,
      componentSpacing: 100,
      nodeRepulsion: 400000,
      edgeElasticity: 100,
      nestingFactor: 5,
      gravity: 80,
      numIter: 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0
    }
  });

  // Add event listeners
  cy.on('tap', 'node', function(evt) {
    const node = evt.target;
    const entity = node.data('entity');
    console.log('🕸️ Graph: Selected node:', entity);
    
    // Update status with node info
    const statusEl = document.getElementById('graphStatus');
    statusEl.textContent = `Selected: ${entity.text} (${entity.type || 'unknown'})`;
  });

  cy.on('tap', 'edge', function(evt) {
    const edge = evt.target;
    const triple = edge.data('triple');
    console.log('🕸️ Graph: Selected edge:', triple);
    
    // Update status with edge info
    const statusEl = document.getElementById('graphStatus');
    statusEl.textContent = `Relationship: ${triple.subject} → ${triple.relation} → ${triple.object}`;
  });

  cy.on('tap', function(evt) {
    if (evt.target === cy) {
      const statusEl = document.getElementById('graphStatus');
      statusEl.textContent = `${cy.nodes().length} nodes • ${cy.edges().length} edges • no selection`;
    }
  });

  // Add zoom controls
  document.getElementById('zoomIn').addEventListener('click', () => {
    cy.zoom(cy.zoom() * 1.2);
  });

  document.getElementById('zoomOut').addEventListener('click', () => {
    cy.zoom(cy.zoom() * 0.8);
  });

  document.getElementById('resetView').addEventListener('click', () => {
    cy.fit();
  });

  // Add search functionality
  const searchInput = document.getElementById('nodeSearch');
  const typeFilter = document.getElementById('entityTypeFilter');
  
  function filterGraph() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    
    console.log('🕸️ Graph: Filtering by search:', searchTerm, 'and type:', selectedType);
    
    // Hide all nodes first
    cy.nodes().style('display', 'none');
    cy.edges().style('display', 'none');
    
    // Show matching nodes
    const matchingNodes = cy.nodes().filter(node => {
      const entity = node.data('entity');
      const matchesSearch = !searchTerm || entity.text.toLowerCase().includes(searchTerm);
      const matchesType = !selectedType || entity.type === selectedType;
      return matchesSearch && matchesType;
    });
    
    matchingNodes.style('display', 'block');
    
    // Show edges between visible nodes
    const visibleNodeIds = new Set(matchingNodes.map(node => node.id()));
    const visibleEdges = cy.edges().filter(edge => {
      const source = edge.source().id();
      const target = edge.target().id();
      return visibleNodeIds.has(source) && visibleNodeIds.has(target);
    });
    
    visibleEdges.style('display', 'block');
    
    // Update layout
    cy.layout({ name: 'cose' }).run();
  }
  
  searchInput.addEventListener('input', filterGraph);
  typeFilter.addEventListener('change', filterGraph);
  
  // Add node limit change handler
  const nodeLimitSelectHandler = document.getElementById('nodeLimit');
  if (nodeLimitSelectHandler) {
    nodeLimitSelectHandler.addEventListener('change', () => {
      console.log('🕸️ Graph: Node limit changed, reloading graph...');
      // Reload the entire graph with new node limit
      loadGraphData();
    });
  }

  console.log('🕸️ Graph: Cytoscape graph rendered successfully');
}
