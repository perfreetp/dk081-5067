import { NavLink, useLocation } from 'react-router-dom';
import {
  Warehouse,
  ClipboardList,
  FileSearch,
  Gavel,
  Handshake,
  HardHat,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/hall', label: '车源大厅', icon: Warehouse, code: '01' },
  { path: '/demand', label: '需求单', icon: ClipboardList, code: '02' },
  { path: '/bargain', label: '议价台', icon: Gavel, code: '03' },
  { path: '/deal', label: '成交中心', icon: Handshake, code: '04' },
];

const inspectionNavItem = { path: '/inspection', label: '验机报告', icon: FileSearch, code: '05' };

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const compareList = useStore((s) => s.compareList);
  const demandOrders = useStore((s) => s.demandOrders);
  const activeQuotes = demandOrders.filter((d) => d.status === 'quoting').length;
  const activeDeals = useStore((s) => s.dealRecords).filter(
    (d) => d.timeline.some((t) => t.status !== 'done'),
  ).length;

  const isInspectionPage = location.pathname.startsWith('/inspection');

  return (
    <div className="flex h-screen overflow-hidden bg-steel-900">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-steel-950 border-r border-steel-700">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-steel-700 bg-steel-800">
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center bg-safety-400 border-2 border-safety-600 shadow-key-sm">
              <HardHat className="h-6 w-6 text-steel-900" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <h1 className="font-display text-lg font-bold uppercase tracking-wider text-white leading-none">
              铁甲撮合
            </h1>
            <p className="font-mono text-[10px] text-safety-400 mt-1 tracking-widest">
              TIEJIA MATCH v2.4
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-2">
            <span className="data-label">导航 / NAVIGATION</span>
          </div>
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const badge =
                item.path === '/bargain' ? compareList.length :
                item.path === '/demand' ? activeQuotes :
                item.path === '/deal' ? activeDeals : 0;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 px-3 py-2.5 border-l-2 transition-all duration-150',
                        isActive
                          ? 'bg-steel-700 border-safety-400 text-white'
                          : 'border-transparent text-steel-300 hover:bg-steel-800 hover:text-white',
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                    <span className="flex-1 font-sans text-sm font-medium">{item.label}</span>
                    {badge > 0 && (
                      <span className="flex h-5 min-w-5 items-center justify-center px-1 font-mono text-xs font-bold bg-engine-500 text-white border border-engine-600">
                        {badge}
                      </span>
                    )}
                    <span className="font-mono text-[10px] text-steel-500 group-hover:text-steel-400">
                      {item.code}
                    </span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Inspection nav - contextual */}
          {isInspectionPage && (
            <div className="mt-4 px-2">
              <div className="px-2 mb-2">
                <span className="data-label">当前页 / CONTEXT</span>
              </div>
              <NavLink
                to={location.pathname}
                className="group flex items-center gap-3 px-3 py-2.5 border-l-2 bg-steel-700 border-safety-400 text-white"
              >
                <inspectionNavItem.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
                <span className="flex-1 font-sans text-sm font-medium">{inspectionNavItem.label}</span>
                <span className="font-mono text-[10px] text-steel-500">{inspectionNavItem.code}</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Panel */}
        <div className="border-t border-steel-700 p-4 bg-steel-800">
          <div className="nameplate">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-steel-600 border border-steel-400">
                <span className="font-display text-sm font-bold text-safety-400">李</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans text-sm font-bold text-white truncate">李采购</span>
                  <ShieldCheck className="h-3.5 w-3.5 text-safety-400 shrink-0" />
                </div>
                <p className="font-mono text-[10px] text-steel-300 truncate">中建路桥集团</p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-steel-600 flex items-center justify-between">
              <span className="font-mono text-[10px] text-steel-400">认证采购员</span>
              <span className="status-badge bg-green-500/20 text-green-400 border-green-500">
                <span className="h-1.5 w-1.5 bg-green-400 animate-flash" />
                在线
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 py-3 bg-steel-800 border-b border-steel-600">
          <div className="flex items-center gap-4">
            <div className="bg-hazard-stripes h-1 w-16" />
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-white">
                {location.pathname === '/hall' && '车源大厅 / EQUIPMENT MARKET'}
                {location.pathname === '/demand' && '需求单 / DEMAND ORDERS'}
                {location.pathname.startsWith('/inspection') && '验机报告 / INSPECTION REPORT'}
                {location.pathname === '/bargain' && '议价台 / BARGAINING DESK'}
                {location.pathname === '/deal' && '成交中心 / DEAL CENTER'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="font-mono text-xs text-steel-300">
              {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
            </div>
            <div className="h-4 w-px bg-steel-600" />
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 bg-green-400 animate-flash" />
              <span className="font-mono text-xs text-steel-300">系统正常</span>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-blueprint">
          {children}
        </main>
      </div>
    </div>
  );
}
