export interface Match {
  id: string;
  matchId: string;
  title: string;
  team1: string;
  team2: string;
  status: string;
  venue: string;
  matchType: string;
  tournament: string;
  dateTimeGMT: string | null; // ISO string (e.g., "2025-05-25T13:00:00")
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
  fantasyLink: string;
  pointsTableLink: string;
  scheduleLink: string;
}