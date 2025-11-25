import React, { useState } from 'react';
import { Tenant } from '../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  tenants: Tenant[];
  selectedTenant: Tenant | null;
  onTenantChange: (tenant: Tenant) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  tenants,
  selectedTenant,
  onTenantChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="ml-4 text-2xl font-bold text-gray-900">
                📞 IVR Control Center
              </h1>
            </div>
            
            {/* Tenant Selector */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedTenant?.id || ''}
                onChange={(e) => {
                  const tenant = tenants.find(t => t.id === Number(e.target.value));
                  if (tenant) onTenantChange(tenant);
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
        {sidebarOpen && (
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
            <nav className="mt-5 px-2 space-y-1">
              <NavItem icon="📊" label="Dashboard" active />
              <NavItem icon="📞" label="Active Calls" />
              <NavItem icon="📋" label="Call History" />
              <NavItem icon="🎯" label="IVR Flows" />
              <NavItem icon="📈" label="Analytics" />
              <NavItem icon="⚙️" label="Settings" />
            </nav>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 p-6">
          {selectedTenant ? (
            children
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
    </div>
  );
};

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active }) => (
  <a
    href="#"
    className={`
      group flex items-center px-2 py-2 text-sm font-medium rounded-md
      ${active
        ? 'bg-primary-50 text-primary-700'
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }
    `}
  >
    <span className="mr-3 text-xl">{icon}</span>
    {label}
  </a>
);

export default DashboardLayout;