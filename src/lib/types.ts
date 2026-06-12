export interface Stint {
  club_id: string;
  season: string;
}

export interface Player {
  name: string;
  country: string;
  position: string;
  current_club_id: string;
  stints: Stint[];
}

export interface Club {
  name: string;
  country: string;
}

export interface EdgeConnection {
  clubId: string;
  clubName: string;
  season: string;
}

export interface UniqueEdge {
  source: string;
  target: string;
  connections: EdgeConnection[];
  weight: number;
}

export interface GraphData {
  meta: {
    playerCount: number;
    clubCount: number;
    edgeCount: number;
    uniqueEdgeCount: number;
    groupCount: number;
  };
  uniqueEdges: UniqueEdge[];
  groups: Record<string, string[]>;
  clubs: Record<string, Club>;
  players: Record<string, Player>;
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

export interface GraphNode {
  id: string;
  name: string;
  country: string;
  position: string;
  degree: number;
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
  weight: number;
  connections: EdgeConnection[];
}
