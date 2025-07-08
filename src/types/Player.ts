export interface Team {
  id: string;
  name: string;
  country: string;
  gender: 'male' | 'female';
  category: 'international' | 'domestic' | 'league';
  logoUrl: string;
  teamRanking: {
    testRank: number;
    odiRank: number;
    t20Rank: number;
    testRating: number;
    odiRating: number;
    t20Rating: number;
  };
}

export interface BattingStats {
  matches: number;
  innings: number;
  runs: number;
  ballsFaced: number;
  highestScore: string | '0';
  average: number;
  strikeRate: number;
  notOuts: number;
  fours: number;
  sixes: number;
  fifties: number;
  hundreds: number;
  doubleHundreds: number;
  tripleHundreds: number;
  quadrupleHundreds: number;
  playerStatus: string | 'Active Player';
}

export interface BowlingStats {
  matches: number;
  innings: number;
  ballsBowled: number;
  runsGiven: number;
  wickets: number;
  average: number;
  economy: number;
  strikeRate: number;
  bestBowlingInnings: string;
  bestBowlingMatch: string;
  fiveWicketHauls: number;
  tenWicketMatches: number;
  catchTaken: number;
}

export interface WicketKeeperStats {
  stumps: number;
  catches: number;
}

export interface Ranking {
  testBattingRank: number;
  odiBattingRank: number;
  t20BattingRank: number;
  testBowlingRank: number;
  odiBowlingRank: number;
  t20BowlingRank: number;
  testAllrounderRank: number;
  odiAllrounderRank: number;
  t20AllrounderRank: number;

  testBattingRating: number;
  odiBattingRating: number;
  t20BattingRating: number;
  testAllrounderRating: number;
  odiAllrounderRating: number;
  t20AllrounderRating: number;
  testBowlingRating: number;
  odiBowlingRating: number;
  t20BowlingRating: number;
}

export interface PlayerMatchStatsBase {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
}

export interface Player{
    id: string;
    name: string;
    country: string;
    gender: 'male' | 'female';
    role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
    birthPlace: string;
    dateOfBirth: string | Date;
    height: string;
    battingStyle: string;
    bowlingStyle: string;
    photoUrl: string;
    description: string;
    twenty20: Twenty20;
    testStats: TestStats ;
    odiStats: OdiStats ;
    ttwentyInternationalsStats: TtwentyInternationalsStats;
    firstClass: FirstClassStats ;
    listAstats: ListAstats ;
    iplStats: IplStats ;
    ranking: Ranking ;
    domesticTeams: string[];
    internationalTeams: string[];
    leagues: string[];
    capNumber: string;
    jerseyNo: string;
}

export interface FirstClassStats {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
}

export interface TtwentyInternationalsStats {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
}

export interface Twenty20 {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
}

export interface TestStats {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
}

export interface OdiStats {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
}

export interface FirstClass {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
}

export interface ListAstats {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
}

export interface IplStats {
  batting: BattingStats;
  bowling: BowlingStats;
  wicketKeeperStats: WicketKeeperStats;
  debutDate: string;
  lastPlayedDate: string;
  ranking: Ranking;
  capNumber: string;
  jerseyNo: string;
}