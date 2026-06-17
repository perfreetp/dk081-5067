import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Filter,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Search,
  Scale,
  Trash2,
} from 'lucide-react';
import { useStore, useMatchResultsWithEquipments } from '@/store/useStore';
import { equipmentTypes, brands, cities, emissionStages } from '@/data/mockData';
import EquipmentCard from '@/components/EquipmentCard';
import { EquipmentTypeIcon, formatPrice } from '@/components/ui';
import { cn } from '@/lib/utils';

export default function Hall() {
  const navigate = useNavigate();
  const store = useStore();
  const { filters, setFilters, resetFilters, compareList, clearCompare, createOrGetBargainSession, demandOrders, equipments } = store;
  const [showCompare, setShowCompare] = useState(true);

  const filteredEquipments = useMemo(() => {
    return equipments.filter((eq) => {
      if (filters.type && eq.type !== filters.type) return false;
      if (filters.brand && eq.brand !== filters.brand) return false;
      if (filters.emission && eq.emission !== filters.emission) return false;
      if (filters.city && eq.city !== filters.city) return false;
      if (filters.tonnageRange && (eq.tonnage < filters.tonnageRange[0] || eq.tonnage > filters.tonnageRange[1]))
        return false;
      if (filters.workHoursRange && (eq.workHours < filters.workHoursRange[0] || eq.workHours > filters.workHoursRange[1]))
        return false;
      if (filters.keyword) {
        const kw = filters.keyword.toLowerCase();
        if (!`${eq.brand} ${eq.model} ${eq.id}`.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
  }, [filters, equipments]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.type) count++;
    if (filters.brand) count++;
    if (filters.emission) count++;
    if (filters.city) count++;
    if (filters.keyword) count++;
    if (filters.tonnageRange && (filters.tonnageRange[0] > 0 || filters.tonnageRange[1] < 30)) count++;
    if (filters.workHoursRange && (filters.workHoursRange[0] > 0 || filters.workHoursRange[1] < 15000)) count++;
    return count;
  }, [filters]);

  const openDemand = demandOrders.find((d) => d.status !== 'closed');
  const recommended = useMatchResultsWithEquipments(openDemand?.id);

  const recommendedEquipments = useMemo(() => {
    return recommended.map((m) => ({ ...m.equipment, matchScore: m.matchScore }));
  }, [recommended]);

  const compareEquipments = useMemo(
    () => compareList.map((id) => equipments.find((e) => e.id === id)).filter(Boolean),
    [compareList, equipments],
  );

  const goToBargain = (equipmentId: string) => {
    createOrGetBargainSession(equipmentId);
    navigate('/bargain');
  };

  return (
    <div className="flex h-full flex-col">
      {/* Smart Recommendation Bar */}
      {recommendedEquipments.length > 0 && openDemand && (
        <div className="bg-hazard-stripes">
          <div className="bg-steel-950/90 backdrop-blur border-b border-safety-600/50 px-6 py-2.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 shrink-0">
                <Sparkles className="h-4 w-4 text-safety-400 animate-flash" />
                <span className="font-display text-sm font-semibold uppercase tracking-wider text-safety-400">
                  智能推荐
                </span>
                <span className="font-mono text-xs text-steel-300 ml-1">
                  匹配求购单 {openDemand.id}
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {recommendedEquipments.map((eq) => {
                  const unavailable = eq.status === 'locked' || eq.status === 'sold';
                  return (
                    <button
                      key={eq.id}
                      onClick={() => !unavailable && goToBargain(eq.id)}
                      disabled={unavailable}
                      className={cn(
                        'group flex items-center gap-2 bg-steel-800 border border-steel-600 px-2.5 py-1 transition-colors shrink-0',
                        unavailable ? 'opacity-40 cursor-not-allowed' : 'hover:border-safety-400',
                      )}
                    >
                      <EquipmentTypeIcon type={eq.type} className="h-3.5 w-3.5 text-safety-400" />
                      <span className="font-mono text-xs text-white whitespace-nowrap">
                        {eq.brand} {eq.model}
                      </span>
                      <span className="font-mono text-xs font-bold text-safety-400">
                        {eq.matchScore}%
                      </span>
                      {unavailable && <span className="font-mono text-[9px] text-engine-400">{eq.status === 'locked' ? '已锁' : '已售'}</span>}
                    </button>
                  );
                })}
              </div>
              <Link
                to="/demand"
                className="ml-auto flex items-center gap-1 font-mono text-xs text-safety-400 hover:text-safety-300 shrink-0"
              >
                查看求购单 <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Filter Panel */}
        <aside className="w-72 shrink-0 border-r border-steel-700 bg-steel-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-safety-400" />
                <span className="section-title !text-base">筛选矩阵</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 font-mono text-xs text-steel-400 hover:text-safety-400"
                >
                  <RotateCcw className="h-3 w-3" />
                  重置
                </button>
              )}
            </div>

            <FilterSection title="关键词搜索">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-steel-400" />
                <input
                  value={filters.keyword ?? ''}
                  onChange={(e) => setFilters({ keyword: e.target.value })}
                  placeholder="品牌/型号/编号"
                  className="w-full bg-steel-900 border border-steel-600 pl-8 pr-3 py-2 font-mono text-sm text-white placeholder:text-steel-600 focus:border-safety-400 focus:outline-none"
                />
              </div>
            </FilterSection>

            <FilterSection title="机型">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setFilters({ type: '' })}
                  className={cn(
                    'flex flex-col items-center gap-1 py-2.5 border transition-all',
                    !filters.type
                      ? 'bg-safety-400 border-safety-600 text-steel-900'
                      : 'bg-steel-900 border-steel-600 text-steel-300 hover:border-steel-400',
                  )}
                >
                  <span className="font-mono text-xs font-bold">全部</span>
                </button>
                {equipmentTypes.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setFilters({ type: filters.type === t.value ? '' : t.value })}
                    className={cn(
                      'flex flex-col items-center gap-1 py-2.5 border transition-all',
                      filters.type === t.value
                        ? 'bg-safety-400 border-safety-600 text-steel-900'
                        : 'bg-steel-900 border-steel-600 text-steel-300 hover:border-steel-400',
                    )}
                  >
                    <EquipmentTypeIcon type={t.value} className="h-5 w-5" />
                    <span className="font-mono text-xs font-bold">{t.label}</span>
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="品牌">
              <select
                value={filters.brand ?? ''}
                onChange={(e) => setFilters({ brand: e.target.value })}
                className="w-full bg-steel-900 border border-steel-600 px-3 py-2 font-mono text-sm text-white focus:border-safety-400 focus:outline-none"
              >
                <option value="">全部品牌</option>
                {brands.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </FilterSection>

            <FilterSection title="吨位 (吨)">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="data-value !text-xs">{filters.tonnageRange?.[0] ?? 0}t</span>
                  <span className="data-value !text-xs">{filters.tonnageRange?.[1] ?? 30}t</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={filters.tonnageRange?.[1] ?? 30}
                  onChange={(e) => setFilters({ tonnageRange: [filters.tonnageRange?.[0] ?? 0, Number(e.target.value)] })}
                  className="w-full accent-safety-400"
                />
              </div>
            </FilterSection>

            <FilterSection title="工况小时">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="data-value !text-xs">{(filters.workHoursRange?.[0] ?? 0).toLocaleString()}h</span>
                  <span className="data-value !text-xs">
                    {filters.workHoursRange?.[1] === 15000 ? '不限' : `${(filters.workHoursRange?.[1] ?? 15000).toLocaleString()}h`}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15000}
                  step={500}
                  value={filters.workHoursRange?.[1] ?? 15000}
                  onChange={(e) => setFilters({ workHoursRange: [filters.workHoursRange?.[0] ?? 0, Number(e.target.value)] })}
                  className="w-full accent-safety-400"
                />
              </div>
            </FilterSection>

            <FilterSection title="排放阶段">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilters({ emission: '' })}
                  className={cn(
                    'px-3 py-1 font-mono text-xs border transition-all',
                    !filters.emission
                      ? 'bg-safety-400 border-safety-600 text-steel-900'
                      : 'bg-steel-900 border-steel-600 text-steel-300 hover:border-steel-400',
                  )}
                >
                  全部
                </button>
                {emissionStages.map((e) => (
                  <button
                    key={e.value}
                    onClick={() => setFilters({ emission: filters.emission === e.value ? '' : e.value })}
                    className={cn(
                      'px-3 py-1 font-mono text-xs border transition-all',
                      filters.emission === e.value
                        ? 'bg-safety-400 border-safety-600 text-steel-900'
                        : 'bg-steel-900 border-steel-600 text-steel-300 hover:border-steel-400',
                    )}
                  >
                    {e.label}
                  </button>
                ))}
              </div>
            </FilterSection>

            <FilterSection title="所在城市">
              <select
                value={filters.city ?? ''}
                onChange={(e) => setFilters({ city: e.target.value })}
                className="w-full bg-steel-900 border border-steel-600 px-3 py-2 font-mono text-sm text-white focus:border-safety-400 focus:outline-none"
              >
                <option value="">全部城市</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </FilterSection>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-3 border-b border-steel-700 bg-steel-800/50">
            <div className="flex items-center gap-4">
              <span className="font-display text-sm uppercase tracking-wider text-steel-300">
                车源列表
              </span>
              <span className="font-mono text-xs text-safety-400 bg-steel-900 px-2 py-1 border border-safety-600/50">
                {filteredEquipments.length} 台
              </span>
              {activeFilterCount > 0 && (
                <span className="font-mono text-xs text-steel-400">
                  ({activeFilterCount} 个筛选条件)
                </span>
              )}
            </div>
            {compareList.length > 0 && (
              <button
                onClick={() => setShowCompare(!showCompare)}
                className="flex items-center gap-1.5 font-mono text-xs text-safety-400 hover:text-safety-300"
              >
                <Scale className="h-3.5 w-3.5" />
                比价单 ({compareList.length})
              </button>
            )}
          </div>

          <div className="p-6">
            {filteredEquipments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-steel-800 border border-steel-600 p-8 max-w-sm">
                  <Search className="h-12 w-12 text-steel-500 mx-auto mb-4" />
                  <p className="font-display text-lg text-steel-300 mb-2">未找到匹配车源</p>
                  <p className="font-mono text-xs text-steel-500 mb-4">
                    尝试调整筛选条件或发布求购单
                  </p>
                  <Link to="/demand" className="btn-industrial">
                    发布求购单
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-slide-in">
                {filteredEquipments.map((eq) => (
                  <EquipmentCard key={eq.id} equipment={eq} onInitiateContact={goToBargain} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compare Bar */}
      {compareList.length > 0 && showCompare && (
        <div className="border-t border-safety-600/50 bg-steel-950 px-6 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 shrink-0">
              <Scale className="h-5 w-5 text-safety-400" />
              <span className="section-title !text-sm">比价清单</span>
              <span className="font-mono text-xs text-safety-400">{compareList.length}/4</span>
            </div>
            <div className="flex-1 flex items-center gap-2 overflow-x-auto">
              {compareEquipments.map((eq) => eq && (
                <div
                  key={eq.id}
                  className="flex items-center gap-2 bg-steel-800 border border-steel-600 px-3 py-1.5 shrink-0"
                >
                  <EquipmentTypeIcon type={eq.type} className="h-4 w-4 text-safety-400" />
                  <span className="font-mono text-xs text-white whitespace-nowrap">
                    {eq.brand} {eq.model}
                  </span>
                  <span className="font-mono text-xs text-safety-400 font-bold">
                    {formatPrice(eq.price)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={clearCompare} className="btn-ghost !py-1.5 !text-xs">
                <Trash2 className="h-3.5 w-3.5" />
                清空
              </button>
              <Link to="/bargain" className="btn-industrial !py-1.5 !text-xs">
                去议价台
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="h-1 w-1 bg-safety-400" />
        <span className="data-label">{title}</span>
      </div>
      {children}
    </div>
  );
}
