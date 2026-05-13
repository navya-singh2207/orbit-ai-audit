import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { formatCurrency, cn } from '../lib/utils';
import { TrendingDown, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  auditId: string;
}

export default function PublicAudit({ auditId }: Props) {
  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAudit = async () => {
      const docRef = doc(db, 'audits', auditId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAudit(docSnap.data());
      }
      setLoading(false);
    };
    fetchAudit();
  }, [auditId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Fetching Audit Data</p>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-slate-200">
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900">Audit Not Found</h3>
        <p className="text-slate-500">This URL might be expired or incorrect.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 pb-24"
    >
       <div className="text-center space-y-4">
         <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
           Public Verification Link
         </span>
         <h1 className="text-4xl font-bold text-slate-900 tracking-tight">AI Stack Performance Report</h1>
       </div>

      <div className="bg-slate-900 text-white rounded-3xl p-12 text-center space-y-4 shadow-2xl shadow-orange-100 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
           <TrendingDown className="w-96 h-96" />
        </div>
        <div className="relative space-y-2">
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Total Monthly Savings Identified</p>
          <div className="text-7xl md:text-8xl font-black text-orange-500">
            {formatCurrency(audit.totalSavings)}
          </div>
          <div className="pt-4 flex items-center justify-center gap-4">
            <div className="flex flex-col items-center">
               <span className="text-orange-300 text-[10px] font-black uppercase">Team Size</span>
               <span className="text-xl font-bold">{audit.teamSize}</span>
            </div>
            <div className="w-[1px] h-8 bg-white/10" />
            <div className="flex flex-col items-center">
               <span className="text-orange-300 text-[10px] font-black uppercase">Use Case</span>
               <span className="text-xl font-bold capitalize">{audit.useCase}</span>
            </div>
          </div>
        </div>
      </div>

      {audit.summary && (
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl shadow-slate-50 italic text-slate-700 leading-relaxed text-lg text-center">
          "{audit.summary}"
        </div>
      )}

      <div className="text-center space-y-6">
        <p className="text-slate-500 font-medium">Want to see your own savings?</p>
        <button 
           onClick={() => window.location.href = '/'}
           className="px-8 py-4 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-100"
        >
          Run My Free Audit
        </button>
      </div>
    </motion.div>
  );
}
