import React from 'react';

interface DocsAndApiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DocsAndApiModal: React.FC<DocsAndApiModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-sky-600 text-[24px]">description</span>
            <h2 className="text-base font-bold text-slate-900">
              IceStream Developer Docs &amp; Telemetry APIs
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 space-y-4 font-mono text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-slate-900 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              REST Catalog Query Endpoint
            </h3>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
              GET /v1/catalogs/lakehouse-prod/namespaces/prod_lakehouse/tables/checkout_transactions
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              Flink Assertion Webhook Callback
            </h3>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-800">
              POST /v1/assertions/stream-trip<br />
              Headers: X-IceStream-Signature, Content-Type: application/json
            </div>
          </div>

          <div>
            <h3 className="text-slate-900 font-bold uppercase tracking-wider text-[11px] mb-1.5">
              PySpark / Trino Time-Travel Code Sample
            </h3>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl leading-relaxed shadow-inner">
{`from pyspark.sql import SparkSession

spark = SparkSession.builder \\
    .appName("IcebergTimeTravelAudit") \\
    .config("spark.sql.catalog.prod", "org.apache.iceberg.spark.SparkCatalog") \\
    .config("spark.sql.catalog.prod.type", "rest") \\
    .getOrCreate()

# Query Golden Baseline (#4819284718)
df_clean = spark.read \\
    .option("snapshot-id", 4819284718) \\
    .table("prod.prod_lakehouse.checkout_transactions")

print(f"Clean rows verified: {df_clean.count()}")`}
            </pre>
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
