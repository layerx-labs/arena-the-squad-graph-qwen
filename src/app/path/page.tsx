'use client';

import { useState, useEffect, useMemo } from 'react';
import { GraphData } from '@/lib/types';
import { buildAdjacencyMap, findPath, getCountryFlag } from '@/lib/graph';

export default function PathFinderPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [player1Search, setPlayer1Search] = useState('');
  const [player2Search, setPlayer2Search] = useState('');
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [player1Results, setPlayer1Results] = useState<Array<{ id: string; name: string; country: string }>>([]);
  const [player2Results, setPlayer2Results] = useState<Array<{ id: string; name: string; country: string }>>([]);
  
  const [pathResult, setPathResult] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetch('/data/graph-data.json')
      .then(res => res.json())
      .then((d: GraphData) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const adjacencyMap = useMemo(() => {
    if (!data) return new Map();
    return buildAdjacencyMap(data);
  }, [data]);

  const handlePlayer1Search = (query: string) => {
    setPlayer1Search(query);
    if (!data || query.length < 2) {
      setPlayer1Results([]);
      return;
    }
    const q = query.toLowerCase();
    const results = Object.entries(data.players)
      .filter(([, p]) => p.name.toLowerCase().includes(q))
      .slice(0, 15)
      .map(([id, p]) => ({ id, name: p.name, country: p.country }));
    setPlayer1Results(results);
  };

  const handlePlayer2Search = (query: string) => {
    setPlayer2Search(query);
    if (!data || query.length < 2) {
      setPlayer2Results([]);
      return;
    }
    const q = query.toLowerCase();
    const results = Object.entries(data.players)
      .filter(([, p]) => p.name.toLowerCase().includes(q))
      .slice(0, 15)
      .map(([id, p]) => ({ id, name: p.name, country: p.country }));
    setPlayer2Results(results);
  };

  const findShortestPath = () => {
    if (!data || !player1Id || !player2Id) return;
    
    setSearching(true);
    
    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const path = findPath(adjacencyMap, player1Id, player2Id);
      
      if (!path) {
        setPathResult({ found: false });
        setSearching(false);
        return;
      }
      
      // Build path details with club connections
      const pathDetails = [];
      for (let i = 0; i < path.length - 1; i++) {
        const currentId = path[i];
        const nextId = path[i + 1];
        
        // Find the edge between these two players
        const edge = data.uniqueEdges.find(e => 
          (e.source === currentId && e.target === nextId) ||
          (e.source === nextId && e.target === currentId)
        );
        
        pathDetails.push({
          from: {
            id: currentId,
            name: data.players[currentId].name,
            country: data.players[currentId].country,
          },
          to: {
            id: nextId,
            name: data.players[nextId].name,
            country: data.players[nextId].country,
          },
          connections: edge?.connections || [],
        });
      }
      
      setPathResult({
        found: true,
        distance: path.length - 1,
        path: path.map(id => ({
          id,
          name: data.players[id].name,
          country: data.players[id].country,
        })),
        details: pathDetails,
      });
      setSearching(false);
    }, 100);
  };

  const randomPair = () => {
    if (!data) return;
    const playerIds = Object.keys(data.players);
    const idx1 = Math.floor(Math.random() * playerIds.length);
    let idx2 = Math.floor(Math.random() * playerIds.length);
    while (idx2 === idx1) {
      idx2 = Math.floor(Math.random() * playerIds.length);
    }
    
    const p1 = data.players[playerIds[idx1]];
    const p2 = data.players[playerIds[idx2]];
    
    setPlayer1Id(playerIds[idx1]);
    setPlayer2Id(playerIds[idx2]);
    setPlayer1Search(p1.name);
    setPlayer2Search(p2.name);
    setPathResult(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading path finder...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <p className="text-red-600">Failed to load data</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔗 Path Finder</h1>
        <p className="text-gray-600">
          Find the shortest path between any two World Cup 2026 players through shared club history
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Player 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Player 1</label>
            <input
              type="text"
              value={player1Search}
              onChange={(e) => handlePlayer1Search(e.target.value)}
              placeholder="Search for a player..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {player1Results.length > 0 && (
              <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {player1Results.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setPlayer1Search(r.name);
                      setPlayer1Id(r.id);
                      setPlayer1Results([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm"
                  >
                    <span className="font-medium">{getCountryFlag(r.country)} {r.name}</span>
                    <span className="text-gray-500 ml-2">({r.country})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Player 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Player 2</label>
            <input
              type="text"
              value={player2Search}
              onChange={(e) => handlePlayer2Search(e.target.value)}
              placeholder="Search for a player..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {player2Results.length > 0 && (
              <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {player2Results.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setPlayer2Search(r.name);
                      setPlayer2Id(r.id);
                      setPlayer2Results([]);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm"
                  >
                    <span className="font-medium">{getCountryFlag(r.country)} {r.name}</span>
                    <span className="text-gray-500 ml-2">({r.country})</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={findShortestPath}
            disabled={!player1Id || !player2Id || searching}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {searching ? 'Finding Path...' : 'Find Path'}
          </button>
          <button
            onClick={randomPair}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Random Pair
          </button>
        </div>
      </div>

      {/* Results */}
      {pathResult && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          {!pathResult.found ? (
            <div className="text-center py-8">
              <p className="text-xl text-gray-600">No path found between these players</p>
              <p className="text-sm text-gray-500 mt-2">
                These players are not connected through shared club history
              </p>
            </div>
          ) : (
            <>
              <div className="bg-indigo-50 rounded-lg p-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  Path Found! Distance: {pathResult.distance}
                </h2>
                <p className="text-sm text-gray-600">
                  {pathResult.path.length} players in the chain
                </p>
              </div>

              {/* Path visualization */}
              <div className="space-y-4">
                {pathResult.details.map((detail: any, i: number) => (
                  <div key={i}>
                    {/* Player node */}
                    <div className="flex items-center gap-3 bg-white border-2 border-indigo-200 rounded-lg p-4">
                      <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {getCountryFlag(detail.from.country)} {detail.from.name}
                        </div>
                        <div className="text-sm text-gray-600">{detail.from.country}</div>
                      </div>
                    </div>

                    {/* Connection */}
                    <div className="ml-5 border-l-2 border-indigo-300 pl-6 py-2">
                      <div className="text-sm text-gray-700 space-y-1">
                        {detail.connections.map((c: any, j: number) => (
                          <div key={j} className="flex items-center gap-2">
                            <span>🏟️</span>
                            <span className="font-medium">{c.clubName}</span>
                            <span className="text-gray-500">({c.season})</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Last player */}
                    {i === pathResult.details.length - 1 && (
                      <div className="flex items-center gap-3 bg-white border-2 border-indigo-200 rounded-lg p-4">
                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                          {i + 2}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900">
                            {getCountryFlag(detail.to.country)} {detail.to.name}
                          </div>
                          <div className="text-sm text-gray-600">{detail.to.country}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
