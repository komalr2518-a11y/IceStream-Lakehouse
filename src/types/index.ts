export type ObservabilityPlane =
  | 'pipeline-lineage-and-topology'
  | 'data-quality-and-assertions'
  | 'iceberg-table-and-time-travel'
  | 'incidents-and-autonomous-healing';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar?: string;
  isAuthenticated: boolean;
}

export interface QuarantinedSample {
  id: string;
  orderId: string;
  customerId: string;
  eventTime: string;
  subtotal: string;
  taxAmount: string | null;
  total: string;
  status: string;
  gateway: string;
  jurisdiction: string;
  reconciledTax?: string;
  reconciledStatus?: 'Resolved' | 'Processing' | 'Failed';
}

export interface AssertionRule {
  id: string;
  name: string;
  suite: string;
  fieldTarget: string;
  engine: string;
  threshold: string;
  liveValue: string;
  status: 'FAIL: CIRCUIT TRIPPED' | 'PASS' | 'WARNING';
  action: string;
  actionIcon: string;
  isAnomaly?: boolean;
}

export interface IcebergSnapshot {
  id: string;
  timestamp: string;
  operation: string;
  recordsAdded: string;
  statusLabel: string;
  isGoldenBaseline?: boolean;
  isIsolated?: boolean;
  manifestCount?: string;
  integrityAudit?: string;
}

export interface IncidentEvent {
  timeOffset: string;
  utcTime: string;
  stage: string;
  badge: string;
  badgeType: 'error' | 'secondary' | 'tertiary' | 'primary';
  description: string;
  isAction?: boolean;
  isLive?: boolean;
}
