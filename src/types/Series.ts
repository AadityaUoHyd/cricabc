export interface Series {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  teams: string; // Stored as comma-separated string in backend
}