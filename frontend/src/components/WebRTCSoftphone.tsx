import React, { useState, useEffect, useRef } from 'react';

interface WebRTCSoftphoneProps {
  extension: string;
  password: string;
  sipServer: string;
}

type CallState = 'idle' | 'connecting' | 'ringing' | 'incall' | 'hold';

const WebRTCSoftphone: React.FC<WebRTCSoftphoneProps> = ({ extension, password, sipServer }) => {
  const [callState, setCallState] = useState<CallState>('idle');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [registered, setRegistered] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{ number: string; name: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Simulated registration on mount
  useEffect(() => {
    // In production, initialize JsSIP or SIP.js here
    setTimeout(() => {
      setRegistered(true);
      console.log('📞 SIP Registered:', extension);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (callState === 'incall') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callState]);

  const handleDigit = (digit: string) => {
    if (callState === 'idle') {
      setPhoneNumber(prev => prev + digit);
    } else if (callState === 'incall') {
      // Send DTMF
      console.log('Sending DTMF:', digit);
    }
  };

  const makeCall = () => {
    if (!phoneNumber) return;
    console.log('📞 Calling:', phoneNumber);
    setCallState('connecting');
    
    // Simulate connection
    setTimeout(() => setCallState('ringing'), 500);
    setTimeout(() => setCallState('incall'), 2000);
  };

  const answerCall = () => {
    console.log('📞 Answering call from:', incomingCall?.number);
    setCallState('incall');
    setIncomingCall(null);
  };

  const hangupCall = () => {
    console.log('📴 Hanging up');
    setCallState('idle');
    setPhoneNumber('');
    setIncomingCall(null);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log('🎤 Mute:', !isMuted);
  };

  const toggleHold = () => {
    if (callState === 'incall') {
      setCallState('hold');
      console.log('⏸️ Call on hold');
    } else if (callState === 'hold') {
      setCallState('incall');
      console.log('▶️ Call resumed');
    }
  };

  const handleBackspace = () => {
    setPhoneNumber(prev => prev.slice(0, -1));
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Simulate incoming call (for demo)
  const simulateIncomingCall = () => {
    setIncomingCall({ number: '+1234567890', name: 'John Doe' });
    setCallState('ringing');
  };

  return (
    <div className="w-96 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl p-6 text-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${registered ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
          <span className="text-sm font-medium">{registered ? 'Online' : 'Offline'}</span>
        </div>
        <div className="text-sm text-gray-400">Ext {extension}</div>
      </div>

      {/* Display */}
      <div className="bg-black/30 rounded-xl p-6 mb-6 min-h-[120px] flex flex-col items-center justify-center">
        {callState === 'idle' && (
          <>
            <input
              type="text"
              value={phoneNumber}
              readOnly
              placeholder="Enter number"
              className="w-full bg-transparent text-center text-3xl font-light text-white border-none outline-none mb-2"
            />
            <div className="text-sm text-gray-400">Ready to dial</div>
          </>
        )}

        {callState === 'connecting' && (
          <>
            <div className="text-2xl mb-2">{phoneNumber}</div>
            <div className="text-sm text-yellow-400 animate-pulse">Connecting...</div>
          </>
        )}

        {callState === 'ringing' && (
          <>
            {incomingCall ? (
              <>
                <div className="text-2xl mb-1">{incomingCall.name}</div>
                <div className="text-lg text-gray-400 mb-2">{incomingCall.number}</div>
                <div className="text-sm text-green-400 animate-pulse">Incoming call...</div>
              </>
            ) : (
              <>
                <div className="text-2xl mb-2">{phoneNumber}</div>
                <div className="text-sm text-blue-400 animate-pulse">Ringing...</div>
              </>
            )}
          </>
        )}

        {(callState === 'incall' || callState === 'hold') && (
          <>
            <div className="text-2xl mb-2">{phoneNumber || incomingCall?.number}</div>
            <div className="text-3xl font-mono mb-1">{formatDuration(callDuration)}</div>
            <div className={`text-sm ${callState === 'hold' ? 'text-yellow-400' : 'text-green-400'}`}>
              {callState === 'hold' ? '⏸️ On Hold' : '✓ Connected'}
            </div>
          </>
        )}
      </div>

      {/* Call Controls (when in call) */}
      {(callState === 'incall' || callState === 'hold') && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-xl transition-all ${
              isMuted ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="text-2xl mb-1">{isMuted ? '🎤' : '🔇'}</div>
            <div className="text-xs">{isMuted ? 'Unmute' : 'Mute'}</div>
          </button>

          <button
            onClick={toggleHold}
            className={`p-4 rounded-xl transition-all ${
              callState === 'hold' ? 'bg-yellow-500' : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            <div className="text-2xl mb-1">{callState === 'hold' ? '▶️' : '⏸️'}</div>
            <div className="text-xs">{callState === 'hold' ? 'Resume' : 'Hold'}</div>
          </button>

          <button
            className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
          >
            <div className="text-2xl mb-1">📞</div>
            <div className="text-xs">Transfer</div>
          </button>
        </div>
      )}

      {/* Incoming Call Actions */}
      {callState === 'ringing' && incomingCall && (
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={answerCall}
            className="p-4 rounded-xl bg-green-500 hover:bg-green-600 transition-all"
          >
            <div className="text-2xl mb-1">📞</div>
            <div className="text-sm font-medium">Answer</div>
          </button>
          <button
            onClick={hangupCall}
            className="p-4 rounded-xl bg-red-500 hover:bg-red-600 transition-all"
          >
            <div className="text-2xl mb-1">📵</div>
            <div className="text-sm font-medium">Decline</div>
          </button>
        </div>
      )}

      {/* Dialpad */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((digit) => (
          <button
            key={digit}
            onClick={() => handleDigit(digit)}
            className="aspect-square bg-white/10 hover:bg-white/20 rounded-xl transition-all active:scale-95 flex flex-col items-center justify-center"
          >
            <div className="text-2xl font-medium">{digit}</div>
            {digit !== '*' && digit !== '#' && (
              <div className="text-xs text-gray-400 mt-1">
                {['', 'ABC', 'DEF', 'GHI', 'JKL', 'MNO', 'PQRS', 'TUV', 'WXYZ'][parseInt(digit)] || ''}
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        {callState === 'idle' && (
          <>
            <button
              onClick={handleBackspace}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all"
            >
              <div className="text-xl">⌫</div>
            </button>
            <button
              onClick={makeCall}
              disabled={!phoneNumber}
              className="p-4 rounded-xl bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed transition-all"
            >
              <div className="text-2xl">📞</div>
            </button>
            <button
              onClick={simulateIncomingCall}
              className="p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-all text-xs"
            >
              Test Call
            </button>
          </>
        )}

        {(callState === 'connecting' || callState === 'ringing' || callState === 'incall' || callState === 'hold') && (
          <>
            <div />
            <button
              onClick={hangupCall}
              className="p-4 rounded-xl bg-red-500 hover:bg-red-600 transition-all col-span-1"
            >
              <div className="text-2xl">📵</div>
            </button>
            <div />
          </>
        )}
      </div>

      {/* Volume Control */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center space-x-3">
          <span className="text-xl">🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={(e) => setVolume(parseInt(e.target.value))}
            className="flex-1 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-sm text-gray-400 w-12 text-right">{volume}%</span>
        </div>
      </div>

      {/* Hidden audio element for ringtones */}
      <audio ref={audioRef} />
    </div>
  );
};

export default WebRTCSoftphone;