import React, { useState } from 'react';
import { IcebergSnapshot } from '../../types';

interface IcebergTableScreenProps {
  snapshots: IcebergSnapshot[];
  onRollbackGolden?: () => void;
}

export const IcebergTableScreen: React.FC<IcebergTableScreenProps> = ({
  snapshots,
  onRollbackGolden,
}) => {
  const [selectedSnapshot, setSelectedSnapshot] = useState<string>('#4819284718');
  const [promoteStatus, setPromoteStatus] = useState<'idle' | 'promoting' | 'promoted'>('idle');
  const [branchStatus, setBranchStatus] = useState<'idle' | 'branching' | 'created'>('idle');
  const [syncRateOverridden, setSyncRateOverridden] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<'golden' | 'corrupt' | 'partitions' | 'history'>('golden');
  const [queryExecutionStats, setQueryExecutionStats] = useState({ runtime: '18ms', filesPruned: '14 / 16', bytesScanned: '2.1 MB' });

  const queryPresets = {
    golden: {
      sql: `SELECT order_id, customer_id, subtotal, tax_amount, total, status\nFROM prod_lakehouse.checkout_transactions\nFOR SYSTEM_VERSION AS OF 4819284718\nWHERE tax_amount IS NULL;`,
      resultSummary: '0 rows returned (Verified Golden State: ZERO NULLs)',
      isClean: true,
      stats: { runtime: '18ms', filesPruned: '14 / 16', bytesScanned: '2.1 MB' },
      columns: ['order_id', 'customer_id', 'subtotal', 'tax_amount', 'total', 'status'],
      rows: [],
    },
    corrupt: {
      sql: `SELECT order_id, customer_id, subtotal, tax_amount, total, status\nFROM prod_lakehouse.checkout_transactions\nFOR SYSTEM_VERSION AS OF 4819284719\nWHERE tax_amount IS NULL\nLIMIT 3;`,
      resultSummary: '14,280 rows returned (QUARANTINED PARTITION CORRUPTION DETECTED)',
      isClean: false,
      stats: { runtime: '26ms', filesPruned: '2 / 16', bytesScanned: '18.4 MB' },
      columns: ['order_id', 'customer_id', 'subtotal', 'tax_amount', 'total', 'status'],
      rows: [
        ['ord_98418290', 'usr_8819401', '$142.50', 'NULL', '$142.50', 'QUARANTINED'],
        ['ord_98418291', 'usr_4401923', '$85.00', 'NULL', '$85.00', 'QUARANTINED'],
        ['ord_98418292', 'usr_2910488', '$259.40', 'NULL', '$259.40', 'QUARANTINED'],
      ],
    },
    partitions: {
      sql: `SELECT partition, record_count, file_count, total_data_file_size_in_bytes\nFROM prod_lakehouse.checkout_transactions.partitions;`,
      resultSummary: '4 partitions returned (1 isolated, 3 healthy)',
      isClean: true,
      stats: { runtime: '12ms', filesPruned: '0 / 4 (Metadata Scan)', bytesScanned: '14 KB' },
      columns: ['partition', 'record_count', 'file_count', 'data_size'],
      rows: [
        ['dt=2025-05-18/hr=12', '248,190', '4 files', '820 MB'],
        ['dt=2025-05-18/hr=13', '261,420', '4 files', '864 MB'],
        ['dt=2025-05-18/hr=14', '14,280 (DLQ)', '1 file', '42 MB'],
        ['dt=2025-05-18/hr=15', '255,800', '4 files', '840 MB'],
      ],
    },
    history: {
      sql: `SELECT snapshot_id, parent_id, is_current_ancestor, made_current_at\nFROM prod_lakehouse.checkout_transactions.history;`,
      resultSummary: '3 snapshot commits retrieved from Iceberg catalog',
      isClean: true,
      stats: { runtime: '8ms', filesPruned: 'Catalog Metastore', bytesScanned: '8 KB' },
      columns: ['snapshot_id', 'parent_id', 'is_current_ancestor', 'timestamp'],
      rows: [
        ['4819284717', '4819284716', 'true', '2025-05-18 14:15:00 UTC'],
        ['4819284718 (GOLD)', '4819284717', 'true', '2025-05-18 14:30:00 UTC'],
        ['4819284719 (CORRUPT)', '4819284718', 'false (ISOLATED)', '2025-05-18 14:31:58 UTC'],
      ],
    },
  };

  const [queryCode, setQueryCode] = useState<string>(queryPresets.golden.sql);
  const [isQueryRunning, setIsQueryRunning] = useState(false);
  const [activePresetData, setActivePresetData] = useState(queryPresets.golden);

  const handleSelectPreset = (key: 'golden' | 'corrupt' | 'partitions' | 'history') => {
    setSelectedPreset(key);
    setQueryCode(queryPresets[key].sql);
    setActivePresetData(queryPresets[key]);
  };

  const handleExecuteQuery = () => {
    setIsQueryRunning(true);
    setTimeout(() => {
      setIsQueryRunning(false);
      setActivePresetData(queryPresets[selectedPreset]);
      setQueryExecutionStats(queryPresets[selectedPreset].stats);
    }, 380);
  };

  const handleToggleSyncRate = () => {
    setSyncRateOverridden(!syncRateOverridden);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-7 pb-12">
      {/* HUD Header */}
      <div className="bg-white border border-slate-200/90 p-5 md:p-6 rounded-2xl shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        {/* Target Table & Schema Specs */}
        <div className="flex items-start gap-4 min-w-0">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-100 shadow-sm">
            <span className="material-symbols-outlined text-[24px]">layers</span>
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-xs uppercase font-bold text-slate-400">Table Target</span>
              <span className="text-slate-300">/</span>
              <span className="text-lg font-bold text-slate-900 truncate">
                prod_lakehouse.checkout_transactions
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                Iceberg Spec v2
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                Pos-Deletes
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap pt-0.5">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-slate-400">hub</span>
                <span>
                  Catalog: <span className="text-slate-800 font-semibold">AWS Glue / REST Nessie</span>
                </span>
              </div>
              <span>·</span>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[15px] text-slate-400">folder_zip</span>
                <span>
                  Storage: <span className="text-slate-800 font-semibold">1,428 Parquet Files (3.8 TB)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Isolation & Active Snapshot Badges */}
        <div className="flex items-center gap-4 flex-wrap shrink-0">
          <div className="flex flex-col text-left xl:text-right">
            <span className="text-xs uppercase text-slate-400 font-bold">Current Active Head</span>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-slate-900 font-mono">#4819284719</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">2m ago</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
          <div className="px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5">
            <span className="material-symbols-outlined text-rose-600 text-[20px]">gpp_maybe</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-rose-700">Circuit Isolation</span>
              <span className="text-xs font-mono font-semibold text-rose-900">dt=2025-05-14 / hour=14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Metric Accelerators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500">Golden Snapshot Target</span>
            <div className="text-2xl font-bold text-emerald-700 font-mono">#4819284718</div>
            <p className="text-xs text-slate-500">Validated baseline</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="material-symbols-outlined text-[22px]">check_circle</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500">Quarantine Diversion</span>
            <div className="text-2xl font-bold text-rose-700 font-mono">14,280 Rows</div>
            <p className="text-xs text-rose-600">Null tax blocked</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
            <span className="material-symbols-outlined text-[22px]">shield</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500">Gateway Re-fetch</span>
            <div className="text-2xl font-bold text-sky-700 font-mono">72.0%</div>
            <p className="text-xs text-slate-500">10,281 Reconstructed</p>
          </div>
          <div className="p-3 rounded-xl bg-sky-50 text-sky-700 border border-sky-200">
            <span className="material-symbols-outlined text-[22px] animate-spin">sync</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs uppercase font-semibold text-slate-500">Commit Strategy</span>
            <div className="text-2xl font-bold text-slate-800 font-mono">COW + Pos-Del</div>
            <p className="text-xs text-slate-500">Auto merge staged</p>
          </div>
          <div className="p-3 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
            <span className="material-symbols-outlined text-[22px]">merge_type</span>
          </div>
        </div>
      </div>

      {/* Snapshot Log Scrubber */}
      <div className="bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-sky-600 text-[22px]">history</span>
            <h3 className="text-base font-bold text-slate-900">
              Iceberg Linear Time-Travel &amp; Snapshot Log
            </h3>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-medium border border-slate-200">
              Branch: refs/heads/main
            </span>
          </div>
          <div className="text-xs text-slate-500">
            Metadata Root: <span className="font-mono text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">v4819.metadata.json</span>
          </div>
        </div>

        {/* Timeline Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Snapshot 1 */}
          <div
            onClick={() => setSelectedSnapshot('#4819284717')}
            className={`bg-slate-50 border p-5 rounded-2xl flex flex-col justify-between hover:bg-slate-100/70 transition-all cursor-pointer ${
              selectedSnapshot === '#4819284717' ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-slate-200'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span className="font-mono text-base font-bold text-slate-900">#4819284717</span>
                </div>
                <span className="text-xs text-slate-500">14:15:00 UTC</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Operation:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">APPEND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Records Added:</span>
                  <span className="text-emerald-700 font-semibold font-mono">+92,400 rows</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Audit:</span>
                  <span className="text-emerald-700 font-semibold">100% Pass</span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                CLEAN
              </span>
              <span className="text-sky-600 font-semibold">Inspect →</span>
            </div>
          </div>

          {/* Snapshot 2 (Golden Active) */}
          <div
            onClick={() => setSelectedSnapshot('#4819284718')}
            className={`bg-sky-50/40 border p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer relative ${
              selectedSnapshot === '#4819284718' ? 'border-sky-500 ring-2 ring-sky-100 shadow-md' : 'border-sky-200'
            }`}
          >
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-sky-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
              Active Golden Baseline
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 ring-2 ring-sky-200"></span>
                  <span className="font-mono text-base font-bold text-sky-800">#4819284718</span>
                </div>
                <span className="text-xs text-slate-500">14:30:00 UTC</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Operation:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200">APPEND</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Records Added:</span>
                  <span className="text-sky-700 font-bold font-mono">+88,120 rows</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Manifests:</span>
                  <span className="text-slate-800 font-mono">12 manifests</span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-sky-100 flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">
                ROLLBACK ANCHOR
              </span>
              <span className="material-symbols-outlined text-sky-600 text-[16px]">lock</span>
            </div>
          </div>

          {/* Snapshot 3 (Quarantined) */}
          <div
            onClick={() => setSelectedSnapshot('#4819284719')}
            className={`bg-rose-50/50 border p-5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer relative ${
              selectedSnapshot === '#4819284719' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-rose-200'
            }`}
          >
            <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-sm">
              Partition Isolated
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                  <span className="font-mono text-base font-bold text-rose-700">#4819284719</span>
                </div>
                <span className="text-xs text-slate-500">14:32:01 UTC</span>
              </div>
              <div className="space-y-1.5 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Operation:</span>
                  <span className="font-mono bg-rose-100 text-rose-700 px-2 py-0.5 rounded font-bold">
                    OVERWRITE
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Isolated Nulls:</span>
                  <span className="text-rose-700 font-bold font-mono">14,280 tax_nulls</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Downstream:</span>
                  <span className="text-slate-600">Bypassed Lake</span>
                </div>
              </div>
            </div>
            <div className="pt-3 mt-3 border-t border-rose-200 flex items-center justify-between text-xs">
              <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold">
                QUARANTINED
              </span>
              <span className="material-symbols-outlined text-rose-600 text-[16px]">pause_circle</span>
            </div>
          </div>
        </div>

        {/* Time-Travel Query Console */}
        <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-sky-600 text-[20px]">terminal</span>
              <span className="text-sm font-bold text-slate-900">
                Interactive Iceberg Time-Travel Query Console
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 font-medium">Engine: Trino / Nessie Catalog</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                Execution: {queryExecutionStats.runtime}
              </span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Query Presets:</span>
            <button
              type="button"
              onClick={() => handleSelectPreset('golden')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedPreset === 'golden'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              Verify Golden Snapshot (#4819284718)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('corrupt')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedPreset === 'corrupt'
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              Detect Corruption (#4819284719)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('partitions')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedPreset === 'partitions'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              Table Partitions (.partitions)
            </button>
            <button
              type="button"
              onClick={() => handleSelectPreset('history')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                selectedPreset === 'history'
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
              }`}
            >
              Snapshot Commit History (.history)
            </button>
          </div>

          {/* SQL Editor */}
          <div className="bg-slate-900 rounded-xl p-4 font-mono text-xs text-slate-200 relative group shadow-inner">
            <pre className="text-slate-200 leading-relaxed font-mono whitespace-pre-wrap">
              {queryCode}
            </pre>

            <button
              type="button"
              onClick={handleExecuteQuery}
              disabled={isQueryRunning}
              className="absolute right-4 top-4 px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              {isQueryRunning ? (
                <>
                  <span className="material-symbols-outlined text-[15px] animate-spin">refresh</span>
                  Executing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[15px]">play_arrow</span>
                  Execute Query
                </>
              )}
            </button>
          </div>

          {/* Query Execution Result & Telemetry Stats */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border ${
                  activePresetData.isClean
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border-rose-200'
                }`}>
                  <span className="material-symbols-outlined text-[16px]">
                    {activePresetData.isClean ? 'check_circle' : 'error'}
                  </span>
                  {activePresetData.resultSummary}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                <span>Pruned: <strong className="text-slate-800">{queryExecutionStats.filesPruned}</strong></span>
                <span>·</span>
                <span>Scanned: <strong className="text-slate-800">{queryExecutionStats.bytesScanned}</strong></span>
              </div>
            </div>

            {/* Tabular Output */}
            {activePresetData.rows.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px]">
                      {activePresetData.columns.map((col, idx) => (
                        <th key={idx} className="p-2.5 font-bold">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activePresetData.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 transition-colors">
                        {row.map((val, cIdx) => (
                          <td key={cIdx} className={`p-2.5 ${
                            val === 'NULL' || val.includes('CORRUPT')
                              ? 'text-rose-600 font-bold bg-rose-50/40'
                              : val.includes('GOLD')
                              ? 'text-emerald-700 font-bold'
                              : 'text-slate-700'
                          }`}>
                            {val}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>Verified: Zero records matched `tax_amount IS NULL` filter. Table integrity 100% compliant.</span>
              </div>
            )}
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-200">
            <span className="text-xs text-slate-500">
              Pointer Controls: Instant catalog update with zero table rewrite
            </span>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handlePromoteSnapshot}
                disabled={promoteStatus === 'promoting'}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 active:scale-95 disabled:opacity-70 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">fast_rewind</span>
                {promoteStatus === 'promoting'
                  ? 'Rolling back pointer...'
                  : promoteStatus === 'promoted'
                  ? 'Rolled back to #4819284718!'
                  : 'Promote Snapshot #4819284718'}
              </button>

              <button
                type="button"
                onClick={handleCreateBranch}
                disabled={branchStatus === 'branching'}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all flex items-center gap-2 border border-slate-200 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">fork_right</span>
                {branchStatus === 'branching'
                  ? 'Branching...'
                  : branchStatus === 'created'
                  ? 'Branch fix-tax-reingest Created'
                  : 'Create Branch: fix-tax-reingest'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Lists & Quarantine Buffer Lower Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Column 1: Manifest Lists (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-sky-600 text-[20px]">account_tree</span>
              <h3 className="text-base font-bold text-slate-900">
                Manifest Lists &amp; Data Files (S3)
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">snap-4819284719-1-e49f.avro</span>
          </div>

          <div className="space-y-2">
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                <span className="truncate text-slate-700">s3://lakehouse-gold/.../0001-a9f2.parquet</span>
              </div>
              <span className="text-emerald-700 font-bold shrink-0">22,030 clean</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                <span className="truncate text-slate-700">s3://lakehouse-gold/.../0002-b34e.parquet</span>
              </div>
              <span className="text-emerald-700 font-bold shrink-0">21,810 clean</span>
            </div>

            <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate text-rose-700">
                <span className="material-symbols-outlined text-[16px]">warning</span>
                <span className="truncate font-bold">s3://lakehouse-dlq/.../0003-err-tax.parquet</span>
              </div>
              <span className="text-rose-700 font-bold shrink-0">14,280 NULLs isolated</span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2 truncate">
                <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                <span className="truncate text-slate-700">s3://lakehouse-gold/.../0004-c711.parquet</span>
              </div>
              <span className="text-emerald-700 font-bold shrink-0">22,000 clean</span>
            </div>
          </div>

          {/* Predicate Bounds */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
            <span className="text-xs uppercase font-bold text-slate-400 block">
              Iceberg Column Bounds (`tax_amount`)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Lower</span>
                <span className="font-bold text-emerald-700 font-mono">$0.00 USD</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Upper</span>
                <span className="font-bold text-slate-900 font-mono">$182.40 USD</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Clean Nulls</span>
                <span className="font-bold text-emerald-700 font-mono">0 in gold</span>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-400 block text-[11px]">Quarantined</span>
                <span className="font-bold text-rose-700 font-mono">14,280 in DLQ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Column 2: Quarantine Buffer & Reconciliation (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 p-6 rounded-2xl shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-rose-600 text-[20px]">healing</span>
                <h3 className="text-base font-bold text-slate-900">
                  Quarantine Buffer Reconciliation
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
                ACTIVE REPAIR
              </span>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
              <div>
                <span className="text-xs text-slate-500 uppercase font-semibold">Target Storage Path</span>
                <div className="mt-1 font-mono text-xs text-rose-700 truncate font-semibold">
                  s3://iceberg-dlq/checkout/2025-05-14/
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-800 font-semibold flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[15px] text-sky-600 animate-spin">refresh</span>
                    Syncing with Payment Gateway...
                  </span>
                  <span className="font-bold text-sky-700 font-mono">
                    {syncRateOverridden ? '88%' : '72%'}
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-sky-600 h-full rounded-full transition-all duration-500"
                    style={{ width: syncRateOverridden ? '88%' : '72%' }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1.5 font-mono">
                  <span>{syncRateOverridden ? '12,566 Recovered' : '10,281 Recovered'}</span>
                  <span>{syncRateOverridden ? '1,714 Remaining' : '3,999 Remaining'}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed">
                <strong className="text-slate-900 block mb-1">Atomic COW Swap</strong>
                When repair reaches 100%, Iceberg Catalog performs atomic manifest swap to replace isolated files with zero transaction aborts.
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Lock: ROW_EXCLUSIVE</span>
            <button
              type="button"
              onClick={handleToggleSyncRate}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                syncRateOverridden
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-sm'
              }`}
            >
              {syncRateOverridden ? 'Accelerated (16 Workers)' : 'Boost Gateway Sync Rate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
