export interface AdminTeam {
  id: string;
  name: string;
  shortName: string;
  logoUrl?: string;
}

export interface SeriesFormData {
  name: string;
  shortName: string;
  startDate: string;
  endDate: string;
  teamIds: string[];
  matchType: string;
  description: string;
  category: string;
  gender: 'MALE' | 'FEMALE' | 'MIXED';
  format: string;
  currentStage: string;
  governingBody: string;
  tournamentLogo: string;
  active: boolean;
}
