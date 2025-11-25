import React, { useState, useRef, useCallback } from 'react';

interface Node {
  id: string;
  type: 'start' | 'greeting' | 'menu' | 'extension' | 'voicemail' | 'hangup';
  position: { x: number; y: number };
  data: {
    label: string;
    audio?: string;
    options?: { [key: string]: string };
    extension?: string;
  };
}

interface Connection {
  from: string;
  to: string;
  label?: string;
}

const IVRFlowBuilder: React.FC<{ tenantId: number }> = ({ tenantId }) => {
  const [nodes, setNodes] = useState<Node[]>([
    {
      id: 'start',
      type: 'start',
      position: { x: 100, y: 50 },
      data: { label: 'Call Start' }
    }
  ]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [dragging, setDragging] = useState<string | null>(null);
  const [connecting, setConnecting] = useState<{ from: string; fromPos: { x: number; y: number } } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const nodeTypes = [
    { type: 'greeting', label: 'Greeting', icon: '🎵', color: 'bg-blue-100 border-blue-300' },
    { type: 'menu', label: 'Menu', icon: '📋', color: 'bg-green-100 border-green-300' },
    { type: 'extension', label: 'Extension', icon: '☎️', color: 'bg-purple-100 border-purple-300' },
    { type: 'voicemail', label: 'Voicemail', icon: '📧', color: 'bg-yellow-100 border-yellow-300' },
    { type: 'hangup', label: 'Hangup', icon: '❌', color: 'bg-red-100 border-red-300' },
  ];

  const addNode = (type: Node['type']) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 300, y: 150 },
      data: {
        label: type.charAt(0).toUpperCase() + type.slice(1),
        ...(type === 'greeting' && { audio: 'welcome.wav' }),
        ...(type === 'menu' && { options: { '1': '', '2': '', '0': '' } }),
        ...(type === 'extension' && { extension: '100' })
      }
    };
    setNodes([...nodes, newNode]);
  };

  const handleMouseDown = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      // Shift + click to start connection
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        setConnecting({ from: nodeId, fromPos: node.position });
      }
    } else {
      setDragging(nodeId);
      setSelectedNode(nodeId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      const node = nodes.find(n => n.id === dragging);
      if (node) {
        setNodes(nodes.map(n => 
          n.id === dragging 
            ? { ...n, position: { x: n.position.x + e.movementX, y: n.position.y + e.movementY } }
            : n
        ));
      }
    }
  };

  const handleMouseUp = (nodeId?: string) => {
    if (connecting && nodeId && nodeId !== connecting.from) {
      setConnections([...connections, { from: connecting.from, to: nodeId }]);
    }
    setDragging(null);
    setConnecting(null);
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === 'start') return; // Can't delete start node
    setNodes(nodes.filter(n => n.id !== nodeId));
    setConnections(connections.filter(c => c.from !== nodeId && c.to !== nodeId));
    setSelectedNode(null);
  };

  const updateNodeData = (nodeId: string, data: Partial<Node['data']>) => {
    setNodes(nodes.map(n => 
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
    ));
  };

  const saveFlow = async () => {
    const flowData = {
      nodes,
      connections,
      tenant_id: tenantId,
      name: 'IVR Flow',
      description: 'Custom IVR flow'
    };
    console.log('Saving flow:', flowData);
    // TODO: Save to API
    alert('Flow saved successfully!');
  };

  const selectedNodeData = nodes.find(n => n.id === selectedNode);

  return (
    <div className="h-screen flex">
      {/* Toolbar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-4">Components</h3>
        <div className="space-y-2">
          {nodeTypes.map((nt) => (
            <button
              key={nt.type}
              onClick={() => addNode(nt.type as Node['type'])}
              className={`w-full p-3 rounded-lg border-2 ${nt.color} hover:shadow-md transition-shadow flex items-center space-x-2`}
            >
              <span className="text-2xl">{nt.icon}</span>
              <span className="font-medium">{nt.label}</span>
            </button>
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={saveFlow}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
          >
            💾 Save Flow
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 bg-gray-50 relative overflow-hidden">
        <div
          ref={canvasRef}
          className="w-full h-full relative"
          onMouseMove={handleMouseMove}
          onMouseUp={() => handleMouseUp()}
          style={{ 
            backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }}
        >
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {connections.map((conn, idx) => {
              const fromNode = nodes.find(n => n.id === conn.from);
              const toNode = nodes.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const x1 = fromNode.position.x + 75;
              const y1 = fromNode.position.y + 30;
              const x2 = toNode.position.x + 75;
              const y2 = toNode.position.y + 30;

              return (
                <g key={idx}>
                  <defs>
                    <marker
                      id={`arrowhead-${idx}`}
                      markerWidth="10"
                      markerHeight="10"
                      refX="9"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
                    </marker>
                  </defs>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#3b82f6"
                    strokeWidth="2"
                    markerEnd={`url(#arrowhead-${idx})`}
                  />
                </g>
              );
            })}
            
            {/* Connection in progress */}
            {connecting && (
              <line
                x1={connecting.fromPos.x + 75}
                y1={connecting.fromPos.y + 30}
                x2={connecting.fromPos.x + 75}
                y2={connecting.fromPos.y + 30}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="5,5"
              />
            )}
          </svg>

          {/* Nodes */}
          {nodes.map((node) => (
            <div
              key={node.id}
              className={`absolute cursor-move rounded-lg shadow-lg border-2 p-3 bg-white transition-all ${
                selectedNode === node.id ? 'ring-4 ring-primary-300' : ''
              }`}
              style={{
                left: node.position.x,
                top: node.position.y,
                width: '150px',
                zIndex: 10
              }}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
              onMouseUp={() => handleMouseUp(node.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">{node.data.label}</span>
                {node.id !== 'start' && (
                  <button
                    onClick={() => deleteNode(node.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {node.type === 'start' && '🟢 Entry Point'}
                {node.type === 'greeting' && `🎵 ${node.data.audio}`}
                {node.type === 'menu' && '📋 DTMF Menu'}
                {node.type === 'extension' && `☎️ Ext ${node.data.extension}`}
                {node.type === 'voicemail' && '📧 Voice Drop'}
                {node.type === 'hangup' && '❌ End Call'}
              </div>
              
              {/* Connection handle */}
              <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full border-2 border-white cursor-pointer hover:scale-110 transition-transform" />
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 text-sm text-gray-600">
          <p className="font-semibold mb-2">💡 Quick Tips:</p>
          <ul className="space-y-1">
            <li>• Drag nodes to reposition</li>
            <li>• Shift + Click to connect nodes</li>
            <li>• Click node to edit properties</li>
            <li>• Click × to delete node</li>
          </ul>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedNodeData && (
        <div className="w-80 bg-white border-l border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Node Properties</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
              <input
                type="text"
                value={selectedNodeData.data.label}
                onChange={(e) => updateNodeData(selectedNode!, { label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {selectedNodeData.type === 'greeting' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Audio File</label>
                <input
                  type="text"
                  value={selectedNodeData.data.audio || ''}
                  onChange={(e) => updateNodeData(selectedNode!, { audio: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="welcome.wav"
                />
              </div>
            )}

            {selectedNodeData.type === 'menu' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Menu Options</label>
                {Object.entries(selectedNodeData.data.options || {}).map(([key, value]) => (
                  <div key={key} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={key}
                      disabled
                      className="w-12 px-2 py-1 border border-gray-300 rounded bg-gray-50 text-center"
                    />
                    <input
                      type="text"
                      value={value}
                      placeholder="Destination"
                      className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                ))}
              </div>
            )}

            {selectedNodeData.type === 'extension' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Extension</label>
                <input
                  type="text"
                  value={selectedNodeData.data.extension || ''}
                  onChange={(e) => updateNodeData(selectedNode!, { extension: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500"
                  placeholder="100"
                />
              </div>
            )}

            <button
              onClick={() => deleteNode(selectedNode!)}
              className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
            >
              🗑️ Delete Node
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default IVRFlowBuilder;