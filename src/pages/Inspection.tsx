import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
} from 'lucide-react';
import { inspectionReports, equipments } from '@/data/mockData';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ScoreBadge, StatusDot, formatPrice, formatFullPrice, emissionLabel, EquipmentTypeIcon } from '@/components/ui';
import { useStore } from '@/store/useStore';
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
  const [activeTab, setActiveTab] = useState<Tab>('photos');
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const { toggleCompare, compareList } = useStore();

  const equipment = equipments.find((e) => e.id === equipmentId);
  const report = inspectionReports.find((r) => r.equipmentId === equipmentId);

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

  return (
    <div className="flex h-full flex-col">
      {/* Equipment Header */}
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
          <Link to="/bargain" className="btn-industrial !py-1.5 !text-xs">
            <VideoIcon className="h-3.5 w-3.5" />
            发起看车
          </Link>
        </div>

        {/* Quick specs */}
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

      {/* Tab Navigation */}
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
      </div>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Photos Tab */}
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

          {/* Video Tab */}
          {activeTab === 'video' && (
            <div className="animate-slide-in">
              <div className="industrial-panel overflow-hidden">
                <div className="relative aspect-video bg-steel-950">
                  <img
                    src={report.coldStartVideo.thumbnail}
                    alt="冷启动视频"
                    className="h-full w-full object-cover opacity-70"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button className="flex h-16 w-16 items-center justify-center bg-safety-400/90 border-4 border-safety-600 hover:bg-safety-300 transition-all animate-pulse-glow">
                      <Play className="h-7 w-7 text-steel-900 ml-1" fill="currentColor" />
                    </button>
                  </div>
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

          {/* Nameplate Tab */}
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

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="animate-slide-in space-y-4">
              <div className="nameplate">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-safety-400" />
                  <span className="section-title !text-base">定期保养记录</span>
                </div>
                <div className="relative pl-6">
                  <div className="absolute left-2 top-2 bottom-2 w-px bg-steel-600" />
                  {report.maintenanceRecords.map((rec, i) => (
                    <div key={i} className="relative mb-3">
                      <div className="absolute -left-4 top-1 h-3 w-3 bg-safety-400 border-2 border-steel-800" />
                      <div className="bg-steel-950 border border-steel-600 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="data-value !text-sm">{rec.item}</span>
                          <span className="font-mono text-xs text-safety-400">{rec.date}</span>
                        </div>
                        <p className="font-sans text-xs text-steel-300">{rec.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="nameplate">
                <div className="flex items-center gap-2 mb-3">
                  <Wrench className="h-4 w-4 text-safety-400" />
                  <span className="section-title !text-base">主要换件清单</span>
                </div>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-steel-600">
                      <th className="text-left py-2 px-2 data-label">部件</th>
                      <th className="text-left py-2 px-2 data-label">品牌</th>
                      <th className="text-left py-2 px-2 data-label">更换日期</th>
                      <th className="text-right py-2 px-2 data-label">当时工时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.replacedParts.map((part, i) => (
                      <tr key={i} className="border-b border-steel-700 hover:bg-steel-800/50">
                        <td className="py-2 px-2 data-value !text-sm">{part.part}</td>
                        <td className="py-2 px-2 font-mono text-xs text-steel-200">{part.brand}</td>
                        <td className="py-2 px-2 font-mono text-xs text-steel-300">{part.date}</td>
                        <td className="py-2 px-2 text-right font-mono text-xs text-safety-400">{part.hours.toLocaleString()}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Accident Tab */}
          {activeTab === 'accident' && (
            <div className="animate-slide-in">
              <div className="nameplate">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className={cn('h-4 w-4', report.accidentHistory.length > 0 ? 'text-engine-400' : 'text-green-400')} />
                  <span className="section-title !text-base">事故维修史</span>
                </div>
                {report.accidentHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <CircleCheck className="h-12 w-12 text-green-400 mb-3" />
                    <p className="font-display text-lg text-green-400">无事故记录</p>
                    <p className="font-mono text-xs text-steel-400 mt-1">该车无事故维修史，结构件完好</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {report.accidentHistory.map((acc, i) => (
                      <div key={i} className="bg-engine-500/10 border border-engine-500/50 p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-engine-400" />
                          <span className="font-mono text-xs text-engine-400">{acc.date}</span>
                          {acc.repaired && (
                            <span className="status-badge bg-green-500/20 text-green-400 border-green-500 ml-auto">
                              <CircleCheck className="h-3 w-3" />
                              已修复
                            </span>
                          )}
                        </div>
                        <p className="font-sans text-sm text-steel-200">{acc.description}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-4 p-3 bg-steel-950 border border-steel-600">
                  <p className="font-mono text-xs text-steel-300">
                    <span className="text-safety-400">[ 披露声明 ]</span> 卖家已承诺上述事故维修史记录真实完整，如有隐瞒，买家有权要求退款并索赔。
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Condition Score Panel */}
        <aside className="w-80 shrink-0 border-l border-steel-700 bg-steel-800 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-4 w-4 text-safety-400" />
              <span className="section-title !text-base">车况评分</span>
            </div>

            {/* Overall Score */}
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

            {/* Radar Chart */}
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

            {/* Quick Actions */}
            <div className="mt-4 space-y-2">
              <Link to="/bargain" className="btn-industrial w-full">
                <VideoIcon className="h-4 w-4" />
                发起视频看车
              </Link>
              <button className="btn-ghost w-full">
                <CalendarCheck className="h-4 w-4" />
                预约线下验机
              </button>
            </div>
          </div>
        </aside>
      </div>
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
