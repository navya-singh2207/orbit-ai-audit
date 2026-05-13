import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Users, Briefcase, Calculator, Loader2 } from 'lucide-react';
import { type ToolInput } from '../services/auditEngine';

interface Props {
  onComplete: (tools: ToolInput[], teamSize: number, useCase: string) => void;
  isSubmitting: boolean;
}

const SUPPORTED_TOOLS = ["Cursor", "GitHub Copilot", "Claude", "ChatGPT", "Anthropic API", "OpenAI API", "Gemini", "v0", "Windsurf"];
const USE_CASES = [
  { id: 'coding', label: 'Software Engineering' },
  { id: 'writing', label: 'Content & Writing' },
  { id: 'data', label: 'Data & Analytics' },
  { id: 'research', label: 'Research & Strategy' },
  { id: 'mixed', label: 'Mixed Team Usage' }
];

export default function AuditForm({ onComplete, isSubmitting }: Props) {
  const [tools, setTools] = useState<ToolInput[]>([
    { name: 'Cursor', plan: 'Pro', monthlySpend: 20, seats: 1 }
  ]);
  const [teamSize, setTeamSize] = useState(1);
  const [useCase, setUseCase] = useState('mixed');

  const addTool = () => {
    setTools([...tools, { name: 'Claude', plan: 'Pro', monthlySpend: 20, seats: 1 }]);
  };

  const removeTool = (index: number) => {
    setTools(tools.filter((_, i) => i !== index));
  };

  const updateTool = (index: number, field: keyof ToolInput, value: any) => {
    const newTools = [...tools];
    newTools[index] = { ...newTools[index], [field]: value };
    setTools(newTools);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('orbit_audit_state', JSON.stringify({ tools, teamSize, useCase }));
    onComplete(tools, teamSize, useCase);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-slate-200/50"
    >
      <form onSubmit={handleSubmit} className="space-y-12">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Your AI Stack</h2>
            <button 
              type="button"
              onClick={addTool}
              className="text-sm font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1 bg-orange-50 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Tool
            </button>
          </div>

          <div className="space-y-4">
            {tools.map((tool, idx) => (
              <motion.div 
                layout
                key={idx} 
                className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group"
              >
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tool</label>
                  <select 
                    value={tool.name}
                    onChange={(e) => updateTool(idx, 'name', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  >
                    {SUPPORTED_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Plan</label>
                  <input 
                    type="text"
                    value={tool.plan}
                    onChange={(e) => updateTool(idx, 'plan', e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                    placeholder="e.g. Pro, Business"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly $</label>
                  <input 
                    type="number"
                    value={tool.monthlySpend}
                    onChange={(e) => updateTool(idx, 'monthlySpend', parseFloat(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Seats</label>
                  <input 
                    type="number"
                    value={tool.seats}
                    onChange={(e) => updateTool(idx, 'seats', parseInt(e.target.value))}
                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-1 flex items-end pb-1.5 justify-end">
                  <button 
                    type="button"
                    onClick={() => removeTool(idx)}
                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Users className="w-5 h-5 text-orange-500" />
              <h3>Team Size</h3>
            </div>
            <input 
              type="range" 
              min="1" 
              max="100" 
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value))}
              className="w-full accent-orange-500 h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs font-bold text-slate-400">
              <span>Solopreneur</span>
              <span className="text-orange-500 bg-orange-50 px-2 py-1 rounded-md">{teamSize} Users</span>
              <span>Large Team</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Briefcase className="w-5 h-5 text-orange-500" />
              <h3>Use Case</h3>
            </div>
            <select 
              value={useCase}
              onChange={(e) => setUseCase(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none"
            >
              {USE_CASES.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </div>
        </div>

        <button
          disabled={isSubmitting || tools.length === 0}
          className="w-full py-5 bg-orange-500 text-white rounded-2xl font-black text-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-orange-100"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Auditing your stack...
            </>
          ) : (
            <>
              <Calculator className="w-6 h-6" />
              Instant Audit
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
