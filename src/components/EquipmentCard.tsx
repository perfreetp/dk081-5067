import { Link } from 'react-router-dom';
import { MapPin, Clock, Gauge, Calendar, Plus, Check, Video, FileSearch, Lock } from 'lucide-react';
import type { Equipment } from '@/types';
import { useStore } from '@/store/useStore';
import { ScoreBadge, StatusDot, formatPrice, emissionLabel, EquipmentTypeIcon } from '@/components/ui';
import { cn } from '@/lib/utils';

type Props = {
  equipment: Equipment;
  onInitiateContact?: (equipmentId: string) => void;
};

export default function EquipmentCard({ equipment, onInitiateContact }: Props) {
  const compareList = useStore((s) => s.compareList);
  const toggleCompare = useStore((s) => s.toggleCompare);
  const isInCompare = compareList.includes(equipment.id);
  const isLocked = equipment.status === 'locked';
  const isSold = equipment.status === 'sold';
  const unavailable = isLocked || isSold;

  const handleVideo = () => {
    if (unavailable) return;
    if (onInitiateContact) onInitiateContact(equipment.id);
  };

  return (
    <div className="industrial-card group flex flex-col">
      <div className="relative overflow-hidden border-b border-steel-600 aspect-[4/3] bg-steel-900">
        <img
          src={equipment.coverImage}
          alt={`${equipment.brand} ${equipment.model}`}
          className={cn(
            'h-full w-full object-cover transition-transform duration-300 group-hover:scale-105',
            unavailable && 'opacity-60 grayscale',
          )}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-steel-950/80 via-transparent to-transparent" />

        <div className="absolute top-2 left-2 right-2 flex items-start justify-between">
          <div className="flex items-center gap-1.5 bg-steel-950/80 backdrop-blur px-2 py-1 border border-steel-600">
            <EquipmentTypeIcon type={equipment.type} className="h-3.5 w-3.5 text-safety-400" />
            <span className="font-mono text-xs text-white">{equipment.typeLabel}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isLocked && (
              <div className="flex items-center gap-1 bg-rust-600 px-2 py-1 border border-rust-500">
                <Lock className="h-3 w-3 text-white" />
                <span className="font-mono text-[10px] font-bold text-white">已锁机</span>
              </div>
            )}
            {isSold && (
              <div className="flex items-center gap-1 bg-steel-600 px-2 py-1 border border-steel-500">
                <span className="font-mono text-[10px] font-bold text-white">已成交</span>
              </div>
            )}
            <ScoreBadge score={equipment.conditionScore} size="sm" />
          </div>
        </div>

        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 bg-steel-950/80 backdrop-blur px-2 py-1 border border-steel-600">
            <StatusDot status={equipment.status} />
          </div>
          <span className="font-mono text-[10px] text-steel-300 bg-steel-950/80 backdrop-blur px-2 py-1 border border-steel-600">
            {equipment.id}
          </span>
        </div>
      </div>

      <div className="nameplate flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-sans text-base font-bold text-white truncate">
              {equipment.brand} {equipment.model}
            </h3>
            <p className="font-mono text-xs text-steel-300 mt-0.5">{equipment.sellerName}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="font-display text-2xl font-bold text-safety-400 leading-none">
              {formatPrice(equipment.price)}
            </div>
            <div className="font-mono text-[10px] text-steel-400 mt-0.5">参考价</div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          <SpecItem icon={Gauge} label="吨位" value={`${equipment.tonnage}t`} />
          <SpecItem icon={Clock} label="工时" value={`${equipment.workHours.toLocaleString()}h`} />
          <SpecItem icon={Calendar} label="年份" value={`${equipment.year}`} />
          <SpecItem icon={Gauge} label="排放" value={emissionLabel(equipment.emission)} />
        </div>

        <div className="mt-2 flex items-center gap-1.5 text-steel-300">
          <MapPin className="h-3.5 w-3.5 text-safety-400" />
          <span className="font-mono text-xs">{equipment.city}</span>
          {equipment.matchScore && (
            <span className="ml-auto font-mono text-xs text-safety-400 font-bold">
              匹配 {equipment.matchScore}%
            </span>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-steel-600 flex items-center gap-2">
          <Link
            to={`/inspection/${equipment.id}`}
            className="flex-1 btn-ghost !py-1.5 !text-xs"
          >
            <FileSearch className="h-3.5 w-3.5" />
            验机
          </Link>
          <button
            onClick={handleVideo}
            disabled={unavailable}
            className={cn(
              'btn-industrial !py-1.5 !px-2 !text-xs',
              unavailable && 'opacity-50 cursor-not-allowed !bg-steel-700 !border-steel-600',
            )}
          >
            <Video className="h-3.5 w-3.5" />
            {isLocked ? '已锁' : '看车'}
          </button>
          <button
            onClick={() => toggleCompare(equipment.id)}
            disabled={isSold}
            className={cn(
              'flex items-center justify-center h-8 w-8 border transition-all',
              isInCompare
                ? 'bg-safety-400 border-safety-600 text-steel-900'
                : 'bg-transparent border-steel-500 text-steel-300 hover:border-safety-400 hover:text-safety-400',
              isSold && 'opacity-50 cursor-not-allowed',
            )}
            title={isInCompare ? '移出比价' : '加入比价'}
          >
            {isInCompare ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function SpecItem({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3 w-3 text-steel-400 shrink-0" />
      <span className="data-label !text-[10px]">{label}</span>
      <span className="data-value !text-xs !text-steel-100 ml-auto">{value}</span>
    </div>
  );
}
