import { GraphData } from './types';

let cachedData: GraphData | null = null;

export async function loadGraphData(): Promise<GraphData> {
  if (cachedData) return cachedData;
  const res = await fetch('/data/graph-data.json');
  if (!res.ok) throw new Error('Failed to load graph data');
  cachedData = await res.json();
  return cachedData!;
}

// BFS to find shortest path between two players
export function findPath(
  adjacency: Map<string, Set<string>>,
  start: string,
  end: string
): string[] | null {
  if (start === end) return [start];
  
  const visited = new Set<string>([start]);
  const queue: Array<{ node: string; path: string[] }> = [{ node: start, path: [start] }];
  
  while (queue.length > 0) {
    const { node, path } = queue.shift()!;
    const neighbors = adjacency.get(node);
    if (!neighbors) continue;
    
    for (const neighbor of Array.from(neighbors)) {
      if (visited.has(neighbor)) continue;
      const newPath = [...path, neighbor];
      if (neighbor === end) return newPath;
      visited.add(neighbor);
      queue.push({ node: neighbor, path: newPath });
    }
  }
  
  return null;
}

// Build adjacency map from graph data
export function buildAdjacencyMap(data: GraphData): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>();
  data.uniqueEdges.forEach(edge => {
    if (!adj.has(edge.source)) adj.set(edge.source, new Set());
    if (!adj.has(edge.target)) adj.set(edge.target, new Set());
    adj.get(edge.source)!.add(edge.target);
    adj.get(edge.target)!.add(edge.source);
  });
  return adj;
}

// Get all countries
export function getCountries(data: GraphData): string[] {
  const countries = new Set<string>();
  Object.values(data.players).forEach(p => countries.add(p.country));
  return Array.from(countries).sort();
}

// Get all positions
export function getPositions(data: GraphData): string[] {
  const positions = new Set<string>();
  Object.values(data.players).forEach(p => positions.add(p.position));
  return Array.from(positions).sort();
}

// Get all seasons sorted
export function getSeasons(data: GraphData): string[] {
  const seasons = new Set<string>();
  Object.keys(data.groups).forEach(key => {
    const [, season] = key.split('::');
    seasons.add(season);
  });
  return Array.from(seasons).sort();
}

// Get all club countries for league filter
export function getClubCountries(data: GraphData): string[] {
  const countries = new Set<string>();
  Object.values(data.clubs).forEach(c => countries.add(c.country));
  return Array.from(countries).sort();
}

// Country flag emoji from country name (simple mapping)
export function getCountryFlag(country: string): string {
  const flagMap: Record<string, string> = {
    'Argentina': '🇦🇷', 'Australia': '🇦🇺', 'Belgium': '🇧🇪', 'Brazil': '🇧🇷',
    'Cameroon': '🇨🇲', 'Canada': '🇨🇦', 'Costa Rica': '🇨🇷', 'Croatia': '🇭🇷',
    'Denmark': '🇩🇰', 'Ecuador': '🇪🇨', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'France': '🇫🇷',
    'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Iran': '🇮🇷', 'Japan': '🇯🇵',
    'Mexico': '🇲🇽', 'Morocco': '🇲🇦', 'Netherlands': '🇳🇱', 'Poland': '🇵🇱',
    'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'Saudi Arabia': '🇸🇦', 'Senegal': '🇸🇳',
    'Serbia': '🇷🇸', 'South Korea': '🇰🇷', 'Spain': '🇪🇸', 'Switzerland': '🇨🇭',
    'Tunisia': '🇹🇳', 'Uruguay': '🇺🇾', 'USA': '🇺🇸', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    'Colombia': '🇨🇴', 'Chile': '🇨🇱', 'Nigeria': '🇳🇬', 'Egypt': '🇪🇬',
    'Italy': '🇮🇹', 'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Norway': '🇳🇴', 'Sweden': '🇸🇪',
    'Austria': '🇦🇹', 'Czech Republic': '🇨🇿', 'Turkey': '🇹🇷', 'Ukraine': '🇺🇦',
    'Algeria': '🇩🇿', 'Ivory Coast': '🇨🇮', 'Burkina Faso': '🇧🇫', 'Panama': '🇵🇦',
    'Honduras': '🇭🇳', 'Paraguay': '🇵🇾', 'Bolivia': '🇧🇴', 'Jamaica': '🇯🇲',
    'Haiti': '🇭🇹', 'El Salvador': '🇸🇻', 'Curaçao': '🇨🇼', 'Cabo Verde': '🇨🇻',
    'South Africa': '🇿🇦', 'New Zealand': '🇳🇿', 'China PR': '🇨🇳', 'Jordan': '🇯🇴',
    'Uzbekistan': '🇺🇿', 'Palestine': '🇵🇸', 'Oman': '🇴🇲', 'Indonesia': '🇮🇩',
    'Iraq': '🇮🇶', 'United Arab Emirates': '🇦🇪', 'Thailand': '🇹🇭', 'Vietnam': '🇻🇳',
    'Iceland': '🇮🇸', 'Hungary': '🇭🇺', 'Slovakia': '🇸🇰', 'Romania': '🇷🇴',
    'Greece': '🇬🇷', 'Finland': '🇫🇮', 'North Macedonia': '🇲🇰', 'Albania': '🇦🇱',
    'Slovenia': '🇸🇮', 'Montenegro': '🇲🇪', 'Bosnia and Herzegovina': '🇧🇦',
    'Georgia': '🇬🇪', 'Kosovo': '🇽🇰', 'Luxembourg': '🇱🇺', 'Belarus': '🇧🇾',
    'Armenia': '🇦🇲', 'Azerbaijan': '🇦🇿', 'Faroe Islands': '🇫🇴', 'Moldova': '🇲🇩',
    'Kazakhstan': '🇰🇿', 'Cyprus': '🇨🇾', 'Estonia': '🇪🇪', 'Latvia': '🇱🇻',
    'Lithuania': '🇱🇹', 'Malta': '🇲🇹', 'Andorra': '🇦🇩', 'Gibraltar': '🇬🇮',
    'San Marino': '🇸🇲', 'Liechtenstein': '🇱🇮',
  };
  return flagMap[country] || '🏳️';
}

// Color palette for countries
const COUNTRY_COLORS = [
  '#e6194B', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4',
  '#42d4f4', '#f032e6', '#bfef45', '#fabed4', '#469990', '#dcbeff',
  '#9A6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1',
  '#000075', '#a9a9a9', '#000000', '#e6beff', '#aa6e28', '#808080',
  '#FF6961', '#77DD77', '#AEC6CF', '#FDFD96', '#CFCFC4', '#B39EB5',
  '#FFB347', '#FF6961', '#CB99C9', '#FDFD96', '#D1E8E2', '#FFDAB9',
  '#B0C4DE', '#FFB6C1', '#DDA0DD', '#98FB98', '#F0E68C', '#D8BFD8',
  '#AFEEEE', '#FA8072', '#E9967A', '#FFA07A', '#20B2AA', '#87CEFA',
];

export function getCountryColor(country: string, allCountries: string[]): string {
  const idx = allCountries.indexOf(country);
  return COUNTRY_COLORS[idx % COUNTRY_COLORS.length];
}

// Query: get all WC players at a club in a season
export function queryClubSeason(data: GraphData, clubId: string, season: string): string[] {
  const key = `${clubId}::${season}`;
  return data.groups[key] || [];
}

// Query: get all connections for a player
export function queryPlayerConnections(data: GraphData, playerId: string): Array<{
  playerId: string;
  playerName: string;
  country: string;
  connections: Array<{ clubId: string; clubName: string; season: string }>;
}> {
  const result: Array<{
    playerId: string;
    playerName: string;
    country: string;
    connections: Array<{ clubId: string; clubName: string; season: string }>;
  }> = [];
  
  data.uniqueEdges.forEach(edge => {
    if (edge.source === playerId) {
      const p = data.players[edge.target];
      if (p) result.push({ playerId: edge.target, playerName: p.name, country: p.country, connections: edge.connections });
    } else if (edge.target === playerId) {
      const p = data.players[edge.source];
      if (p) result.push({ playerId: edge.source, playerName: p.name, country: p.country, connections: edge.connections });
    }
  });
  
  return result;
}

// Query: cross-country connections
export function queryCountryVsCountry(data: GraphData, country1: string, country2: string): Array<{
  player1Id: string;
  player1Name: string;
  player2Id: string;
  player2Name: string;
  connections: Array<{ clubId: string; clubName: string; season: string }>;
}> {
  const result: Array<{
    player1Id: string;
    player1Name: string;
    player2Id: string;
    player2Name: string;
    connections: Array<{ clubId: string; clubName: string; season: string }>;
  }> = [];
  
  data.uniqueEdges.forEach(edge => {
    const p1 = data.players[edge.source];
    const p2 = data.players[edge.target];
    if (!p1 || !p2) return;
    
    if ((p1.country === country1 && p2.country === country2) ||
        (p1.country === country2 && p2.country === country1)) {
      result.push({
        player1Id: edge.source,
        player1Name: p1.name,
        player2Id: edge.target,
        player2Name: p2.name,
        connections: edge.connections,
      });
    }
  });
  
  return result;
}
