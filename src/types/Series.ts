export interface Series {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  teams: string[];
  matchType?: 'TEST' | 'ODI' | 'T20' | 'TOUR';
  totalMatches?: number;
  tournamentId?: string;
  description?: string;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface MatchSchedule {
  title: string;
  team1Id: string;
  team2Id: string;
  matchType: string;
  dateTimeGMT: string | Date;
  venueId: string;
  matchNumber?: number;
}

export interface CreateSeriesRequest {
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  teamIds: string[];
  matchType: 'TEST' | 'ODI' | 'T20' | 'TOUR';
  totalMatches?: number;
  tournamentId?: string;
  description?: string;
  matches: MatchSchedule[];
}