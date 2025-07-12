export interface Team {
  id: string;
  name: string;
  category: 'international' | 'domestic' | 'league';
  internationalTeamType?: 'full member' | 'associate member'; // Only for international
  leagueName?: string;
  domesticTournamentName?: string;
  country?: string;
  gender?: 'male' | 'female';
  logoUrl?: string;
  teamRanking?: TeamRanking;
  governingBody: string;
  headquarters: string;
  teamImageUrl: string;
  majorTitles: string[];
  foundedYear?: number;
  shortName?: string;
  venues?: Venues;
}

export interface Venues {
  stadiumName: string;
  city: string;
  country: string;
  capacity?: number;
  location?: string;
  imageUrl?: string;
  description?: string;
  establishedYear?: number;
  matchesHosted?: number;
}

export interface TeamRanking {
  testRank: number;
  odiRank: number;
  t20Rank: number;
  testRating: number;
  odiRating: number;
  t20Rating: number;
}
