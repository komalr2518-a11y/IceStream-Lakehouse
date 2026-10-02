import React, { useState } from 'react';
import { QuarantinedSample } from '../../types';

interface InspectQuarantineModalProps {
  isOpen: boolean;
  onClose: () => void;
  samples: QuarantinedSample[];
}

export const InspectQuarantineModal: React.FC<InspectQuarantineModalProps> = ({
  isOpen,
  onClose,
  samples,
}) => {
  const [selectedSample, setSelectedSample] = useState<QuarantinedSample>(samples[0] || null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-rose-600 text-[24px]">data_table</span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                S3 Dead-Letter Lakehouse Quarantine Inspector
              </h2>
              <span className="font-mono text-xs text-slate-500">
                s3://lakehouse-quarantine/orders_bad_tax/dt=2025-05-18/
              </span>
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

        <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-5 overflow-y-auto">
          {/* List of samples */}
          <div className="md:col-span-5 space-y-2.5">
            <div className="text-xs font-bold uppercase text-slate-400">
              Quarantined Event Records ({samples.length} Samples)
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
              {samples.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSample(s)}
                  className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                    selectedSample?.id === s.id
                      ? 'bg-sky-50 border-sky-400 text-sky-900 shadow-sm'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sky-700 font-bold">{s.orderId}</span>
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                      NULL TAX
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[11px]">
                    <span>{s.customerId}</span>
                    <span className="font-semibold text-slate-700">{s.subtotal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed payload viewer */}
          <div className="md:col-span-7 flex flex-col gap-2.5">
            <div className="text-xs font-bold uppercase text-slate-400">
              Parquet Record Payload &amp; Schema Validation
            </div>

            {selectedSample && (
              <div className="bg-slate-900 rounded-xl p-4 flex-1 font-mono text-xs text-slate-200 overflow-x-auto space-y-2 shadow-inner">
                <div className="text-emerald-400 font-semibold">// Record UUID: {selectedSample.id}</div>
                <div className="text-slate-400">// Timestamp: {selectedSample.eventTime} UTC</div>
                <pre className="text-slate-300 leading-relaxed">
{JSON.stringify(
  {
    schema_version: "2.4.0",
    event_id: selectedSample.id,
    order_id: selectedSample.orderId,
    customer_id: selectedSample.customerId,
    subtotal_usd: selectedSample.subtotal,
    tax_amount: selectedSample.taxAmount,
    tax_rate: null,
    tax_engine_status: "TIMEOUT_FALLBACK_SKIPPED",
    total_amount: selectedSample.total,
    gateway_provider: selectedSample.gateway,
    jurisdiction_code: selectedSample.jurisdiction,
    lakehouse_partition: "dt=2025-05-18/hour=14",
    quarantine_digest: "sha256:7f9914ab0192e4"
  },
  null,
  2
)}
                </pre>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-mono">
              Format: Apache Parquet (v2) · Snappy
            </span>
            <span className="text-slate-300">|</span>
            <button
              type="button"
              onClick={() => {
                const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(samples, null, 2));
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `quarantine_records_${Date.now()}.json`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              Export JSON
            </button>
            <span className="text-slate-300">·</span>
            <button
              type="button"
              onClick={() => {
                const headers = "id,orderId,customerId,eventTime,subtotal,taxAmount,total,status,gateway,jurisdiction\n";
                const rows = samples.map(s => `"${s.id}","${s.orderId}","${s.customerId}","${s.eventTime}","${s.subtotal}","${s.taxAmount || ''}","${s.total}","${s.status}","${s.gateway}","${s.jurisdiction}"`).join("\n");
                const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + rows);
                const downloadAnchor = document.createElement('a');
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute("download", `quarantine_records_${Date.now()}.csv`);
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
              }}
              className="text-xs text-sky-700 hover:text-sky-900 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">table_chart</span>
              Export CSV
            </button>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                alert("Initiated Kafka DLQ re-drive job: 18,492 quarantined records queued for reprocessing into 'checkout.v2.repaired'.");
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">replay</span>
              Re-drive to DLQ
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 shadow-sm cursor-pointer"
            >
              Close Inspector
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
