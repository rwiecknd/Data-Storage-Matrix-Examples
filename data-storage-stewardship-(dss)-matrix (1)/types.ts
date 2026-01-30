
export type SupportLevel = 'Recommended' | 'Supported' | 'Not Permitted' | 'Case-by-Case';

export interface LevelDefinition {
  level: SupportLevel;
  definition: string;
  guidance: string;
  colorClass: string;
}

export interface StorageDestination {
  id: string;
  name: string;
  icon: string;
  description: string;
  detailedOverview: string;
  bestFor: string[];
  limitations: string[];
  governanceRules: string[];
  allocation: string;
  cost: 'Included' | 'Usage-Based' | 'Threshold-Based';
  pricingNotes: string;
  fullCostDetails: string;
  requestLink: string;
  docLink: string;
  consultationLink: string; // New: Link for technical help
  userFriendlyRating: number; // New: 1-5 scale for usability
}

export interface DataCategory {
  id: string;
  label: string;
  description: string;
  sensitivity: 'Low' | 'Medium' | 'High';
}

export interface MatrixEntry {
  categoryId: string;
  destinationId: string;
  level: SupportLevel;
  notes?: string;
}
