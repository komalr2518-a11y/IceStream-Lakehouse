import React, { useState } from 'react';
import { AssertionRule } from '../../types';

interface DataQualityScreenProps {
  rules: AssertionRule[];
  onCreateSuite?: () => void;
  onImportYaml?: () => void;
  onSimulate?: () => void;
}

export const DataQualityScreen: React.FC<DataQualityScreenProps> = ({
  rules,
  onCreateSuite,
  onImportYaml,
}) => {
  const [selectedRuleId, setSelectedRuleId] = useState<string>('rule-tax-null');
  const [isAutoPilotActive, setIsAutoPilotActive] = useState(true);
  const [yamlCopied, setYamlCopied] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationBanner, setSimulationBanner] = useState<string | null>(null);

  const selectedRule = rules.find((r) => r.id === selectedRuleId) || rules[0];

  const handleCopyYaml = () => {
    const yaml = `expectation_type: expect_column_values_to_not_be_null
kwargs:
  column: tax_amount
  mostly: 0.9995
meta:
  engine: flink_sliding_window
  window_seconds: 60
  action: quarantine_and_halt`;
    navigator.clipboard.writeText(yaml);
    setYamlCopied(true);
    setTimeout(() => setYamlCopied(false), 2000);
  };

  const handleRunSimulation = () => {
    setSimulating(true);
    setSimulationBanner(
      'Simulating 50,000 synthetic micro-batch records against 48 Great Expectations assertions...'
    );
    setTimeout(() => {
      setSimulating(false);
      setSimulationBanner(
        'Simulation Complete: 47 rules passed, 1 intentional tax_amount null breach verified with 85ms auto-trip response.'
      );
      setTimeout(() => setSimulationBanner(null), 5000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* Top Command Deck */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-slate-200/90 p-4 md:p-5 rounded-2xl shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Pipeline Selector Chip */}
            <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-sky-500 transition-colors">
              <span className="material-symbols-outlined text-[17px] text-sky-600">alt_route</span>
              <span className="text-xs uppercase font-bold text-slate-400">Pipeline:</span>
              <span className="text-sm font-semibold text-slate-900 font-mono">
                checkout.telemetry.v2
              </span>
              <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

            {/* Environment Indicator */}
            <div className="flex items-center gap-2 px-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-500">Environment:</span>
              <span className="text-sm font-bold text-slate-900">
                Production S3 Lakehouse
              </span>
            </div>

            <div className="h-4 w-px bg-slate-200 hidden lg:block"></div>

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-600">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                GE v0.18.9
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 font-semibold border border-sky-200">
                Flink SQL Engine
              </span>
            </div>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={onImportYaml}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all active:scale-95 border border-slate-200"
            >
              <span className="material-symbols-outlined text-[16px] text-sky-600">upload_file</span>
              Import GE YAML
            </button>

            <button
              type="button"
              disabled={simulating}
              onClick={handleRunSimulation}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all active:scale-95 border border-slate-200"
            >
              <span className={`material-symbols-outlined text-[16px] text-emerald-600 ${simulating ? 'animate-spin' : ''}`}>
                science
              </span>
              {simulating ? 'Simulating...' : 'Simulate Assertions'}
            </button>

            <button
              type="button"
              onClick={onCreateSuite}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[17px]">add_circle</span>
              Create Expectation Suite
            </button>
          </div>
        </div>

        {simulationBanner && (
          <div className="px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 font-medium flex items-center justify-between animate-in fade-in duration-150">
            <span>{simulationBanner}</span>
            <button type="button" onClick={() => setSimulationBanner(null)} className="text-slate-400 hover:text-slate-700">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* Telemetry Metric Overview Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs uppercase font-semibold tracking-wider">Active Assertions</span>
              <span className="material-symbols-outlined text-[20px] text-sky-600">rule</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900">48</span>
              <span className="text-xs text-slate-400">rules active</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">36 Flink sliding, 12 GE batch</p>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs uppercase font-semibold tracking-wider">Pass Rate</span>
              <span className="material-symbols-outlined text-[20px] text-rose-600">gpp_maybe</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-rose-700">97.9%</span>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                1 Failed
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">47 passed, 0 warnings</p>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs uppercase font-semibold tracking-wider">Detection Latency</span>
              <span className="material-symbols-outlined text-[20px] text-emerald-600">speed</span>
            </div>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-2xl font-bold text-emerald-700">142</span>
              <span className="text-xs text-emerald-700 font-semibold">ms</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">-18ms vs 24h trailing p95</p>
          </div>

          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs uppercase font-semibold tracking-wider">Quarantined Today</span>
              <span className="material-symbols-outlined text-[20px] text-rose-600">filter_alt_off</span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-2xl font-bold text-slate-900">18,492</span>
              <span className="text-xs text-slate-400">rows</span>
            </div>
            <p className="text-xs text-rose-600 mt-2 font-medium">Halted downstream ingest at 14:32</p>
          </div>
        </div>
      </section>

      {/* Primary Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT PANE: Active Rule Suites (8 of 12 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Table Control Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-5 bg-slate-50 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Active Rule Suites &amp; Real-Time Assertion Stream
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Sliding window validation against streaming checkpoints
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                  1 FAILED
                </span>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                  47 PASSED
                </span>
              </div>
            </div>

            {/* Roomy Data Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">Expectation Name</th>
                    <th className="py-3 px-3 font-semibold">Field</th>
                    <th className="py-3 px-3 font-semibold">Engine</th>
                    <th className="py-3 px-3 font-semibold">Threshold</th>
                    <th className="py-3 px-3 font-semibold">Live Value</th>
                    <th className="py-3 px-3 font-semibold">Status</th>
                    <th className="py-3 px-4 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {rules.map((rule) => {
                    const isSelected = rule.id === selectedRuleId;
                    const isFailed = rule.status.includes('FAIL');
                    return (
                      <tr
                        key={rule.id}
                        onClick={() => setSelectedRuleId(rule.id)}
                        className={`transition-colors cursor-pointer ${
                          isFailed
                            ? 'bg-rose-50/60 hover:bg-rose-50'
                            : isSelected
                            ? 'bg-sky-50/50'
                            : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900 flex items-center gap-2">
                            <span
                              className={`material-symbols-outlined text-[17px] ${
                                isFailed ? 'text-rose-600' : 'text-emerald-600'
                              }`}
                            >
                              {isFailed ? 'dangerous' : 'check_circle'}
                            </span>
                            <span className="font-mono text-xs font-semibold">{rule.name}</span>
                          </div>
                          <div className="text-[11px] text-slate-400 ml-6 mt-0.5">{rule.suite}</div>
                        </td>
                        <td className="py-3.5 px-3">
                          <span className="font-mono text-xs text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 font-semibold">
                            {rule.fieldTarget}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600">{rule.engine}</td>
                        <td className="py-3.5 px-3 text-slate-600">{rule.threshold}</td>
                        <td className="py-3.5 px-3 font-bold font-mono">
                          <span className={isFailed ? 'text-rose-600 font-bold' : 'text-emerald-700'}>
                            {rule.liveValue}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          {isFailed ? (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 font-bold text-[10px] border border-rose-200">
                              FAIL
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                              PASS
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                          {rule.action}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between px-5 py-3 bg-slate-50 text-xs text-slate-500 border-t border-slate-200">
              <span className="flex items-center gap-2 text-emerald-700 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Streaming Assertions Active
              </span>
              <span>Sync rate: 100ms</span>
            </div>
          </div>

          {/* Quarantine Record Sample Tray */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">dataset_linked</span>
                Quarantine Buffer Live Malformed Events
              </h3>
              <span className="text-xs text-slate-400">Showing latest 2 events</span>
            </div>
            <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 space-y-3">
              <div>
                <div className="text-rose-400 text-[11px] mb-1 font-semibold">
                  // Event #98240182 - Ingested 14:32:04 UTC - Reason: [FAIL: tax_amount IS NULL]
                </div>
                <div className="text-slate-400 whitespace-pre-wrap leading-relaxed">
                  {`{ "event_id": "evt_998124_fa", "session_id": "sess_88192a01", `}
                  <span className="bg-rose-500/30 text-rose-400 px-1 rounded font-bold">"tax_amount": null</span>
                  {`, "order_total": 84.50, "gateway": "stripe_v2" }`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANE: Assertion Inspector & Policies (4 of 12 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Drift Inspector Card */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[18px]">analytics</span>
                Assertion Inspector
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                Critical Drift
              </span>
            </div>

            <div>
              <span className="text-xs text-slate-400 uppercase font-semibold block mb-1">Target Assertion</span>
              <div className="font-mono text-xs text-sky-700 font-bold">
                {selectedRule.name}
              </div>
            </div>

            {/* Spike Chart */}
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span className="font-medium">tax_amount NULL Rate (60m)</span>
                <span className="text-rose-600 font-bold">Current: 50.42%</span>
              </div>
              <div className="relative w-full h-36">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 120">
                  <defs>
                    <linearGradient id="spikeGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25"></stop>
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0"></stop>
                    </linearGradient>
                  </defs>
                  <line stroke="#cbd5e1" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="320" y1="102" y2="102"></line>
                  <path
                    d="M 0,105 L 40,105 L 80,104 L 120,105 L 160,104 L 200,105 L 225,105 L 235,16 L 260,18 L 290,15 L 320,17 L 320,115 L 0,115 Z"
                    fill="url(#spikeGrad)"
                  ></path>
                  <path
                    d="M 0,105 L 40,105 L 80,104 L 120,105 L 160,104 L 200,105 L 225,105 L 235,16 L 260,18 L 290,15 L 320,17"
                    fill="none"
                    stroke="#e11d48"
                    strokeWidth="2.5"
                  ></path>
                  <circle cx="235" cy="16" fill="#e11d48" r="4.5"></circle>
                </svg>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                <span>14:00</span>
                <span>14:15</span>
                <span className="text-rose-600 font-bold">14:32 (Spike)</span>
                <span>15:00</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 block mb-1">Root Cause Correlation:</strong>
              Upstream checkout service deployed <code>v2.18.4</code> omitting tax calculations on iOS ApplePay.
            </div>
          </div>

          {/* Autonomous Remediation Policy */}
          <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">smart_toy</span>
                Remediation Policy
              </h3>
              <span className="material-symbols-outlined text-slate-400 text-[18px]">tune</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
                <span className="text-slate-400 uppercase text-[10px] font-bold">Trigger Rule</span>
                <div className="text-slate-900 font-semibold">Failure &gt; 5 consecutive windows</div>
                <div className="text-emerald-700 text-[11px] font-medium">Condition Met (12 windows active)</div>
              </div>

              {/* Operator Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="text-xs font-semibold text-slate-900">Operator Override Mode</div>
                  <div className="text-[11px] text-emerald-700 font-medium">
                    {isAutoPilotActive ? 'Auto-Pilot Engaged' : 'Manual Mode'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAutoPilotActive(!isAutoPilotActive)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full transition-colors ${
                    isAutoPilotActive ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition duration-200 mt-0.5 ml-0.5 shadow-sm ${
                      isAutoPilotActive ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Quick YAML Extract */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-semibold">GE YAML Specification</span>
                <button
                  type="button"
                  onClick={handleCopyYaml}
                  className="text-sky-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <span className="material-symbols-outlined text-[14px]">content_copy</span>
                  {yamlCopied ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-slate-900 rounded-xl p-3.5 font-mono text-[11px] text-slate-200 leading-relaxed shadow-inner">
{`expectation_type: expect_column_values_to_not_be_null
kwargs:
  column: tax_amount
  mostly: 0.9995
meta:
  engine: flink_sliding_window`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
