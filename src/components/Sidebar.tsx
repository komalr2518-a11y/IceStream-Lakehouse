import React from 'react';
import { ObservabilityPlane } from '../types';

interface SidebarProps {
  currentPlane: ObservabilityPlane;
  onSelectPlane: (plane: ObservabilityPlane) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onOpenDocs?: () => void;
  onOpenConfig?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPlane,
  onSelectPlane,
  isOpenMobile = false,
  onCloseMobile,
  onOpenDocs,
  onOpenConfig,
}) => {
  const navItems: {
    id: ObservabilityPlane;
    title: string;
    subtitle: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'pipeline-lineage-and-topology',
      title: 'Pipeline Lineage & Topology',
      subtitle: 'Real-time DAG & Stream Flow',
      icon: 'account_tree',
    },
    {
      id: 'data-quality-and-assertions',
      title: 'Data Quality & Assertions',
      subtitle: 'Great Expectations Rules',
      icon: 'verified_user',
      badge: '1 Fail',
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
    {
      id: 'iceberg-table-and-time-travel',
      title: 'Iceberg Table & Time-Travel',
      subtitle: 'Partitions & Snapshots',
      icon: 'layers',
    },
    {
      id: 'incidents-and-autonomous-healing',
      title: 'Incidents & Autonomous Healing',
      subtitle: 'Root Cause & Auto-Mitigation',
      icon: 'bolt',
      badge: 'P1 Active',
      badgeColor: 'bg-rose-50 text-rose-700 border border-rose-200',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed left-0 top-16 bottom-0 w-72 bg-white z-40 flex flex-col justify-between border-r border-slate-200 shadow-sm transition-transform duration-200 md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col pt-5 px-3.5">
          <div className="px-2.5 pb-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
              <span className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                Observability Planes
              </span>
            </div>
            {isOpenMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                title="Close navigation"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            )}
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = currentPlane === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  title={item.title}
                  onClick={() => {
                    onSelectPlane(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-900 font-semibold border border-sky-200 shadow-sm'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                      isActive ? 'text-sky-600' : 'text-slate-400'
                    }`}
                  >
                    {item.icon}
                  </span>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="text-[13.5px] font-semibold leading-tight text-slate-900 break-words">
                        {item.title}
                      </span>
                      {item.badge && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide shrink-0 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 font-normal mt-0.5 leading-tight">
                      {item.subtitle}
                    </span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Cluster Health & SLA Indicator */}
        <div className="p-4 flex flex-col gap-3 bg-slate-50 border-t border-slate-200">
          <div className="flex items-center justify-between text-slate-600 px-1">
            <span className="text-xs font-medium">Latency SLA</span>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs text-emerald-700 font-bold">
                42ms (p99)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-xs">
            <button
              type="button"
              onClick={onOpenDocs}
              className="text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1.5 cursor-pointer py-1 font-medium"
            >
              <span className="material-symbols-outlined text-[15px]">description</span>
              Docs &amp; API
            </button>
            <button
              type="button"
              onClick={onOpenConfig}
              className="text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-1.5 cursor-pointer py-1 font-medium"
            >
              <span className="material-symbols-outlined text-[15px]">settings</span>
              Config
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
