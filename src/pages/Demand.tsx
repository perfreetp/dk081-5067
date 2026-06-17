import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  ClipboardList,
  TrendingUp,
  CheckCircle2,
  XCircle,
  X,
  MapPin,
  Calendar,
  Wallet,
  ArrowRight,
  Target,
  Sparkles,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { matchResults } from '@/data/mockData';
import type { DemandOrder, EquipmentType, EmissionStage } from '@/types';
import { equipmentTypes, emissionStages, cities } from '@/data/mockData';
import { EquipmentTypeIcon, ScoreBadge, formatPrice, emissionLabel } from '@/components/ui';
import { cn } from '@/lib/utils';

const statusConfig = {
  quoting: { label: '报价中', color: 'text-safety-400', bg: 'bg-safety-400/10', border: 'border-safety-400/50', icon: TrendingUp },
  matched: { label: '已匹配', color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/50', icon: CheckCircle2 },
  closed: { label: '已关闭', color: 'text-steel-400', bg: 'bg-steel-700', border: 'border-steel-600', icon: XCircle },
};

export default function Demand() {
  const { demandOrders, addDemandOrder, closeDemandOrder } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<DemandOrder | null>(null);

  const stats = {
    total: demandOrders.length,
    quoting: demandOrders.filter((d) => d.status === 'quoting').length,
    matched: demandOrders.filter((d) => d.status === 'matched').length,
    closed: demandOrders.filter((d) => d.status === 'closed').length,
  };

  return (
    <div className="flex h-full flex-col">
      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-3 p-4 border-b border-steel-700 bg-steel-800/50">
        <StatCard label="需求总数" value={stats.total} icon={ClipboardList} color="text-white" />
        <StatCard label="报价中" value={stats.quoting} icon={TrendingUp} color="text-safety-400" />
        <StatCard label="已匹配" value={stats.matched} icon={CheckCircle2} color="text-green-400" />
        <StatCard label="已关闭" value={stats.closed} icon={XCircle} color="text-steel-400" />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Kanban Board */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="section-title">需求看板</span>
              <span className="font-mono text-xs text-steel-400">DEMAND KANBAN</span>
            </div>
            <button onClick={() => setShowForm(true)} className="btn-industrial">
              <Plus className="h-4 w-4" />
              发布求购
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {(['quoting', 'matched', 'closed'] as const).map((status) => {
              const config = statusConfig[status];
              const items = demandOrders.filter((d) => d.status === status);
              const Icon = config.icon;
              return (
                <div key={status} className="flex flex-col">
                  <div className={cn('flex items-center justify-between px-3 py-2 border', config.border, config.bg)}>
                    <div className="flex items-center gap-2">
                      <Icon className={cn('h-4 w-4', config.color)} />
                      <span className={cn('font-display text-sm font-semibold uppercase', config.color)}>
                        {config.label}
                      </span>
                    </div>
                    <span className={cn('font-mono text-lg font-bold', config.color)}>{items.length}</span>
                  </div>
                  <div className="flex-1 space-y-2 mt-2 min-h-[200px] bg-steel-900/30 border border-steel-700 border-t-0 p-2">
                    {items.map((demand) => (
                      <DemandCard
                        key={demand.id}
                        demand={demand}
                        onClick={() => setSelectedDemand(demand)}
                        onClose={() => closeDemandOrder(demand.id)}
                        isSelected={selectedDemand?.id === demand.id}
                      />
                    ))}
                    {items.length === 0 && (
                      <div className="flex items-center justify-center py-8">
                        <span className="font-mono text-xs text-steel-600">暂无需求</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Match Results Panel */}
        {selectedDemand && (
          <aside className="w-96 shrink-0 border-l border-steel-700 bg-steel-800 overflow-y-auto">
            <div className="sticky top-0 bg-steel-800 border-b border-steel-600 px-4 py-3 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-safety-400" />
                <span className="section-title !text-base">匹配推荐</span>
              </div>
              <button onClick={() => setSelectedDemand(null)} className="text-steel-400 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-4">
              <div className="nameplate mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <EquipmentTypeIcon type={selectedDemand.type} className="h-4 w-4 text-safety-400" />
                  <span className="font-mono text-xs text-steel-300">{selectedDemand.id}</span>
                  <span className={cn('status-badge ml-auto', statusConfig[selectedDemand.status].border, statusConfig[selectedDemand.status].color, statusConfig[selectedDemand.status].bg)}>
                    {statusConfig[selectedDemand.status].label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="data-label">吨位</span>
                    <p className="data-value">{selectedDemand.tonnage}t</p>
                  </div>
                  <div>
                    <span className="data-label">预算</span>
                    <p className="data-value">{formatPrice(selectedDemand.budgetRange[0])} - {formatPrice(selectedDemand.budgetRange[1])}</p>
                  </div>
                  <div>
                    <span className="data-label">进场地点</span>
                    <p className="data-value">{selectedDemand.location}</p>
                  </div>
                  <div>
                    <span className="data-label">排放</span>
                    <p className="data-value">{selectedDemand.emission ? emissionLabel(selectedDemand.emission) : '不限'}</p>
                  </div>
                </div>
                {selectedDemand.remark && (
                  <div className="mt-2 pt-2 border-t border-steel-600">
                    <span className="data-label">备注</span>
                    <p className="font-sans text-xs text-steel-200 mt-1">{selectedDemand.remark}</p>
                  </div>
                )}
              </div>

              {(matchResults[selectedDemand.id] || []).map((result) => (
                <div key={result.equipment.id} className="industrial-card mb-3 p-3">
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <svg className="h-14 w-14 -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15" fill="none" stroke="#3A4047" strokeWidth="3" />
                        <circle
                          cx="18" cy="18" r="15" fill="none"
                          stroke="#F5A623" strokeWidth="3"
                          strokeDasharray={`${(result.matchScore / 100) * 94.2} 94.2`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-safety-400">
                        {result.matchScore}%
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <EquipmentTypeIcon type={result.equipment.type} className="h-3.5 w-3.5 text-safety-400" />
                        <span className="font-sans text-sm font-bold text-white truncate">
                          {result.equipment.brand} {result.equipment.model}
                        </span>
                        <ScoreBadge score={result.equipment.conditionScore} size="sm" />
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-display text-lg font-bold text-safety-400">
                          {formatPrice(result.equipment.price)}
                        </span>
                        <span className="font-mono text-xs text-steel-400">{result.equipment.city}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {result.reasons.map((reason, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-safety-400/10 border border-safety-400/30 font-mono text-[10px] text-safety-400"
                          >
                            <Sparkles className="h-2.5 w-2.5" />
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Link
                    to={`/inspection/${result.equipment.id}`}
                    className="mt-2 w-full btn-ghost !py-1.5 !text-xs flex"
                  >
                    查看验机报告
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              ))}

              {(!matchResults[selectedDemand.id] || matchResults[selectedDemand.id].length === 0) && (
                <div className="text-center py-8">
                  <Target className="h-8 w-8 text-steel-600 mx-auto mb-2" />
                  <p className="font-mono text-xs text-steel-500">系统匹配中，请稍候...</p>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* Publish Form Modal */}
      {showForm && (
        <PublishForm
          onClose={() => setShowForm(false)}
          onSubmit={(data) => {
            addDemandOrder(data);
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="industrial-panel p-3 flex items-center gap-3">
      <Icon className={cn('h-8 w-8', color)} strokeWidth={1.5} />
      <div>
        <div className={cn('font-display text-3xl font-bold leading-none', color)}>{value}</div>
        <div className="font-mono text-xs text-steel-400 mt-1">{label}</div>
      </div>
    </div>
  );
}

function DemandCard({ demand, onClick, onClose, isSelected }: { demand: DemandOrder; onClick: () => void; onClose: () => void; isSelected: boolean }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'industrial-card p-3 cursor-pointer',
        isSelected && 'border-safety-400 shadow-key-sm',
      )}
    >
      <div className="flex items-center gap-1.5 mb-2">
        <EquipmentTypeIcon type={demand.type} className="h-3.5 w-3.5 text-safety-400" />
        <span className="font-mono text-xs text-steel-300">{demand.id}</span>
      </div>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-1.5">
          <Wallet className="h-3 w-3 text-steel-400" />
          <span className="data-value !text-xs">{formatPrice(demand.budgetRange[0])}-{formatPrice(demand.budgetRange[1])}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-steel-400" />
          <span className="text-steel-200">{demand.location}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-3 w-3 text-steel-400" />
          <span className="text-steel-300 font-mono text-[10px]">{demand.startDate} → {demand.endDate}</span>
        </div>
      </div>
      {demand.status === 'quoting' && (
        <div className="mt-2 pt-2 border-t border-steel-600 flex items-center justify-between">
          <span className="font-mono text-xs text-safety-400">{demand.receivedQuotes} 条报价</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="font-mono text-[10px] text-steel-500 hover:text-red-400"
          >
            关闭
          </button>
        </div>
      )}
    </div>
  );
}

function PublishForm({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: Omit<DemandOrder, 'id' | 'status' | 'receivedQuotes' | 'createdAt'>) => void }) {
  const [type, setType] = useState<EquipmentType>('excavator');
  const [tonnage, setTonnage] = useState(20);
  const [budgetMin, setBudgetMin] = useState(200000);
  const [budgetMax, setBudgetMax] = useState(450000);
  const [startDate, setStartDate] = useState('2024-10-15');
  const [endDate, setEndDate] = useState('2025-04-15');
  const [location, setLocation] = useState('上海');
  const [emission, setEmission] = useState<EmissionStage | ''>('guo4');
  const [remark, setRemark] = useState('');

  const handleSubmit = () => {
    onSubmit({
      type,
      tonnage,
      budgetRange: [budgetMin, budgetMax],
      startDate,
      endDate,
      location,
      emission: emission || undefined,
      remark,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-steel-950/80 backdrop-blur p-4">
      <div className="bg-steel-800 border border-steel-600 shadow-key w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-3 border-b border-steel-600 bg-steel-900">
          <div className="flex items-center gap-2">
            <div className="bg-hazard-stripes h-1 w-8" />
            <h2 className="section-title">发布求购单</h2>
          </div>
          <button onClick={onClose} className="text-steel-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Basic Info */}
          <FormSection title="基础信息">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="机型">
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as EquipmentType)}
                  className="form-input"
                >
                  {equipmentTypes.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="吨位 (吨)">
                <input
                  type="number"
                  value={tonnage}
                  onChange={(e) => setTonnage(Number(e.target.value))}
                  className="form-input"
                />
              </FormField>
            </div>
          </FormSection>

          {/* Budget & Timeline */}
          <FormSection title="预算与工期">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="预算下限 (元)">
                <input
                  type="number"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(Number(e.target.value))}
                  className="form-input"
                  step={10000}
                />
              </FormField>
              <FormField label="预算上限 (元)">
                <input
                  type="number"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(Number(e.target.value))}
                  className="form-input"
                  step={10000}
                />
              </FormField>
              <FormField label="工期开始">
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
              </FormField>
              <FormField label="工期结束">
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
              </FormField>
            </div>
          </FormSection>

          {/* Location & Emission */}
          <FormSection title="进场要求">
            <div className="grid grid-cols-2 gap-3">
              <FormField label="进场地点">
                <select value={location} onChange={(e) => setLocation(e.target.value)} className="form-input">
                  {cities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="排放要求">
                <select
                  value={emission}
                  onChange={(e) => setEmission(e.target.value as EmissionStage | '')}
                  className="form-input"
                >
                  <option value="">不限</option>
                  {emissionStages.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </FormField>
            </div>
            <FormField label="特殊要求" className="mt-3">
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="如：需配破碎锤管路、优先低工时等"
                rows={2}
                className="form-input resize-none"
              />
            </FormField>
          </FormSection>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-steel-600 bg-steel-900">
          <button onClick={onClose} className="btn-ghost">取消</button>
          <button onClick={handleSubmit} className="btn-industrial">
            <Plus className="h-4 w-4" />
            发布求购
          </button>
        </div>

        <style>{`
          .form-input {
            width: 100%;
            background: #15181B;
            border: 1px solid #3A4047;
            padding: 0.5rem 0.75rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.875rem;
            color: white;
          }
          .form-input:focus {
            outline: none;
            border-color: #F5A623;
          }
        `}</style>
      </div>
    </div>
  );
}

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="h-1 w-1 bg-safety-400" />
        <span className="data-label">{title}</span>
      </div>
      {children}
    </div>
  );
}

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="data-label block mb-1">{label}</label>
      {children}
    </div>
  );
}
