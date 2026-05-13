import React, { useState } from 'react';
import { Mail, Loader2, Check } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../lib/firebase';
import { v4 as uuidv4 } from 'uuid';

interface Props {
  auditId: string;
  totalSavings: number;
  onSuccess: () => void;
}

export default function LeadCapture({ auditId, totalSavings, onSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const leadId = uuidv4();
      await setDoc(doc(db, 'leads', leadId), {
        email,
        company,
        auditId,
        createdAt: serverTimestamp(),
      });

      // Trigger backend for email notification
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, company, auditId, totalSavings })
      });

      setIsDone(true);
      setTimeout(onSuccess, 2000);
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'leads');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isDone) {
    return (
      <div className="bg-green-50 border border-green-100 rounded-3xl p-8 text-center space-y-4">
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto">
          <Check className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-green-900">Report Captured!</h3>
        <p className="text-green-700">We've sent a copy to your inbox. Check it out!</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-2xl shadow-slate-200/50 space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-900">Capture this Audit</h3>
        <p className="text-slate-500">We'll save your results and send you a PDF report + future optimization alerts.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Honeypot field */}
        <div className="hidden" aria-hidden="true">
          <input 
            type="text" 
            name="hp_field" 
            tabIndex={-1} 
            autoComplete="off" 
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Business Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-slate-400 pl-1">Company (Optional)</label>
            <input 
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Your Company Name"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:outline-none font-medium"
            />
          </div>
        </div>

        <button
          disabled={isSubmitting}
          className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Lock in Savings'}
        </button>
        
        <p className="text-[10px] text-center text-slate-400 pt-2 uppercase tracking-tighter font-bold">
           Honeypot protection enabled • No spam, strictly finance reports
        </p>
      </form>
    </div>
  );
}
