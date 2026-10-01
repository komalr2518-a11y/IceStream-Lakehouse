import React, { useState } from 'react';
import { UserProfile } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLogin: (user: UserProfile) => void;
  isMandatory?: boolean;
}

export const PRESET_USERS: UserProfile[] = [
  {
    id: 'user-sarah',
    name: 'Sarah Lin',
    email: 'sarah.lin@lakehouse.internal',
    role: 'Lead Data Reliability Eng',
    department: 'Platform Reliability',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKLN3Uba1MvBWV4M8lnFgQyggtnYgsEjjmbXn_1Fw2dAEjPZ50zEo2F8PWoEAnEDX7dZRe_axwVIUnedETqYrB_QLtRlXkyOaPjTkYrNI4NUXOJLZE9wUWdXt__iV9UJIkApkx1MqMDOAV-YBoqCt3X3-nz9Z1SMaO1k_xONoh1cGtPztsxfDywNKwcHGSaZlcP3T01IwNCVlDD47rbbyTrGESWbiN0Er9lGpsZ7lDHlK6gB0oyW0',
    isAuthenticated: true,
  },
  {
    id: 'user-komal',
    name: 'Komal R.',
    email: 'komal.r2518@gmail.com',
    role: 'Principal Platform Architect',
    department: 'Data Infrastructure',
    isAuthenticated: true,
  },
  {
    id: 'user-auditor',
    name: 'Security Auditor',
    email: 'auditor@soc2compliance.org',
    role: 'Compliance Auditor',
    department: 'External Audit',
    isAuthenticated: true,
  },
];

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  isMandatory = false,
}) => {
  const [email, setEmail] = useState('sarah.lin@lakehouse.internal');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      setIsLoading(false);
      const matched = PRESET_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      );
      if (matched) {
        onLogin(matched);
      } else {
        // Create custom user
        onLogin({
          id: `user-${Date.now()}`,
          name: email.split('@')[0].replace('.', ' '),
          email,
          role: 'Data Reliability Engineer',
          department: 'Platform Engineering',
          isAuthenticated: true,
        });
      }
    }, 700);
  };

  const handleSelectPreset = (user: UserProfile) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(user);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              alt="IceStream"
              className="h-8 w-auto object-contain"
              src="https://lh3.googleusercontent.com/aida/AEtjO1XZmZbTOHAF2IMjmEDbQ7AI5KCssLg9I3g8hS9RWgl_oRoB2yaGIl41Lc8OD-kSN3yIi8vdjl2bw-JCUByjHj73meTWey2PLAR2-axq9xDRnbPq4dBfAFG8bitVxQUz5BKXTzgv2hXGD9ZqMDL8NFx_yI5xDHUE3iT63IcMIB4wJ9MFSMvjlAHMQHBJNi6T5Q3T5Ry6QwEEUcfZ8jUu_zdU8sRezBWZeuISlum7YKvt5g5MOCEV1A1HJQ"
            />
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">IceStream Console</h2>
              <p className="text-xs text-slate-500">Autonomous Lakehouse Reliability</p>
            </div>
          </div>
          {!isMandatory && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Quick 1-Click Login options */}
          <div>
            <label className="block text-[11px] font-semibold uppercase text-slate-400 tracking-wider mb-2.5">
              Quick 1-Click Role Login
            </label>
            <div className="space-y-2">
              {PRESET_USERS.map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectPreset(user)}
                  disabled={isLoading}
                  className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-sky-500 hover:bg-sky-50/50 flex items-center justify-between text-left transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-sky-600 font-bold text-xs flex items-center justify-center border border-slate-200">
                        {user.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 group-hover:text-sky-700 truncate">
                        {user.name}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{user.role}</div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-sky-600 transition-transform group-hover:translate-x-0.5">
                    arrow_forward
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200"></div>
            <span className="text-[11px] font-medium text-slate-400 uppercase">Or sign in with email</span>
            <div className="flex-1 h-px bg-slate-200"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <a href="#reset" onClick={(e) => { e.preventDefault(); alert("Single Sign-On password reset dispatched to Okta."); }} className="text-[11px] text-sky-600 hover:underline">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 transition-all"
                required
              />
            </div>

            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-600">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-75"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                  Authenticating SSO Token...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">lock</span>
                  Sign In to Lakehouse
                </>
              )}
            </button>
          </form>

          {/* Guest preview footer */}
          {!isMandatory && onClose && (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Continue in Guest Preview Mode →
              </button>
            </div>
          )}
        </div>

        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
          <span>Protected by Enterprise TLS 1.3 &amp; Okta SAML 2.0</span>
        </div>
      </div>
    </div>
  );
};
