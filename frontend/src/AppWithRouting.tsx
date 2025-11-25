import React, { useState, useEffect } from 'react';
import StatsCard from './components/StatsCard';
import ActiveCallsPanel from './components/ActiveCallsPanel';
import CallVolumeChart from './components/CallVolumeChart';
import IVRFlowBuilder from './components/IVRFlowBuilder';
import CDRReports from './components/CDRReports';
import WebRTCSoftphone from './components/WebRTCSoftphone';
import { tenantAPI } from './services/api';
import { wsService } from './services/websocket';
import { Tenant, ActiveCall } from './types';

type Page = 'dashboard' | 'calls' | 'cdr' | 'ivr' | 'softphone' | 'settings';

function AppWithRouting() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showSoftphone, setShowSoftphone] = useState(false);
  
  const [stats, setStats] = useState({
    totalCalls: 1247,
    activeCalls: 3,
    answeredRate: 92.5,
    avgDuration: 245
  });

  const chartData = [
    { time: '00:00', answered: 12, missed: 2, abandoned: 1 },
    { time: '04:00', answered: 8, missed: 1, abandoned: 0 },
    { time: '08:00', answered: 45, missed: 5, abandoned: 2 },
    { time: '12:00', answered: 67, missed: 8, abandoned: 4 },
    { time: '16:00', answered: 52, missed: 6, abandoned: 3 },
    { time: '20:00', answered: 23, missed: 3, abandoned: 1 },
  ];

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await tenantAPI.getAll();
        setTenants(response.data);
        if (response.data.length > 0) {
          setSelectedTenant(response.data[0]);
        }
      } catch (error) {
        console.error('Failed to fetch tenants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  useEffect(() => {
    if (selectedTenant) {
      wsService.connect(selectedTenant.id);
      
      const unsubscribe = wsService.subscribe((data) => {
        console.log('WebSocket event:', data);
        
        if (data.type === 'call_started') {
          setActiveCalls(prev => [...prev, data.call]);
          setStats(prev => ({ ...prev, activeCalls: prev.activeCalls + 1 }));
        } else if (data.type === 'call_ended') {
          setActiveCalls(prev => prev.filter(call => call.id !== data.call_id));
          setStats(prev => ({ ...prev, activeCalls: Math.max(0, prev.activeCalls - 1) }));
        }
      });

      return () => {
        unsubscribe();
        wsService.disconnect();
      };
    }
  }, [selectedTenant]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (!selectedTenant) return null;

    switch (currentPage) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatsCard
                title="Total Calls Today"
                value={stats.totalCalls}
                icon="📊"
                trend={{ value: 12.5, isPositive: true }}
                color="blue"
              />
              <StatsCard
                title="Active Calls"
                value={stats.activeCalls}
                icon="📞"
                color="green"
              />
              <StatsCard
                title="Answer Rate"
                value={`${stats.answeredRate}%`}
                icon="✅"
                trend={{ value: 3.2, isPositive: true }}
                color="green"
              />
              <StatsCard
                title="Avg Duration"
                value={formatDuration(stats.avgDuration)}
                icon="⏱️"
                trend={{ value: 5.8, isPositive: false }}
                color="yellow"
              />
            </div>

            <ActiveCallsPanel tenantId={selectedTenant.id} calls={activeCalls} />
            <CallVolumeChart data={chartData} />
          </div>
        );

      case 'calls':
        return <ActiveCallsPanel tenantId={selectedTenant.id} calls={activeCalls} />;

      case 'cdr':
        return <CDRReports tenantId={selectedTenant.id} />;

      case 'ivr':
        return <IVRFlowBuilder tenantId={selectedTenant.id} />;

      case 'softphone':
        return (
          <div className="flex items-center justify-center min-h-[600px]">
            <WebRTCSoftphone
              extension="100"
              password="password123"
              sipServer="sip.yourdomain.com"
            />
          </div>
        );

      case 'settings':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings page coming soon...</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="ml-4 text-2xl font-bold text-gray-900">
                📞 IVR Control Center
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={selectedTenant?.id || ''}
                onChange={(e) => {
                  const tenant = tenants.find(t => t.id === Number(e.target.value));
                  if (tenant) setSelectedTenant(tenant);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Tenant...</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowSoftphone(!showSoftphone)}
                className="p-2 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors"
              >
                📞
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">Live</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="mt-5 px-2 space-y-1">
            <NavItem 
              icon="📊" 
              label="Dashboard" 
              active={currentPage === 'dashboard'}
              onClick={() => setCurrentPage('dashboard')}
            />
            <NavItem 
              icon="📞" 
              label="Active Calls" 
              active={currentPage === 'calls'}
              onClick={() => setCurrentPage('calls')}
            />
            <NavItem 
              icon="📋" 
              label="Call History" 
              active={currentPage === 'cdr'}
              onClick={() => setCurrentPage('cdr')}
            />
            <NavItem 
              icon="🎯" 
              label="IVR Flows" 
              active={currentPage === 'ivr'}
              onClick={() => setCurrentPage('ivr')}
            />
            <NavItem 
              icon="☎️" 
              label="Softphone" 
              active={currentPage === 'softphone'}
              onClick={() => setCurrentPage('softphone')}
            />
            <NavItem 
              icon="⚙️" 
              label="Settings" 
              active={currentPage === 'settings'}
              onClick={() => setCurrentPage('settings')}
            />
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {selectedTenant ? (
            renderPage()
          ) : (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No tenant selected</h3>
                <p className="mt-1 text-sm text-gray-500">Select a tenant from the dropdown to get started</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Floating Softphone */}
      {showSoftphone && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="relative">
            <button
              onClick={() => setShowSoftphone(false)}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors z-10"
            >
              ×
            </button>
            <WebRTCSoftphone
              extension="100"
              password="password123"
              sipServer="sip.yourdomain.com"
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    type="button"
    onClick={(e) => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    className={`
      w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
      ${active
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
  >
    <span className="mr-3 text-xl">{icon}</span>
    {label}
  </button>
);

export default AppWithRouting;