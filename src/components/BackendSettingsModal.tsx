import React, { useState } from 'react';
import {
  X,
  Server,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Sliders,
  Shield,
} from 'lucide-react';
import { ApiConfig } from '../api/client';

interface BackendSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefreshData?: () => void;
}

export const BackendSettingsModal: React.FC<BackendSettingsModalProps> = ({
  isOpen,
  onClose,
  onRefreshData,
}) => {
  const [url, setUrl] = useState(ApiConfig.getBaseUrl() || '');
  const [isLiveEnabled, setIsLiveEnabled] = useState(ApiConfig.isLiveEnabled());
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    ApiConfig.setBaseUrl(url);
    ApiConfig.setLiveEnabled(isLiveEnabled);
    if (onRefreshData) onRefreshData();
    onClose();
  };

  const handleTestConnection = async () => {
    if (!url.trim()) {
      setTestStatus('failed');
      setStatusMessage('Please specify a base URL (e.g. http://localhost:8000 or your deployed FastAPI URL).');
      return;
    }

    setTestStatus('testing');
    setStatusMessage('Pinging FastAPI /api/orgs/org-default/dashboard ...');

    try {
      const cleanUrl = url.replace(/\/$/, '');
      const res = await fetch(`${cleanUrl}/api/orgs/org-default/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test_token',
        },
      });

      if (res.ok) {
        setTestStatus('success');
        setStatusMessage(`Connection verified! Response status: ${res.status}`);
      } else {
        setTestStatus('failed');
        setStatusMessage(`Endpoint returned HTTP ${res.status}. Falling back to local engine.`);
      }
    } catch (err: any) {
      setTestStatus('failed');
      setStatusMessage(
        `Unable to reach host (${err.message}). Local mathematically rigorous mock engine will handle requests seamlessly with is_synthetic: true.`
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#0e1624] border border-[#233147] rounded-xl max-w-lg w-full p-6 shadow-2xl text-xs space-y-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-[#233147]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">External FastAPI Backend Configuration</h3>
              <p className="text-[11px] text-gray-400">Configure connection to your existing Python FAIR/FABRICS backend</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-gray-400 hover:text-white hover:bg-[#1a2538]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notice Card */}
        <div className="p-3 rounded-lg bg-[#142032] border border-[#22334c] space-y-2">
          <div className="flex items-center space-x-2 text-blue-300 font-semibold">
            <Shield className="w-4 h-4" />
            <span>Option A Architecture Compliance</span>
          </div>
          <p className="text-gray-300 leading-relaxed text-[11px]">
            AI Studio operates strictly in <span className="text-white font-semibold">Frontend-only mode</span>.
            All data queries target your FastAPI service via the endpoints specified in the architectural contract.
            When the backend URL is unavailable or unconfigured, the frontend automatically falls back to the
            in-memory mathematical engine with clearly labeled <code className="text-blue-300 font-mono">is_synthetic: true</code> flags.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 font-medium mb-1.5">
              FastAPI Base URL (<code className="text-blue-300">VITE_API_BASE_URL</code>)
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="e.g. https://api.cybereal-enterprise.internal or http://localhost:8000"
              className="w-full bg-[#080d16] border border-[#23334c] rounded-md px-3 py-2 text-white placeholder-gray-600 font-mono text-xs focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-gray-500 mt-1">
              Leave empty to run in standalone local synthetic engine mode.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-md bg-[#111c2c] border border-[#1f2f45]">
            <div>
              <div className="text-white font-medium">Attempt Live API Requests</div>
              <div className="text-[11px] text-gray-400">When enabled, queries will ping the configured base URL</div>
            </div>
            <input
              type="checkbox"
              checked={isLiveEnabled}
              onChange={(e) => setIsLiveEnabled(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Test Status feedback */}
          {testStatus !== 'idle' && (
            <div
              className={`p-3 rounded-md border flex items-start space-x-2 text-[11px] ${
                testStatus === 'success'
                  ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                  : testStatus === 'failed'
                  ? 'bg-amber-950/40 border-amber-800 text-amber-300'
                  : 'bg-blue-950/40 border-blue-800 text-blue-300'
              }`}
            >
              {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
              {testStatus === 'failed' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />}
              {testStatus === 'testing' && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin shrink-0 mt-0.5" />}
              <span className="leading-tight">{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#233147]">
          <button
            onClick={handleTestConnection}
            disabled={testStatus === 'testing'}
            className="px-3 py-1.5 rounded-md bg-[#162438] hover:bg-[#1f314c] border border-[#2b3e59] text-gray-200 font-medium transition-colors"
          >
            {testStatus === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
            >
              Apply Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
