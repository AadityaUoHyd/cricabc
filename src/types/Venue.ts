export interface Venue {
  _id?: string;
  id?: string; // Keep for backward compatibility
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

export interface VenueFormData {
  stadiumName: string;
  city: string;
  country: string;
  capacity: string;
  location: string;
  imageUrl: string;
  description: string;
  establishedYear: string;
  matchesHosted: string;
}
