
import { StorageDestination, DataCategory, MatrixEntry, LevelDefinition } from './types';

export const LEVEL_DEFINITIONS: LevelDefinition[] = [
  {
    level: 'Recommended',
    definition: 'The primary and preferred storage solution for this data type.',
    guidance: 'Highest priority for migration and new projects. Aligns with corporate security architecture.',
    colorClass: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  {
    level: 'Supported',
    definition: 'Permitted and supported by IT, but not the primary recommendation.',
    guidance: 'Use if Recommended options do not meet specific technical needs or departmental workflows.',
    colorClass: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  {
    level: 'Case-by-Case',
    definition: 'Requires consultation with the Data Stewardship committee or IT Security.',
    guidance: 'Do not move data here without explicit written approval. Risk assessment required.',
    colorClass: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  {
    level: 'Not Permitted',
    definition: 'Explicitly prohibited due to security, compliance, or policy constraints.',
    guidance: 'Strictly forbidden. Data found here will be flagged for immediate removal to maintain compliance.',
    colorClass: 'bg-rose-100 text-rose-800 border-rose-200'
  }
];

export const DESTINATIONS: StorageDestination[] = [
  {
    id: 'onedrive',
    name: 'OneDrive (M365)',
    icon: '👤',
    description: 'Personal work storage for individual business files.',
    detailedOverview: 'OneDrive provides a consistent experience for personal work drafts. It is the designated primary target for users moving individual files from legacy or local storage.',
    bestFor: ['Draft documents', 'Individual working files', 'Syncing files across devices'],
    limitations: ['Not for departmental records', 'Limited external guest collaboration features'],
    governanceRules: ['Encryption at rest required', 'No sharing with external personal accounts', 'Subject to individual offboarding policy'],
    allocation: '5TB per User',
    cost: 'Threshold-Based',
    pricingNotes: 'Included in M365 License.',
    fullCostDetails: 'Initial 5TB is covered under the Enterprise M365 license. Storage exceeding this limit requires a justified business case and departmental chargeback.',
    requestLink: 'https://service-now.com/request_onedrive',
    docLink: 'https://kb.corporate.com/onedrive-guide',
    consultationLink: 'https://service-now.com/it_consultation',
    userFriendlyRating: 5
  },
  {
    id: 'sharepoint',
    name: 'SharePoint (M365)',
    icon: '🏢',
    description: 'Long-term storage for departments and structured teams.',
    detailedOverview: 'SharePoint is the backbone for organizational data. It supports complex metadata, versioning, and large-scale document management for institutional records.',
    bestFor: ['Departmental records', 'Public-facing team content', 'Intranet document publishing'],
    limitations: ['Complex permission management', 'Not for high-frequency small file collaboration'],
    governanceRules: ['Requires Site Owner training', 'Sensitivity labels must be applied', 'Annual permission audit required'],
    allocation: '25TB per Site Collection',
    cost: 'Threshold-Based',
    pricingNotes: 'Included up to 5TB pool per Dept.',
    fullCostDetails: 'Departmental allocations are pooled. If the total departmental footprint exceeds 5TB, the department will be billed per TB/year for excess capacity.',
    requestLink: 'https://service-now.com/request_sharepoint_site',
    docLink: 'https://kb.corporate.com/sharepoint-guide',
    consultationLink: 'https://service-now.com/it_consultation',
    userFriendlyRating: 3
  },
  {
    id: 'teams',
    name: 'MS Teams (M365)',
    icon: '💬',
    description: 'Collaborative space for active projects and small groups.',
    detailedOverview: 'Teams provides a high-velocity collaboration environment. Behind every Team is a SharePoint site, but the focus is on communication and iterative drafts.',
    bestFor: ['Daily collaboration', 'Project-specific files', 'Internal team drafts & chat sharing'],
    limitations: ['Storage limits per team', 'Can become unstructured if not curated'],
    governanceRules: ['Team must have 2+ owners', 'Inactive teams deleted after 12 months', 'No PII in chat channels'],
    allocation: '5TB per Team',
    cost: 'Threshold-Based',
    pricingNotes: 'Standard teams are included.',
    fullCostDetails: 'Usage counts toward the departmental M365 pool. Threshold alerts are triggered at 80% of the 5TB soft limit to prevent overages.',
    requestLink: 'https://service-now.com/request_teams_group',
    docLink: 'https://kb.corporate.com/teams-guide',
    consultationLink: 'https://service-now.com/it_consultation',
    userFriendlyRating: 4
  },
  {
    id: 'google',
    name: 'Google Drive (Workspace)',
    icon: '📂',
    description: 'Cloud storage for Workspace users and research labs.',
    detailedOverview: 'Google Drive is the preferred choice for departments with established Google Workspace workflows and collaborative research environments.',
    bestFor: ['Google Doc/Sheet collaboration', 'Cross-institutional research sharing', 'Lab-specific data management'],
    limitations: ['Secondary to M365 strategy', 'External sharing strictly monitored', 'Complex data export'],
    governanceRules: ['Business-only accounts', 'No personal data mixed with corporate', 'Shared Drive ownership strictly controlled'],
    allocation: '2TB per Shared Drive',
    cost: 'Threshold-Based',
    pricingNotes: 'Quota-limited by Google terms.',
    fullCostDetails: 'Accounts or shared drives exceeding 5TB must be migrated or converted to a paid Google Cloud Storage bucket with monthly usage billing.',
    requestLink: 'https://service-now.com/request_google_drive',
    docLink: 'https://kb.corporate.com/google-drive-guide',
    consultationLink: 'https://service-now.com/it_consultation',
    userFriendlyRating: 4
  },
  {
    id: 'azure',
    name: 'Azure Blob/Files',
    icon: '☁️',
    description: 'High-scale storage for research and technical data.',
    detailedOverview: 'Azure Storage provides enterprise-grade cloud storage for large datasets (Petabyte scale). It requires technical proficiency for management.',
    bestFor: ['Big Data sets', 'Research sets > 5TB', 'Database backups & Application data'],
    limitations: ['Requires technical setup', 'No native file explorer interface', 'Usage costs accrue daily'],
    governanceRules: ['Subscription-based access', 'VNET integration required', 'Identity access management via Entra ID'],
    allocation: 'Unlimited (Elastic)',
    cost: 'Usage-Based',
    pricingNotes: 'Pay-as-you-go monthly.',
    fullCostDetails: 'Billing is based on Tier (Hot/Cool/Archive). Hot storage is ~$0.018/GB. Data egress fees and transaction costs apply monthly.',
    requestLink: 'https://service-now.com/request_azure_storage',
    docLink: 'https://kb.corporate.com/azure-storage-guide',
    consultationLink: 'https://service-now.com/it_consultation_technical',
    userFriendlyRating: 1
  }
];

export const CATEGORIES: DataCategory[] = [
  { id: 'pii', label: 'Personally Identifiable Info (PII)', description: 'Sensitive records containing SSNs, birth dates, or private IDs.', sensitivity: 'High' },
  { id: 'hipaa', label: 'Health Data (HIPAA)', description: 'Protected Patient records, clinical trial data, or medical histories.', sensitivity: 'High' },
  { id: 'research', label: 'General Research Data', description: 'Lab notes, raw experimental data, and publication drafts.', sensitivity: 'Medium' },
  { id: 'internal', label: 'Internal Administrative', description: 'Internal policies, budget drafts, and corporate memos.', sensitivity: 'Low' },
  { id: 'media', label: 'Multimedia Content', description: 'High-res videos, raw photography archives, and audio logs.', sensitivity: 'Low' },
  { id: 'personal', label: 'Personal Files', description: 'Non-work related items (personal resumes, family photos).', sensitivity: 'Low' }
];

export const STEWARDSHIP_MATRIX: MatrixEntry[] = [
  { categoryId: 'pii', destinationId: 'onedrive', level: 'Supported' },
  { categoryId: 'pii', destinationId: 'sharepoint', level: 'Recommended' },
  { categoryId: 'pii', destinationId: 'teams', level: 'Supported' },
  { categoryId: 'pii', destinationId: 'google', level: 'Case-by-Case' },
  { categoryId: 'pii', destinationId: 'azure', level: 'Case-by-Case' },
  { categoryId: 'hipaa', destinationId: 'onedrive', level: 'Not Permitted' },
  { categoryId: 'hipaa', destinationId: 'sharepoint', level: 'Recommended' },
  { categoryId: 'hipaa', destinationId: 'teams', level: 'Supported' },
  { categoryId: 'hipaa', destinationId: 'google', level: 'Not Permitted' },
  { categoryId: 'hipaa', destinationId: 'azure', level: 'Recommended' },
  { categoryId: 'research', destinationId: 'onedrive', level: 'Supported' },
  { categoryId: 'research', destinationId: 'sharepoint', level: 'Supported' },
  { categoryId: 'research', destinationId: 'teams', level: 'Recommended' },
  { categoryId: 'research', destinationId: 'google', level: 'Supported' },
  { categoryId: 'research', destinationId: 'azure', level: 'Recommended' },
  { categoryId: 'internal', destinationId: 'onedrive', level: 'Recommended' },
  { categoryId: 'internal', destinationId: 'sharepoint', level: 'Recommended' },
  { categoryId: 'internal', destinationId: 'teams', level: 'Recommended' },
  { categoryId: 'internal', destinationId: 'google', level: 'Supported' },
  { categoryId: 'internal', destinationId: 'azure', level: 'Not Permitted' },
  { categoryId: 'media', destinationId: 'onedrive', level: 'Supported' },
  { categoryId: 'media', destinationId: 'sharepoint', level: 'Supported' },
  { categoryId: 'media', destinationId: 'teams', level: 'Case-by-Case' },
  { categoryId: 'media', destinationId: 'google', level: 'Supported' },
  { categoryId: 'media', destinationId: 'azure', level: 'Recommended' },
  { categoryId: 'personal', destinationId: 'onedrive', level: 'Case-by-Case' },
  { categoryId: 'personal', destinationId: 'sharepoint', level: 'Not Permitted' },
  { categoryId: 'personal', destinationId: 'teams', level: 'Not Permitted' },
  { categoryId: 'personal', destinationId: 'google', level: 'Case-by-Case' },
  { categoryId: 'personal', destinationId: 'azure', level: 'Not Permitted' }
];
