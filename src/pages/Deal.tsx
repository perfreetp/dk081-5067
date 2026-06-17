import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  FileSignature,
  Truck,
  Coins,
  Star,
  ArrowRight,
  Handshake,
  MessageSquare,
  Zap,
  PackageCheck,
  Timer,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { equipments } from '@/data/mockData';
import { ScoreBadge, formatPrice, formatFullPrice, emissionLabel, EquipmentTypeIcon } from '@/components/ui';
import type { DealRecord, Evaluation } from '@/types';
import { cn } from '@/lib/utils';

const nodeIcons: Record<string, React.ElementType> = {
  inspection: CheckCircle2,
  deposit: Coins,
  contract: FileSignature,
  balance: Coins,
  transfer: Truck,
  pickup: PackageCheck,
  evaluation: Star,
};

const tabConfig = [
  { key: 'contract', label: '合同确认', icon: FileText },
  { key: 'transfer', label: '过户清单', icon: Truck },
  { key: 'payment', label: '付款待办', icon: Coins },
  { key: 'evaluation', label: '成交评价', icon: Star },
];

export default function Deal() {
  const { dealRecords } = useStore();
  const [selectedId, setSelectedId] = useState(dealRecords[0]?.id ?? '');
  const [activeTab, setActiveTab] = useState('contract');

  const selectedDeal = dealRecords.find((d) => d.id === selectedId) ?? dealRecords[0];

  if (!selectedDeal) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Handshake className="h-12 w-12 text-steel-600 mx-auto mb-4" />
          <p className="font-display text-xl text-steel-400">暂无成交记录</p>
          <p className="font-mono text-xs text-steel-500 mt-2 mb-4">完成议价锁机后即可在此查看交易流程</p>
          <Link to="/bargain" className="btn-industrial">去议价台</Link>
        </div>
      </div>
    );
  }

  const equipment = equipments.find((e) => e.id === selectedDeal.equipmentId);
  const currentStep = selectedDeal.timeline.findIndex((t) => t.status === 'current');
  const doneCount = selectedDeal.timeline.filter((t) => t.status === 'done').length;
  const progress = Math.round((doneCount / selectedDeal.timeline.length) * 100);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Deal List */}
      <aside className="w-72 shrink-0 border-r border-steel-700 bg-steel-800 overflow-y-auto">
        <div className="px-4 py-3 border-b border-steel-600">
          <div className="flex items-center gap-2">
            <Handshake className="h-4 w-4 text-safety-400" />
            <span className="section-title !text-base">成交记录</span>
          </div>
          <p className="font-mono text-xs text-steel-400 mt-1">DEAL RECORDS</p>
        </div>
        <div className="p-2 space-y-1">
          {dealRecords.map((deal) => {
            const eq = equipments.find((e) => e.id === deal.equipmentId);
            const dealDone = deal.timeline.every((t) => t.status === 'done');
            const dealCurrent = deal.timeline.some((t) => t.status === 'current');
            return (
              <button
                key={deal.id}
                onClick={() => setSelectedId(deal.id)}
                className={cn(
                  'w-full text-left p-3 border transition-all',
                  selectedDeal.id === deal.id
                    ? 'bg-steel-700 border-safety-400'
                    : 'bg-steel-900/50 border-steel-700 hover:border-steel-500',
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  {eq && <EquipmentTypeIcon type={eq.type} className="h-4 w-4 text-safety-400" />}
                  <span className="font-mono text-xs text-steel-300">{deal.id}</span>
                  <span className={cn(
                    'ml-auto status-badge',
                    dealDone ? 'bg-green-500/20 text-green-400 border-green-500' :
                    dealCurrent ? 'bg-safety-400/20 text-safety-400 border-safety-400' :
                    'bg-steel-700 text-steel-400 border-steel-600',
                  )}>
                    {dealDone ? '已完成' : dealCurrent ? '进行中' : '待处理'}
                  </span>
                </div>
                {eq && (
                  <div className="font-sans text-sm font-bold text-white">
                    {eq.brand} {eq.model}
                  </div>
                )}
                <div className="font-mono text-xs text-steel-400 mt-0.5">{deal.buyerName}</div>
                <div className="mt-2 h-1 bg-steel-700 overflow-hidden">
                  <div
                    className={cn('h-full transition-all', dealDone ? 'bg-green-500' : 'bg-safety-400')}
                    style={{ width: `${(deal.timeline.filter((t) => t.status === 'done').length / deal.timeline.length) * 100}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Main Detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Deal Header */}
        <div className="border-b border-steel-600 bg-steel-800 px-6 py-3">
          <div className="flex items-center gap-4">
            {equipment && (
              <>
                <EquipmentTypeIcon type={equipment.type} className="h-8 w-8 text-safety-400" />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-white">{equipment.brand} {equipment.model}</h2>
                    <ScoreBadge score={equipment.conditionScore} size="sm" />
                  </div>
                  <p className="font-mono text-xs text-steel-300">
                    {selectedDeal.id} | 买家：{selectedDeal.buyerName} | 成交日期：{selectedDeal.createdAt}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-display text-2xl font-bold text-safety-400">{formatPrice(equipment.price)}</div>
                  <div className="font-mono text-xs text-steel-400">成交价</div>
                </div>
              </>
            )}
          </div>

          {/* Progress bar */}
          <div className="mt-3 flex items-center gap-3">
            <span className="data-label">交易进度</span>
            <div className="flex-1 h-2 bg-steel-900 overflow-hidden border border-steel-600">
              <div
                className="h-full bg-hazard-stripes transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-display text-lg font-bold text-safety-400">{progress}%</span>
            <span className="font-mono text-xs text-steel-400">({doneCount}/{selectedDeal.timeline.length})</span>
          </div>
        </div>

        {/* Transaction Timeline */}
        <div className="border-b border-steel-700 bg-steel-800/30 px-6 py-4">
          <div className="flex items-center gap-2 mb-3">
            <Timer className="h-4 w-4 text-safety-400" />
            <span className="section-title !text-sm">交易节点</span>
          </div>
          <div className="flex items-center overflow-x-auto pb-2">
            {selectedDeal.timeline.map((node, i) => {
              const Icon = nodeIcons[node.node] ?? Circle;
              const isLast = i === selectedDeal.timeline.length - 1;
              return (
                <div key={i} className="flex items-center shrink-0">
                  <div className="flex flex-col items-center min-w-[100px]">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center border-2 transition-all',
                        node.status === 'done' && 'bg-green-500/20 border-green-500 text-green-400',
                        node.status === 'current' && 'bg-safety-400/20 border-safety-400 text-safety-400 animate-pulse-glow',
                        node.status === 'pending' && 'bg-steel-800 border-steel-600 text-steel-500',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      'font-mono text-xs font-bold mt-1.5 text-center',
                      node.status === 'done' && 'text-green-400',
                      node.status === 'current' && 'text-safety-400',
                      node.status === 'pending' && 'text-steel-500',
                    )}>
                      {node.label}
                    </span>
                    {node.timestamp && (
                      <span className="font-mono text-[10px] text-steel-500 mt-0.5">{node.timestamp}</span>
                    )}
                    {node.status === 'current' && (
                      <span className="font-mono text-[10px] text-safety-400 mt-0.5 flex items-center gap-0.5">
                        <Clock className="h-2.5 w-2.5" />
                        待处理
                      </span>
                    )}
                  </div>
                  {!isLast && (
                    <div className={cn(
                      'h-0.5 w-12 mx-1',
                      selectedDeal.timeline[i + 1].status === 'done' ||
                      (node.status === 'done' && selectedDeal.timeline[i + 1].status !== 'pending')
                        ? 'bg-green-500/50'
                        : 'bg-steel-600',
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab Nav */}
          <div className="flex items-center gap-1 px-6 border-b border-steel-700 bg-steel-800/50 sticky top-0 z-10">
            {tabConfig.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-mono text-xs font-bold uppercase tracking-wide transition-all',
                    activeTab === tab.key
                      ? 'border-safety-400 text-safety-400'
                      : 'border-transparent text-steel-400 hover:text-white',
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {activeTab === 'contract' && <ContractTab deal={selectedDeal} />}
            {activeTab === 'transfer' && <TransferTab deal={selectedDeal} />}
            {activeTab === 'payment' && <PaymentTab deal={selectedDeal} />}
            {activeTab === 'evaluation' && <EvaluationTab deal={selectedDeal} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractTab({ deal }: { deal: DealRecord }) {
  const { confirmContractClause, setSpecialTerms } = useStore();
  const allConfirmed = deal.contractClauses.every((c) => c.confirmed);

  return (
    <div className="animate-slide-in max-w-3xl">
      <div className="nameplate mb-4">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="h-4 w-4 text-safety-400" />
          <span className="section-title !text-base">二手设备买卖合同</span>
          <span className="font-mono text-xs text-steel-400 ml-auto">CONTRACT №{deal.id}</span>
        </div>
        <div className="bg-steel-950 border border-steel-600 p-4">
          <p className="font-sans text-sm text-steel-200 leading-relaxed mb-3">
            买方（{deal.buyerName}）与卖方经友好协商，就二手工程机械设备的买卖事宜达成如下协议：
          </p>
          <div className="space-y-2">
            {deal.contractClauses.map((clause, i) => (
              <div key={i} className="flex items-start gap-2">
                <button
                  onClick={() => confirmContractClause(deal.id, i)}
                  className={cn(
                    'mt-0.5 flex h-4 w-4 items-center justify-center border-2 shrink-0 transition-all',
                    clause.confirmed
                      ? 'bg-green-500 border-green-600 text-steel-900'
                      : 'border-steel-500 hover:border-safety-400',
                  )}
                >
                  {clause.confirmed && <CheckCircle2 className="h-3 w-3" />}
                </button>
                <span className={cn(
                  'font-sans text-sm',
                  clause.confirmed ? 'text-steel-200' : 'text-steel-400',
                )}>
                  {i + 1}. {clause.clause}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Special Terms */}
      <div className="nameplate mb-4">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="h-4 w-4 text-safety-400" />
          <span className="data-label">特殊条款</span>
        </div>
        <textarea
          value={deal.specialTerms}
          onChange={(e) => setSpecialTerms(deal.id, e.target.value)}
          placeholder="补充双方约定的特殊条款，如质保范围、交付时间等..."
          rows={3}
          className="w-full bg-steel-950 border border-steel-600 px-3 py-2 font-sans text-sm text-white placeholder:text-steel-600 focus:border-safety-400 focus:outline-none resize-none"
        />
      </div>

      {/* Confirmation Status */}
      <div className={cn(
        'flex items-center gap-3 p-4 border',
        allConfirmed
          ? 'bg-green-500/10 border-green-500/50'
          : 'bg-safety-400/10 border-safety-400/50',
      )}>
        {allConfirmed ? (
          <>
            <ShieldCheck className="h-5 w-5 text-green-400" />
            <span className="font-display text-sm font-bold text-green-400">合同条款已全部确认</span>
          </>
        ) : (
          <>
            <Clock className="h-5 w-5 text-safety-400" />
            <span className="font-display text-sm font-bold text-safety-400">
              待确认 {deal.contractClauses.filter((c) => !c.confirmed).length} 项条款
            </span>
          </>
        )}
        <button
          className={cn('ml-auto btn-industrial', allConfirmed && '!bg-green-500 !border-green-600 hover:!bg-green-400')}
          disabled={!allConfirmed}
        >
          <FileSignature className="h-4 w-4" />
          签署合同
        </button>
      </div>
    </div>
  );
}

function TransferTab({ deal }: { deal: DealRecord }) {
  const { toggleTransferDoc } = useStore();
  const readyCount = deal.transferDocs.filter((d) => d.ready).length;
  const progress = Math.round((readyCount / deal.transferDocs.length) * 100);

  return (
    <div className="animate-slide-in max-w-3xl">
      <div className="nameplate mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-safety-400" />
            <span className="section-title !text-base">过户资料清单</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-display text-2xl font-bold text-safety-400">{progress}%</span>
            <span className="font-mono text-xs text-steel-400">({readyCount}/{deal.transferDocs.length})</span>
          </div>
        </div>
        <div className="h-2 bg-steel-950 overflow-hidden border border-steel-600 mb-4">
          <div className="h-full bg-safety-400 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
        <div className="space-y-2">
          {deal.transferDocs.map((doc, i) => (
            <button
              key={i}
              onClick={() => toggleTransferDoc(deal.id, i)}
              className={cn(
                'w-full flex items-center gap-3 p-3 border transition-all text-left',
                doc.ready
                  ? 'bg-green-500/10 border-green-500/50'
                  : 'bg-steel-950 border-steel-600 hover:border-steel-400',
              )}
            >
              <div className={cn(
                'flex h-5 w-5 items-center justify-center border-2 shrink-0',
                doc.ready ? 'bg-green-500 border-green-600 text-steel-900' : 'border-steel-500',
              )}>
                {doc.ready && <CheckCircle2 className="h-3.5 w-3.5" />}
              </div>
              <FileText className={cn('h-4 w-4', doc.ready ? 'text-green-400' : 'text-steel-400')} />
              <span className={cn('font-sans text-sm flex-1', doc.ready ? 'text-white' : 'text-steel-300')}>
                {doc.name}
              </span>
              <span className={cn(
                'status-badge',
                doc.ready ? 'bg-green-500/20 text-green-400 border-green-500' : 'bg-safety-400/20 text-safety-400 border-safety-400',
              )}>
                {doc.ready ? '已备齐' : '待提交'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PaymentTab({ deal }: { deal: DealRecord }) {
  const { payItem } = useStore();
  const totalPaid = deal.paymentTodo.filter((p) => p.paid).reduce((sum, p) => sum + p.amount, 0);
  const totalAmount = deal.paymentTodo.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="animate-slide-in max-w-3xl">
      <div className="nameplate mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Coins className="h-4 w-4 text-safety-400" />
          <span className="section-title !text-base">付款待办</span>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-steel-950 border border-steel-600 p-3 text-center">
            <span className="data-label">应付总额</span>
            <div className="font-display text-xl font-bold text-white mt-1">{formatFullPrice(totalAmount)}</div>
          </div>
          <div className="bg-green-500/10 border border-green-500/50 p-3 text-center">
            <span className="data-label text-green-400">已支付</span>
            <div className="font-display text-xl font-bold text-green-400 mt-1">{formatFullPrice(totalPaid)}</div>
          </div>
          <div className="bg-safety-400/10 border border-safety-400/50 p-3 text-center">
            <span className="data-label text-safety-400">待支付</span>
            <div className="font-display text-xl font-bold text-safety-400 mt-1">{formatFullPrice(totalAmount - totalPaid)}</div>
          </div>
        </div>

        {/* Payment Items */}
        <div className="space-y-2">
          {deal.paymentTodo.map((item, i) => (
            <div
              key={i}
              className={cn(
                'flex items-center gap-3 p-3 border',
                item.paid ? 'bg-green-500/10 border-green-500/50' : 'bg-steel-950 border-steel-600',
              )}
            >
              <div className={cn(
                'flex h-9 w-9 items-center justify-center border-2 shrink-0',
                item.paid ? 'bg-green-500 border-green-600 text-steel-900' : 'border-safety-400 text-safety-400',
              )}>
                {item.paid ? <CheckCircle2 className="h-5 w-5" /> : <Coins className="h-4 w-4" />}
              </div>
              <div className="flex-1">
                <div className="font-sans text-sm font-bold text-white">{item.item}</div>
                <div className="font-mono text-xs text-steel-400">{formatFullPrice(item.amount)}</div>
              </div>
              {item.paid ? (
                <span className="status-badge bg-green-500/20 text-green-400 border-green-500">
                  <CheckCircle2 className="h-3 w-3" />
                  已支付
                </span>
              ) : (
                <button onClick={() => payItem(deal.id, i)} className="btn-industrial !py-1.5 !text-xs">
                  <Zap className="h-3.5 w-3.5" />
                  立即支付
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function EvaluationTab({ deal }: { deal: DealRecord }) {
  const { submitEvaluation } = useStore();
  const [evaluation, setEvaluation] = useState<Evaluation>(
    deal.evaluation ?? { responsiveness: 0, conditionMatch: 0, delivery: 0, comment: '' },
  );

  const dimensions = [
    { key: 'responsiveness' as const, label: '卖家响应速度', icon: Zap },
    { key: 'conditionMatch' as const, label: '车况一致度', icon: ShieldCheck },
    { key: 'delivery' as const, label: '交付时效', icon: PackageCheck },
  ];

  const avgScore = evaluation.responsiveness && evaluation.conditionMatch && evaluation.delivery
    ? ((evaluation.responsiveness + evaluation.conditionMatch + evaluation.delivery) / 3).toFixed(1)
    : '0.0';

  return (
    <div className="animate-slide-in max-w-3xl">
      {deal.evaluation ? (
        <div className="nameplate">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-safety-400" fill="currentColor" />
            <span className="section-title !text-base">已评价</span>
            <span className="ml-auto font-display text-3xl font-bold text-safety-400">{avgScore}</span>
            <span className="font-mono text-sm text-steel-400">/ 5.0</span>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {dimensions.map((dim) => {
              const Icon = dim.icon;
              const score = deal.evaluation[dim.key];
              return (
                <div key={dim.key} className="bg-steel-950 border border-steel-600 p-3 text-center">
                  <Icon className="h-6 w-6 text-safety-400 mx-auto mb-2" />
                  <div className="flex items-center justify-center gap-0.5 mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn('h-3.5 w-3.5', star <= score ? 'text-safety-400' : 'text-steel-700')}
                        fill={star <= score ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <span className="font-mono text-xs text-steel-300">{dim.label}</span>
                </div>
              );
            })}
          </div>
          <div className="bg-steel-950 border border-steel-600 p-3">
            <span className="data-label block mb-1">评价内容</span>
            <p className="font-sans text-sm text-steel-200">{deal.evaluation.comment}</p>
          </div>
        </div>
      ) : (
        <div className="nameplate">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-safety-400" />
            <span className="section-title !text-base">成交评价</span>
          </div>

          <div className="space-y-3 mb-4">
            {dimensions.map((dim) => {
              const Icon = dim.icon;
              const score = evaluation[dim.key];
              return (
                <div key={dim.key} className="bg-steel-950 border border-steel-600 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="h-4 w-4 text-safety-400" />
                    <span className="font-sans text-sm text-white">{dim.label}</span>
                    <span className="ml-auto font-display text-lg font-bold text-safety-400">{score || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setEvaluation({ ...evaluation, [dim.key]: star })}
                        className="transition-all hover:scale-110"
                      >
                        <Star
                          className={cn('h-7 w-7', star <= score ? 'text-safety-400' : 'text-steel-700 hover:text-steel-500')}
                          fill={star <= score ? 'currentColor' : 'none'}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mb-4">
            <span className="data-label block mb-2">文字评价</span>
            <textarea
              value={evaluation.comment}
              onChange={(e) => setEvaluation({ ...evaluation, comment: e.target.value })}
              placeholder="请评价本次交易的体验，如车况是否与描述一致、卖家服务态度、交付是否准时等..."
              rows={4}
              className="w-full bg-steel-950 border border-steel-600 px-3 py-2 font-sans text-sm text-white placeholder:text-steel-600 focus:border-safety-400 focus:outline-none resize-none"
            />
          </div>

          <button
            onClick={() => submitEvaluation(deal.id, evaluation)}
            disabled={!evaluation.responsiveness || !evaluation.conditionMatch || !evaluation.delivery}
            className={cn(
              'btn-industrial w-full',
              (!evaluation.responsiveness || !evaluation.conditionMatch || !evaluation.delivery) && 'opacity-50 cursor-not-allowed',
            )}
          >
            <Send className="h-4 w-4" />
            提交评价
          </button>
        </div>
      )}
    </div>
  );
}
