import React, { useState } from 'react';
import { QuarantinedSample } from '../../types';
import { CHRONOLOGY_EVENTS } from '../../data/mockData';

interface IncidentsScreenProps {
  samples: QuarantinedSample[];
  onOpenPostmortem: () => void;
  onApproveSnapshot?: () => void;
}

export const IncidentsScreen: React.FC<IncidentsScreenProps> = ({
  samples,
  onOpenPostmortem,
  onApproveSnapshot,
}) => {
  const [activeApprovalState, setActiveApprovalState] = useState<'idle' | 'approving' | 'approved'>('idle');
  const [canaryState, setCanaryState] = useState<'idle' | 'running' | 'success'>('idle');
  const [manualReopenActive, setManualReopenActive] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');

  const handleApprove = () => {
    setActiveApprovalState('approving');
    setTimeout(() => {
      setActiveApprovalState('approved');
      if (onApproveSnapshot) onApproveSnapshot();
      setTimeout(() => setActiveApprovalState('idle'), 4000);
    }, 1200);
  };

  const handleRunCanary = () => {
    setCanaryState('running');
    setTimeout(() => {
      setCanaryState('success');
      setTimeout(() => setCanaryState('idle'), 3500);
    }, 1500);
  };

  const filteredSamples = samples.filter(
    (s) =>
      s.orderId.toLowerCase().includes(filterSearch.toLowerCase()) ||
      s.customerId.toLowerCase().includes(filterSearch.toLowerCase()) ||
      s.jurisdiction.toLowerCase().includes(filterSearch.toLowerCase())
  );

  const handleDownloadIncidentJson = () => {
    const data = {
      incidentId: "INC-2025-0514-082",
      severity: "P1 - CRITICAL",
      status: "AUTONOMOUSLY_MITIGATED",
      pipeline: "telemetry.orders.checkout.v2",
      targetTable: "prod_lakehouse.checkout_transactions",
      autonomousAgent: "IceStream-SelfHeal-v4",
      circuitTripLatencyMs: 189,
      dataLeakedRows: 0,
      financialBlastRadiusGuardedUsd: 1420800,
      quarantinedOrdersCount: 14160,
      goldenSnapshotLocked: 4819284718,
      chronologyEvents: CHRONOLOGY_EVENTS,
      quarantinedSamples: samples,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_audit_INC-2025-0514-082.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleDownloadIncidentCsv = () => {
    const headers = ["Event Offset", "UTC Timestamp", "Badge", "Action Taken", "Description"];
    const eventRows = CHRONOLOGY_EVENTS.map(e => [
      `"${e.timeOffset}"`,
      `"${e.utcTime}"`,
      `"${e.badge}"`,
      e.isAction ? "YES" : "NO",
      `"${e.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...eventRows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident_chronology_INC-2025-0514-082.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* 1. Incident Master Forensics Header */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-4 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-ping"></span>
                P1 · CRITICAL
              </span>
              <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
                AUTONOMOUSLY MITIGATED
              </span>
              <span className="text-xs font-mono text-slate-500 font-medium">INC-2025-0514-082</span>
              <span className="text-slate-300">/</span>
              <span className="text-xs text-slate-600 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-sky-600">robot_2</span>
                Agent: <span className="text-sky-700 font-semibold">IceStream-SelfHeal-v4</span>
              </span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Downstream Data Corruption Prevented: <span className="text-rose-600 font-mono">tax_amount</span> NULL Spike
            </h1>

            <p className="text-sm text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">sync</span> Stage 3/4: Upstream Re-fetch &amp; ACID Reconciliation
              </span>
              <span className="text-slate-300">·</span>
              <span>
                SRE Escort: <strong className="text-slate-900">Sarah Lin</strong> (Supervisory Lock Engaged)
              </span>
            </p>
          </div>

          {/* Metric Telemetry Cards */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-3 rounded-2xl flex-wrap">
            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-semibold">Trip Latency</span>
              <div className="text-xl font-bold text-emerald-700 font-mono">189 ms</div>
              <span className="text-[11px] text-slate-400">Anomaly to cut</span>
            </div>

            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-semibold">Data Leaked</span>
              <div className="text-xl font-bold text-emerald-700 font-mono">0 rows</div>
              <span className="text-[11px] text-emerald-700 font-medium">100% Zero-Leak</span>
            </div>

            <div className="px-4 py-2 bg-white rounded-xl border border-slate-200 shadow-sm">
              <span className="text-xs text-slate-500 uppercase font-semibold">Tax Drift Guarded</span>
              <div className="text-xl font-bold text-sky-700 font-mono">$1.42M</div>
              <span className="text-[11px] text-slate-500">14,160 Orders</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-2 font-medium">
              <span className="material-symbols-outlined text-[15px] text-emerald-600">autorenew</span>
              Live Parquet Compaction &amp; Payment Re-Fetch Engine: 72% Complete
            </span>
            <span className="font-mono text-sky-700 font-semibold">ETA ~00:01:45</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div className="h-full bg-emerald-500 rounded-full w-[72%] transition-all duration-700"></div>
          </div>
        </div>
      </section>

      {/* 2. Chronology & Blast Radius Split */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (7 cols): Chronology & Decision Trace */}
        <section className="xl:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-sky-600 text-[20px]">history_toggle_off</span>
                <h3 className="text-base font-bold text-slate-900">
                  Incident Anatomy &amp; Autonomous Chronology
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">Microsecond Clock</span>
            </div>

            <div className="space-y-3.5">
              {CHRONOLOGY_EVENTS.map((event, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    event.isAction
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono font-bold text-sky-700">{event.timeOffset}</span>
                      <span className="text-xs text-slate-500">{event.utcTime}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        event.badgeType === 'error'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : event.badgeType === 'tertiary'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {event.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{event.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Decision Trace */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-sky-600 text-[18px]">terminal</span>
                Autonomous Agent Decision Trace
              </span>
              <span className="font-mono text-xs text-slate-400">hash: 9f8a2..c18</span>
            </div>
            <pre className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 leading-relaxed overflow-x-auto shadow-inner">
{`// Great Expectations Auto-Triage Triggered: 2025-05-14T14:32:00.142Z
MATCH (stream: "telemetry.orders.checkout.v2")
ASSERT tax_amount IS NOT NULL -> FAIL (Violation: 50.42%)

// Interceptor Action:
EXECUTE iceberg.circuit_breaker.trip(table="lakehouse.orders_realtime")
SNAPSHOT_PIN target=4819284718 [ACID Safe Point Established]
DISPATCH async_remediation_worker(batch=9281, action="GEO_TAX_REBUILD")
>> STATUS: OK. Downstream BI and models fully insulated. 0 bad records written to lake.`}
            </pre>
          </div>
        </section>

        {/* Right Column (5 cols): Blast Radius & Control Actions */}
        <section className="xl:col-span-5 space-y-6">
          {/* Blast Radius Matrix */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">hub</span>
                <h3 className="text-base font-bold text-slate-900">
                  Downstream Blast Radius
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                0 Affected
              </span>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Finance Revenue Mart</span>
                  <span className="text-xs text-emerald-700 font-semibold">PROTECTED</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Snowflake External Table · Iceberg</span>
                  <span className="text-emerald-700 font-mono font-medium">0% Skew</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Fraud Detection Model</span>
                  <span className="text-xs text-emerald-700 font-semibold">HEALTHY</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Flink Inference Cluster</span>
                  <span className="text-emerald-700 font-mono font-medium">31ms p95</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900">Executive KPI Dashboard</span>
                  <span className="text-xs text-sky-700 font-semibold">CIRCUIT-HELD</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Looker / BI Layer</span>
                  <span className="text-sky-700 font-medium">Sync Paused</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
              <span className="text-xs uppercase font-bold text-slate-400 block">Risk Avoidance Vector</span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">Tax Error Avoided</span>
                  <span className="text-base font-bold text-slate-900 font-mono">$1,420,800</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Audit Compliance</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">100.0%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Supervisory Control Actions */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900">Supervisory Control Actions</h3>
            <p className="text-xs text-slate-500">
              Autonomous agent commits healed partitions unless paused by an active reliability engineer.
            </p>

            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleApprove}
                disabled={activeApprovalState === 'approving'}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-[0.99] disabled:opacity-75"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">
                    {activeApprovalState === 'approving' ? 'sync' : 'verified'}
                  </span>
                  {activeApprovalState === 'approving'
                    ? 'Re-indexing Parquet Manifests...'
                    : activeApprovalState === 'approved'
                    ? 'Snapshot #4819284720 Approved!'
                    : 'Approve Re-ingested Iceberg Snapshot'}
                </span>
                <span className="text-white/80 uppercase font-normal text-[10px]">Auto at 100%</span>
              </button>

              <button
                type="button"
                onClick={handleRunCanary}
                disabled={canaryState === 'running'}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors border border-slate-200"
              >
                <span className="flex items-center gap-2">
                  <span className={`material-symbols-outlined text-[17px] text-sky-600 ${canaryState === 'running' ? 'animate-spin' : ''}`}>
                    science
                  </span>
                  {canaryState === 'running'
                    ? 'Executing Canary...'
                    : canaryState === 'success'
                    ? 'Canary Passed (100/100)'
                    : 'Trigger Canary Batch (100 Rows)'}
                </span>
                <span className="text-slate-500 text-[11px] font-normal">Dry-Run</span>
              </button>

              <button
                type="button"
                onClick={onOpenPostmortem}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors border border-slate-200 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-emerald-600">picture_as_pdf</span>
                  Generate SOC2 Postmortem PDF
                </span>
                <span className="text-slate-500 text-[11px] font-normal">Instant Export</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleDownloadIncidentJson}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-sky-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all cursor-pointer"
                  title="Download full incident audit telemetry and chronology as JSON"
                >
                  <span className="material-symbols-outlined text-[15px]">data_object</span>
                  Export Audit JSON
                </button>
                <button
                  type="button"
                  onClick={handleDownloadIncidentCsv}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-emerald-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-sm transition-all cursor-pointer"
                  title="Download incident events chronology as CSV"
                >
                  <span className="material-symbols-outlined text-[15px]">table_chart</span>
                  Export Audit CSV
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  setManualReopenActive(!manualReopenActive);
                  alert(
                    !manualReopenActive
                      ? "Downstream gates manually reopened."
                      : "Protective circuit breaker re-engaged."
                  );
                }}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200"
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px]">lock_open</span>
                  {manualReopenActive ? 'Downstream Gates Opened' : 'Reopen Downstream Gates Manually'}
                </span>
                <span className="uppercase text-[10px]">Override</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* 3. Real-time Partition Diff & Quarantine Inspection Tray */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-[20px]">difference</span>
              Data Quarantine &amp; Field Parity Inspector
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">Partition: dt=2025-05-14/region=us-east-1</p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Filter order or customer..."
              value={filterSearch}
              onChange={(e) => setFilterSearch(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-sky-500 focus:outline-none"
            />
            <span className="text-xs text-slate-500 font-medium">
              {filteredSamples.length} of {samples.length} records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-3 px-4 font-semibold">ORDER_ID</th>
                <th className="py-3 px-4 font-semibold">CUSTOMER_ID</th>
                <th className="py-3 px-4 font-semibold text-rose-700">RAW_TAX (QUARANTINED)</th>
                <th className="py-3 px-4 font-semibold text-emerald-700">RECONCILED_TAX (AGENT)</th>
                <th className="py-3 px-4 font-semibold">GEO_JURISDICTION</th>
                <th className="py-3 px-4 font-semibold">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700 bg-white">
              {filteredSamples.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sky-600 font-bold">{item.orderId}</td>
                  <td className="py-3 px-4">{item.customerId}</td>
                  <td className="py-3 px-4 text-rose-700 bg-rose-50 font-bold">
                    NULL [VIOLATION]
                  </td>
                  <td className="py-3 px-4 font-bold bg-emerald-50 text-emerald-800">
                    {item.reconciledTax || '$14.28 USD'}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.jurisdiction}</td>
                  <td className="py-3 px-4">
                    {item.reconciledStatus === 'Processing' ? (
                      <span className="text-sky-600 flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                        Processing
                      </span>
                    ) : (
                      <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[15px]">check_circle</span>
                        Resolved
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
