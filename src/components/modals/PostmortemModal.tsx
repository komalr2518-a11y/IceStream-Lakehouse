import React, { useState } from 'react';

interface PostmortemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PostmortemModal: React.FC<PostmortemModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    const reportText = `INCIDENT POSTMORTEM REPORT: INC-2025-0514-082
Severity: P1 - CRITICAL (Autonomous Mitigation Succeeded)
Target: prod_lakehouse.checkout_transactions
Agent: IceStream-SelfHeal-v4
Lead Engineer: Sarah Lin (Lead Data Reliability Eng)
Root Cause: AvaTax container timeout leading to 50.42% tax_amount NULL rate in telemetry.orders.checkout.v2.
Circuit Trip Latency: 189 ms
Data Leaked: 0 rows (100% Zero-Leak Guard)
Downstream Protection: $1.42M tax drift saved across 14,160 customer checkout orders.
Golden Snapshot Locked: #4819284718
Catalog Sync: AWS Glue / REST Nessie
Compliance Status: SOC2 Type II Clean Assertion`;
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-emerald-600 text-[24px]">verified</span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                SOC2 / Reliability Incident Postmortem
              </h2>
              <span className="font-mono text-xs text-slate-500">Incident Ticket #INC-2025-0514-082</span>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Severity</span>
              <span className="text-rose-700 font-bold text-sm">P1 CRITICAL</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Time-To-Cut</span>
              <span className="text-emerald-700 font-bold text-sm">189 ms</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Data Leaked</span>
              <span className="text-emerald-700 font-bold text-sm">0 Rows (0%)</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase text-[10px] font-bold">Tax Drift Guarded</span>
              <span className="text-sky-700 font-bold text-sm">$1,420,800 USD</span>
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-1.5">Executive Summary</h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              At 14:32:00 UTC, upstream deployment <code>checkout-api-v2.14</code> introduced an omitted GeoIP lookup dependency resulting in a 50.42% NULL tax rate. Within 189 milliseconds, the IceStream Autonomous Circuit Breaker engaged, diverting corrupt micro-batches to the S3 Quarantine DLQ (<code>s3://lakehouse-quarantine/orders_bad_tax/</code>) while locking the Apache Iceberg commit head at golden snapshot <code>#4819284718</code>. Downstream financial marts and BI consumers served clean cache without exposure to bad data.
            </p>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold uppercase tracking-wider text-xs mb-1.5">Audit Compliance Evidence</h3>
            <div className="bg-slate-900 text-slate-200 font-mono p-4 rounded-xl space-y-1.5 shadow-inner">
              <div className="text-emerald-400">[SOC2-CC7.2] Incident detection within automated SLA: PASS (189ms vs 1000ms SLA)</div>
              <div className="text-emerald-400">[SOC2-CC7.3] Quarantine data segregation in isolated bucket: PASS</div>
              <div className="text-emerald-400">[SOC2-CC6.6] Dual-approver gate for breaker override enforcement: PASS</div>
              <div className="text-emerald-400">[SOC2-CC6.8] ACID rollback guarantee with Apache Iceberg Spec v2: VERIFIED</div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={handleCopy}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold flex items-center gap-2 border border-slate-200 shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            {copied ? 'Copied to Clipboard' : 'Copy Full Postmortem'}
          </button>

          <button
            type="button"
            onClick={() => {
              window.print();
            }}
            className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-all flex items-center gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">print</span>
            Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
