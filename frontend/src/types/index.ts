export interface Tenant {
  id: number;
  name: string;
  slug: string;
  email: string;
  status: 'active' | 'suspended' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface DID {
  id: number;
  tenant_id: number;
  number: string;
  country_code?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface ActiveCall {
  id: string;
  tenant_id: number;
  caller_id: string;
  destination: string;
  status: 'ringing' | 'answered' | 'hold';
  duration: number;
  started_at: string;
}

export interface CDRRecord {
  id: number;
  tenant_id: number;
  uniqueid: string;
  call_date: string;
  clid: string;
  src: string;
  dst: string;
  duration: number;
  billsec: number;
  disposition: string;
  recording_file?: string;
}

export interface CallStats {
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  avg_duration: number;
  total_duration: number;
}

export interface IVRFlow {
  id: number;
  tenant_id: number;
  name: string;
  description?: string;
  flow_json: any;
  is_default: boolean;
  status: 'active' | 'inactive';
}