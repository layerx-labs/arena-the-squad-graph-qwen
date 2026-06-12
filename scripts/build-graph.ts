import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// Types matching the dataset schema
interface Stint {
  club_id: string;
  season: string;
}

interface Player {
  id: string;
  name: string;
  country: string;
  position: string;
  current_club_id: string;
  stints: Stint[];
}

interface Club {
  id: string;
  name: string;
  country: string;
}

interface Dataset {
  meta: any;
  clubs: Club[];
  players: Player[];
}

interface GraphData {
  meta: {
    playerCount: number;
    clubCount: number;
    edgeCount: number;
    uniqueEdgeCount: number;
    groupCount: number;
  };
  // Unique edges (one per player pair) with aggregated club-seasons
  uniqueEdges: Array<{
    source: string;
    target: string;
    connections: Array<{ clubId: string; clubName: string; season: string }>;
    weight: number;
  }>;
  // Groups: "clubId::season" -> player IDs
  groups: Record<string, string[]>;
  // Club lookup
  clubs: Record<string, { name: string; country: string }>;
  // Player lookup
  players: Record<string, { name: string; country: string; position: string; current_club_id: string; stints: Stint[] }>;
  // Stats
  stats: {
    topClubs: Array<{ clubId: string; clubName: string; country: string; season: string; playerCount: number }>;
    topConnectedPlayers: Array<{ playerId: string; playerName: string; country: string; degree: number }>;
    totalEdges: number;
    uniqueEdges: number;
    avgDegree: number;
    countryPairs: Array<{ pair: string; count: number }>;
    leagueConnections: Array<{ country: string; count: number }>;
  };
}

console.log('Loading players.json...');
const dataPath = join(process.cwd(), 'public/data/players.json');
const data: Dataset = JSON.parse(readFileSync(dataPath, 'utf-8'));

console.log(`Loaded ${data.players.length} players and ${data.clubs.length} clubs`);

// Build club lookup map
const clubMap = new Map<string, Club>();
data.clubs.forEach(club => clubMap.set(club.id, club));

// Build groups: (club_id, season) -> Set of player IDs
console.log('Building groups...');
const groups = new Map<string, Set<string>>();
data.players.forEach(player => {
  player.stints.forEach(stint => {
    const key = `${stint.club_id}::${stint.season}`;
    if (!groups.has(key)) {
      groups.set(key, new Set());
    }
    groups.get(key)!.add(player.id);
  });
});

// Build unique edges: for each player pair, aggregate all club-seasons they shared
console.log('Building edges...');
const edgeMap = new Map<string, { source: string; target: string; connections: Array<{ clubId: string; clubName: string; season: string }> }>();

// Also build adjacency for degree computation
const adjacency = new Map<string, Set<string>>();

let totalEdgeCount = 0;

groups.forEach((playerIds, key) => {
  if (playerIds.size < 2) return;
  
  const [clubId, season] = key.split('::');
  const club = clubMap.get(clubId);
  const clubName = club?.name || 'Unknown Club';
  
  const players = Array.from(playerIds);
  
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      totalEdgeCount++;
      const pairKey = [players[i], players[j]].sort().join('::');
      
      if (!edgeMap.has(pairKey)) {
        edgeMap.set(pairKey, {
          source: [players[i], players[j]].sort()[0],
          target: [players[i], players[j]].sort()[1],
          connections: [],
        });
      }
      edgeMap.get(pairKey)!.connections.push({ clubId, clubName, season });
      
      // Track adjacency for degree
      if (!adjacency.has(players[i])) adjacency.set(players[i], new Set());
      if (!adjacency.has(players[j])) adjacency.set(players[j], new Set());
      adjacency.get(players[i])!.add(players[j]);
      adjacency.get(players[j])!.add(players[i]);
    }
  }
});

const uniqueEdges = Array.from(edgeMap.values()).map(e => ({
  ...e,
  weight: e.connections.length,
}));

console.log(`Generated ${totalEdgeCount} total edges, ${uniqueEdges.length} unique player pairs`);

// Convert groups to serializable format
const groupsSerialized: Record<string, string[]> = {};
groups.forEach((playerIds, key) => {
  groupsSerialized[key] = Array.from(playerIds);
});

// Build player lookup
const playersMap: Record<string, any> = {};
data.players.forEach(p => {
  playersMap[p.id] = {
    name: p.name,
    country: p.country,
    position: p.position,
    current_club_id: p.current_club_id,
    stints: p.stints,
  };
});

// Build club lookup
const clubsMap: Record<string, { name: string; country: string }> = {};
data.clubs.forEach(c => {
  clubsMap[c.id] = { name: c.name, country: c.country };
});

// Compute stats
console.log('Computing stats...');

// Top clubs by player count in a season
const topClubs = Array.from(groups.entries())
  .map(([key, playerIds]) => {
    const [clubId, season] = key.split('::');
    const club = clubMap.get(clubId);
    return {
      clubId,
      clubName: club?.name || 'Unknown',
      country: club?.country || 'Unknown',
      season,
      playerCount: playerIds.size,
    };
  })
  .filter(g => g.playerCount >= 2)
  .sort((a, b) => b.playerCount - a.playerCount)
  .slice(0, 30);

// Top connected players (by unique degree)
const topConnectedPlayers = data.players
  .map(p => ({
    playerId: p.id,
    playerName: p.name,
    country: p.country,
    degree: adjacency.get(p.id)?.size || 0,
  }))
  .sort((a, b) => b.degree - a.degree)
  .slice(0, 30);

// Average degree
const totalDegree = data.players.reduce((sum, p) => sum + (adjacency.get(p.id)?.size || 0), 0);
const avgDegree = totalDegree / data.players.length;

// Country pairs (cross-national connections)
const countryPairsMap: Record<string, number> = {};
uniqueEdges.forEach(edge => {
  const playerA = playersMap[edge.source];
  const playerB = playersMap[edge.target];
  if (playerA && playerB && playerA.country !== playerB.country) {
    const pair = [playerA.country, playerB.country].sort().join(' ↔ ');
    countryPairsMap[pair] = (countryPairsMap[pair] || 0) + 1;
  }
});
const countryPairs = Object.entries(countryPairsMap)
  .map(([pair, count]) => ({ pair, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 30);

// League connections (by club country)
const leagueMap: Record<string, number> = {};
uniqueEdges.forEach(edge => {
  edge.connections.forEach(conn => {
    const club = clubMap.get(conn.clubId);
    if (club) {
      leagueMap[club.country] = (leagueMap[club.country] || 0) + 1;
    }
  });
});
const leagueConnections = Object.entries(leagueMap)
  .map(([country, count]) => ({ country, count }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 20);

// Build final output
const graphData: GraphData = {
  meta: {
    playerCount: data.players.length,
    clubCount: data.clubs.length,
    edgeCount: totalEdgeCount,
    uniqueEdgeCount: uniqueEdges.length,
    groupCount: groups.size,
  },
  uniqueEdges,
  groups: groupsSerialized,
  clubs: clubsMap,
  players: playersMap,
  stats: {
    topClubs,
    topConnectedPlayers,
    totalEdges: totalEdgeCount,
    uniqueEdges: uniqueEdges.length,
    avgDegree,
    countryPairs,
    leagueConnections,
  },
};

// Sanity check: PSG 2023-24
const psgKey = 'Q483020::2023-24';
const psgPlayers = groupsSerialized[psgKey] || [];
console.log(`\nSanity check - PSG 2023-24 players: ${psgPlayers.length}`);
psgPlayers.forEach((pid: string) => {
  console.log(`  - ${playersMap[pid]?.name} (${playersMap[pid]?.country})`);
});

// Verify Vitinha, Nuno Mendes, Gonçalo Ramos are connected
const vitinha = 'Q66818509';
const nunoMendes = Object.keys(playersMap).find(id => playersMap[id].name === 'Nuno Mendes');
const goncaloRamos = Object.keys(playersMap).find(id => playersMap[id].name === 'Gonçalo Ramos');
console.log(`\nV2023-24 connections check:`);
console.log(`  Vitinha ID: ${vitinha}`);
console.log(`  Nuno Mendes: ${nunoMendes}`);
console.log(`  Gonçalo Ramos: ${goncaloRamos}`);

console.log('\nWriting graph-data.json...');
const outputPath = join(process.cwd(), 'public/data/graph-data.json');
writeFileSync(outputPath, JSON.stringify(graphData));

const sizeMB = (Buffer.byteLength(JSON.stringify(graphData)) / 1024 / 1024).toFixed(2);
console.log(`✓ Done! ${totalEdgeCount} total edges, ${uniqueEdges.length} unique pairs`);
console.log(`✓ Output size: ${sizeMB} MB`);
console.log(`✓ Output: public/data/graph-data.json`);
