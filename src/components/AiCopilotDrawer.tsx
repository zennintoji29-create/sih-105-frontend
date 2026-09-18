import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  HelpCircle,
  TrendingDown,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { NavigationPage, AiQueryResponse } from '../types';
import { ApiClient } from '../api/client';

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePage?: NavigationPage;
  selectedScenarioId?: string;
  activeScenarioId?: string;
  onNavigateToView?: (view: NavigationPage) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  timestamp: string;
  responsePayload?: AiQueryResponse;
}

export const AiCopilotDrawer: React.FC<AiCopilotDrawerProps> = ({
  isOpen,
  onClose,
  activePage = 'dashboard',
  selectedScenarioId,
  activeScenarioId,
  onNavigateToView,
}) => {
  const currentScenarioId = activeScenarioId || selectedScenarioId || 'SC-04';
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'copilot',
      text: 'Welcome to CyberEAL Risk Copilot. I provide quantitative, deterministic answers grounded in our FAIR v3.2 loss exceedance engine, GPD extreme value models, and Monte Carlo runs.',
      timestamp: 'Active Session',
      responsePayload: {
        intent: 'EAL_LOOKUP',
        answer_text:
          'Ask me about current EAL figures, variance attribution, SPoF concentration, or simulate counterfactual security control budgets.',
        citations: ['FAIR v3.2 Engine', 'Monte Carlo Distribution', 'Clayton Copula Matrix'],
        is_fallback: false,
        is_synthetic: true,
      },
    },
  ]);

  const quickPrompts = [
    { label: 'Total EAL & VaR', q: 'What is our current total EAL and 95% VaR?' },
    { label: 'Attribution Feed', q: 'Explain recent change attribution drivers.' },
    { label: 'SPoF Vendors', q: 'Which vendors represent single points of failure?' },
    { label: 'PAM Counterfactual', q: 'Simulate counterfactual $500k investment in PAM.' },
    { label: 'Portfolio Optimization', q: 'How should we optimize our control portfolio?' },
    { label: 'Snowflake Profile', q: 'Show risk profile for Snowflake Inc.' },
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const { data } = await ApiClient.queryAiCopilot({
        query: text,
        page: activePage,
        scenario_id: currentScenarioId,
      });

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'copilot',
        text: data.answer_text,
        timestamp: 'Just now',
        responsePayload: data,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      const errBotMsg: ChatMessage = {
        id: `bot-err-${Date.now()}`,
        sender: 'copilot',
        text: 'An error occurred while evaluating the query against the FAIR engine.',
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, errBotMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-[#0c1421] border-l border-[#202f45] shadow-2xl z-50 flex flex-col transition-transform animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-[#202f45] flex items-center justify-between bg-[#0e1726]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-white">AI Risk Copilot</h3>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 border border-blue-800 text-blue-300 font-mono">
                Deterministic
              </span>
            </div>
            <p className="text-[10px] text-gray-400">
              Context: <span className="font-mono text-gray-300">{activePage}</span> | Scenario:{' '}
              <span className="font-mono text-gray-300">{selectedScenarioId}</span>
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-[#18253a] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Whitelist Guardrail Notice */}
      <div className="px-4 py-2 bg-blue-950/40 border-b border-blue-900/40 text-[11px] text-blue-300 flex items-center justify-between">
        <span className="flex items-center space-x-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Strict Intent Whitelist Active</span>
        </span>
        <span className="font-mono text-[10px] text-blue-400/80">6/6 Domains</span>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-lg p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-none shadow-md shadow-blue-600/20'
                  : 'bg-[#141f30] text-gray-200 border border-[#23334a] rounded-bl-none'
              }`}
            >
              {msg.text}

              {/* Rich Response Payload Data */}
              {msg.responsePayload && !msg.responsePayload.is_fallback && (
                <div className="mt-2.5 pt-2 border-t border-[#23334a]/80 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] text-blue-300">
                    <span className="font-semibold uppercase tracking-wider font-mono">
                      Intent: {msg.responsePayload.intent}
                    </span>
                    <span className="text-gray-400">FAIR Audited</span>
                  </div>

                  {msg.responsePayload.citations && msg.responsePayload.citations.length > 0 && (
                    <div className="text-[10px] text-gray-400 flex flex-wrap gap-1 mt-1">
                      <span className="text-gray-500">Proofs:</span>
                      {msg.responsePayload.citations.map((c, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.2 rounded bg-[#0b121c] border border-[#1b2738] text-gray-300 font-mono"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Fallback Notice if triggered */}
              {msg.responsePayload?.is_fallback && (
                <div className="mt-2 p-2 rounded bg-amber-950/40 border border-amber-800/50 text-[10px] text-amber-300 flex items-start space-x-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                  <span>
                    Out of domain: Copilot only handles financial quantification, change attribution,
                    and counterfactual ROSI questions.
                  </span>
                </div>
              )}
            </div>
            <span className="text-[9px] text-gray-500 mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-2 text-xs text-blue-400 p-2">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            <span>Consulting FAIR engine & Monte Carlo quantiles...</span>
          </div>
        )}
      </div>

      {/* Suggested Chips */}
      <div className="p-3 border-t border-[#1b283b] bg-[#09101b] space-y-2">
        <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
          Suggested Inquiries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p.q)}
              className="text-[11px] px-2 py-1 rounded bg-[#131e2e] hover:bg-[#1c2c42] border border-[#22334b] text-gray-300 hover:text-white transition-all text-left"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-3 border-t border-[#202f45] bg-[#0c1421]">
        <div className="relative">
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask anything about EAL, variance attribution, SPoFs, or counterfactuals..."
            rows={2}
            className="w-full bg-[#111a28] border border-[#24364f] rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!query.trim() || loading}
            className="absolute right-2 bottom-2.5 p-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
        <p className="text-[9px] text-gray-500 text-center mt-1.5 font-mono">
          All numeric outputs strictly bind to verified FAIR parameters. No hallucinated figures.
        </p>
      </div>
    </div>
  );
};
