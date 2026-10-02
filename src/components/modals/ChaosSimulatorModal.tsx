import React, { useState } from 'react';

interface ChaosSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerScenario: (scenario: 'tax_timeout' | 'price_outlier' | 'kafka_lag') => void;
  onAutoHeal: () => void;
  isBreakerTripped: boolean;
}

export const ChaosSimulatorModal: React.FC<ChaosSimulatorModalProps> = ({
  isOpen,
  onClose,
  onTriggerScenario,
  onAutoHeal,
  isBreakerTripped,
}) => {
  const [activeChaos, setActiveChaos] = useState<string | null>(isBreakerTripped ? 'tax_timeout' : null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isHealing, setIsHealing] = useState(false);

  if (!isOpen) return null;

  const handleSimulate = (scenario: 'tax_timeout' | 'price_outlier' | 'kafka_lag') => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setActiveChaos(scenario);
      onTriggerScenario(scenario);
    }, 600);
  };

  const handleHeal = () => {
    setIsHealing(true);
    setTimeout(() => {
      setIsHealing(false);
      setActiveChaos(null);
      onAutoHeal();
    }, 750);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-150">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-200">
              <span className="material-symbols-outlined text-[22px]">pest_control</span>
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Streaming Chaos &amp; Anomaly Simulator
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  DEMO TOOL
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Deliberately inject upstream failures to test autonomous circuit breaker &amp; recovery.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Current Breaker State HUD */}
          <div className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
            isBreakerTripped
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[24px]">
                {isBreakerTripped ? 'electric_bolt' : 'verified'}
              </span>
              <div>
                <div className="text-xs uppercase font-bold tracking-wider">
                  Circuit Breaker Status: {isBreakerTripped ? 'TRIPPED (ISOLATION ACTIVE)' : 'ARMED / NORMAL'}
                </div>
                <div className="text-xs opacity-80">
                  {isBreakerTripped
                    ? 'Bad records diverted to S3 quarantine. Downstream Iceberg sink protected.'
                    : '100% of stream passing quality assertions within 42ms p99 SLA.'}
                </div>
              </div>
            </div>
            {isBreakerTripped && (
              <button
                type="button"
                onClick={handleHeal}
                disabled={isHealing}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isHealing ? 'sync' : 'auto_fix_high'}
                </span>
                {isHealing ? 'Healing...' : 'Auto-Heal System'}
              </button>
            )}
          </div>

          {/* Scenario Grid */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase text-slate-400 block tracking-wider">
              Select Failure Scenario to Inject:
            </span>

            {/* Scenario 1 */}
            <div className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
              activeChaos === 'tax_timeout'
                ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Scenario 1: Avalara Tax Engine 504 Timeout
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                    P1 CRITICAL
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Microservice fails with HTTP 504. Upstream Kafka emits records where <code className="text-rose-600 font-mono">tax_amount = null</code> at 50.42% breach rate.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSimulate('tax_timeout')}
                disabled={isSimulating}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 text-slate-700 font-semibold text-xs border border-slate-200 shadow-sm shrink-0 transition-all cursor-pointer"
              >
                {activeChaos === 'tax_timeout' ? 'Triggered' : 'Inject Failure'}
              </button>
            </div>

            {/* Scenario 2 */}
            <div className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
              activeChaos === 'price_outlier'
                ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Scenario 2: Negative Pricing Currency Anomaly
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                    P2 SEVERE
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Promotion discount bug generates checkout transactions with <code className="text-amber-700 font-mono">total &lt; $0.00 USD</code>.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSimulate('price_outlier')}
                disabled={isSimulating}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-amber-50 hover:text-amber-800 hover:border-amber-300 text-slate-700 font-semibold text-xs border border-slate-200 shadow-sm shrink-0 transition-all cursor-pointer"
              >
                {activeChaos === 'price_outlier' ? 'Triggered' : 'Inject Failure'}
              </button>
            </div>

            {/* Scenario 3 */}
            <div className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 ${
              activeChaos === 'kafka_lag'
                ? 'bg-sky-50/70 border-sky-400 shadow-sm'
                : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Scenario 3: Kafka Partition 03 Consumer Lag Spurt
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                    PERF BOTTLENECK
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Slow consumer lag causes queue buffer overflow, increasing p99 latency to 482ms.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleSimulate('kafka_lag')}
                disabled={isSimulating}
                className="px-3.5 py-1.5 rounded-lg bg-white hover:bg-sky-50 hover:text-sky-800 hover:border-sky-300 text-slate-700 font-semibold text-xs border border-slate-200 shadow-sm shrink-0 transition-all cursor-pointer"
              >
                {activeChaos === 'kafka_lag' ? 'Triggered' : 'Inject Failure'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <span className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[15px] text-emerald-600">security</span>
            SOC2 Safe: Sandboxed in Ephemeral Test Stream
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 shadow-sm cursor-pointer"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
