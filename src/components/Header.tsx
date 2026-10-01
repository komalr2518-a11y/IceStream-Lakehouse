import React, { useState } from 'react';
import { ObservabilityPlane, UserProfile } from '../types';

interface HeaderProps {
  currentPlane: ObservabilityPlane;
  onSelectPlane: (plane: ObservabilityPlane) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenIncident: () => void;
  onToggleMobileSidebar?: () => void;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSwitchUser?: (user: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPlane,
  onSelectPlane,
  searchQuery,
  onSearchChange,
  onOpenIncident,
  onToggleMobileSidebar,
  currentUser,
  onOpenLogin,
  onLogout,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="h-16 w-full px-5 md:px-8 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Logo Brand */}
        <div className="flex items-center gap-4 min-w-max">
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 rounded-lg bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
            title="Toggle Navigation"
          >
            <span className="material-symbols-outlined text-[20px]">menu</span>
          </button>

          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onSelectPlane('pipeline-lineage-and-topology')}
          >
            {!logoError ? (
              <img
                alt="IceStream Logo"
                className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida/AEtjO1XZmZbTOHAF2IMjmEDbQ7AI5KCssLg9I3g8hS9RWgl_oRoB2yaGIl41Lc8OD-kSN3yIi8vdjl2bw-JCUByjHj73meTWey2PLAR2-axq9xDRnbPq4dBfAFG8bitVxQUz5BKXTzgv2hXGD9ZqMDL8NFx_yI5xDHUE3iT63IcMIB4wJ9MFSMvjlAHMQHBJNi6T5Q3T5Ry6QwEEUcfZ8jUu_zdU8sRezBWZeuISlum7YKvt5g5MOCEV1A1HJQ"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-600 font-bold">
                <span className="material-symbols-outlined text-[20px]">alt_route</span>
              </div>
            )}
            <div className="flex items-center gap-2.5">
              <span className="text-[17px] font-bold text-slate-900 tracking-tight">
                IceStream
              </span>
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                PROD-US-EAST-1 · Lakehouse
              </span>
            </div>
          </div>
        </div>

        {/* Center Health Telemetry Badges (Desktop) */}
        <div className="hidden xl:flex items-center gap-4 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-500">Flink:</span>
            <span className="text-xs text-emerald-700 font-semibold">128 TMs OK</span>
          </div>
          <span className="text-slate-300 text-xs">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-sky-500"></span>
            <span className="text-xs text-slate-500">Kafka:</span>
            <span className="text-xs text-sky-700 font-semibold">84.2k eps</span>
          </div>
          <span className="text-slate-300 text-xs">/</span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs text-slate-500">Iceberg:</span>
            <span className="text-xs text-slate-800 font-semibold">REST/Nessie OK</span>
          </div>
        </div>

        {/* Global Search Bar */}
        <div className="flex-1 max-w-md mx-3 hidden lg:block">
          <div className="relative flex items-center w-full">
            <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">
              search
            </span>
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-slate-100/80 pl-9 pr-3 py-2 rounded-xl text-slate-900 text-xs placeholder:text-slate-400 border border-slate-200 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition-all"
              placeholder="Search lineage, tables, expectations, incidents..."
              type="text"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 text-slate-400 hover:text-slate-700"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Section: Alert Button & User Profile / Login */}
        <div className="flex items-center gap-3.5 min-w-max">
          {/* Circuit-Breaker Triggered Alert */}
          <button
            type="button"
            onClick={onOpenIncident}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-all cursor-pointer group shadow-sm"
            title="View Incident Triage"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-xs font-semibold tracking-wide">
              1 Circuit-Breaker Active
            </span>
          </button>

          {/* User Auth Section */}
          {currentUser?.isAuthenticated ? (
            <div className="relative">
              <div
                className="flex items-center gap-2.5 pl-1 cursor-pointer select-none py-1 hover:opacity-90 transition-opacity"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs text-slate-900 font-semibold leading-none">
                    {currentUser.name}
                  </span>
                  <span className="text-[11px] text-slate-500 mt-0.5">
                    {currentUser.role}
                  </span>
                </div>
                {!avatarError && currentUser.avatar ? (
                  <img
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-200 hover:ring-sky-500 transition-all shadow-sm"
                    src={currentUser.avatar}
                    onError={() => setAvatarError(true)}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center ring-2 ring-sky-200">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div
                  className="absolute right-0 top-12 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl p-3.5 z-50 text-left animate-in fade-in duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="pb-3 border-b border-slate-100">
                    <div className="text-sm font-bold text-slate-900">{currentUser.name}</div>
                    <div className="text-slate-500 text-xs mt-0.5 truncate">
                      {currentUser.email}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-emerald-700 text-xs font-semibold">
                        Supervisory Lock Active
                      </span>
                    </div>
                  </div>

                  <div className="py-2.5 space-y-1 text-xs text-slate-600">
                    <div className="flex justify-between py-1 px-2 rounded-lg hover:bg-slate-50">
                      <span>Role</span>
                      <span className="font-semibold text-slate-900">{currentUser.role}</span>
                    </div>
                    <div className="flex justify-between py-1 px-2 rounded-lg hover:bg-slate-50">
                      <span>Department</span>
                      <span className="text-slate-800">{currentUser.department}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenLogin();
                      }}
                      className="text-xs text-sky-600 hover:underline font-medium"
                    >
                      Switch Account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-semibold flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[15px]">logout</span>
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">login</span>
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
