import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Equipment,
  EquipmentFilter,
  DemandOrder,
  BargainSession,
  DealRecord,
  BargainMessage,
  FreightMode,
  TaxMode,
  Evaluation,
  InspectionReport,
  InspectionBooking,
} from '@/types';
import {
  equipments as seedEquipments,
  demandOrders as seedDemandOrders,
  bargainSessions as seedBargainSessions,
  dealRecords as seedDealRecords,
  inspectionReports as seedInspectionReports,
} from '@/data/mockData';
import {
  computeMatchResults,
  defaultTimeline,
  defaultContractClauses,
  defaultTransferDocs,
  computeFreightCost,
} from '@/utils/business';

type MatchResultLocal = { equipmentId: string; matchScore: number; reasons: string[] };

interface AppState {
  filters: EquipmentFilter;
  setFilters: (filters: Partial<EquipmentFilter>) => void;
  resetFilters: () => void;

  compareList: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  equipments: Equipment[];
  getEquipmentById: (id: string) => Equipment | undefined;
  updateEquipmentStatus: (id: string, status: Equipment['status']) => void;

  inspectionReports: InspectionReport[];
  getInspectionReport: (id: string) => InspectionReport | undefined;
  addMaintenanceRecord: (equipmentId: string, rec: { date: string; item: string; note: string }) => void;
  addReplacedPart: (equipmentId: string, part: { part: string; brand: string; date: string; hours: number }) => void;
  addAccidentHistory: (equipmentId: string, acc: { date: string; description: string; repaired: boolean }) => void;
  updateMaintenanceRecord: (equipmentId: string, index: number, rec: { date: string; item: string; note: string }) => void;
  updateReplacedPart: (equipmentId: string, index: number, part: { part: string; brand: string; date: string; hours: number }) => void;
  updateAccidentHistory: (equipmentId: string, index: number, acc: { date: string; description: string; repaired: boolean }) => void;
  removeMaintenanceRecord: (equipmentId: string, index: number) => void;
  removeReplacedPart: (equipmentId: string, index: number) => void;
  removeAccidentHistory: (equipmentId: string, index: number) => void;

  demandOrders: DemandOrder[];
  addDemandOrder: (order: Omit<DemandOrder, 'id' | 'status' | 'receivedQuotes' | 'createdAt'>) => string;
  closeDemandOrder: (id: string) => void;
  matchResults: Record<string, MatchResultLocal[]>;

  bargainSessions: BargainSession[];
  activeSessionId: string | null;
  setActiveSession: (id: string | null) => void;
  createOrGetBargainSession: (equipmentId: string) => string;
  sendMessage: (sessionId: string, message: Omit<BargainMessage, 'timestamp'>) => void;
  setFreightMode: (sessionId: string, mode: FreightMode) => void;
  setTaxMode: (sessionId: string, mode: TaxMode) => void;
  lockEquipment: (sessionId: string, deposit: number, equipmentId: string) => void;

  dealRecords: DealRecord[];
  confirmContractClause: (dealId: string, index: number) => void;
  signContract: (dealId: string) => void;
  setSpecialTerms: (dealId: string, terms: string) => void;
  toggleTransferDoc: (dealId: string, index: number) => void;
  payItem: (dealId: string, index: number) => void;
  submitEvaluation: (dealId: string, evaluation: Evaluation) => void;
  getDealByEquipment: (equipmentId: string) => DealRecord | undefined;

  bookings: InspectionBooking[];
  addBooking: (equipmentId: string, booking: Omit<InspectionBooking, 'id' | 'equipmentId' | 'createdAt' | 'status'>) => InspectionBooking;
  getBookingByEquipment: (equipmentId: string) => InspectionBooking | undefined;
  removeBooking: (equipmentId: string) => void;
}

const defaultFilters: EquipmentFilter = {
  type: '',
  brand: '',
  tonnageRange: [0, 30],
  workHoursRange: [0, 15000],
  emission: '',
  city: '',
  keyword: '',
};

const seedMatchResults: Record<string, MatchResultLocal[]> = {};
seedDemandOrders.forEach((d) => {
  const r = computeMatchResults(d, seedEquipments);
  seedMatchResults[d.id] = r.map((m) => ({ equipmentId: m.equipment.id, matchScore: m.matchScore, reasons: m.reasons }));
});

const genId = (prefix: string, list: { id: string }[]) => {
  const n = list.length + 1;
  return `${prefix}-2024-${String(n).padStart(3, '0')}`;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      setFilters: (newFilters) => set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      resetFilters: () => set({ filters: defaultFilters }),

      compareList: [],
      toggleCompare: (id) =>
        set((state) => ({
          compareList: state.compareList.includes(id)
            ? state.compareList.filter((i) => i !== id)
            : [...state.compareList, id],
        })),
      clearCompare: () => set({ compareList: [] }),

      equipments: seedEquipments,
      getEquipmentById: (id) => get().equipments.find((e) => e.id === id),
      updateEquipmentStatus: (id, status) =>
        set((state) => ({
          equipments: state.equipments.map((e) => (e.id === id ? { ...e, status } : e)),
        })),

      inspectionReports: seedInspectionReports,
      getInspectionReport: (id) => get().inspectionReports.find((r) => r.equipmentId === id),
      addMaintenanceRecord: (equipmentId, rec) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) =>
            r.equipmentId === equipmentId
              ? { ...r, maintenanceRecords: [...r.maintenanceRecords, rec] }
              : r,
          ),
        })),
      addReplacedPart: (equipmentId, part) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) =>
            r.equipmentId === equipmentId
              ? { ...r, replacedParts: [...r.replacedParts, part] }
              : r,
          ),
        })),
      addAccidentHistory: (equipmentId, acc) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) =>
            r.equipmentId === equipmentId
              ? { ...r, accidentHistory: [...r.accidentHistory, acc] }
              : r,
          ),
        })),
      updateMaintenanceRecord: (equipmentId, index, rec) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) => {
            if (r.equipmentId !== equipmentId) return r;
            const arr = [...r.maintenanceRecords];
            arr[index] = rec;
            return { ...r, maintenanceRecords: arr };
          }),
        })),
      updateReplacedPart: (equipmentId, index, part) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) => {
            if (r.equipmentId !== equipmentId) return r;
            const arr = [...r.replacedParts];
            arr[index] = part;
            return { ...r, replacedParts: arr };
          }),
        })),
      updateAccidentHistory: (equipmentId, index, acc) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) => {
            if (r.equipmentId !== equipmentId) return r;
            const arr = [...r.accidentHistory];
            arr[index] = acc;
            return { ...r, accidentHistory: arr };
          }),
        })),
      removeMaintenanceRecord: (equipmentId, index) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) =>
            r.equipmentId === equipmentId
              ? { ...r, maintenanceRecords: r.maintenanceRecords.filter((_, i) => i !== index) }
              : r,
          ),
        })),
      removeReplacedPart: (equipmentId, index) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) =>
            r.equipmentId === equipmentId
              ? { ...r, replacedParts: r.replacedParts.filter((_, i) => i !== index) }
              : r,
          ),
        })),
      removeAccidentHistory: (equipmentId, index) =>
        set((state) => ({
          inspectionReports: state.inspectionReports.map((r) =>
            r.equipmentId === equipmentId
              ? { ...r, accidentHistory: r.accidentHistory.filter((_, i) => i !== index) }
              : r,
          ),
        })),

      demandOrders: seedDemandOrders,
      addDemandOrder: (order) => {
        const id = genId('DJ', get().demandOrders);
        const newDemand: DemandOrder = {
          ...order,
          id,
          status: 'quoting',
          receivedQuotes: Math.floor(Math.random() * 3) + 1,
          createdAt: new Date().toISOString().split('T')[0],
        };
        const matches = computeMatchResults(newDemand, get().equipments);
        const localMatches = matches.map((m) => ({ equipmentId: m.equipment.id, matchScore: m.matchScore, reasons: m.reasons }));
        set((state) => ({
          demandOrders: [newDemand, ...state.demandOrders],
          matchResults: { ...state.matchResults, [id]: localMatches },
        }));
        return id;
      },
      closeDemandOrder: (id) =>
        set((state) => ({
          demandOrders: state.demandOrders.map((d) => (d.id === id ? { ...d, status: 'closed' } : d)),
        })),
      matchResults: seedMatchResults,

      bargainSessions: seedBargainSessions,
      activeSessionId: seedBargainSessions[0]?.id ?? null,
      setActiveSession: (id) => set({ activeSessionId: id }),
      createOrGetBargainSession: (equipmentId) => {
        const existing = get().bargainSessions.find((s) => s.equipmentIds.includes(equipmentId));
        if (existing) {
          set((state) => ({
            activeSessionId: existing.id,
            bargainSessions: state.bargainSessions.map((s) =>
              s.id === existing.id ? { ...s, focusEquipmentId: equipmentId } : s,
            ),
          }));
          const compareList = get().compareList;
          if (!compareList.includes(equipmentId)) {
            set({ compareList: [...compareList, equipmentId] });
          }
          return existing.id;
        }
        const equipment = get().equipments.find((e) => e.id === equipmentId);
        const id = genId('BS', get().bargainSessions);
        const newSession: BargainSession = {
          id,
          equipmentIds: [equipmentId],
          focusEquipmentId: equipmentId,
          messages: [
            {
              from: 'seller',
              content: `你好，欢迎咨询 ${equipment?.brand ?? ''} ${equipment?.model ?? ''}，目前参考价 ${equipment ? (equipment.price / 10000).toFixed(1) + '万' : ''}，有什么可以帮您？`,
              timestamp: new Date().toLocaleString('zh-CN', { hour12: false }),
            },
          ],
          freightMode: 'excluded',
          freightCost: computeFreightCost(equipment?.city ?? '上海', '上海'),
          taxMode: 'taxExcluded',
          taxRate: 3,
          lastPrice: equipment?.price,
        };
        set((state) => ({
          bargainSessions: [...state.bargainSessions, newSession],
          activeSessionId: id,
          compareList: state.compareList.includes(equipmentId) ? state.compareList : [...state.compareList, equipmentId],
        }));
        return id;
      },
      sendMessage: (sessionId, message) =>
        set((state) => ({
          bargainSessions: state.bargainSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: [
                    ...s.messages,
                    { ...message, timestamp: new Date().toLocaleString('zh-CN', { hour12: false }) },
                  ],
                  lastPrice: message.amount ?? s.lastPrice,
                }
              : s,
          ),
        })),
      setFreightMode: (sessionId, mode) =>
        set((state) => ({
          bargainSessions: state.bargainSessions.map((s) => (s.id === sessionId ? { ...s, freightMode: mode } : s)),
        })),
      setTaxMode: (sessionId, mode) =>
        set((state) => ({
          bargainSessions: state.bargainSessions.map((s) => (s.id === sessionId ? { ...s, taxMode: mode } : s)),
        })),
      lockEquipment: (sessionId, deposit, equipmentId) => {
        const targetEq = get().equipments.find((e) => e.id === equipmentId);
        if (targetEq?.status === 'locked') return;
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 3);
        set((state) => ({
          bargainSessions: state.bargainSessions.map((s) =>
            s.id === sessionId ? { ...s, depositAmount: deposit, lockDeadline: deadline.toISOString(), focusEquipmentId: equipmentId } : s,
          ),
          equipments: state.equipments.map((e) => (e.id === equipmentId ? { ...e, status: 'locked' } : e)),
        }));

        const existingDeal = get().dealRecords.find((d) => d.equipmentId === equipmentId);
        if (!existingDeal) {
          const eq = get().equipments.find((e) => e.id === equipmentId);
          const price = eq?.price ?? 0;
          const now = new Date().toISOString().split('T')[0];
          const newDeal: DealRecord = {
            id: genId('DR', get().dealRecords),
            equipmentId,
            buyerName: '中建路桥集团',
            timeline: defaultTimeline(now),
            contractConfirmed: false,
            contractClauses: [...defaultContractClauses],
            specialTerms: '',
            transferDocs: [...defaultTransferDocs],
            paymentTodo: [
              { item: '订金（20%）', amount: deposit, paid: true },
              { item: '尾款（80%）', amount: Math.max(price - deposit, 0), paid: false },
            ],
            createdAt: now,
          };
          set((state) => ({ dealRecords: [newDeal, ...state.dealRecords] }));
        }
      },

      dealRecords: seedDealRecords,
      confirmContractClause: (dealId, index) =>
        set((state) => ({
          dealRecords: state.dealRecords.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  contractClauses: d.contractClauses.map((c, i) => (i === index ? { ...c, confirmed: !c.confirmed } : c)),
                }
              : d,
          ),
        })),
      signContract: (dealId) =>
        set((state) => {
          const deal = state.dealRecords.find((d) => d.id === dealId);
          if (!deal) return {};
          if (deal.contractConfirmed) return {};
          if (!deal.contractClauses.every((c) => c.confirmed)) return {};
          const now = new Date().toLocaleString('zh-CN', { hour12: false });
          const timeline = deal.timeline.map((t) =>
            t.node === 'contract' ? { ...t, status: 'done' as const, timestamp: now, operator: '双方签署' } : t,
          );
          const nextIdx = timeline.findIndex((t) => t.status === 'pending');
          if (nextIdx !== -1) {
            timeline[nextIdx] = { ...timeline[nextIdx], status: 'current' as const };
          }
          return {
            dealRecords: state.dealRecords.map((d) =>
              d.id === dealId ? { ...d, contractConfirmed: true, timeline } : d,
            ),
          };
        }),
      setSpecialTerms: (dealId, terms) =>
        set((state) => ({
          dealRecords: state.dealRecords.map((d) => (d.id === dealId ? { ...d, specialTerms: terms } : d)),
        })),
      toggleTransferDoc: (dealId, index) =>
        set((state) => ({
          dealRecords: state.dealRecords.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  transferDocs: d.transferDocs.map((t, i) => (i === index ? { ...t, ready: !t.ready } : t)),
                }
              : d,
          ),
        })),
      payItem: (dealId, index) =>
        set((state) => {
          const deal = state.dealRecords.find((d) => d.id === dealId);
          if (!deal) return {};
          const newPayments = deal.paymentTodo.map((p, i) => (i === index ? { ...p, paid: !p.paid } : p));
          const allPaid = newPayments.every((p) => p.paid);
          const now = new Date().toLocaleString('zh-CN', { hour12: false });
          const newTimeline = deal.timeline.map((t) => {
            if (t.node === 'balance') {
              return allPaid ? { ...t, status: 'done' as const, timestamp: now, operator: '采购员' } : { ...t, status: 'current' as const };
            }
            if (t.node === 'transfer') {
              return allPaid ? { ...t, status: 'current' as const } : t;
            }
            return t;
          });
          return {
            dealRecords: state.dealRecords.map((d) =>
              d.id === dealId ? { ...d, paymentTodo: newPayments, timeline: newTimeline } : d,
            ),
          };
        }),
      submitEvaluation: (dealId, evaluation) =>
        set((state) => {
          const now = new Date().toLocaleString('zh-CN', { hour12: false });
          return {
            dealRecords: state.dealRecords.map((d) =>
              d.id === dealId
                ? {
                    ...d,
                    evaluation,
                    timeline: d.timeline.map((t) =>
                      t.node === 'evaluation' ? { ...t, status: 'done' as const, timestamp: now, operator: '采购员' } : t,
                    ),
                  }
                : d,
            ),
          };
        }),
      getDealByEquipment: (equipmentId) => get().dealRecords.find((d) => d.equipmentId === equipmentId),

      bookings: [],
      addBooking: (equipmentId, booking) => {
        const existing = get().bookings.find((b) => b.equipmentId === equipmentId);
        const nb: InspectionBooking = {
          ...booking,
          equipmentId,
          id: existing?.id ?? genId('BK', get().bookings),
          createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
          status: 'confirmed',
        };
        set((state) => {
          const rest = state.bookings.filter((b) => b.equipmentId !== equipmentId);
          return { bookings: [nb, ...rest] };
        });
        return nb;
      },
      getBookingByEquipment: (equipmentId) => get().bookings.find((b) => b.equipmentId === equipmentId),
      removeBooking: (equipmentId) => set((state) => ({ bookings: state.bookings.filter((b) => b.equipmentId !== equipmentId) })),
    }),
    {
      name: 'tiejia-match-store',
      partialize: (state) => ({
        compareList: state.compareList,
        filters: state.filters,
        equipments: state.equipments,
        inspectionReports: state.inspectionReports,
        demandOrders: state.demandOrders,
        matchResults: state.matchResults,
        bargainSessions: state.bargainSessions,
        activeSessionId: state.activeSessionId,
        dealRecords: state.dealRecords,
        bookings: state.bookings,
      }),
    },
  ),
);

export function useMatchResultsWithEquipments(demandId: string | undefined) {
  const matchMap = useStore((s) => s.matchResults);
  const equipments = useStore((s) => s.equipments);
  const localMatches = (demandId ? matchMap[demandId] : undefined) ?? [];
  return localMatches
    .map((m) => {
      const eq = equipments.find((e) => e.id === m.equipmentId);
      if (!eq) return null;
      return { equipment: eq, matchScore: m.matchScore, reasons: m.reasons };
    })
    .filter(Boolean) as { equipment: Equipment; matchScore: number; reasons: string[] }[];
}
