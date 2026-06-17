import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Wrench,
  AlertTriangle,
  ArrowLeft,
  MapPin,
  Clock,
  Gauge,
  Calendar,
  ShieldCheck,
  CircleCheck,
  CircleAlert,
  Play,
  Star,
  Scale,
  Video as VideoIcon,
  CalendarCheck,
  Pause,
  X,
  Plus,
  Trash2,
  Edit3,
  Save,
  User,
  Phone,
  Map,
  Lock,
} from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ScoreBadge, StatusDot, formatPrice, emissionLabel, EquipmentTypeIcon } from '@/components/ui';
import { useStore } from '@/store/useStore';
import type { MaintenanceRecord, ReplacedPart, AccidentRecord, InspectionBooking } from '@/types';
import { cn } from '@/lib/utils';

type Tab = 'photos' | 'video' | 'nameplate' | 'maintenance' | 'accident';

const tabs = [
  { key: 'photos' as const, label: '整机照片', icon: ImageIcon },
  { key: 'video' as const, label: '冷启动视频', icon: Video },
  { key: 'nameplate' as const, label: '铭牌手续', icon: FileText },
  { key: 'maintenance' as const, label: '维保记录', icon: Wrench },
  { key: 'accident' as const, label: '事故史', icon: AlertTriangle },
];

export default function Inspection() {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const store = useStore();
  const {
    toggleCompare, compareList, equipments, inspectionReports,
    createOrGetBargainSession,
    getBookingByEquipment, addBooking, removeBooking,
    addMaintenanceRecord, updateMaintenanceRecord, removeMaintenanceRecord,
    addReplacedPart, updateReplacedPart, removeReplacedPart,
    addAccidentHistory, updateAccidentHistory, removeAccidentHistory,
  } = store;

  const [activeTab, setActiveTab] = useState<Tab>('photos');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const equipment = equipments.find((e) => e.id === equipmentId);
  const report = inspectionReports.find((r) => r.equipmentId === equipmentId);
  const booking = equipmentId ? getBookingByEquipment(equipmentId) : null;

  if (!equipment || !report) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="font-display text-xl text-steel-400">验机报告未找到</p>
          <Link to="/hall" className="btn-industrial mt-4">返回车源大厅</Link>
        </div>
      </div>
    );
  }

  const isInCompare = compareList.includes(equipment.id);
  const radarData = [
    { dimension: '发动机', score: report.scores.engine },
    { dimension: '液压', score: report.scores.hydraulic },
    { dimension: '底盘', score: report.scores.chassis },
    { dimension: '外观', score: report.scores.appearance },
  ];

  const goToBargain = () => {
    createOrGetBargainSession(equipment.id);
    navigate('/bargain');
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-steel-600 bg-steel-800">
        <div className="flex items-center gap-4 px-6 py-3">
          <Link to="/hall" className="btn-ghost !py-1.5 !text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            返回大厅
          </Link>
          <div className="h-6 w-px bg-steel-600" />
          <div className="flex items-center gap-3 flex-1">
            <EquipmentTypeIcon type={equipment.type} className="h-6 w-6 text-safety-400" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-xl font-bold text-white">{equipment.brand} {equipment.model}</h2>
                <ScoreBadge score={equipment.conditionScore} size="sm" />
              </div>
              <p className="font-mono text-xs text-steel-300">{equipment.id} | {equipment.sellerName}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-safety-400">{formatPrice(equipment.price)}</div>
            <StatusDot status={equipment.status} />
          </div>
          <div className="h-8 w-px bg-steel-600" />
          <button
            onClick={() => toggleCompare(equipment.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 border font-mono text-xs font-bold uppercase transition-all',
              isInCompare
                ? 'bg-safety-400 border-safety-600 text-steel-900'
                : 'bg-transparent border-steel-500 text-steel-200 hover:border-safety-400',
            )}
          >
            <Scale className="h-3.5 w-3.5" />
            {isInCompare ? '已加入比价' : '加入比价'}
          </button>
          <button onClick={goToBargain} disabled={equipment.status === 'locked' || equipment.status === 'sold'} className={cn('btn-industrial !py-1.5 !text-xs', (equipment.status === 'locked' || equipment.status === 'sold') && 'opacity-50 cursor-not-allowed !bg-steel-700 !border-steel-600')}>
            {equipment.status === 'locked' ? (
              <>
                <Lock className="h-3.5 w-3.5" />
                已锁机
              </>
            ) : equipment.status === 'sold' ? (
              '已成交'
            ) : (
              <>
                <VideoIcon className="h-3.5 w-3.5" />
                发起看车
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-6 px-6 pb-3">
          <QuickSpec icon={Gauge} label="吨位" value={`${equipment.tonnage}t`} />
          <QuickSpec icon={Clock} label="工况" value={`${equipment.workHours.toLocaleString()}h`} />
          <QuickSpec icon={Calendar} label="年份" value={`${equipment.year}`} />
          <QuickSpec icon={Gauge} label="排放" value={emissionLabel(equipment.emission)} />
          <QuickSpec icon={MapPin} label="城市" value={equipment.city} />
          <div className="ml-auto flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-safety-400" />
            <span className="font-mono text-xs text-steel-300">
              验机师 {report.inspector} | {report.inspectDate}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1 px-6 bg-steel-800 border-b border-steel-600">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-4 py-2.5 border-b-2 font-mono text-xs font-bold uppercase tracking-wide transition-all',
                activeTab === tab.key
                  ? 'border-safety-400 text-safety-400 bg-steel-700/50'
                  : 'border-transparent text-steel-400 hover:text-white',
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
        {(activeTab === 'maintenance' || activeTab === 'accident') && (
          <button
            onClick={() => setEditMode(!editMode)}
            className={cn(
              'ml-auto flex items-center gap-1.5 px-3 py-1 border font-mono text-[10px] font-bold uppercase transition-all',
              editMode
                ? 'bg-safety-400 border-safety-600 text-steel-900'
                : 'bg-transparent border-steel-500 text-steel-300 hover:border-safety-400 hover:text-safety-400',
            )}
          >
            {editMode ? <Save className="h-3 w-3" /> : <Edit3 className="h-3 w-3" />}
            {editMode ? '完成编辑' : '卖家编辑'}
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'photos' && (
            <div className="animate-slide-in">
              <div className="industrial-panel mb-4 overflow-hidden">
                <img
                  src={report.photos[selectedPhoto].url}
                  alt={report.photos[selectedPhoto].category}
                  className="w-full h-80 object-cover"
                />
                <div className="flex items-center justify-between px-4 py-2 bg-steel-900 border-t border-steel-600">
                  <span className="data-label">{report.photos[selectedPhoto].category}视角</span>
                  <span className="font-mono text-xs text-steel-400">{selectedPhoto + 1} / {report.photos.length}</span>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {report.photos.map((photo, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedPhoto(i)}
                    className={cn(
                      'aspect-square overflow-hidden border-2 transition-all',
                      selectedPhoto === i
                        ? 'border-safety-400 shadow-key-sm'
                        : 'border-steel-600 hover:border-steel-400',
                    )}
                  >
                    <img src={photo.url} alt={photo.category} className="h-full w-full object-cover" loading="lazy" />
                  </button>
                ))}
              </div>
              <div className="mt-4 p-3 bg-steel-800 border border-steel-600">
                <p className="font-mono text-xs text-steel-300">
                  <span className="text-safety-400">[ 验机提示 ]</span> 本组照片涵盖设备外观6面、驾驶室及发动机舱，由专业验机师现场拍摄，未经修图处理。
                </p>
              </div>
            </div>
          )}

          {activeTab === 'video' && (
            <div className="animate-slide-in">
              <div className="industrial-panel overflow-hidden">
                <div className="relative aspect-video bg-steel-950 border-b border-steel-600">
                  {!isVideoPlaying ? (
                    <>
                      <img
                        src={report.coldStartVideo.thumbnail}
                        alt="冷启动视频"
                        className="h-full w-full object-cover opacity-70"
                      />
                      <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="absolute inset-0 flex items-center justify-center"
                      >
                        <div className="flex h-16 w-16 items-center justify-center bg-safety-400/90 border-4 border-safety-600 hover:bg-safety-300 transition-all animate-pulse-glow">
                          <Play className="h-7 w-7 text-steel-900 ml-1" fill="currentColor" />
                        </div>
                      </button>
                    </>
                  ) : (
                    <div className="absolute inset-0 bg-black flex flex-col items-center justify-center">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="flex items-center gap-1.5 bg-engine-500/30 border border-engine-500 px-3 py-1">
                          <span className="h-2 w-2 bg-engine-400 animate-flash rounded-full" />
                          <span className="font-mono text-xs text-engine-400">播放中</span>
                        </div>
                        <span className="font-mono text-xs text-steel-400">{report.coldStartVideo.duration}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 mb-6 max-w-md w-full px-6">
                        <div className="bg-steel-800 border border-steel-600 p-3 text-center">
                          <div className="font-mono text-[10px] text-steel-400 mb-1">发动机转速</div>
                          <div className="font-display text-lg text-safety-400">1,850</div>
                          <div className="font-mono text-[10px] text-steel-500">RPM</div>
                        </div>
                        <div className="bg-steel-800 border border-steel-600 p-3 text-center">
                          <div className="font-mono text-[10px] text-steel-400 mb-1">液压油温</div>
                          <div className="font-display text-lg text-green-400">46</div>
                          <div className="font-mono text-[10px] text-steel-500">°C</div>
                        </div>
                        <div className="bg-steel-800 border border-steel-600 p-3 text-center">
                          <div className="font-mono text-[10px] text-steel-400 mb-1">冷却液</div>
                          <div className="font-display text-lg text-green-400">78</div>
                          <div className="font-mono text-[10px] text-steel-500">°C</div>
                        </div>
                      </div>
                      <p className="font-mono text-xs text-steel-500">模拟播放画面 · 点击下方按钮可暂停</p>
                      <button
                        onClick={() => setIsVideoPlaying(false)}
                        className="mt-4 flex items-center gap-1.5 px-4 py-1.5 bg-steel-800 border border-steel-600 font-mono text-xs text-steel-200 hover:border-safety-400"
                      >
                        <Pause className="h-3.5 w-3.5" />
                        暂停
                      </button>
                    </div>
                  )}
                  <div className="absolute top-3 left-3 flex items-center gap-2 bg-steel-950/80 backdrop-blur px-3 py-1 border border-steel-600">
                    <span className="h-2 w-2 bg-red-500 animate-flash" />
                    <span className="font-mono text-xs text-white">冷启动实录</span>
                  </div>
                  <div className="absolute bottom-3 right-3 bg-steel-950/80 backdrop-blur px-2 py-1 border border-steel-600">
                    <span className="font-mono text-xs text-white">{report.coldStartVideo.duration}</span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-display text-lg font-bold text-white mb-2">冷启动检测视频</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <VideoCheckItem label="启动时间" value="3.2秒" status="pass" />
                    <VideoCheckItem label="排烟情况" value="微量蓝烟" status="warn" />
                    <VideoCheckItem label="异响检查" value="无异常" status="pass" />
                    <VideoCheckItem label="液压压力" value="正常" status="pass" />
                    <VideoCheckItem label="怠速稳定性" value="平稳" status="pass" />
                    <VideoCheckItem label="水温上升" value="正常" status="pass" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'nameplate' && (
            <div className="animate-slide-in space-y-4">
              <div className="industrial-panel overflow-hidden">
                <img src={report.nameplate.url} alt="设备铭牌" className="w-full h-48 object-cover" />
              </div>
              <div className="nameplate">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-safety-400" />
                  <span className="section-title !text-base">铭牌信息</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(report.nameplate.info).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between bg-steel-950 border border-steel-600 px-3 py-2">
                      <span className="data-label">{key}</span>
                      <span className="data-value">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="nameplate">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-4 w-4 text-safety-400" />
                  <span className="section-title !text-base">手续文件</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {report.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 bg-steel-950 border border-steel-600 px-3 py-2.5">
                      <div className={cn(
                        'flex h-9 w-9 items-center justify-center border',
                        doc.status === 'verified'
                          ? 'bg-green-500/10 border-green-500/50 text-green-400'
                          : 'bg-safety-400/10 border-safety-400/50 text-safety-400',
                      )}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="data-value !text-sm">{doc.type}</div>
                        <div className={cn(
                          'font-mono text-[10px] flex items-center gap-1',
                          doc.status === 'verified' ? 'text-green-400' : 'text-safety-400',
                        )}>
                          {doc.status === 'verified' ? <CircleCheck className="h-3 w-3" /> : <CircleAlert className="h-3 w-3" />}
                          {doc.status === 'verified' ? '已验证' : '待验证'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && equipmentId && (
            <div className="animate-slide-in space-y-4">
              <MaintenanceSection
                equipmentId={equipmentId}
                records={report.maintenanceRecords}
                editMode={editMode}
                onAdd={(r) => addMaintenanceRecord(equipmentId, r)}
                onUpdate={(i, r) => updateMaintenanceRecord(equipmentId, i, r)}
                onRemove={(i) => removeMaintenanceRecord(equipmentId, i)}
              />
              <PartsSection
                equipmentId={equipmentId}
                parts={report.replacedParts}
                editMode={editMode}
                onAdd={(p) => addReplacedPart(equipmentId, p)}
                onUpdate={(i, p) => updateReplacedPart(equipmentId, i, p)}
                onRemove={(i) => removeReplacedPart(equipmentId, i)}
              />
            </div>
          )}

          {activeTab === 'accident' && equipmentId && (
            <div className="animate-slide-in">
              <AccidentSection
                equipmentId={equipmentId}
                records={report.accidentHistory}
                editMode={editMode}
                onAdd={(r) => addAccidentHistory(equipmentId, r)}
                onUpdate={(i, r) => updateAccidentHistory(equipmentId, i, r)}
                onRemove={(i) => removeAccidentHistory(equipmentId, i)}
              />
            </div>
          )}
        </div>

        <aside className="w-80 shrink-0 border-l border-steel-700 bg-steel-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-safety-400" />
              <span className="section-title !text-base">车况评分</span>
            </div>

            <div className="nameplate flex flex-col items-center mb-4">
              <span className="data-label mb-2">综合评级</span>
              <ScoreBadge score={report.overallScore} size="lg" />
              <span className="font-mono text-xs text-steel-400 mt-2">
                {report.overallScore === 'A' && '优秀 · 推荐采购'}
                {report.overallScore === 'B' && '良好 · 可议价'}
                {report.overallScore === 'C' && '一般 · 需检修'}
                {report.overallScore === 'D' && '较差 · 谨慎购买'}
              </span>
            </div>

            <div className="nameplate">
              <span className="data-label block mb-2">四维度评分</span>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#3A4047" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8B95A1', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
                  <Radar
                    dataKey="score"
                    stroke="#F5A623"
                    fill="#F5A623"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {radarData.map((d) => (
                  <div key={d.dimension} className="flex items-center justify-between bg-steel-950 border border-steel-600 px-2 py-1">
                    <span className="data-label !text-[10px]">{d.dimension}</span>
                    <span className={cn(
                      'font-mono text-xs font-bold',
                      d.score >= 80 ? 'text-green-400' : d.score >= 60 ? 'text-safety-400' : 'text-engine-400',
                    )}>
                      {d.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {booking && (
              <div className="mt-4 p-3 bg-green-500/10 border border-green-500/50">
                <div className="flex items-center gap-1.5 mb-2">
                  <CalendarCheck className="h-3.5 w-3.5 text-green-400" />
                  <span className="font-mono text-xs text-green-400 font-bold">已预约线下验机</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-steel-200">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3 text-steel-400" />
                    {booking.date} {booking.time}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3 w-3 text-steel-400" />
                    {booking.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="h-3 w-3 text-steel-400" />
                    {booking.contactName} · {booking.contactPhone}
                  </div>
                </div>
                <button
                  onClick={() => equipmentId && removeBooking(equipmentId)}
                  className="mt-2 w-full btn-ghost !py-1 !text-[10px]"
                >
                  取消预约
                </button>
              </div>
            )}

            <div className="mt-4 space-y-2">
              {equipment.status === 'locked' ? (
                <Link to="/deal" className="btn-industrial w-full flex justify-center">
                  <Lock className="h-4 w-4" />
                  已锁机 · 查看交易
                </Link>
              ) : equipment.status === 'sold' ? (
                <button disabled className="btn-industrial w-full opacity-50 cursor-not-allowed !bg-steel-700 !border-steel-600">
                  已成交
                </button>
              ) : (
                <button onClick={goToBargain} className="btn-industrial w-full">
                  <VideoIcon className="h-4 w-4" />
                  发起视频看车
                </button>
              )}
              {!booking ? (
                <button onClick={() => setShowBookingForm(true)} className="btn-ghost w-full">
                  <CalendarCheck className="h-4 w-4" />
                  预约线下验机
                </button>
              ) : (
                <button onClick={() => setShowBookingForm(true)} className="btn-ghost w-full">
                  <CalendarCheck className="h-4 w-4" />
                  修改验机预约
                </button>
              )}
            </div>
          </div>
        </aside>
      </div>

      {showBookingForm && equipmentId && (
        <BookingForm
          initial={booking || undefined}
          equipmentCity={equipment.city}
          onClose={() => setShowBookingForm(false)}
          onSubmit={(b) => {
            addBooking(equipmentId, b);
            setShowBookingForm(false);
          }}
        />
      )}
    </div>
  );
}

function QuickSpec({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-steel-400" />
      <span className="data-label">{label}</span>
      <span className="data-value !text-sm">{value}</span>
    </div>
  );
}

function VideoCheckItem({ label, value, status }: { label: string; value: string; status: 'pass' | 'warn' }) {
  return (
    <div className="flex items-center gap-2 bg-steel-950 border border-steel-600 px-3 py-2">
      {status === 'pass' ? (
        <CircleCheck className="h-4 w-4 text-green-400 shrink-0" />
      ) : (
        <CircleAlert className="h-4 w-4 text-safety-400 shrink-0" />
      )}
      <div>
        <div className="data-label">{label}</div>
        <div className={cn('font-mono text-xs font-bold', status === 'pass' ? 'text-green-400' : 'text-safety-400')}>
          {value}
        </div>
      </div>
    </div>
  );
}

function MaintenanceSection({
  records,
  editMode,
  onAdd,
  onUpdate,
  onRemove,
}: {
  equipmentId: string;
  records: MaintenanceRecord[];
  editMode: boolean;
  onAdd: (r: MaintenanceRecord) => void;
  onUpdate: (index: number, r: MaintenanceRecord) => void;
  onRemove: (index: number) => void;
}) {
  const [newItem, setNewItem] = useState('');
  const [newDate, setNewDate] = useState('2024-09-01');
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (!newItem.trim()) return;
    onAdd({ item: newItem.trim(), date: newDate, note: newNote.trim() || '常规保养' });
    setNewItem('');
    setNewNote('');
  };

  return (
    <div className="nameplate">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-safety-400" />
          <span className="section-title !text-base">定期保养记录</span>
        </div>
        <span className="font-mono text-xs text-steel-400">{records.length} 条</span>
      </div>
      <div className="relative pl-6">
        <div className="absolute left-2 top-2 bottom-2 w-px bg-steel-600" />
        {records.map((rec, i) => (
          <EditableRow
            key={i}
            editMode={editMode}
            onRemove={() => onRemove(i)}
            onSave={(data) => onUpdate(i, { item: data.field1, date: data.field2, note: data.field3 })}
            initial={{ field1: rec.item, field2: rec.date, field3: rec.note }}
            labels={{ f1: '保养项目', f2: '日期', f3: '备注' }}
            renderView={(data) => (
              <>
                <div className="absolute -left-4 top-1 h-3 w-3 bg-safety-400 border-2 border-steel-800" />
                <div className="bg-steel-950 border border-steel-600 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="data-value !text-sm">{data.field1}</span>
                    <span className="font-mono text-xs text-safety-400">{data.field2}</span>
                  </div>
                  <p className="font-sans text-xs text-steel-300">{data.field3}</p>
                </div>
              </>
            )}
          />
        ))}
      </div>
      {editMode && (
        <div className="mt-3 p-3 bg-steel-950 border border-dashed border-steel-500 space-y-2">
          <div className="data-label">新增保养记录</div>
          <div className="grid grid-cols-2 gap-2">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              placeholder="保养项目（如：机油机滤更换）"
              className="form-input-small"
            />
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="form-input-small"
            />
          </div>
          <input
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="备注说明"
            className="form-input-small"
          />
          <button onClick={handleAdd} className="btn-industrial w-full !py-1.5 !text-xs">
            <Plus className="h-3.5 w-3.5" />
            添加记录
          </button>
        </div>
      )}
      <style>{`
        .form-input-small {
          width: 100%;
          background: #15181B;
          border: 1px solid #3A4047;
          padding: 0.375rem 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: white;
        }
        .form-input-small:focus { outline: none; border-color: #F5A623; }
      `}</style>
    </div>
  );
}

function PartsSection({
  parts,
  editMode,
  onAdd,
  onUpdate,
  onRemove,
}: {
  equipmentId: string;
  parts: ReplacedPart[];
  editMode: boolean;
  onAdd: (p: ReplacedPart) => void;
  onUpdate: (index: number, p: ReplacedPart) => void;
  onRemove: (index: number) => void;
}) {
  const [f1, setF1] = useState('');
  const [f2, setF2] = useState('原厂');
  const [f3, setF3] = useState('2024-06-01');
  const [f4, setF4] = useState('3000');

  const handleAdd = () => {
    if (!f1.trim()) return;
    onAdd({ part: f1.trim(), brand: f2.trim() || '原厂', date: f3, hours: Number(f4) || 0 });
    setF1(''); setF2('原厂'); setF3('2024-06-01'); setF4('3000');
  };

  return (
    <div className="nameplate">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-safety-400" />
          <span className="section-title !text-base">主要换件清单</span>
        </div>
        <span className="font-mono text-xs text-steel-400">{parts.length} 项</span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="border-b border-steel-600">
            <th className="text-left py-2 px-2 data-label">部件</th>
            <th className="text-left py-2 px-2 data-label">品牌</th>
            <th className="text-left py-2 px-2 data-label">更换日期</th>
            <th className="text-right py-2 px-2 data-label">当时工时</th>
            {editMode && <th className="text-right py-2 px-2 data-label w-16">操作</th>}
          </tr>
        </thead>
        <tbody>
          {parts.map((part, i) => (
            <EditableRow
              key={i}
              editMode={editMode}
              onRemove={() => onRemove(i)}
              onSave={(d) => onUpdate(i, { part: d.field1, brand: d.field2, date: d.field3, hours: Number(d.field4) || 0 })}
              initial={{ field1: part.part, field2: part.brand, field3: part.date, field4: String(part.hours) }}
              labels={{ f1: '部件', f2: '品牌', f3: '日期', f4: '工时' }}
              asRow
              renderView={(d) => (
                <>
                  <td className="py-2 px-2 data-value !text-sm">{d.field1}</td>
                  <td className="py-2 px-2 font-mono text-xs text-steel-200">{d.field2}</td>
                  <td className="py-2 px-2 font-mono text-xs text-steel-300">{d.field3}</td>
                  <td className="py-2 px-2 text-right font-mono text-xs text-safety-400">{Number(d.field4).toLocaleString()}h</td>
                </>
              )}
            />
          ))}
        </tbody>
      </table>
      {editMode && (
        <div className="mt-3 p-3 bg-steel-950 border border-dashed border-steel-500 space-y-2">
          <div className="data-label">新增换件</div>
          <div className="grid grid-cols-4 gap-2">
            <input value={f1} onChange={(e) => setF1(e.target.value)} placeholder="部件名" className="form-input-small" />
            <input value={f2} onChange={(e) => setF2(e.target.value)} placeholder="品牌" className="form-input-small" />
            <input type="date" value={f3} onChange={(e) => setF3(e.target.value)} className="form-input-small" />
            <input value={f4} onChange={(e) => setF4(e.target.value)} placeholder="当时工时" className="form-input-small" />
          </div>
          <button onClick={handleAdd} className="btn-industrial w-full !py-1.5 !text-xs">
            <Plus className="h-3.5 w-3.5" /> 添加
          </button>
        </div>
      )}
      <style>{`
        .form-input-small {
          width: 100%;
          background: #15181B;
          border: 1px solid #3A4047;
          padding: 0.375rem 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: white;
        }
        .form-input-small:focus { outline: none; border-color: #F5A623; }
      `}</style>
    </div>
  );
}

function AccidentSection({
  records,
  editMode,
  onAdd,
  onUpdate,
  onRemove,
}: {
  equipmentId: string;
  records: AccidentRecord[];
  editMode: boolean;
  onAdd: (r: AccidentRecord) => void;
  onUpdate: (index: number, r: AccidentRecord) => void;
  onRemove: (index: number) => void;
}) {
  const [date, setDate] = useState('2023-10-15');
  const [desc, setDesc] = useState('');
  const [repaired, setRepaired] = useState(true);

  const handleAdd = () => {
    if (!desc.trim()) return;
    onAdd({ date, description: desc.trim(), repaired });
    setDesc('');
  };

  return (
    <div className="nameplate">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn('h-4 w-4', records.length > 0 ? 'text-engine-400' : 'text-green-400')} />
          <span className="section-title !text-base">事故维修史</span>
        </div>
        <span className="font-mono text-xs text-steel-400">{records.length} 条</span>
      </div>
      {records.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8">
          <CircleCheck className="h-12 w-12 text-green-400 mb-3" />
          <p className="font-display text-lg text-green-400">无事故记录</p>
          <p className="font-mono text-xs text-steel-400 mt-1">该车无事故维修史，结构件完好</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((acc, i) => (
            <EditableRow
              key={i}
              editMode={editMode}
              onRemove={() => onRemove(i)}
              onSave={(d) => onUpdate(i, { date: d.field1, description: d.field2, repaired: d.field3 === 'true' })}
              initial={{ field1: acc.date, field2: acc.description, field3: String(acc.repaired) }}
              labels={{ f1: '日期', f2: '描述', f3: '已修复(true/false)' }}
              renderView={(d) => (
                <div className="bg-engine-500/10 border border-engine-500/50 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="h-4 w-4 text-engine-400" />
                    <span className="font-mono text-xs text-engine-400">{d.field1}</span>
                    {(d.field3 === 'true') && (
                      <span className="status-badge bg-green-500/20 text-green-400 border-green-500 ml-auto">
                        <CircleCheck className="h-3 w-3" />
                        已修复
                      </span>
                    )}
                  </div>
                  <p className="font-sans text-sm text-steel-200">{d.field2}</p>
                </div>
              )}
            />
          ))}
        </div>
      )}
      {editMode && (
        <div className="mt-3 p-3 bg-steel-950 border border-dashed border-steel-500 space-y-2">
          <div className="data-label">新增事故记录</div>
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input-small" />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={repaired}
                onChange={(e) => setRepaired(e.target.checked)}
                className="accent-safety-400"
              />
              <label className="font-mono text-xs text-steel-300">已修复</label>
            </div>
          </div>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="事故描述及处理情况"
            rows={2}
            className="form-input-small resize-none"
          />
          <button onClick={handleAdd} className="btn-industrial w-full !py-1.5 !text-xs">
            <Plus className="h-3.5 w-3.5" /> 添加记录
          </button>
        </div>
      )}
      <div className="mt-4 p-3 bg-steel-950 border border-steel-600">
        <p className="font-mono text-xs text-steel-300">
          <span className="text-safety-400">[ 披露声明 ]</span> 卖家已承诺上述事故维修史记录真实完整，如有隐瞒，买家有权要求退款并索赔。
        </p>
      </div>
      <style>{`
        .form-input-small {
          width: 100%;
          background: #15181B;
          border: 1px solid #3A4047;
          padding: 0.375rem 0.5rem;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          color: white;
        }
        .form-input-small:focus { outline: none; border-color: #F5A623; }
      `}</style>
    </div>
  );
}

type EditableData = { field1: string; field2: string; field3: string; field4?: string };

function EditableRow({
  editMode,
  initial,
  labels,
  renderView,
  onSave,
  onRemove,
  asRow,
}: {
  editMode: boolean;
  initial: EditableData;
  labels: { f1: string; f2: string; f3: string; f4?: string };
  renderView: (data: EditableData) => React.ReactNode;
  onSave: (data: EditableData) => void;
  onRemove: () => void;
  asRow?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<EditableData>(initial);

  if (editMode && editing) {
    const content = (
      <div className={cn('p-3 bg-safety-400/5 border border-safety-400/50 space-y-2', asRow && 'col-span-full')}>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="data-label !text-[10px] block mb-1">{labels.f1}</label>
            <input
              value={data.field1}
              onChange={(e) => setData({ ...data, field1: e.target.value })}
              className="form-input-small"
            />
          </div>
          <div>
            <label className="data-label !text-[10px] block mb-1">{labels.f2}</label>
            <input
              value={data.field2}
              onChange={(e) => setData({ ...data, field2: e.target.value })}
              className="form-input-small"
            />
          </div>
          <div>
            <label className="data-label !text-[10px] block mb-1">{labels.f3}</label>
            <input
              value={data.field3}
              onChange={(e) => setData({ ...data, field3: e.target.value })}
              className="form-input-small"
            />
          </div>
          {labels.f4 && data.field4 !== undefined && (
            <div>
              <label className="data-label !text-[10px] block mb-1">{labels.f4}</label>
              <input
                value={data.field4}
                onChange={(e) => setData({ ...data, field4: e.target.value })}
                className="form-input-small"
              />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => { setData(initial); setEditing(false); }}
            className="btn-ghost !py-1 !text-[10px]"
          >
            取消
          </button>
          <button
            onClick={() => { onSave(data); setEditing(false); }}
            className="btn-industrial !py-1 !text-[10px]"
          >
            <Save className="h-3 w-3" /> 保存
          </button>
        </div>
      </div>
    );
    if (asRow) {
      return <tr><td colSpan={99}>{content}</td></tr>;
    }
    return <div className="relative mb-3">{content}</div>;
  }

  const actionButtons = editMode && (
    <div className="absolute right-1 top-1 flex items-center gap-1 z-10">
      <button
        onClick={() => setEditing(true)}
        className="flex items-center justify-center h-6 w-6 bg-steel-800 border border-steel-600 text-steel-300 hover:text-safety-400 hover:border-safety-400"
        title="编辑"
      >
        <Edit3 className="h-3 w-3" />
      </button>
      <button
        onClick={onRemove}
        className="flex items-center justify-center h-6 w-6 bg-steel-800 border border-steel-600 text-steel-300 hover:text-red-400 hover:border-red-400"
        title="删除"
      >
        <Trash2 className="h-3 w-3" />
      </button>
    </div>
  );

  if (asRow) {
    return (
      <tr className="relative border-b border-steel-700 hover:bg-steel-800/50">
        {renderView(data)}
        {editMode && (
          <td className="py-2 px-2 text-right">
            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setEditing(true)}
                className="flex items-center justify-center h-6 w-6 bg-steel-900 border border-steel-600 text-steel-300 hover:text-safety-400 hover:border-safety-400"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              <button
                onClick={onRemove}
                className="flex items-center justify-center h-6 w-6 bg-steel-900 border border-steel-600 text-steel-300 hover:text-red-400 hover:border-red-400"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </td>
        )}
      </tr>
    );
  }

  return (
    <div className="relative mb-3 group">
      {actionButtons}
      {renderView(data)}
    </div>
  );
}

function BookingForm({
  initial,
  equipmentCity,
  onClose,
  onSubmit,
}: {
  initial?: InspectionBooking;
  equipmentCity: string;
  onClose: () => void;
  onSubmit: (b: Omit<InspectionBooking, 'id' | 'equipmentId' | 'createdAt' | 'status'>) => void;
}) {
  const [date, setDate] = useState(initial?.date || '2024-10-20');
  const [time, setTime] = useState(initial?.time || '10:00');
  const [location, setLocation] = useState(initial?.location || `${equipmentCity}市工程机械交易市场`);
  const [contactName, setContactName] = useState(initial?.contactName || '');
  const [contactPhone, setContactPhone] = useState(initial?.contactPhone || '');

  const handleSubmit = () => {
    if (!contactName.trim() || !contactPhone.trim()) return;
    onSubmit({ date, time, location, contactName: contactName.trim(), contactPhone: contactPhone.trim() });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-steel-950/80 backdrop-blur p-4">
      <div className="bg-steel-800 border border-steel-600 shadow-key w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-3 border-b border-steel-600 bg-steel-900">
          <div className="flex items-center gap-2">
            <div className="bg-hazard-stripes h-1 w-8" />
            <h2 className="section-title">预约线下验机</h2>
          </div>
          <button onClick={onClose} className="text-steel-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="验机日期">
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="form-input" />
            </FormField>
            <FormField label="验机时间">
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="form-input" />
            </FormField>
          </div>
          <FormField label="验机地点">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-steel-400" />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="form-input pl-9"
                placeholder="详细地址"
              />
            </div>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="联系人">
              <div className="relative">
                <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-steel-400" />
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="您的姓名"
                  className="form-input pl-9"
                />
              </div>
            </FormField>
            <FormField label="联系电话">
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-steel-400" />
                <input
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="手机号"
                  className="form-input pl-9"
                />
              </div>
            </FormField>
          </div>
          <div className="p-3 bg-safety-400/10 border border-safety-400/30">
            <p className="font-mono text-[11px] text-safety-300">
              <span className="text-safety-400 font-bold">[ 注意 ]</span>{' '}
              请按时到达指定地点，验机师将携带专业工具到场。取消请提前24小时。
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-steel-600 bg-steel-900">
          <button onClick={onClose} className="btn-ghost">取消</button>
          <button onClick={handleSubmit} className="btn-industrial">
            <CalendarCheck className="h-4 w-4" />
            确认预约
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
          .form-input:focus { outline: none; border-color: #F5A623; }
        `}</style>
      </div>
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="data-label block mb-1">{label}</label>
      {children}
    </div>
  );
}
