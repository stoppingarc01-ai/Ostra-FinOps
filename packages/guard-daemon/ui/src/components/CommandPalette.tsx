import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Zap,
  Activity,
  Calendar,
  Settings,
  UserCheck,
  Copy,
  Check,
  Filter,
  RefreshCw,
  Terminal,
} from 'lucide-react';

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  onFilterProvider?: (provider: string) => void;
  onReconnect?: () => void;
}

interface CommandItem {
  id: string;
  category: 'Navigation' | 'Quick Actions' | 'Filters';
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onFilterProvider,
  onReconnect,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
      onClose();
    }, 1000);
  };

  const allCommands: CommandItem[] = [
    // Navigation
    {
      id: 'nav-models',
      category: 'Navigation',
      title: 'Live Monitor & Traces',
      description: 'View real-time stream of incoming AI calls and latency',
      icon: Activity,
      action: () => {
        onNavigate('models');
        onClose();
      },
    },
    {
      id: 'nav-analytics',
      category: 'Navigation',
      title: 'Analytics & Spend Cockpit',
      description: 'Inspect spend trends, model breakdown, and token burn',
      icon: Zap,
      action: () => {
        onNavigate('analytics');
        onClose();
      },
    },
    {
      id: 'nav-calendar',
      category: 'Navigation',
      title: 'Calendar & Tasks',
      description: 'Developer task manager, scheduled refactors, and token limits',
      icon: Calendar,
      action: () => {
        onNavigate('calendar');
        onClose();
      },
    },
    {
      id: 'nav-account',
      category: 'Navigation',
      title: 'Account & Cloud Pairing',
      description: 'Local machine identity, gateway status, and virtual keys',
      icon: UserCheck,
      action: () => {
        onNavigate('account');
        onClose();
      },
    },
    {
      id: 'nav-settings',
      category: 'Navigation',
      title: 'Daemon Settings',
      description: 'Configure budgets, ports, upstream keys, and telemetry',
      icon: Settings,
      action: () => {
        onNavigate('settings');
        onClose();
      },
    },

    // Quick Actions
    {
      id: 'action-copy-openai',
      category: 'Quick Actions',
      title: 'Copy OpenAI Base URL',
      description: 'http://127.0.0.1:8080/v1 (Paste into Cursor / OpenAI SDK)',
      icon: Terminal,
      action: () => copyToClipboard('http://127.0.0.1:8080/v1', 'OpenAI Base URL copied!'),
    },
    {
      id: 'action-copy-anthropic',
      category: 'Quick Actions',
      title: 'Copy Anthropic Base URL',
      description: 'http://127.0.0.1:8080 (Paste into Cline / Claude Dev)',
      icon: Terminal,
      action: () => copyToClipboard('http://127.0.0.1:8080', 'Anthropic Base URL copied!'),
    },
    {
      id: 'action-reconnect',
      category: 'Quick Actions',
      title: 'Reconnect SSE Event Stream',
      description: 'Re-establish realtime broker connection',
      icon: RefreshCw,
      action: () => {
        onReconnect?.();
        onClose();
      },
    },

    // Filters
    {
      id: 'filter-openai',
      category: 'Filters',
      title: 'Filter: OpenAI Calls',
      description: 'Show only GPT-4o, o1, and OpenAI completions',
      icon: Filter,
      action: () => {
        onFilterProvider?.('openai');
        onNavigate('models');
        onClose();
      },
    },
    {
      id: 'filter-anthropic',
      category: 'Filters',
      title: 'Filter: Anthropic Calls',
      description: 'Show only Claude 3.7 Sonnet, Haiku, and Opus messages',
      icon: Filter,
      action: () => {
        onFilterProvider?.('anthropic');
        onNavigate('models');
        onClose();
      },
    },
  ];

  const filteredCommands = allCommands.filter((cmd) => {
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.description && cmd.description.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault();
          onClose(); // Will be toggled by caller
        }
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-charcoal-950/60 backdrop-blur-sm animate-fade-in font-sans">
      <div
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#EAE4D8] overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#F0ECE1] gap-3">
          <Search className="w-5 h-5 text-charcoal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search views, or copy endpoints..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-charcoal-900 placeholder:text-charcoal-400 font-medium"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold text-charcoal-500 bg-[#F5F2EB] rounded border border-[#EAE4D8]">
            ESC
          </kbd>
        </div>

        {/* Feedback message */}
        {copiedText && (
          <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center gap-2 text-xs font-semibold text-emerald-800">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{copiedText}</span>
          </div>
        )}

        {/* Command list */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-transparent">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-charcoal-400 text-xs">
              No matching commands or actions found.
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={cmd.id}
                  onClick={() => cmd.action()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0C2419] text-white'
                      : 'text-charcoal-800 hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-white/10 text-white'
                        : 'bg-[#F5F2EB] text-[#0C2419]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold tracking-tight truncate">
                        {cmd.title}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                          isSelected
                            ? 'bg-white/20 text-white/90'
                            : 'bg-[#F0ECE1] text-charcoal-500'
                        }`}
                      >
                        {cmd.category}
                      </span>
                    </div>
                    {cmd.description && (
                      <p
                        className={`text-[11px] truncate mt-0.5 ${
                          isSelected ? 'text-white/70' : 'text-charcoal-400'
                        }`}
                      >
                        {cmd.description}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#FAF8F5] border-t border-[#F0ECE1] flex items-center justify-between text-[11px] text-charcoal-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono bg-white border border-[#EAE4D8] px-1 rounded text-[10px]">↑</kbd>{' '}
              <kbd className="font-mono bg-white border border-[#EAE4D8] px-1 rounded text-[10px]">↓</kbd> to navigate
            </span>
            <span>
              <kbd className="font-mono bg-white border border-[#EAE4D8] px-1 rounded text-[10px]">↵</kbd> to select
            </span>
          </div>
          <span className="font-mono text-[10px]">OsterdOps Command Bar</span>
        </div>
      </div>
    </div>
  );
};
