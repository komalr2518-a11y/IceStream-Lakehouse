import React, { useState } from 'react';
import { QuarantinedSample } from '../../types';

interface PipelineTopologyScreenProps {
  samples: QuarantinedSample[];
  onOpenSampleModal?: () => void;
  onNavigateToIceberg?: () => void;
  onNavigateToQuality?: () => void;
  onNavigateToIncidents?: () => void;
}

export const PipelineTopologyScreen: React.FC<PipelineTopologyScreenProps> = ({
  samples,
  onNavigateToIceberg,
  onNavigateToQuality,
}) => {
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isPlayingLive, setIsPlayingLive] = useState(true);
  const [backfillState, setBackfillState] = useState<'idle' | 'running' | 'success'>('idle');
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideMfaInput, setOverrideMfaInput] = useState('');
  const [overrideError, setOverrideError] = useState<string | null>(null);

  const handleTriggerBackfill = () => {
    setBackfillState('running');
    setTimeout(() => {
      setBackfillState('success');
      setTimeout(() => {
        setBackfillState('idle');
      }, 4000);
    }, 1800);
  };

  const handleOverrideAttempt = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideMfaInput === '9921' || overrideMfaInput.length >= 4) {
      setOverrideError(
        'Safety gate refusal: Dual-approver consensus token rejected for partition with >50% NULL rate. PagerDuty incident #PD-9921 requires VP Data Platform sign-off.'
      );
    } else {
      setOverrideError('Invalid 6-digit MFA token. Enter valid token from Okta/PagerDuty Authenticator.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* Top Banner & KPI Metrics */}
      <div className="space-y-4">
        {/* Critical Autonomous Trip Banner */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-2xl px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
            </span>
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Autonomous Trip Protocol Engaged
            </span>
            <span className="text-rose-300 text-xs">·</span>
            <span className="text-sm text-slate-700">
              Auto-remediation isolated partition{' '}
              <span className="font-mono text-xs text-rose-700 font-semibold bg-white px-2 py-0.5 rounded-md border border-rose-200">
                dt=2025-05-18/hr=14
              </span>{' '}
              in 85ms
            </span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-600">
              SLA Impact: <strong className="text-emerald-700 font-semibold">0 Analytic Marts Corrupted</strong>
            </span>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-white text-rose-700 hover:bg-rose-100 hover:text-rose-800 transition-colors text-xs font-semibold flex items-center gap-1.5 border border-rose-200 shadow-sm"
              onClick={() => {
                document.getElementById('recovery-terminal')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              View Trace Log <span className="material-symbols-outlined text-[15px]">arrow_downward</span>
            </button>
          </div>
        </div>

        {/* 4 Spacious KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-sky-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                Ingestion Throughput
              </span>
              <span className="material-symbols-outlined text-sky-600 text-[20px]">speed</span>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl font-bold text-slate-900 tracking-tight">
                84,210 <span className="text-xs font-normal text-slate-400">eps</span>
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                +4.2% peak
              </span>
            </div>
            {/* Live Sparkline */}
            <div className="mt-3 h-8 w-full flex items-end">
              <svg className="w-full h-full text-sky-500" fill="none" preserveAspectRatio="none" viewBox="0 0 100 24">
                <path
                  d="M0 18 Q 12 12, 24 16 T 48 8 T 72 14 T 88 5 L 100 11"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M0 18 Q 12 12, 24 16 T 48 8 T 72 14 T 88 5 L 100 11 L 100 24 L 0 24 Z"
                  fill="currentColor"
                  fillOpacity="0.08"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>T-60s: 80.8k</span>
              <span className="text-emerald-700 font-medium">p99: 14ms Lag</span>
            </div>
          </div>

          {/* KPI 2 */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-rose-300 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                Circuit-Breaker State
              </span>
              <span className="material-symbols-outlined text-rose-600 text-[20px]">bolt</span>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-xl font-bold text-rose-700 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                TRIPPED
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                AUTONOMOUS
              </span>
            </div>
            <div className="mt-3 bg-slate-50 p-2.5 rounded-xl flex flex-col gap-1.5 border border-slate-200">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Diversion Mode:</span>
                <span className="text-rose-700 font-medium">S3 Quarantine Lake</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full w-full animate-pulse"></div>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Tripped: 14:32:01 UTC</span>
              <span className="text-rose-600 font-medium">Auto-Refetch Active</span>
            </div>
          </div>

          {/* KPI 3 */}
          <div
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
            onClick={onNavigateToQuality}
            title="Inspect Anomaly Profile"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                Anomaly Profile
              </span>
              <span className="material-symbols-outlined text-rose-600 text-[20px]">troubleshoot</span>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl font-bold text-rose-700 tracking-tight">
                50.42% <span className="text-xs font-normal text-slate-400">tax NULL</span>
              </span>
              <span className="text-xs text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                ▲ 1008x tol
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <div className="flex-1 bg-slate-50 rounded-lg p-2 flex items-center justify-between border border-slate-200">
                <span className="text-[11px] text-slate-500">Threshold:</span>
                <span className="text-[11px] text-emerald-700 font-semibold">&lt; 0.05%</span>
              </div>
              <div className="flex-1 bg-slate-50 rounded-lg p-2 flex items-center justify-between border border-slate-200">
                <span className="text-[11px] text-slate-500">Rule ID:</span>
                <span className="text-[11px] text-sky-700 font-mono font-medium">GE-NULL-TAX</span>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>14,280 / 28,310 rows</span>
              <span className="text-rose-600 font-medium">99.98% Confidence</span>
            </div>
          </div>

          {/* KPI 4 */}
          <div
            className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
            onClick={onNavigateToIceberg}
            title="Inspect Safeguarded Lakehouse"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-500 tracking-wider">
                Downstream Impact
              </span>
              <span className="material-symbols-outlined text-emerald-600 text-[20px]">shield</span>
            </div>
            <div className="flex items-baseline justify-between mt-3">
              <span className="text-2xl font-bold text-emerald-700 tracking-tight">
                $1.42M <span className="text-xs font-normal text-slate-400">saved</span>
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                SAFEGUARDED
              </span>
            </div>
            <div className="mt-3 bg-slate-50 p-2 rounded-xl flex items-center justify-between border border-slate-200">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600 text-[16px]">pause_circle</span>
                <span className="text-xs text-slate-700 font-medium">
                  3 Analytics Marts Paused
                </span>
              </div>
              <span className="text-xs text-emerald-700 font-semibold">Clean Cache</span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
              <span>Snapshot: #4819284718</span>
              <span className="text-emerald-700 font-medium">Zero Bad Rollups</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Pipeline Topology Interactive Canvas */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Canvas Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
              <span className="material-symbols-outlined text-[22px]">account_tree</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                E-Commerce Checkout Lineage:{' '}
                <span className="font-mono text-sm text-sky-600 font-medium">telemetry.orders.checkout.v2</span>
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Evaluation Interval: 1.0s Micro-batch</span>
                <span>·</span>
                <span>Active Watermark: 18ms</span>
              </div>
            </div>
          </div>

          {/* Action & View Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setIsPlayingLive(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isPlayingLive
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">play_arrow</span> Live
              </button>
              <button
                type="button"
                onClick={() => setIsPlayingLive(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                  !isPlayingLive
                    ? 'bg-white text-slate-900 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">history</span> Replay T-5m
              </button>
            </div>

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-sky-600 text-white text-xs font-semibold flex items-center gap-2 hover:bg-sky-700 transition-all shadow-sm active:scale-95"
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            >
              <span className="material-symbols-outlined text-[16px]">visibility</span>
              {isInspectorOpen ? 'Hide Samples Tray' : 'Inspect Quarantined (14,280)'}
            </button>
          </div>
        </div>

        {/* Visual Lineage Nodes Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Node 1: Kafka Broker (Cols 1-4) */}
          <div className="lg:col-span-4 bg-slate-50 border border-slate-200/90 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative group hover:border-sky-300 transition-colors">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-sky-600 text-[22px]">hub</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Kafka Broker</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">telemetry.orders.checkout.v2</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  ACTIVE
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Throughput</span>
                  <span className="text-sm font-semibold text-emerald-700">84,210 msg/s</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Consumer Lag</span>
                  <span className="text-sm font-semibold text-slate-800">11 ms</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Partitions</span>
                  <span className="text-sm font-semibold text-slate-800">32 in-sync</span>
                </div>
                <div>
                  <span className="text-xs text-slate-400 block font-medium">Producer</span>
                  <span className="text-sm font-semibold text-sky-700">Checkout-Svc-v4</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
              <span>Payload: JSON AVRO</span>
              <span className="text-emerald-700 flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-[14px]">done_all</span> Nominal Flow
              </span>
            </div>
          </div>

          {/* Node 2: Flink Stateful Stream (Cols 5-8) */}
          <div className="lg:col-span-4 bg-rose-50/50 border border-rose-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative group hover:border-rose-400 transition-colors">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-rose-600 text-[22px]">memory</span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Flink Stateful Stream</h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">Job: flink-chk-902 (v1.18.1)</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-700 border border-rose-300 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                  ANOMALY
                </span>
              </div>

              {/* Quality Assertion Callout */}
              <div className="bg-white p-3.5 rounded-xl border border-rose-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px]">gpp_bad</span>
                    Great Expectations Assertion
                  </span>
                  <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                    CRITICAL FAIL
                  </span>
                </div>

                <div className="font-mono text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                  <span className="text-rose-600 font-bold">ASSERT:</span> expect_column_values_to_not_be_null(
                  <br />
                  &nbsp;&nbsp;column=<span className="text-sky-600 font-semibold">'tax_amount'</span>,<br />
                  &nbsp;&nbsp;max_unexpected_percent=<span className="text-emerald-600 font-semibold">0.05</span>
                  <br />) <span className="text-slate-400">-- Observed: 50.42%</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-rose-200/80 flex items-center justify-between text-xs text-slate-600">
              <span className="text-rose-700 font-semibold">Bifurcation: 50.4% Bad Records</span>
              <span className="text-slate-500">4 TaskManagers</span>
            </div>
          </div>

          {/* Node 3: Sinks Bifurcation (Cols 9-12) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            {/* Quarantined S3 DLQ */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-rose-600 text-[18px]">emergency_home</span>
                  <span className="text-sm font-bold text-slate-900">S3 Quarantine Lake</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-700">
                  RECEIVING CORRUPT
                </span>
              </div>
              <p className="text-xs font-mono text-slate-600 truncate">
                s3://lakehouse-quarantine/orders_bad_tax/
              </p>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-rose-100">
                <span className="text-slate-500">Quarantined Records:</span>
                <span className="text-rose-700 font-bold">14,280 rows (+420/s)</span>
              </div>
            </div>

            {/* Apache Iceberg (Protected) */}
            <div
              className="bg-slate-50 border border-slate-200 rounded-2xl p-4 shadow-sm space-y-2 cursor-pointer hover:border-emerald-300 transition-colors"
              onClick={onNavigateToIceberg}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sky-600 text-[18px]">layers</span>
                  <span className="text-sm font-bold text-slate-900">Apache Iceberg Table</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                  COMMITS LOCKED
                </span>
              </div>
              <p className="text-xs font-mono text-slate-600 truncate">
                prod_lakehouse.checkout_transactions
              </p>
              <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
                <span className="text-slate-500">Golden Snapshot:</span>
                <span className="text-emerald-700 font-semibold">#4819284718 (Clean)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Real-Time Visual Flow Indicator */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Nominal Flow: 42,480 eps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              <span className="text-rose-700 font-semibold">Quarantine Diverter: 41,730 eps (50.4%)</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span>Destination: <strong className="text-slate-800">s3://lakehouse-quarantine</strong></span>
            <span>·</span>
            <span className="text-sky-700 font-medium">Re-fetch ETA: ~2m 14s</span>
          </div>
        </div>
      </div>

      {/* Autonomous Healing Audit Trail & Event Telemetry */}
      <div
        className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5"
        id="recovery-terminal"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <span className="material-symbols-outlined text-[20px]">terminal</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Autonomous Healing Audit Trail &amp; Event Telemetry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">High-frequency forensic execution log</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors flex items-center gap-2 border border-slate-200"
              onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            >
              <span className="material-symbols-outlined text-[15px]">troubleshoot</span>
              {isInspectorOpen ? 'Hide Samples' : 'Inspect Quarantined Samples'}
            </button>

            <button
              type="button"
              disabled={backfillState === 'running'}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-all flex items-center gap-2 disabled:opacity-70 active:scale-95 shadow-sm"
              onClick={handleTriggerBackfill}
            >
              {backfillState === 'idle' && (
                <>
                  <span className="material-symbols-outlined text-[15px]">replay</span>
                  Trigger Backfill &amp; Re-play
                </>
              )}
              {backfillState === 'running' && (
                <>
                  <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                  Backfilling 14,280 Rows...
                </>
              )}
              {backfillState === 'success' && (
                <>
                  <span className="material-symbols-outlined text-[15px]">check</span>
                  Backfill Submitted (bf-4921)
                </>
              )}
            </button>

            <button
              type="button"
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-colors flex items-center gap-2 border border-rose-200 active:scale-95"
              onClick={() => setShowOverrideModal(true)}
            >
              <span className="material-symbols-outlined text-[15px]">lock_open</span>
              Override Circuit Breaker
            </button>
          </div>
        </div>

        {/* Live Event Log Console */}
        <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 space-y-2.5 overflow-x-auto shadow-inner">
          <div className="flex items-baseline gap-3 hover:bg-slate-800/80 p-2 rounded-lg transition-colors">
            <span className="text-slate-400 min-w-[95px]">14:32:01.104</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold text-[10px]">
              BREACH
            </span>
            <span className="flex-1 font-sans text-xs">
              <strong className="text-sky-400 font-medium">Flink Sliding Window [60s]</strong> detected{' '}
              <code className="text-rose-400 font-mono">tax_amount IS NULL</code> rate ={' '}
              <span className="text-rose-400 font-bold">50.42%</span> (Threshold: &lt; 0.05%). Target column flagged as critical upstream regression.
            </span>
          </div>

          <div className="flex items-baseline gap-3 hover:bg-slate-800/80 p-2 rounded-lg transition-colors">
            <span className="text-slate-400 min-w-[95px]">14:32:01.142</span>
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-semibold text-[10px]">
              ASSERTION
            </span>
            <span className="flex-1 font-sans text-xs">
              Great Expectations Suite <code className="text-sky-400 font-mono">[orders_strict_validation]</code> assertion{' '}
              <code className="text-rose-400 font-mono">[expect_column_values_to_not_be_null]</code> failed. Evaluation batch size: 28,310 records.
            </span>
          </div>

          <div className="flex items-baseline gap-3 hover:bg-slate-800/80 p-2 rounded-lg transition-colors">
            <span className="text-slate-400 min-w-[95px]">14:32:01.189</span>
            <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-400 font-semibold text-[10px]">
              CIRCUIT-TRIP
            </span>
            <span className="flex-1 font-sans text-xs">
              <strong className="text-rose-400 font-semibold">IceStream Autonomous Breaker Tripped:</strong> Flink sink diverter routed all corrupt transaction records directly to isolated S3 Quarantine Lake (
              <code className="text-slate-400 font-mono">s3://lakehouse-quarantine/orders_bad_tax/</code>).
            </span>
          </div>

          <div className="flex items-baseline gap-3 hover:bg-slate-800/80 p-2 rounded-lg transition-colors">
            <span className="text-slate-400 min-w-[95px]">14:32:01.215</span>
            <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold text-[10px]">
              LAKE-LOCK
            </span>
            <span className="flex-1 font-sans text-xs">
              Apache Iceberg transaction commit locked for snapshot #4819284719. Prevented dirty write of 14,280 null-tax rows into{' '}
              <code className="text-sky-400 font-mono">prod_lakehouse.checkout_transactions</code>. Downstream Looker mart paused.
            </span>
          </div>

          <div className="flex items-baseline gap-3 hover:bg-slate-800/80 p-2 rounded-lg transition-colors">
            <span className="text-slate-400 min-w-[95px]">14:32:01.890</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
              WEBHOOK
            </span>
            <span className="flex-1 font-sans text-xs">
              Dispatch webhook payload to <code className="text-sky-400 font-mono">api.internal.payments/v1/tax-engine/re-evaluate</code> with trace ID{' '}
              <code className="text-emerald-400 font-mono">chk_err_88319f0</code>. Upstream root cause identified: AvaTax service timeout in Checkout Pod #04.
            </span>
          </div>

          <div className="flex items-baseline gap-3 hover:bg-slate-800/80 p-2 rounded-lg transition-colors bg-emerald-950/20 border-l-2 border-emerald-500">
            <span className="text-emerald-400 min-w-[95px]">14:32:03.412</span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
              SELF-HEAL
            </span>
            <span className="flex-1 font-sans text-xs text-slate-100">
              Upstream AvaTax pod scaled out &amp; restarted. Fallback recalculation worker online. Auto-replay buffer staged in Kafka topic{' '}
              <code className="text-sky-400 font-mono">telemetry.orders.retry.recalc</code>. Awaiting verification batch.
            </span>
          </div>
        </div>

        {/* Live Data Sample Tray (Spacious, Roomy Table) */}
        {isInspectorOpen && (
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-rose-600 text-[20px]">data_table</span>
                <span className="text-sm font-bold text-slate-900">
                  Inspecting Sample Quarantined Records in S3 (10 of 14,280)
                </span>
              </div>
              <button
                type="button"
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                onClick={() => setIsInspectorOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                    <th className="py-3 px-4 font-semibold">EVENT_TIME (UTC)</th>
                    <th className="py-3 px-4 font-semibold">ORDER_ID</th>
                    <th className="py-3 px-4 font-semibold">USER_ID</th>
                    <th className="py-3 px-4 font-semibold">SUBTOTAL</th>
                    <th className="py-3 px-4 font-semibold text-rose-600">TAX_AMOUNT (CORRUPT)</th>
                    <th className="py-3 px-4 font-semibold">TOTAL</th>
                    <th className="py-3 px-4 font-semibold">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                  {samples.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500">{row.eventTime}</td>
                      <td className="py-3 px-4 text-sky-600 font-bold">{row.orderId}</td>
                      <td className="py-3 px-4">{row.customerId}</td>
                      <td className="py-3 px-4">{row.subtotal}</td>
                      <td className="py-3 px-4 text-rose-600 bg-rose-50 font-bold">NULL</td>
                      <td className="py-3 px-4">{row.total}</td>
                      <td className="py-3 px-4 text-rose-600 font-semibold">{row.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Safety Override Confirmation Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-rose-200 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="flex items-center gap-2.5 text-rose-600">
                <span className="material-symbols-outlined text-[24px]">gpp_maybe</span>
                <span className="text-base font-bold">Manual Breaker Override</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowOverrideModal(false);
                  setOverrideError(null);
                  setOverrideMfaInput('');
                }}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed">
              Overriding this circuit-breaker will immediately resume commits of unverified{' '}
              <strong className="text-rose-600">50.42% NULL tax records</strong> to Apache Iceberg table{' '}
              <code className="text-sky-700 font-mono bg-sky-50 px-1 py-0.5 rounded">prod_lakehouse.checkout_transactions</code>.
            </p>

            <form onSubmit={handleOverrideAttempt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
                  Dual-Approver MFA Token (PagerDuty Incident #PD-9921)
                </label>
                <input
                  type="text"
                  value={overrideMfaInput}
                  onChange={(e) => setOverrideMfaInput(e.target.value)}
                  placeholder="Enter 6-digit MFA token (e.g. 992144)..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 font-mono focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-100"
                />
              </div>

              {overrideError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 leading-relaxed">
                  {overrideError}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowOverrideModal(false);
                    setOverrideError(null);
                    setOverrideMfaInput('');
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200"
                >
                  Cancel &amp; Maintain Protection
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors shadow-sm"
                >
                  Authorize Emergency Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
