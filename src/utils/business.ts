import type { Equipment, DemandOrder, MatchResult } from '@/types';
import { equipments as baseEquipments } from '@/data/mockData';

export function computeMatchResults(
  demand: DemandOrder,
  equipmentList: Equipment[] = baseEquipments,
): MatchResult[] {
  const results: MatchResult[] = [];

  for (const eq of equipmentList) {
    if (eq.status === 'sold') continue;
    if (eq.type !== demand.type) continue;

    let score = 0;
    const reasons: string[] = [];

    if (demand.emission && eq.emission === demand.emission) {
      score += 25;
      reasons.push(`排放${eq.emission === 'guo5' ? '国五' : eq.emission === 'guo4' ? '国四' : '国三'}符合`);
    } else if (!demand.emission) {
      score += 15;
    }

    if (eq.price >= demand.budgetRange[0] && eq.price <= demand.budgetRange[1]) {
      score += 30;
      reasons.push('预算范围内');
    } else if (eq.price <= demand.budgetRange[1] * 1.1) {
      score += 10;
      reasons.push('价格略高于预算');
    }

    if (eq.workHours <= 5000) {
      score += 20;
      reasons.push(`工况优 ${eq.workHours.toLocaleString()}h`);
    } else if (eq.workHours <= 8000) {
      score += 12;
      reasons.push(`工况适中 ${eq.workHours.toLocaleString()}h`);
    } else {
      score += 5;
      reasons.push(`工时较高 ${eq.workHours.toLocaleString()}h`);
    }

    if (eq.city === demand.location) {
      score += 25;
      reasons.push(`同城${demand.location}，运输0km`);
    } else {
      score += 8;
      reasons.push(`${demand.location} → ${eq.city}需跨城运输`);
    }

    if (demand.tonnage && Math.abs(eq.tonnage - demand.tonnage) <= 3) {
      score += 10;
      reasons.push('吨位匹配');
    }

    if (score >= 30) {
      results.push({
        equipment: eq,
        matchScore: Math.min(100, Math.round(score)),
        reasons: reasons.slice(0, 3),
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export const defaultTimeline = (now: string) => [
  { node: 'inspection' as const, label: '验机通过', status: 'done' as const, timestamp: now, operator: '验机系统' },
  { node: 'deposit' as const, label: '订金支付', status: 'done' as const, timestamp: now, operator: '采购员' },
  { node: 'contract' as const, label: '合同签署', status: 'current' as const, operator: '待双方' },
  { node: 'balance' as const, label: '尾款待办', status: 'pending' as const },
  { node: 'transfer' as const, label: '过户办理', status: 'pending' as const },
  { node: 'pickup' as const, label: '提车完成', status: 'pending' as const },
  { node: 'evaluation' as const, label: '成交评价', status: 'pending' as const },
];

export const defaultContractClauses = [
  { clause: '设备型号与铭牌信息一致', confirmed: false },
  { clause: '车况与验机报告相符', confirmed: false },
  { clause: '交付时附完整手续文件', confirmed: false },
  { clause: '质保期内液压系统保修', confirmed: false },
  { clause: '违约责任与赔偿条款', confirmed: false },
];

export const defaultTransferDocs = [
  { name: '登记证书', ready: false },
  { name: '行驶证', ready: false },
  { name: '购机发票', ready: false },
  { name: '合格证', ready: false },
  { name: '买卖双方身份证件', ready: false },
  { name: '购置税完税证明', ready: false },
];

export function computeFreightCost(cityA: string, cityB: string): number {
  if (cityA === cityB) return 3000;
  const matrix: Record<string, number> = {
    '上海-成都': 15000, '上海-西安': 12000, '上海-天津': 8000,
    '成都-西安': 9000, '成都-天津': 14000, '西安-天津': 10000,
  };
  const key = [cityA, cityB].sort().join('-');
  return matrix[key] ?? 10000;
}
