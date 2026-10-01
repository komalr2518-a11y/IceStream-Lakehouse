import React, { useState } from 'react';
import { AssertionRule } from '../../types';

interface CreateExpectationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRule: (rule: AssertionRule) => void;
}

export const CreateExpectationModal: React.FC<CreateExpectationModalProps> = ({
  isOpen,
  onClose,
  onAddRule,
}) => {
  const [name, setName] = useState('expect_column_values_to_not_be_null');
  const [suite, setSuite] = useState('telemetry_financial_core');
  const [fieldTarget, setFieldTarget] = useState('shipping_fee');
  const [engine, setEngine] = useState('Flink 60s Window');
  const [threshold, setThreshold] = useState('Null Rate < 0.10%');
  const [action, setAction] = useState('Quarantine & Halt Marts');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRule: AssertionRule = {
      id: `rule-${Date.now()}`,
      name,
      suite,
      fieldTarget,
      engine,
      threshold,
      liveValue: '0.00% (Nominal)',
      status: 'PASS',
      action,
      actionIcon: action.includes('Quarantine') ? 'shield_with_heart' : 'notifications',
    };
    onAddRule(newRule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200/90 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden animate-in fade-in duration-150">
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-sky-600 text-[24px]">add_circle</span>
            <h2 className="text-base font-bold text-slate-900">
              Create Great Expectations Rule
            </h2>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg">
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Expectation Type
            </label>
            <select
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:border-sky-500 focus:outline-none"
            >
              <option value="expect_column_values_to_not_be_null">expect_column_values_to_not_be_null</option>
              <option value="expect_column_values_to_be_between">expect_column_values_to_be_between</option>
              <option value="expect_table_schema_match">expect_table_schema_match</option>
              <option value="expect_column_values_to_match_regex">expect_column_values_to_match_regex</option>
              <option value="expect_column_distinct_count">expect_column_distinct_count</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Target Field</label>
              <input
                type="text"
                value={fieldTarget}
                onChange={(e) => setFieldTarget(e.target.value)}
                placeholder="e.g. shipping_fee"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Evaluation Suite</label>
              <input
                type="text"
                value={suite}
                onChange={(e) => setSuite(e.target.value)}
                placeholder="e.g. telemetry_financial_core"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Execution Engine</label>
              <select
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-sky-500 focus:outline-none"
              >
                <option value="Flink 60s Window">Flink 60s Sliding Window</option>
                <option value="Flink Continuous">Flink Continuous Stream</option>
                <option value="Great Expectations">Great Expectations Batch</option>
                <option value="HyperLogLog">HyperLogLog Cardinality</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">Threshold / SLA</label>
              <input
                type="text"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
                placeholder="e.g. Null Rate < 0.10%"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-slate-500 mb-1.5">
              Autonomous Remediation Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-sky-500 focus:outline-none"
            >
              <option value="Quarantine & Halt Marts">Quarantine to S3 DLQ &amp; Halt Lakehouse Commits</option>
              <option value="Alert Slack">Alert Slack (#data-platform-incidents)</option>
              <option value="Auto-Branch Iceberg">Auto-Branch Iceberg in REST Nessie</option>
              <option value="Log Warning">Log Warning &amp; Continue</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-semibold hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-sky-600 text-white font-semibold text-xs hover:bg-sky-700 transition-all shadow-sm"
            >
              Register Rule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
