import React, { useState } from 'react';
import { ObservabilityPlane, QuarantinedSample, AssertionRule, UserProfile } from './types';
import {
  INITIAL_QUARANTINED_SAMPLES,
  ASSERTION_RULES,
  ICEBERG_SNAPSHOTS,
} from './data/mockData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PipelineTopologyScreen } from './components/screens/PipelineTopologyScreen';
import { IcebergTableScreen } from './components/screens/IcebergTableScreen';
import { DataQualityScreen } from './components/screens/DataQualityScreen';
import { IncidentsScreen } from './components/screens/IncidentsScreen';
import { InspectQuarantineModal } from './components/modals/InspectQuarantineModal';
import { CreateExpectationModal } from './components/modals/CreateExpectationModal';
import { PostmortemModal } from './components/modals/PostmortemModal';
import { DocsAndApiModal } from './components/modals/DocsAndApiModal';
import { ClusterConfigModal } from './components/modals/ClusterConfigModal';
import { LoginModal, PRESET_USERS } from './components/auth/LoginModal';

export default function App() {
  const [currentPlane, setCurrentPlane] = useState<ObservabilityPlane>('pipeline-lineage-and-topology');
  const [samples] = useState<QuarantinedSample[]>(INITIAL_QUARANTINED_SAMPLES);
  const [rules, setRules] = useState<AssertionRule[]>(ASSERTION_RULES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(PRESET_USERS[0]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Modals state
  const [isQuarantineModalOpen, setIsQuarantineModalOpen] = useState(false);
  const [isCreateSuiteModalOpen, setIsCreateSuiteModalOpen] = useState(false);
  const [isPostmortemModalOpen, setIsPostmortemModalOpen] = useState(false);
  const [isDocsModalOpen, setIsDocsModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    setIsLoginModalOpen(false);
    showToast(`Signed in successfully as ${user.name} (${user.role}).`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoginModalOpen(true);
    showToast('Signed out of IceStream Lakehouse Console.');
  };

  const handleAddRule = (newRule: AssertionRule) => {
    setRules([newRule, ...rules]);
    showToast(`New Rule "${newRule.name}" registered and deployed to stream.`);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    const q = query.toLowerCase();
    if (q.includes('iceberg') || q.includes('snap') || q.includes('4819') || q.includes('parquet')) {
      setCurrentPlane('iceberg-table-and-time-travel');
    } else if (q.includes('rule') || q.includes('expect') || q.includes('assertion') || q.includes('quality')) {
      setCurrentPlane('data-quality-and-assertions');
    } else if (q.includes('incident') || q.includes('soc2') || q.includes('p1') || q.includes('chronology')) {
      setCurrentPlane('incidents-and-autonomous-healing');
    } else if (q.includes('lineage') || q.includes('kafka') || q.includes('flink') || q.includes('topology')) {
      setCurrentPlane('pipeline-lineage-and-topology');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans antialiased selection:bg-sky-500/20 selection:text-sky-700">
      {/* Toast banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-xl text-xs text-slate-800 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
          <span className="font-medium">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-slate-700 ml-2 p-1 rounded-md"
          >
            <span className="material-symbols-outlined text-[14px]">close</span>
          </button>
        </div>
      )}

      {/* Global Application Header */}
      <Header
        currentPlane={currentPlane}
        onSelectPlane={(plane) => setCurrentPlane(plane)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onOpenIncident={() => setCurrentPlane('incidents-and-autonomous-healing')}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Sidebar Navigation */}
      <Sidebar
        currentPlane={currentPlane}
        onSelectPlane={(plane) => setCurrentPlane(plane)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onOpenDocs={() => setIsDocsModalOpen(true)}
        onOpenConfig={() => setIsConfigModalOpen(true)}
      />

      {/* Main Observatory Content Viewport with Roomy Spacing */}
      <div className="md:pl-72">
        <main className="relative w-full pt-20 px-5 md:px-8 bg-[#f8fafc] min-h-[calc(100vh-64px)]">
          {currentPlane === 'pipeline-lineage-and-topology' && (
            <PipelineTopologyScreen
              samples={samples}
              onOpenSampleModal={() => setIsQuarantineModalOpen(true)}
              onNavigateToIceberg={() => setCurrentPlane('iceberg-table-and-time-travel')}
              onNavigateToQuality={() => setCurrentPlane('data-quality-and-assertions')}
              onNavigateToIncidents={() => setCurrentPlane('incidents-and-autonomous-healing')}
            />
          )}

          {currentPlane === 'iceberg-table-and-time-travel' && (
            <IcebergTableScreen
              snapshots={ICEBERG_SNAPSHOTS}
              onRollbackGolden={() => {
                showToast("Catalog pointer rolled back to Golden Snapshot #4819284718.");
              }}
            />
          )}

          {currentPlane === 'data-quality-and-assertions' && (
            <DataQualityScreen
              rules={rules}
              onCreateSuite={() => setIsCreateSuiteModalOpen(true)}
              onImportYaml={() => {
                showToast("Imported 12 Great Expectations assertion suites from Lakehouse CI/CD.");
              }}
              onSimulate={() => {
                showToast("Triggered micro-batch assertion simulation runner.");
              }}
            />
          )}

          {currentPlane === 'incidents-and-autonomous-healing' && (
            <IncidentsScreen
              samples={samples}
              onOpenPostmortem={() => setIsPostmortemModalOpen(true)}
              onApproveSnapshot={() => {
                showToast("Autonomous snapshot validation approved. Downstream caches synced.");
              }}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={handleLogin}
      />

      <InspectQuarantineModal
        isOpen={isQuarantineModalOpen}
        onClose={() => setIsQuarantineModalOpen(false)}
        samples={samples}
      />

      <CreateExpectationModal
        isOpen={isCreateSuiteModalOpen}
        onClose={() => setIsCreateSuiteModalOpen(false)}
        onAddRule={handleAddRule}
      />

      <PostmortemModal
        isOpen={isPostmortemModalOpen}
        onClose={() => setIsPostmortemModalOpen(false)}
      />

      <DocsAndApiModal
        isOpen={isDocsModalOpen}
        onClose={() => setIsDocsModalOpen(false)}
      />

      <ClusterConfigModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
      />
    </div>
  );
}
