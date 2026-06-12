'use client';

import { useState, useEffect, useMemo } from 'react';
import { GraphData } from '@/lib/types';
import { getCountries, getCountryFlag, queryClubSeason, queryPlayerConnections, queryCountryVsCountry } from '@/lib/graph';

type QueryMode = 'club-season' | 'player' | 'country-vs-country';

export default function QueryPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<QueryMode>('club-season');

  // Club + Season query
  const [clubSearch, setClubSearch] = useState('');
  const [selectedClubId, setSelectedClubId] = useState('');
  const [season, setSeason] = useState('');
  const [clubResults, setClubResults] = useState<Array<{ id: string; name: string; country: string }>>([]);
  const [queryResult, setQueryResult] = useState<any>(null);

  // Player query
  const [playerSearch, setPlayerSearch] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerResults, setPlayerResults] = useState<Array<{ id: string; name: string; country: string }>>([]);
  const [playerQueryResult, setPlayerQueryResult] = useState<any>(null);

  // Country vs Country query
  const [country1, setCountry1] = useState('');
  const [country2, setCountry2] = useState('');
  const [countryQueryResult, setCountryQueryResult] = useState<any>(null);

  useEffect(() => {
    fetch('/data/graph-data.json')
      .then(res => res.json())
      .then((d: GraphData) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  const countries = useMemo(() => data ? getCountries(data) : [], [data]);
  const seasons = useMemo(() => {
    if (!data) return [];
    const s = new Set<string>();
    Object.keys(data.groups).forEach(key => {
      const [, season] = key.split('::');
      s.add(season);
    });
    return Array.from(s).sort();
  }, [data]);

  // Club search
  const handleClubSearch = (query: string) => {
    setClubSearch(query);
    if (!data || query.length < 2) {
      setClubResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results = Object.entries(data.clubs)
      .filter(([, c]) => c.name.toLowerCase().includes(q))
      .slice(0, 15)
      .map(([id, c]) => ({ id, name: c.name, country: c.country }));
    setClubResults(results);
  };

  // Player search
  const handlePlayerSearch = (query: string) => {
    setPlayerSearch(query);
    if (!data || query.length < 2) {
      setPlayerResults([]);
      return;
    }
    const q = query.toLowerCase();
    const results = Object.entries(data.players)
      .filter(([, p]) => p.name.toLowerCase().includes(q))
      .slice(0, 15)
      .map(([id, p]) => ({ id, name: p.name, country: p.country }));
    setPlayerResults(results);
  };

  // Execute club+season query
  const executeClubSeasonQuery = () => {
    if (!data || !selectedClubId || !season) return;
    const playerIds = queryClubSeason(data, selectedClubId, season);
    const club = data.clubs[selectedClubId];
    setQueryResult({
      club: club?.name || selectedClubId,
      country: club?.country || 'Unknown',
      season,
      players: playerIds.map(id => ({
        id,
        name: data.players[id]?.name,
        country: data.players[id]?.country,
        position: data.players[id]?.position,
      })),
    });
  };

  // Execute player query
  const executePlayerQuery = () => {
    if (!data || !selectedPlayerId) return;
    const connections = queryPlayerConnections(data, selectedPlayerId);
    const player = data.players[selectedPlayerId];
    setPlayerQueryResult({
      player: player?.name,
      country: player?.country,
      connections,
    });
  };

  // Execute country vs country query
  const executeCountryQuery = () => {
    if (!data || !country1 || !country2 || country1 === country2) return;
    const connections = queryCountryVsCountry(data, country1, country2);
    setCountryQueryResult({
      country1,
      country2,
      connections,
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading query interface...</p>
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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🔍 Query Interface</h1>
        <p className="text-gray-600">Explore the World Cup 2026 player network with three query modes</p>
      </div>

      {/* Mode selector */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setMode('club-season')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'club-season'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Club + Season
        </button>
        <button
          onClick={() => setMode('player')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'player'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Player Connections
        </button>
        <button
          onClick={() => setMode('country-vs-country')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            mode === 'country-vs-country'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Country vs Country
        </button>
      </div>

      {/* Club + Season Query */}
      {mode === 'club-season' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Find Players at Club in Season</h2>
          <p className="text-gray-600 mb-6">
            Discover which World Cup 2026 players were teammates at the same club during a specific season.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Club search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Club</label>
              <input
                type="text"
                value={clubSearch}
                onChange={(e) => handleClubSearch(e.target.value)}
                placeholder="Search for a club..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {clubResults.length > 0 && (
                <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {clubResults.map(r => (
                    <button
                      key={r.id}
                      onClick={() => {
                        setClubSearch(r.name);
                        setSelectedClubId(r.id);
                        setClubResults([]);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-indigo-50 text-sm"
                    >
                      <span className="font-medium">{r.name}</span>
                      <span className="text-gray-500 ml-2">({r.country})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Season selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
              <select
                value={season}
                onChange={(e) => setSeason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a season</option>
                {seasons.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={executeClubSeasonQuery}
            disabled={!selectedClubId || !season}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Query
          </button>

          {/* Results */}
          {queryResult && (
            <div className="mt-6">
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {queryResult.club} ({queryResult.country})
                </h3>
                <p className="text-gray-600">Season: {queryResult.season}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Found {queryResult.players.length} World Cup player{queryResult.players.length !== 1 ? 's' : ''}
                </p>
              </div>

              {queryResult.players.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {queryResult.players.map((p: any) => (
                    <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="font-medium text-gray-900">
                        {getCountryFlag(p.country)} {p.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{p.country}</div>
                      <div className="text-xs text-gray-500">{p.position}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No World Cup players found at this club in this season</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Player Query */}
      {mode === 'player' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Player Connections</h2>
          <p className="text-gray-600 mb-6">
            Find all other World Cup 2026 players who shared a club with this player at some point.
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Player</label>
            <input
              type="text"
              value={playerSearch}
              onChange={(e) => handlePlayerSearch(e.target.value)}
              placeholder="Search for a player..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {playerResults.length > 0 && (
              <div className="mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {playerResults.map(r => (
                  <button
                    key={r.id}
                    onClick={() => {
                      setPlayerSearch(r.name);
                      setSelectedPlayerId(r.id);
                      setPlayerResults([]);
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

          <button
            onClick={executePlayerQuery}
            disabled={!selectedPlayerId}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Query
          </button>

          {/* Results */}
          {playerQueryResult && (
            <div className="mt-6">
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {getCountryFlag(playerQueryResult.country)} {playerQueryResult.player}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Connected to {playerQueryResult.connections.length} other World Cup player{playerQueryResult.connections.length !== 1 ? 's' : ''}
                </p>
              </div>

              {playerQueryResult.connections.length > 0 ? (
                <div className="space-y-2">
                  {playerQueryResult.connections.map((conn: any, i: number) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="font-medium text-gray-900 mb-2">
                        {getCountryFlag(conn.country)} {conn.playerName}
                        <span className="text-sm text-gray-500 ml-2">({conn.country})</span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {conn.connections.map((c: any, j: number) => (
                          <div key={j} className="flex items-center gap-2">
                            <span>🏟️</span>
                            <span className="font-medium">{c.clubName}</span>
                            <span className="text-gray-500">({c.season})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No connections found</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Country vs Country Query */}
      {mode === 'country-vs-country' && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Country vs Country</h2>
          <p className="text-gray-600 mb-6">
            Find all club connections between players from two different national teams.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country 1</label>
              <select
                value={country1}
                onChange={(e) => setCountry1(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a country</option>
                {countries.map(c => (
                  <option key={c} value={c}>{getCountryFlag(c)} {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country 2</label>
              <select
                value={country2}
                onChange={(e) => setCountry2(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a country</option>
                {countries.filter(c => c !== country1).map(c => (
                  <option key={c} value={c}>{getCountryFlag(c)} {c}</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={executeCountryQuery}
            disabled={!country1 || !country2}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Query
          </button>

          {/* Results */}
          {countryQueryResult && (
            <div className="mt-6">
              <div className="bg-indigo-50 rounded-lg p-4 mb-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {getCountryFlag(countryQueryResult.country1)} {countryQueryResult.country1}
                  {' vs '}
                  {getCountryFlag(countryQueryResult.country2)} {countryQueryResult.country2}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Found {countryQueryResult.connections.length} connection{countryQueryResult.connections.length !== 1 ? 's' : ''}
                </p>
              </div>

              {countryQueryResult.connections.length > 0 ? (
                <div className="space-y-2">
                  {countryQueryResult.connections.map((conn: any, i: number) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow">
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <div>
                          <div className="font-medium text-gray-900">
                            {getCountryFlag(data.players[conn.player1Id]?.country)} {conn.player1Name}
                          </div>
                          <div className="text-sm text-gray-600">{data.players[conn.player1Id]?.country}</div>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {getCountryFlag(data.players[conn.player2Id]?.country)} {conn.player2Name}
                          </div>
                          <div className="text-sm text-gray-600">{data.players[conn.player2Id]?.country}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1 border-t pt-2">
                        {conn.connections.map((c: any, j: number) => (
                          <div key={j} className="flex items-center gap-2">
                            <span>🏟️</span>
                            <span className="font-medium">{c.clubName}</span>
                            <span className="text-gray-500">({c.season})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No connections found between these countries</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
