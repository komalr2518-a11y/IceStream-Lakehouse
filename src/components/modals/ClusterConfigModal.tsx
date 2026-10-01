import React from 'react';

interface ClusterConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClusterConfigModal: React.FC<ClusterConfigModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-sky-600 text-[24px]">settings</span>
            <h2 className="text-base font-bold text-slate-900">
              Cluster Infrastructure &amp; Engine Topology
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs text-slate-700">
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400">Region / Cloud</span>
            <span className="text-slate-900 font-semibold">AWS us-east-1 (N. Virginia)</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400">Apache Flink Cluster</span>
            <span className="text-emerald-700 font-semibold">128 TaskManagers (1,024 Slots)</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400">Kafka Broker Cluster</span>
            <span className="text-sky-700 font-semibold">MSK Dedicated (v3.5.1) · 32 Partitions</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400">Apache Iceberg Catalog</span>
            <span className="text-slate-900 font-semibold">Project Nessie REST / AWS Glue 0.14</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400">Quarantine DLQ Bucket</span>
            <span className="text-rose-700 font-semibold">s3://lakehouse-quarantine/</span>
          </div>
          <div className="flex justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-400">Watermark Evaluation</span>
            <span className="text-slate-900 font-semibold">1,000 ms sliding window</span>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 shadow-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
