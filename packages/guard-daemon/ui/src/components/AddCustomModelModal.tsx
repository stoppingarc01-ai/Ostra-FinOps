import React, { useState } from 'react';
import { X, Sparkles, Check } from 'lucide-react';

export interface CustomModelData {
  id: string;
  name: string;
  provider: string;
  description: string;
  inputPrice: string;
  outputPrice: string;
  contextWindow: string;
  capabilities: string[];
  status: 'Active' | 'Disabled';
  recommended?: boolean;
}

interface AddCustomModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (model: CustomModelData) => void;
}

const AVAILABLE_CAPABILITIES = [
  'Text',
  'Vision',
  'Tools',
  'Reasoning',
  'Audio',
  'Multimodal',
  'Code execution',
  'JSON mode',
];

const POPULAR_PROVIDERS = [
  'OpenAI',
  'Anthropic',
  'Google Gemini',
  'DeepSeek',
  'Grok',
  'Kimi',
  'Qwen',
  'GLM',
  'Meta',
  'Mistral',
];

export const AddCustomModelModal: React.FC<AddCustomModelModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('OpenAI');
  const [description, setDescription] = useState('');
  const [inputPrice, setInputPrice] = useState('0.002');
  const [outputPrice, setOutputPrice] = useState('0.008');
  const [contextWindow, setContextWindow] = useState('128K');
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([
    'Text',
    'Tools',
  ]);
  const [isRecommended, setIsRecommended] = useState(false);

  if (!isOpen) return null;

  const toggleCapability = (cap: string) => {
    setSelectedCapabilities((prev) =>
      prev.includes(cap) ? prev.filter((c) => c !== cap) : [...prev, cap]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newModel: CustomModelData = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: name.trim(),
      provider,
      description: description.trim() || 'Custom managed model configuration.',
      inputPrice: inputPrice.startsWith('$') ? inputPrice : `$${inputPrice} / 1K`,
      outputPrice: outputPrice.startsWith('$') ? outputPrice : `$${outputPrice} / 1K`,
      contextWindow: contextWindow.toUpperCase().endsWith('K') || contextWindow.toUpperCase().endsWith('M')
        ? contextWindow.toUpperCase()
        : `${contextWindow}K`,
      capabilities: selectedCapabilities.length > 0 ? selectedCapabilities : ['Text'],
      status: 'Active',
      recommended: isRecommended,
    };

    onAdd(newModel);
    onClose();
    setName('');
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-white border border-[#EAE4D8] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EAE4D8] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E5F2EB] flex items-center justify-center text-[#0C2419]">
              <Sparkles className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-charcoal-900 leading-tight">
                Add Custom Model
              </h3>
              <p className="text-xs text-charcoal-500">
                Register a new AI model with customized pricing and capabilities
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-charcoal-400 hover:text-charcoal-700 hover:bg-[#F5F2EB] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Model Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Llama 3.3 70B"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Provider *
              </label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all"
              >
                {POPULAR_PROVIDERS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1">
              Description
            </label>
            <input
              type="text"
              placeholder="e.g. Best performance for coding and complex tool use"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Input Price ($/1K)
              </label>
              <input
                type="text"
                placeholder="0.0025"
                value={inputPrice}
                onChange={(e) => setInputPrice(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Output Price ($/1K)
              </label>
              <input
                type="text"
                placeholder="0.01"
                value={outputPrice}
                onChange={(e) => setOutputPrice(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-charcoal-700 mb-1">
                Context Window
              </label>
              <input
                type="text"
                placeholder="128K"
                value={contextWindow}
                onChange={(e) => setContextWindow(e.target.value)}
                className="w-full bg-[#FAF8F5] border border-[#EAE4D8] rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-[#0C2419] focus:bg-white transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-charcoal-700 mb-1.5">
              Capabilities
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CAPABILITIES.map((cap) => {
                const isSelected = selectedCapabilities.includes(cap);
                return (
                  <button
                    key={cap}
                    type="button"
                    onClick={() => toggleCapability(cap)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer border ${
                      isSelected
                        ? 'bg-[#0C2419] text-white border-[#0C2419]'
                        : 'bg-[#FAF8F5] text-charcoal-600 border-[#EAE4D8] hover:bg-[#F5F2EB]'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{cap}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isRecommended"
              checked={isRecommended}
              onChange={(e) => setIsRecommended(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 border-[#EAE4D8] focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="isRecommended" className="text-xs font-medium text-charcoal-700 cursor-pointer">
              Mark as Recommended model
            </label>
          </div>

          <div className="pt-3 border-t border-[#EAE4D8] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-charcoal-600 hover:bg-[#FAF8F5] hover:text-charcoal-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0C2419] hover:bg-[#143B2A] text-white transition-all shadow-xs cursor-pointer"
            >
              Add Model
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
