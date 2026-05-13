import { motion } from 'motion/react';
import { TrendingDown, Share2, ArrowRight, Sparkles, AlertCircle, Quote } from 'lucide-react';
import { type AuditResult } from '../services/auditEngine';
import { formatCurrency, cn } from '../lib/utils';
import LeadCapture from './LeadCapture';

interface Props {
  result: AuditResult;
  summary: string | null;
  auditId: string;
  onCapture: () => void;
}

export default function AuditResults({ result, summary, auditId, onCapture }: Props) {
  const isHighSavings = result.totalMonthlySavings > 500;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-12 pb-24"
    >
      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
             <TrendingDown className="w-32 h-32" />
          </div>
          <div className="space-y-2 relative">
            <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Monthly Savings</h3>
            <div className="text-6xl font-black text-orange-500">
              {formatCurrency(result.totalMonthlySavings)}
            </div>
            <p className="text-slate-400 text-sm">
               {formatCurrency(result.totalAnnualSavings)} potential annual reduction
            </p>
          </div>
          <div className="pt-8 relative">
            <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs font-bold">
               <Sparkles className="w-3 h-3 text-orange-400" />
               {result.isOptimal ? "Your stack is efficient!" : "Optimization opportunities found"}
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-8 flex flex-col justify-between shadow-xl shadow-slate-100">
          <div className="space-y-6">
             <div className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-widest text-xs">
                <Quote className="w-4 h-4" />
                AI Executive Summary
             </div>
             {summary ? (
               <p className="text-slate-700 leading-relaxed font-medium italic">
                 "{summary}"
               </p>
             ) : (
               <div className="space-y-3">
                 <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
                 <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
                 <div className="h-4 w-4/6 bg-slate-100 rounded animate-pulse" />
               </div>
             )}
          </div>
        </div>
      </div>

      {/* Breakout Table */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-slate-900 px-2 flex items-center gap-2">
          Per-Tool Breakdown
          <span className="text-xs font-normal text-slate-400 ml-auto">Sources: PRICING_DATA.md</span>
        </h3>
        <div className="space-y-3">
          {result.recommendations.map((rec, i) => (
            <div 
              key={i}
              className={cn(
                "p-6 rounded-2xl border transition-all",
                rec.savings > 0 
                  ? "bg-white border-orange-100 shadow-sm shadow-orange-50" 
                  : "bg-slate-50 border-slate-100 opacity-80"
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rec.toolName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-slate-200 text-[10px] font-bold text-slate-600 uppercase tracking-tighter">
                      {rec.currentPlan}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">
                    {rec.reason}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className={cn("font-bold", rec.savings > 0 ? "text-orange-500" : "text-slate-400")}>
                      {rec.savings > 0 ? `-$${rec.savings}` : "Optimal"}
                    </div>
                    <div className="text-[10px] font-bold uppercase text-slate-400">Action: {rec.recommendedAction}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Credex Upsell or Honest Optimization */}
      {isHighSavings ? (
        <div className="bg-orange-500 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl shadow-orange-200">
          <div className="space-y-2 flex-1">
            <h3 className="text-2xl font-bold">Unlocking {formatCurrency(result.totalMonthlySavings)} is just the start.</h3>
            <p className="text-orange-100 font-medium">Credex specializes in consolidated enterprise AI licensing for teams like yours.</p>
          </div>
          <button className="whitespace-nowrap px-8 py-4 bg-white text-orange-500 rounded-xl font-bold hover:bg-orange-50 transition-colors flex items-center gap-2 group">
             Book Credex Consultation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      ) : (
        <div className="bg-slate-100 rounded-3xl p-8 flex items-center gap-4 border border-slate-200 border-dashed">
          <AlertCircle className="w-6 h-6 text-slate-400" />
          <p className="text-slate-500 font-medium">
            <span className="text-slate-900 font-bold">You're spending well.</span> Your stack is already lean. We'll notify you if new alternatives emerge for your specific use cases.
          </p>
        </div>
      )}

      {/* Lead Capture */}
      <div id="lead-capture" className="scroll-mt-24">
        <LeadCapture 
           auditId={auditId} 
           totalSavings={result.totalMonthlySavings}
           onSuccess={onCapture}
        />
      </div>

      {/* Shareable Link */}
      <div className="flex items-center justify-center pt-8">
        <button 
          onClick={() => {
            navigator.clipboard.writeText(`${window.location.origin}/share/${auditId}`);
            alert('Share link copied to clipboard!');
          }}
          className="text-slate-400 hover:text-orange-500 font-bold text-sm flex items-center gap-2 transition-colors"
        >
          <Share2 className="w-4 h-4" /> Share this report
        </button>
      </div>
    </motion.div>
  );
}
