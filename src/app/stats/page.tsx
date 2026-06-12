'use client';

import { useState, useEffect } from 'react';
import { GraphData } from '@/lib/types';
import { getCountryFlag } from '@/lib/graph';

export default function StatsPage() {
  const [data, setData] = useState<GraphData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/graph-data.json')
      .then(res => res.json())
      .then((d: GraphData) => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading statistics...</p>
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📊 Statistics & Insights</h1>
        <p className="text-gray-600">Explore the network of World Cup 2026 player connections</p>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-3xl font-bold text-indigo-600">{data.meta.playerCount.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Players</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-3xl font-bold text-indigo-600">{data.meta.clubCount.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Clubs</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-3xl font-bold text-indigo-600">{data.meta.uniqueEdgeCount.toLocaleString()}</div>
          <div className="text-sm text-gray-600 mt-1">Unique Connections</div>
        </div>
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-3xl font-bold text-indigo-600">{data.stats.avgDegree.toFixed(1)}</div>
          <div className="text-sm text-gray-600 mt-1">Avg Connections/Player</div>
        </div>
      </div>

      {/* Top Connected Players */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🌟 Most Connected Players</h2>
        <p className="text-sm text-gray-600 mb-4">
          Players with the most connections to other World Cup 2026 players through shared club history
        </p>
        <div className="space-y-2">
          {data.stats.topConnectedPlayers.slice(0, 15).map((player, i) => (
            <div key={player.playerId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {getCountryFlag(player.country)} {player.playerName}
                </div>
                <div className="text-sm text-gray-600">{player.country}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{player.degree}</div>
                <div className="text-xs text-gray-500">connections</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clubs */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🏟️ Top Clubs by World Cup Players</h2>
        <p className="text-sm text-gray-600 mb-4">
          Clubs with the most World Cup 2026 players in a single season
        </p>
        <div className="space-y-2">
          {data.stats.topClubs.slice(0, 15).map((club, i) => (
            <div key={`${club.clubId}-${club.season}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{club.clubName}</div>
                <div className="text-sm text-gray-600">
                  {club.country} • {club.season}
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{club.playerCount}</div>
                <div className="text-xs text-gray-500">players</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Country Pairs */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🌍 Strongest Cross-Country Connections</h2>
        <p className="text-sm text-gray-600 mb-4">
          National team pairs with the most club connections between their players
        </p>
        <div className="space-y-2">
          {data.stats.countryPairs.slice(0, 15).map((pair, i) => (
            <div key={pair.pair} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{pair.pair}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{pair.count}</div>
                <div className="text-xs text-gray-500">connections</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* League Connections */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">⚽ League Connections by Country</h2>
        <p className="text-sm text-gray-600 mb-4">
          Which countries' leagues produced the most connections between World Cup players
        </p>
        <div className="space-y-2">
          {data.stats.leagueConnections.slice(0, 15).map((league, i) => (
            <div key={league.country} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">{getCountryFlag(league.country)} {league.country}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-indigo-600">{league.count}</div>
                <div className="text-xs text-gray-500">connections</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
