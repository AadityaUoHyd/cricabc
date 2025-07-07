export interface Team {
  id: string;
  name: string;
  category: 'international' | 'domestic' | 'league';
  leagueName?: string;
  country?: string;
  gender?: 'male' | 'female';
  logoUrl?: string;
  teamRanking?: TeamRanking;
}

export interface TeamRanking {
  testRank: number;
  odiRank: number;
  t20Rank: number;
  testRating: number;
  odiRating: number;
  t20Rating: number;
}
