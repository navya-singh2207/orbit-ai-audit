/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, TrendingDown, Mail, Share2, Calculator, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, getDoc, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { GoogleGenAI } from "@google/genai";
import { db, OperationType, handleFirestoreError, initAuth } from './lib/firebase';
import { runAudit, type ToolInput, type AuditResult } from './services/auditEngine';
import { cn, formatCurrency } from './lib/utils';

// Components
import AuditForm from './components/AuditForm';
import AuditResults from './components/AuditResults';
import LeadCapture from './components/LeadCapture';
import PublicAudit from './components/PublicAudit';

type Page = 'home' | 'audit' | 'results' | 'share';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [auditId, setAuditId] = useState<string | null>(null);
  const [tools, setTools] = useState<ToolInput[]>([]);
  const [teamSize, setTeamSize] = useState(1);
  const [useCase, setUseCase] = useState('mixed');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persistence and Auth
  useEffect(() => {
    initAuth();
    const saved = localStorage.getItem('orbit_audit_state');
    if (saved) {
      const { tools, teamSize, useCase } = JSON.parse(saved);
      setTools(tools);
      setTeamSize(teamSize);
      setUseCase(useCase);
    }

    // Handle share links
    const path = window.location.pathname;
    if (path.startsWith('/share/')) {
      setPage('share');
      setAuditId(path.split('/')[2]);
    }
  }, []);

  const handleAudit = async (toolsInput: ToolInput[], size: number, uc: string) => {
    setIsSubmitting(true);
    const auditResult = runAudit(toolsInput, size, uc);
    setResult(auditResult);
    
    const id = uuidv4();
    setAuditId(id);

    // Save to Firestore
    try {
      const docRef = await addDoc(collection(db, 'audits'), {
        useCase: uc,
        teamSize: size,
        tools: toolsInput,
        totalSpend: auditResult.totalCurrentSpend,
        totalSavings: auditResult.totalMonthlySavings,
        createdAt: serverTimestamp(),
      });
      const id = docRef.id;
      setAuditId(id);

      // Get AI Summary from backend
      try {
        const res = await fetch('/api/summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            useCase: uc,
            teamSize: size,
            totalSpend: auditResult.totalCurrentSpend,
            totalSavings: auditResult.totalMonthlySavings,
            toolBreakdown: auditResult.recommendations
          }),
        });
        const data = await res.json();
        const summary = data.summary || "";
        setAiSummary(summary);
        
        // Update Firestore with summary
        try {
          await updateDoc(doc(db, 'audits', id), { summary });
        } catch (updateErr) {
          console.error("Failed to update audit with summary", updateErr);
        }
      } catch (sumErr) {
        console.error("AI Summary call failed", sumErr);
        setAiSummary("We've calculated your savings! Review your personalized tool breakdown below for specific optimization steps.");
      }
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, 'audits');
    }

    setPage('results');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-900 font-sans selection:bg-orange-100 selection:text-orange-900">
      <nav className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => { window.location.href = '/'; }}
          >
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold rotate-12 group-hover:rotate-0 transition-transform">
              O
            </div>
            <span className="font-bold text-xl tracking-tight">Orbit Audit</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-sm font-medium text-slate-500">
            <a href="#how-it-works" className="hover:text-orange-500 transition-colors">How it works</a>
            <a href="#pricing" className="hover:text-orange-500 transition-colors">Pricing Data</a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="space-y-4">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-700 text-xs font-bold tracking-wider uppercase border border-orange-100">
                  <TrendingDown className="w-3 h-3" /> Save up to 40% on AI Spend
                </span>
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 leading-[1.1]">
                   Stop blindly paying for <br />
                  <span className="text-orange-500">every AI subscription.</span>
                </h1>
                <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
                  Most teams overspend on AI by $200-$1,000 per month by choosing the wrong tiers or redundant tools. Run an instant, data-backed audit of your stack.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <button
                  onClick={() => setPage('audit')}
                  className="w-full sm:w-auto px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group shadow-xl shadow-slate-200"
                >
                  Start Free Audit <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center -space-x-2">
                   {[1,2,3,4].map(i => (
                     <img 
                        key={i}
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} 
                        className="w-8 h-8 rounded-full border-2 border-white bg-slate-100" 
                        alt="User"
                      />
                   ))}
                   <span className="pl-4 text-sm text-slate-500 font-medium italic">Joined by 800+ teams this month</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
                {[
                  { icon: Shield, title: "Data Secure", desc: "No tool access required. Just input your plan names." },
                  { icon: Calculator, title: "Live Pricing", desc: "Always-updated database of Cursor, Claude, OpenAI, and more." },
                  { icon: CheckCircle2, title: "Actionable", desc: "Not just charts—specific 'Downgrade' or 'Switch' commands." }
                ].map((feat, i) => (
                  <div key={i} className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-orange-200 transition-colors">
                    <feat.icon className="w-10 h-10 text-orange-500 mb-4" />
                    <h3 className="font-bold text-slate-900 mb-1">{feat.title}</h3>
                    <p className="text-sm text-slate-500">{feat.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {page === 'audit' && (
            <AuditForm 
              onComplete={handleAudit} 
              isSubmitting={isSubmitting}
            />
          )}

          {page === 'results' && result && auditId && (
            <AuditResults 
              result={result} 
              summary={aiSummary} 
              auditId={auditId}
              onCapture={() => setPage('home')}
            />
          )}

          {page === 'share' && auditId && (
            <PublicAudit auditId={auditId} />
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-100 bg-white py-12 mt-24">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="text-slate-400 text-sm font-medium">Orbit Audit &copy; 2026. Data traces to PRICING_DATA.md.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors"><Mail className="w-5 h-5" /></a>
            <a href="#" className="text-slate-400 hover:text-slate-600 transition-colors"><Share2 className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}

