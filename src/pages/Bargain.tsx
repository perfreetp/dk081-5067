import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Scale,
  Send,
  Lock,
  Truck,
  Receipt,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  Coins,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { ScoreBadge, formatPrice, formatFullPrice, emissionLabel, EquipmentTypeIcon } from '@/components/ui';
import type { FreightMode, TaxMode } from '@/types';
import { cn } from '@/lib/utils';

export default function Bargain() {
  const store = useStore();
  const { bargainSessions, activeSessionId, setActiveSession, sendMessage, setFreightMode, setTaxMode, lockEquipment, equipments } = store;
  const [inputMessage, setInputMessage] = useState('');
  const [inputAmount, setInputAmount] = useState('');
  const [depositInput, setDepositInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = bargainSessions.find((s) => s.id === activeSessionId) ?? bargainSessions[0];
  const sessionEquipments = activeSession?.equipmentIds
    .map((id) => equipments.find((e) => e.id === id))
    .filter(Boolean) ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages.length]);

  if (!activeSession) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Scale className="h-12 w-12 text-steel-600 mx-auto mb-4" />
          <p className="font-display text-xl text-steel-400">暂无议价会话</p>
          <p className="font-mono text-xs text-steel-500 mt-2 mb-4">在车源大厅加入比价单后即可开始议价</p>
          <Link to="/hall" className="btn-industrial">去车源大厅</Link>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!inputMessage.trim() && !inputAmount.trim()) return;
    sendMessage(activeSession.id, {
      from: 'buyer',
      content: inputMessage.trim(),
      amount: inputAmount ? Number(inputAmount) : undefined,
    });
    setInputMessage('');
    setInputAmount('');
  };

  const handleLock = () => {
    const deposit = Number(depositInput) || Math.round((activeSession.lastPrice ?? 0) * 0.2);
    const equipmentId = activeSession.focusEquipmentId ?? sessionEquipments[0]?.id;
    if (equipmentId) {
      lockEquipment(activeSession.id, deposit, equipmentId);
    }
    setDepositInput('');
  };

  const isLocked = !!activeSession.lockDeadline;
  const lastPrice = activeSession.lastPrice ?? sessionEquipments[0]?.price ?? 0;
  const freight = activeSession.freightMode === 'included' ? 0 : activeSession.freightCost;
  const taxAmount = activeSession.taxMode === 'taxIncluded' ? 0 : Math.round(lastPrice * (activeSession.taxRate / 100));
  const totalPrice = lastPrice + freight + taxAmount;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-steel-700 bg-steel-800 overflow-x-auto">
        <span className="data-label shrink-0">议价会话</span>
        {bargainSessions.map((s) => {
          const eq = equipments.find((e) => e.id === s.equipmentIds[0]);
          return (
            <button
              key={s.id}
              onClick={() => setActiveSession(s.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 border font-mono text-xs transition-all shrink-0',
                activeSession.id === s.id
                  ? 'bg-safety-400 border-safety-600 text-steel-900'
                  : 'bg-steel-900 border-steel-600 text-steel-300 hover:border-steel-400',
              )}
            >
              {eq && <EquipmentTypeIcon type={eq.type} className="h-3.5 w-3.5" />}
              <span>{s.id}</span>
              {s.lockDeadline && <Lock className="h-3 w-3" />}
            </button>
          );
        })}
      </div>

      <div className="border-b border-steel-700 bg-steel-800/50 overflow-x-auto">
        <div className="px-4 py-2 flex items-center gap-2 border-b border-steel-700">
          <Scale className="h-4 w-4 text-safety-400" />
          <span className="section-title !text-sm">横向比价单</span>
          <span className="font-mono text-xs text-steel-400">COMPARISON SHEET</span>
          {isLocked && (
            <span className="ml-auto flex items-center gap-1.5 status-badge bg-engine-500/20 text-engine-400 border-engine-500">
              <Lock className="h-3 w-3" />
              已锁机
            </span>
          )}
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-steel-700">
              <th className="text-left p-3 data-label w-28">对比项</th>
              {sessionEquipments.map((eq) => eq && (
                <th key={eq.id} className="text-left p-3 min-w-[160px]">
                  <Link to={`/inspection/${eq.id}`} className="block">
                    <div className="flex items-center gap-1.5 mb-1">
                      <EquipmentTypeIcon type={eq.type} className="h-4 w-4 text-safety-400" />
                      <span className="font-sans text-sm font-bold text-white">{eq.brand}</span>
                      <ScoreBadge score={eq.conditionScore} size="sm" />
                      {eq.id === activeSession.focusEquipmentId && (
                        <span className="font-mono text-[9px] font-bold text-engine-400 bg-engine-500/20 border border-engine-500/50 px-1 py-0.5">锁定目标</span>
                      )}
                    </div>
                    <div className="font-mono text-xs text-steel-400">{eq.model}</div>
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <CompareRow label="参考价" values={sessionEquipments.map((eq) => eq && formatPrice(eq.price))} highlight="min" />
            <CompareRow label="吨位" values={sessionEquipments.map((eq) => eq && `${eq.tonnage}t`)} />
            <CompareRow label="工况小时" values={sessionEquipments.map((eq) => eq && `${eq.workHours.toLocaleString()}h`)} highlight="min" />
            <CompareRow label="排放" values={sessionEquipments.map((eq) => eq && emissionLabel(eq.emission))} />
            <CompareRow label="年份" values={sessionEquipments.map((eq) => eq && `${eq.year}`)} highlight="max" />
            <CompareRow label="车况评分" values={sessionEquipments.map((eq) => eq && eq.conditionScore)} highlight="max" />
            <CompareRow label="所在城市" values={sessionEquipments.map((eq) => eq && eq.city)} />
          </tbody>
        </table>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col bg-steel-900">
          <div className="px-4 py-2 border-b border-steel-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-blue-400" />
                <span className="font-mono text-xs text-blue-400">买家</span>
              </div>
              <span className="text-steel-600">↔</span>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 bg-safety-400" />
                <span className="font-mono text-xs text-safety-400">卖家</span>
              </div>
            </div>
            <span className="font-mono text-xs text-steel-400">议价记录全程留痕</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeSession.messages.map((msg, i) => (
              <div
                key={i}
                className={cn('flex', msg.from === 'buyer' ? 'justify-start' : 'justify-end')}
              >
                <div className={cn(
                  'max-w-[70%] border',
                  msg.from === 'buyer'
                    ? 'bg-blue-500/10 border-blue-500/30'
                    : 'bg-safety-400/10 border-safety-400/30',
                )}>
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={cn(
                        'font-mono text-[10px] font-bold',
                        msg.from === 'buyer' ? 'text-blue-400' : 'text-safety-400',
                      )}>
                        {msg.from === 'buyer' ? '买家' : '卖家'}
                      </span>
                      <span className="font-mono text-[10px] text-steel-500">{msg.timestamp}</span>
                    </div>
                    <p className="font-sans text-sm text-steel-100">{msg.content}</p>
                    {msg.amount && (
                      <div className="mt-2 pt-2 border-t border-steel-700 flex items-center gap-1.5">
                        <Coins className="h-3.5 w-3.5 text-safety-400" />
                        <span className="font-display text-lg font-bold text-safety-400">{formatFullPrice(msg.amount)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-steel-700 p-3 bg-steel-800">
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={inputAmount}
                onChange={(e) => setInputAmount(e.target.value)}
                placeholder="报价金额（可选）"
                className="w-40 bg-steel-900 border border-steel-600 px-3 py-1.5 font-mono text-sm text-safety-400 placeholder:text-steel-600 focus:border-safety-400 focus:outline-none"
              />
              <span className="font-mono text-xs text-steel-500">元</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="输入议价消息..."
                className="flex-1 bg-steel-900 border border-steel-600 px-3 py-2 font-sans text-sm text-white placeholder:text-steel-500 focus:border-safety-400 focus:outline-none"
              />
              <button onClick={handleSend} className="btn-industrial !py-2">
                <Send className="h-4 w-4" />
                发送
              </button>
            </div>
          </div>
        </div>

        <aside className="w-80 shrink-0 border-l border-steel-700 bg-steel-800 overflow-y-auto">
          <div className="p-4 space-y-4">
            <div className="nameplate">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-4 w-4 text-safety-400" />
                <span className="section-title !text-sm">费用计算器</span>
              </div>

              <div className="bg-steel-950 border border-steel-600 p-3 mb-3 text-center">
                <span className="data-label">最新报价</span>
                <div className="font-display text-3xl font-bold text-safety-400 mt-1">
                  {formatFullPrice(lastPrice)}
                </div>
              </div>

              <div className="mb-3">
                <span className="data-label block mb-2">运费分摊</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['included', 'excluded'] as FreightMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setFreightMode(activeSession.id, mode)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 py-2 border font-mono text-xs font-bold transition-all',
                        activeSession.freightMode === mode
                          ? 'bg-safety-400 border-safety-600 text-steel-900'
                          : 'bg-steel-900 border-steel-600 text-steel-300 hover:border-steel-400',
                      )}
                    >
                      <Truck className="h-3 w-3" />
                      {mode === 'included' ? '含运费' : '不含运费'}
                    </button>
                  ))}
                </div>
                {activeSession.freightMode === 'excluded' && (
                  <div className="mt-2 flex items-center justify-between bg-steel-950 border border-steel-600 px-3 py-1.5">
                    <span className="data-label !text-[10px]">运费金额</span>
                    <span className="font-mono text-sm text-safety-400 font-bold">{formatFullPrice(activeSession.freightCost)}</span>
                  </div>
                )}
              </div>

              <div className="mb-3">
                <span className="data-label block mb-2">含税口径</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['taxIncluded', 'taxExcluded'] as TaxMode[]).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setTaxMode(activeSession.id, mode)}
                      className={cn(
                        'flex items-center justify-center gap-1.5 py-2 border font-mono text-xs font-bold transition-all',
                        activeSession.taxMode === mode
                          ? 'bg-safety-400 border-safety-600 text-steel-900'
                          : 'bg-steel-900 border-steel-600 text-steel-300 hover:border-steel-400',
                      )}
                    >
                      <Receipt className="h-3 w-3" />
                      {mode === 'taxIncluded' ? '含税' : '不含税'}
                    </button>
                  ))}
                </div>
                {activeSession.taxMode === 'taxExcluded' && (
                  <div className="mt-2 flex items-center justify-between bg-steel-950 border border-steel-600 px-3 py-1.5">
                    <span className="data-label !text-[10px]">税费 ({activeSession.taxRate}%)</span>
                    <span className="font-mono text-sm text-safety-400 font-bold">{formatFullPrice(taxAmount)}</span>
                  </div>
                )}
              </div>

              <div className="bg-safety-400/10 border border-safety-400/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="data-label">设备价格</span>
                  <span className="font-mono text-sm text-white">{formatFullPrice(lastPrice)}</span>
                </div>
                {freight > 0 && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="data-label">运费</span>
                    <span className="font-mono text-sm text-white">+ {formatFullPrice(freight)}</span>
                  </div>
                )}
                {taxAmount > 0 && (
                  <div className="flex items-center justify-between mb-1">
                    <span className="data-label">税费</span>
                    <span className="font-mono text-sm text-white">+ {formatFullPrice(taxAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-safety-400/30">
                  <span className="font-display text-sm font-bold uppercase text-safety-400">合计</span>
                  <span className="font-display text-xl font-bold text-safety-400">{formatFullPrice(totalPrice)}</span>
                </div>
              </div>
            </div>

            <div className={cn(
              'border p-4',
              isLocked ? 'bg-engine-500/10 border-engine-500/50' : 'nameplate',
            )}>
              <div className="flex items-center gap-2 mb-3">
                <Lock className={cn('h-4 w-4', isLocked ? 'text-engine-400' : 'text-safety-400')} />
                <span className="section-title !text-sm">订金锁机</span>
              </div>

              {isLocked ? (
                <div>
                  <div className="bg-steel-950 border border-engine-500/50 p-3 mb-3 text-center">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-engine-400" />
                      <span className="font-mono text-xs text-engine-400">设备已锁定</span>
                    </div>
                    <div className="font-display text-2xl font-bold text-engine-400">
                      {formatFullPrice(activeSession.depositAmount ?? 0)}
                    </div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Clock className="h-3 w-3 text-steel-400" />
                      <span className="font-mono text-xs text-steel-400">
                        锁机至 {new Date(activeSession.lockDeadline!).toLocaleDateString('zh-CN')}
                      </span>
                    </div>
                  </div>
                  <Link to="/deal" className="btn-industrial w-full">
                    前往成交中心
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div>
                  <div className="bg-steel-950 border border-steel-600 p-3 mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertCircle className="h-3.5 w-3.5 text-safety-400" />
                      <span className="font-mono text-xs text-steel-300">
                        支付订金后设备锁定3天，卖家不可再售
                      </span>
                    </div>
                    {(() => {
                      const focusEq = sessionEquipments.find((e) => e && e.id === activeSession.focusEquipmentId) ?? sessionEquipments[0];
                      return focusEq ? (
                        <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-steel-700">
                          <Lock className="h-3.5 w-3.5 text-engine-400" />
                          <span className="font-mono text-xs text-engine-400">锁定目标：</span>
                          <span className="font-sans text-xs font-bold text-white">{focusEq.brand} {focusEq.model}</span>
                          <span className="font-mono text-[10px] text-steel-400">{focusEq.id}</span>
                        </div>
                      ) : null;
                    })()}
                    <div className="flex items-center justify-between">
                      <span className="data-label">建议订金（20%）</span>
                      <span className="font-mono text-sm font-bold text-safety-400">
                        {formatFullPrice(Math.round(lastPrice * 0.2))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      value={depositInput}
                      onChange={(e) => setDepositInput(e.target.value)}
                      placeholder={String(Math.round(lastPrice * 0.2))}
                      className="flex-1 bg-steel-900 border border-steel-600 px-3 py-2 font-mono text-sm text-safety-400 placeholder:text-steel-600 focus:border-safety-400 focus:outline-none"
                    />
                    <span className="font-mono text-xs text-steel-500">元</span>
                  </div>
                  <button onClick={handleLock} className="btn-danger w-full">
                    <Lock className="h-4 w-4" />
                    支付订金锁机
                  </button>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CompareRow({
  label,
  values,
  highlight,
}: {
  label: string;
  values: (string | false | null | undefined)[];
  highlight?: 'min' | 'max';
}) {
  const numValues = values.map((v) => {
    if (!v) return null;
    const num = parseFloat(v.replace(/[^0-9.]/g, ''));
    return isNaN(num) ? null : num;
  });

  const bestIndex = highlight
    ? numValues.reduce((best, val, i) => {
        if (val === null) return best;
        if (best === -1) return i;
        const bestVal = numValues[best];
        if (bestVal === null) return i;
        return highlight === 'min' ? (val < bestVal ? i : best) : val > bestVal ? i : best;
      }, -1)
    : -1;

  return (
    <tr className="border-b border-steel-700/50 hover:bg-steel-800/30">
      <td className="p-3 data-label">{label}</td>
      {values.map((val, i) => (
        <td
          key={i}
          className={cn(
            'p-3 font-mono text-sm',
            i === bestIndex && highlight === 'min' && 'text-green-400 font-bold bg-green-500/5',
            i === bestIndex && highlight === 'max' && 'text-green-400 font-bold bg-green-500/5',
            (i !== bestIndex || !highlight) && 'text-steel-200',
          )}
        >
          {val || '-'}
        </td>
      ))}
    </tr>
  );
}
