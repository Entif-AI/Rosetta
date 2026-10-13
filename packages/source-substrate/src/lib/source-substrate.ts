import { buildTile, type TileEnvelope } from '@entif-ai/rosetta-core';

export interface SourceSystemProfile {
  sourceSystemId: string;
  canonicalName: string;
  sourceRoles: string[];
  capabilityFacets: string[];
  curationPosture: string;
  reviewPosture: string;
  preservationPosture: string;
  rightsPosture: string;
  evidenceRefs: string[];
  operatorOrgs?: string[];
  pidSupport?: Record<string, boolean>;
}

export interface SourceRecord {
  sourceSystemId: string;
  recordLocalId: string;
  stableLocators: string[];
  recordType: string;
  publicationStatus: string;
  claimedVersion?: string;
  metadataBlob: Record<string, unknown>;
  collectionRefs?: string[];
  lineageRefs?: string[];
}

export interface SourceManifestation {
  sourceRecordCid: string;
  manifestationId: string;
  manifestationKind: string;
  mediaType: string;
  byteHashes: Record<string, string>;
  accessRequirements: string[];
  structureProfile: string;
  contentLanguage?: string;
  fetchableUrl?: string;
}

export type BoundedAcquisitionSourceKind =
  | 'drive-folder'
  | 'drive-query'
  | 'drive-revision-list'
  | 'generic-listing'
  | 'github-contents'
  | 'github-tree';

export interface BoundedAcquisitionScope {
  authorityRef?: string;
  capturedAt: string;
  locator: string;
  scope: Record<string, string>;
  sourceKind: BoundedAcquisitionSourceKind;
  sourceSystemId: string;
}

export interface BoundedAcquisitionPagination {
  mode: 'not-applicable' | 'paginated' | 'single-page';
  nextPageToken?: string;
}

export interface BoundedAcquisitionSignals {
  incompleteSearch: boolean;
  isComplete: boolean;
  itemCount: number;
  maxItems?: number;
  pagination: BoundedAcquisitionPagination;
  signals: string[];
  truncated: boolean;
}

export interface SourcePackage {
  sourceRecordCid?: string;
  packageId: string;
  packageKind: string;
  members: string[];
  profileRefs: string[];
  boundedness?: BoundedAcquisitionSignals;
  discoveredRecordCids?: string[];
  lineageRole?: 'bounded-acquisition-snapshot' | 'record-scoped-package';
  scope?: BoundedAcquisitionScope;
}

export type SourceFamily =
  | 'arxiv-paper'
  | 'chat-transcript'
  | 'github-issue'
  | 'github-pull-request'
  | 'github-text'
  | 'journal-log'
  | 'questionnaire'
  | 'social-thread'
  | 'unresolved'
  | 'youtube-transcript';

export interface SourceChronologyInstant {
  date: string;
  kind: string;
  localDateTime?: string;
  source: string;
}

export interface SourceChronology {
  canonical?: Record<string, SourceChronologyInstant>;
  fallback?: Record<string, unknown>;
  intake?: Record<string, string>;
  primary: SourceChronologyInstant;
}

export interface RawEvidenceRef {
  evidenceId: string;
  evidenceKind: 'local-file' | 'remote-fetch' | 'inline-text' | 'generated-fixture';
  locator: string;
  sha256?: string;
}

export interface SourceEpisode {
  episodeId: string;
  family: SourceFamily;
  locator: string;
  rawEvidenceRefs: RawEvidenceRef[];
  rightsScope: string[];
  chronology: SourceChronology;
  mode: 'parse-only';
  classification: {
    confidence: number;
    reasons: string[];
  };
  sourceManifestationCid?: string;
  sourcePackageCid?: string;
  sourceRecordCid?: string;
}

export interface TrustMatrixAxes {
  artifactIntegrity: number;
  recordIdentity: number;
  authorship: number;
  affiliation: number;
  stewardship: number;
  reviewRigor: number;
  metadataRichness: number;
  correctionResponsiveness: number;
  licenseClarity: number;
  manipulationRisk: number;
  novelty: number;
  rarity: number;
  corroborationDensity: number;
  invalidationSensitivity: number;
}

export interface TrustMatrix {
  subjectCid: string;
  axes: TrustMatrixAxes;
  trustClass: 'infrastructure' | 'normative' | 'repository' | 'volatile';
  notes: string[];
}

export interface CorrectionEvent {
  subjectCid: string;
  eventKind: 'correction' | 'retraction' | 'supersession' | 'rights-change';
  recordedAt: string;
  summary: string;
}

export function createSourceSystemProfileTile(profile: SourceSystemProfile): TileEnvelope<SourceSystemProfile> {
  return buildTile('source.system_profile', profile, { pack: 'source-substrate' });
}

export function createSourceRecordTile(record: SourceRecord, parents: string[] = []): TileEnvelope<SourceRecord> {
  return buildTile('source.record', record, { pack: 'source-substrate', parents });
}

export function createSourceManifestationTile(
  manifestation: SourceManifestation,
  parents: string[] = []
): TileEnvelope<SourceManifestation> {
  return buildTile('source.manifestation', manifestation, { pack: 'source-substrate', parents });
}

export function createSourcePackageTile(sourcePackage: SourcePackage, parents: string[] = []): TileEnvelope<SourcePackage> {
  return buildTile('source.package', sourcePackage, { pack: 'source-substrate', parents });
}

export function createBoundedListingSnapshotPackageTile(
  sourcePackage: Omit<SourcePackage, 'lineageRole' | 'packageKind' | 'sourceRecordCid'> & {
    packageKind?: 'bounded-listing-snapshot';
  },
  parents: string[] = []
): TileEnvelope<SourcePackage> {
  return createSourcePackageTile(
    {
      ...sourcePackage,
      lineageRole: 'bounded-acquisition-snapshot',
      packageKind: sourcePackage.packageKind ?? 'bounded-listing-snapshot'
    },
    parents
  );
}

export function createSourceEpisodeTile(episode: SourceEpisode, parents: string[] = []): TileEnvelope<SourceEpisode> {
  return buildTile('source.episode', episode, { pack: 'source-substrate', parents });
}

export function createTrustMatrixTile(matrix: TrustMatrix, parents: string[] = []): TileEnvelope<TrustMatrix> {
  return buildTile('source.trust_matrix', matrix, { pack: 'source-substrate', parents });
}

export function createCorrectionEventTile(event: CorrectionEvent, parents: string[] = []): TileEnvelope<CorrectionEvent> {
  return buildTile('source.correction_event', event, { pack: 'source-substrate', parents });
}
