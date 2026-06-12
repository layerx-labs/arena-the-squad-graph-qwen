'use client';


import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { GraphData, GraphNode, GraphLink, Player, Club } from '@/lib/types';
import { getCountries, getCountryColor, getCountryFlag, queryClubSeason, queryPlayerConnections } from '@/lib/graph';

const ForceGraph2D = dynamic(() => import('react-force-graph-2d').then(mod => mod.default), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-96"><p className="text-gray-500">Loading graph...</p></div>,
});

export default function Home() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string; country: string }>>([]);
  const [highlightNodes, setHighlightNodes] = useState<Set<string>>(new Set());
  const [highlightLinks, setHighlightLinks] = useState<Set<string>>(new Set());
  const [sidebarPlayer, setSidebarPlayer] = useState<{ id: string; player: Player; connections: any[] } | null>(null);
  const [seasonFilter, setSeasonFilter] = useState<string>('');
  const graphRef = useRef<any>(null);

  useEffect(() => {
    fetch('/data/graph-data.json')
      .then(res => res.json())
      .then((d: GraphData) => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load graph data:', err);
        setLoading(false);
      });
  }, []);

  const countries = useMemo(() => data ? getCountries(data) : [], [data]);

  const filteredNodes = useMemo(() => {
    if (!data) return [];
    const nodes: GraphNode[] = [];
    
    Object.entries(data.players).forEach(([id, player]) => {
      if (selectedCountry && player.country !== selectedCountry) return;
      
      // Count degree for this filtered view
      const degree = data.uniqueEdges.filter(e => 
        (e.source === id || e.target === id) &&
        (!selectedCountry || 
          data.players[e.source]?.country === selectedCountry || 
          data.players[e.target]?.country === selectedCountry)
      ).length;
      
      nodes.push({
        id,
        name: player.name,
        country: player.country,
        position: player.position,
        degree,
      });
    });
    
    return nodes;
  }, [data, selectedCountry]);

  const filteredLinks = useMemo(() => {
    if (!data || filteredNodes.length === 0) return [];
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    
    return data.uniqueEdges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .filter(e => {
        if (seasonFilter) {
          return e.connections.some(c => c.season === seasonFilter);
        }
        return true;
      })
      .map(e => ({
        source: e.source,
        target: e.target,
        weight: e.weight,
        connections: e.connections,
      }));
  }, [data, filteredNodes, seasonFilter]);

  const graphData = useMemo(() => ({
    nodes: filteredNodes,
    links: filteredLinks,
  }), [filteredNodes, filteredLinks]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (!data || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    const q = query.toLowerCase();
    const results = Object.entries(data.players)
      .filter(([, p]) => p.name.toLowerCase().includes(q))
      .slice(0, 10)
      .map(([id, p]) => ({ id, name: p.name, country: p.country }));
    
    setSearchResults(results);
  }, [data]);

  const handleNodeClick = useCallback((node: any) => {
    if (!data) return;
    const player = data.players[node.id];
    if (!player) return;
    
    const connections = queryPlayerConnections(data, node.id);
    setSidebarPlayer({ id: node.id, player, connections });
    setSelectedPlayer(node.id);
    
    // Highlight connected nodes
    const connected = new Set(connections.map(c => c.playerId));
    connected.add(node.id);
    setHighlightNodes(connected);
  }, [data]);

  const nodeColor = useCallback((node: any) => {
    if (highlightNodes.size > 0 && !highlightNodes.has(node.id)) {
      return 'rgba(200, 200, 200, 0.3)';
    }
    return getCountryColor(node.country, countries);
  }, [highlightNodes, countries]);

  const nodeRelVal = useCallback((node: any) => {
    if (highlightNodes.size > 0 && highlightNodes.has(node.id)) return 2;
    return 1;
  }, [highlightNodes]);

  const linkColor = useCallback((link: any) => {
    if (highlightNodes.size > 0) {
      const src = typeof link.source === 'object' ? link.source.id : link.source;
      const tgt = typeof link.target === 'object' ? link.target.id : link.target;
      if (highlightNodes.has(src) && highlightNodes.has(tgt)) {
        return 'rgba(99, 102, 241, 0.6)';
      }
      return 'rgba(200, 200, 200, 0.1)';
    }
    return 'rgba(99, 102, 241, 0.2)';
  }, [highlightNodes]);

  const seasons = useMemo(() => {
    if (!data) return [];
    const s = new Set<string>();
    Object.keys(data.groups).forEach(key => {
      const [, season] = key.split('::');
      s.add(season);
    });
    return Array.from(s).sort();
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading World Cup 2026 player graph...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-red-600">Failed to load graph data</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Left sidebar - Filters */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto p-4 border-r border-gray-200">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>
        
        {/* Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Search Players</label>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Type a player name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {searchResults.length > 0 && (
            <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
              {searchResults.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSearchQuery(r.name);
                    setSearchResults([]);
                    setSidebarPlayer({
                      id: r.id,
                      player: data.players[r.id],
                      connections: queryPlayerConnections(data, r.id),
                    });
                    setSelectedPlayer(r.id);
                    const connected = new Set(queryPlayerConnections(data, r.id).map(c => c.playerId));
                    connected.add(r.id);
                    setHighlightNodes(connected);
                    // Focus on node
                    if (graphRef.current) {
                      const node = filteredNodes.find(n => n.id === r.id);
                      if (node) {
                        graphRef.current.centerAt(node.x, node.y, 1000);
                        graphRef.current.zoom(3, 1000);
                      }
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm"
                >
                  <span className="font-medium">{r.name}</span>
                  <span className="text-gray-500 ml-2">{getCountryFlag(r.country)} {r.country}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Country filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">National Team</label>
          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setHighlightNodes(new Set());
              setSidebarPlayer(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Countries</option>
            {countries.map(c => (
              <option key={c} value={c}>{getCountryFlag(c)} {c}</option>
            ))}
          </select>
        </div>

        {/* Season filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
          <select
            value={seasonFilter}
            onChange={(e) => setSeasonFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Seasons</option>
            {seasons.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Stats */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Current View</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p>Nodes: <span className="font-medium">{filteredNodes.length}</span></p>
            <p>Edges: <span className="font-medium">{filteredLinks.length}</span></p>
            {selectedCountry && <p>Country: <span className="font-medium">{getCountryFlag(selectedCountry)} {selectedCountry}</span></p>}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend</h3>
          <div className="space-y-1 text-xs text-gray-600">
            <p>• Node color = national team</p>
            <p>• Edge = shared club season</p>
            <p>• Click a node to see connections</p>
            <p>• Drag nodes to rearrange</p>
            <p>• Scroll to zoom</p>
          </div>
        </div>

        {/* Clear button */}
        {highlightNodes.size > 0 && (
          <button
            onClick={() => {
              setHighlightNodes(new Set());
              setSidebarPlayer(null);
              setSelectedPlayer(null);
            }}
            className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Clear Selection
          </button>
        )}
      </div>

      {/* Main graph area */}
      <div className="flex-1 relative">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={(node: any) => `<b>${node.name}</b><br/>${getCountryFlag(node.country)} ${node.country}<br/>Position: ${node.position}`}
          nodeColor={nodeColor}
          nodeVal={nodeRelVal}
          nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
            const label = node.name;
            const fontSize = 12 / globalScale;
            const nodeSize = Math.max(4, Math.sqrt(node.degree || 1) * 2);
            
            // Draw node
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize, 0, 2 * Math.PI, false);
            ctx.fillStyle = nodeColor(node);
            ctx.fill();
            
            // Draw label if zoomed in enough
            if (globalScale > 1.5) {
              ctx.font = `${fontSize}px Sans-Serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'top';
              ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
              ctx.fillText(label, node.x, node.y + nodeSize + 2);
            }
          }}
          linkColor={linkColor}
          linkWidth={(link: any) => Math.max(0.5, link.weight * 0.5)}
          linkDirectionalParticles={2}
          linkDirectionalParticleWidth={1}
          onNodeClick={handleNodeClick}
          cooldownTicks={100}
          d3AlphaDecay={0.02}
          d3VelocityDecay={0.3}
          width={typeof window !== 'undefined' ? window.innerWidth - 320 - 320 : 800}
          height={typeof window !== 'undefined' ? window.innerHeight - 64 : 600}
        />
        
        {/* Stats overlay */}
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 max-w-xs">
          <h3 className="text-sm font-bold text-gray-900 mb-2">📊 Graph Stats</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p>Players: {data.meta.playerCount.toLocaleString()}</p>
            <p>Clubs: {data.meta.clubCount.toLocaleString()}</p>
            <p>Connections: {data.meta.uniqueEdgeCount.toLocaleString()}</p>
            <p>Avg connections/player: {data.stats.avgDegree.toFixed(1)}</p>
          </div>
        </div>
      </div>

      {/* Right sidebar - Player details */}
      {sidebarPlayer && (
        <div className="w-80 bg-white shadow-lg overflow-y-auto p-4 border-l border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">{sidebarPlayer.player.name}</h2>
              <p className="text-sm text-gray-600">{getCountryFlag(sidebarPlayer.player.country)} {sidebarPlayer.player.country}</p>
              <p className="text-sm text-gray-500">{sidebarPlayer.player.position}</p>
            </div>
            <button
              onClick={() => {
                setSidebarPlayer(null);
                setHighlightNodes(new Set());
                setSelectedPlayer(null);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Club history */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Club History</h3>
            <div className="space-y-1">
              {sidebarPlayer.player.stints.map((stint, i) => {
                const club = data.clubs[stint.club_id];
                return (
                  <div key={i} className="text-xs bg-gray-50 rounded p-2">
                    <span className="font-medium">{club?.name || stint.club_id}</span>
                    <span className="text-gray-500 ml-2">{stint.season}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">
              Connections ({sidebarPlayer.connections.length})
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {sidebarPlayer.connections.slice(0, 50).map((conn, i) => (
                <div key={i} className="text-xs bg-indigo-50 rounded p-2">
                  <div className="font-medium">
                    {getCountryFlag(conn.country)} {conn.playerName}
                  </div>
                  <div className="text-gray-600 mt-1">
                    {conn.connections.map((c: any, j: number) => (
                      <span key={j} className="block">
                        🏟️ {c.clubName} ({c.season})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
              {sidebarPlayer.connections.length > 50 && (
                <p className="text-xs text-gray-500 text-center">
                  ...and {sidebarPlayer.connections.length - 50} more
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
