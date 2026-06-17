import type { EquipmentType, ConditionScore } from '@/types';
import { Pickaxe, Truck, CircleDot, HardHat } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EquipmentTypeIcon({ type, className }: { type: EquipmentType; className?: string }) {
  const Icon =
    type === 'excavator' ? Pickaxe :
    type === 'loader' ? Truck :
    type === 'roller' ? CircleDot :
    HardHat;
  return <Icon className={className} strokeWidth={2} />;
}

export function ScoreBadge({ score, size = 'md' }: { score: ConditionScore; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass =
    size === 'lg' ? 'h-16 w-16 text-4xl' :
    size === 'sm' ? 'h-7 w-7 text-sm' :
    'h-10 w-10 text-xl';
  const colorClass =
    score === 'A' ? 'bg-green-500/20 text-green-400 border-green-500' :
    score === 'B' ? 'bg-safety-400/20 text-safety-400 border-safety-400' :
    score === 'C' ? 'bg-engine-500/20 text-engine-400 border-engine-500' :
    'bg-red-500/20 text-red-400 border-red-500';
  return (
    <div className={cn('flex items-center justify-center font-display font-bold border-2', sizeClass, colorClass)}>
      {score}
    </div>
  );
}

export function StatusDot({ status }: { status: 'available' | 'locked' | 'sold' }) {
  const config = {
    available: { color: 'bg-green-400', label: '在售', textColor: 'text-green-400' },
    locked: { color: 'bg-safety-400', label: '已锁机', textColor: 'text-safety-400' },
    sold: { color: 'bg-steel-500', label: '已售', textColor: 'text-steel-400' },
  }[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2 w-2', config.color, status === 'available' && 'animate-flash')} />
      <span className={cn('font-mono text-xs font-bold', config.textColor)}>{config.label}</span>
    </span>
  );
}

export function formatPrice(price: number): string {
  if (price >= 10000) {
    return `${(price / 10000).toFixed(1)}万`;
  }
  return `${price.toLocaleString()}`;
}

export function formatFullPrice(price: number): string {
  return `¥${price.toLocaleString()}`;
}

export function emissionLabel(emission: string): string {
  return emission === 'guo5' ? '国五' : emission === 'guo4' ? '国四' : '国三';
}
