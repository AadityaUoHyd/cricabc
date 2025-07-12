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
  teamStats?: TeamStats;
  shortName?: string;
  teamLeadership?: TeamLeadership;
  homeVenueIds?: string[];
}

export interface TeamStats {
  totalTestMatches: number;
  totalODIMatches: number;
  totalT20Matches: number;

  totalTestDraws: number;
  totalODIDraws: number;
  totalT20Draws: number;

  totalTestTies: number;
  totalODITies: number;
  totalT20Ties: number;

  totalTestWins: number;
  totalODIWins: number;
  totalT20Wins: number;

  totalTestLosses: number;
  totalODILosses: number;
  totalT20Losses: number;

  percentageTestWin: number;
  percentageODIWin: number;
  percentageT20Win: number;

  highestTestScore: number;
  highestODIScore: number;
  highestT20Score: number;

  lowestTestScore: number;
  lowestODIScore: number;
  lowestT20Score: number;
}

export interface TeamLeadership {
  testCaptain: string; // International only
  odiCaptain: string; // International only
  ttwentyInternationalsCaptain: string; // International, League
  firstClassCaptain: string; // Domestic only
  listACaptain: string; // Domestic only
  twenty20Captain: string; // leagues, Domestic only

  testHeadCoach: string; // International only
  odiHeadCoach: string; // International only
  ttwentyInternationalsHeadCoach: string; // International, League
  firstClassHeadCoach: string; // Domestic only
  listAHeadCoach: string; // Domestic only
  twenty20HeadCoach: string; // Domestic only

  coachingStaff?: { [key: string]: string }; //key:coachingStaffRole, value:StaffName
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
