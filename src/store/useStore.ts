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
} from '@/types';
import {
  equipments,
  demandOrders,
  bargainSessions,
  dealRecords,
  matchResults,
} from '@/data/mockData';

interface AppState {
  filters: EquipmentFilter;
  setFilters: (filters: Partial<EquipmentFilter>) => void;
  resetFilters: () => void;

  compareList: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;

  demandOrders: DemandOrder[];
  addDemandOrder: (order: Omit<DemandOrder, 'id' | 'status' | 'receivedQuotes' | 'createdAt'>) => void;
  closeDemandOrder: (id: string) => void;

  bargainSessions: BargainSession[];
  activeSessionId: string | null;
  setActiveSession: (id: string | null) => void;
  sendMessage: (sessionId: string, message: Omit<BargainMessage, 'timestamp'>) => void;
  setFreightMode: (sessionId: string, mode: FreightMode) => void;
  setTaxMode: (sessionId: string, mode: TaxMode) => void;
  lockEquipment: (sessionId: string, deposit: number) => void;

  dealRecords: DealRecord[];
  confirmContractClause: (dealId: string, index: number) => void;
  setSpecialTerms: (dealId: string, terms: string) => void;
  toggleTransferDoc: (dealId: string, index: number) => void;
  payItem: (dealId: string, index: number) => void;
  submitEvaluation: (dealId: string, evaluation: Evaluation) => void;

  getEquipmentById: (id: string) => Equipment | undefined;
  getMatchResults: (demandId: string) => typeof matchResults[string];
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

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({ filters: { ...state.filters, ...newFilters } })),
      resetFilters: () => set({ filters: defaultFilters }),

      compareList: [],
      toggleCompare: (id) =>
        set((state) => ({
          compareList: state.compareList.includes(id)
            ? state.compareList.filter((i) => i !== id)
            : [...state.compareList, id],
        })),
      clearCompare: () => set({ compareList: [] }),

      demandOrders,
      addDemandOrder: (order) =>
        set((state) => ({
          demandOrders: [
            {
              ...order,
              id: `DJ-2024-${String(state.demandOrders.length + 1).padStart(3, '0')}`,
              status: 'quoting',
              receivedQuotes: 0,
              createdAt: new Date().toISOString().split('T')[0],
            },
            ...state.demandOrders,
          ],
        })),
      closeDemandOrder: (id) =>
        set((state) => ({
          demandOrders: state.demandOrders.map((d) =>
            d.id === id ? { ...d, status: 'closed' } : d,
          ),
        })),

      bargainSessions,
      activeSessionId: bargainSessions[0]?.id ?? null,
      setActiveSession: (id) => set({ activeSessionId: id }),
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
          bargainSessions: state.bargainSessions.map((s) =>
            s.id === sessionId ? { ...s, freightMode: mode } : s,
          ),
        })),
      setTaxMode: (sessionId, mode) =>
        set((state) => ({
          bargainSessions: state.bargainSessions.map((s) =>
            s.id === sessionId ? { ...s, taxMode: mode } : s,
          ),
        })),
      lockEquipment: (sessionId, deposit) =>
        set((state) => {
          const session = state.bargainSessions.find((s) => s.id === sessionId);
          if (!session) return {};
          const deadline = new Date();
          deadline.setDate(deadline.getDate() + 3);
          return {
            bargainSessions: state.bargainSessions.map((s) =>
              s.id === sessionId
                ? { ...s, depositAmount: deposit, lockDeadline: deadline.toISOString() }
                : s,
            ),
          };
        }),

      dealRecords,
      confirmContractClause: (dealId, index) =>
        set((state) => ({
          dealRecords: state.dealRecords.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  contractClauses: d.contractClauses.map((c, i) =>
                    i === index ? { ...c, confirmed: !c.confirmed } : c,
                  ),
                }
              : d,
          ),
        })),
      setSpecialTerms: (dealId, terms) =>
        set((state) => ({
          dealRecords: state.dealRecords.map((d) =>
            d.id === dealId ? { ...d, specialTerms: terms } : d,
          ),
        })),
      toggleTransferDoc: (dealId, index) =>
        set((state) => ({
          dealRecords: state.dealRecords.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  transferDocs: d.transferDocs.map((t, i) =>
                    i === index ? { ...t, ready: !t.ready } : t,
                  ),
                }
              : d,
          ),
        })),
      payItem: (dealId, index) =>
        set((state) => ({
          dealRecords: state.dealRecords.map((d) =>
            d.id === dealId
              ? {
                  ...d,
                  paymentTodo: d.paymentTodo.map((p, i) =>
                    i === index ? { ...p, paid: !p.paid } : p,
                  ),
                }
              : d,
          ),
        })),
      submitEvaluation: (dealId, evaluation) =>
        set((state) => ({
          dealRecords: state.dealRecords.map((d) =>
            d.id === dealId ? { ...d, evaluation } : d,
          ),
        })),

      getEquipmentById: (id) => equipments.find((e) => e.id === id),
      getMatchResults: (demandId) => matchResults[demandId] ?? [],
    }),
    {
      name: 'tiejia-match-store',
      partialize: (state) => ({
        compareList: state.compareList,
        filters: state.filters,
      }),
    },
  ),
);
