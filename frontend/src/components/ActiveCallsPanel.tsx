import React, { useEffect, useState } from 'react';
import { ActiveCall } from '../types';

interface ActiveCallsPanelProps {
  tenantId: number;
  calls: ActiveCall[];
}

const ActiveCallsPanel: React.FC<ActiveCallsPanelProps> = ({ tenantId, calls }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateDuration = (startTime: string) => {
    const start = new Date(startTime).getTime();
    const now = currentTime.getTime();
    const seconds = Math.floor((now - start) / 1000);
    
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ringing': return 'bg-yellow-100 text-yellow-800';
      case 'answered': return 'bg-green-100 text-green-800';
      case 'hold': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ringing': return '📲';
      case 'answered': return '📞';
      case 'hold': return '⏸️';
      default: return '📱';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Active Calls
          </h2>
          <span className="flex items-center px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-full">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            {calls.length} Live
          </span>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {calls.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500">No active calls</p>
          </div>
        ) : (
          calls.map((call) => (
            <div key={call.id} className="p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{getStatusIcon(call.status)}</span>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">{call.caller_id}</p>
                      <span className="text-gray-400">→</span>
                      <p className="text-gray-600">{call.destination}</p>
                    </div>
                    <div className="flex items-center mt-1 space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(call.status)}`}>
                        {call.status.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        ⏱️ {calculateDuration(call.started_at)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                  </button>
                  <button className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActiveCallsPanel;