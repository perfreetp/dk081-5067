export type EquipmentType = 'excavator' | 'loader' | 'roller' | 'crane';
export type EmissionStage = 'guo3' | 'guo4' | 'guo5';
export type ConditionScore = 'A' | 'B' | 'C' | 'D';
export type EquipmentStatus = 'available' | 'locked' | 'sold';

export interface Equipment {
  id: string;
  type: EquipmentType;
  typeLabel: string;
  brand: string;
  model: string;
  tonnage: number;
  workHours: number;
  emission: EmissionStage;
  city: string;
  price: number;
  conditionScore: ConditionScore;
  coverImage: string;
  sellerId: string;
  sellerName: string;
  status: EquipmentStatus;
  year: number;
  distance?: number;
  matchScore?: number;
  matchReasons?: string[];
}

export interface VideoSession {
  equipmentId: string;
  playing: boolean;
  startAt?: string;
}

export interface InspectionBooking {
  id: string;
  equipmentId: string;
  date: string;
  time: string;
  location: string;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'completed';
}

export interface MaintenanceRecord { date: string; item: string; note: string; }
export interface ReplacedPart { part: string; brand: string; date: string; hours: number; }
export interface AccidentRecord { date: string; description: string; repaired: boolean; }
export interface MaintenanceUpdate {
  type: 'maintenance' | 'part' | 'accident';
  equipmentId: string;
}

export interface EquipmentFilter {
  type?: EquipmentType | '';
  brand?: string;
  tonnageRange?: [number, number];
  workHoursRange?: [number, number];
  emission?: EmissionStage | '';
  city?: string;
  keyword?: string;
}

export interface PhotoItem {
  category: string;
  url: string;
}

export interface InspectionReport {
  equipmentId: string;
  photos: PhotoItem[];
  coldStartVideo: { url: string; duration: string; thumbnail: string };
  nameplate: { url: string; info: Record<string, string> };
  documents: { type: string; url: string; status: 'verified' | 'pending' }[];
  maintenanceRecords: MaintenanceRecord[];
  replacedParts: ReplacedPart[];
  accidentHistory: AccidentRecord[];
  scores: { engine: number; hydraulic: number; chassis: number; appearance: number };
  overallScore: ConditionScore;
  inspector: string;
  inspectDate: string;
}

export type DemandStatus = 'quoting' | 'matched' | 'closed';

export interface DemandOrder {
  id: string;
  type: EquipmentType;
  brandPreference?: string;
  tonnage: number;
  budgetRange: [number, number];
  startDate: string;
  endDate: string;
  location: string;
  emission?: EmissionStage;
  status: DemandStatus;
  receivedQuotes: number;
  createdAt: string;
  remark?: string;
}

export interface MatchResult {
  equipment: Equipment;
  matchScore: number;
  reasons: string[];
}

export type MessageFrom = 'buyer' | 'seller';
export type FreightMode = 'included' | 'excluded';
export type TaxMode = 'taxIncluded' | 'taxExcluded';

export interface BargainMessage {
  from: MessageFrom;
  content: string;
  timestamp: string;
  amount?: number;
}

export interface BargainSession {
  id: string;
  equipmentIds: string[];
  messages: BargainMessage[];
  freightMode: FreightMode;
  freightCost: number;
  taxMode: TaxMode;
  taxRate: number;
  depositAmount?: number;
  lockDeadline?: string;
  lastPrice?: number;
}

export type TimelineNodeStatus = 'done' | 'current' | 'pending';

export interface TimelineNode {
  node: string;
  label: string;
  status: TimelineNodeStatus;
  timestamp?: string;
  operator?: string;
}

export interface TransferDoc {
  name: string;
  ready: boolean;
}

export interface PaymentItem {
  item: string;
  amount: number;
  paid: boolean;
}

export interface Evaluation {
  responsiveness: number;
  conditionMatch: number;
  delivery: number;
  comment: string;
}

export interface DealRecord {
  id: string;
  equipmentId: string;
  buyerName: string;
  timeline: TimelineNode[];
  contractConfirmed: boolean;
  contractClauses: { clause: string; confirmed: boolean }[];
  specialTerms: string;
  transferDocs: TransferDoc[];
  paymentTodo: PaymentItem[];
  evaluation?: Evaluation;
  createdAt: string;
}

export interface Seller {
  id: string;
  name: string;
  company: string;
  verified: boolean;
  rating: number;
  dealCount: number;
}
