/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { CustomerApp } from './pages/customer/CustomerApp';
import { AttendantApp } from './pages/attendant/AttendantApp';
import { AdminApp } from './pages/admin/AdminApp';
import { useStore, Theme } from './store/useStore';
import { useEffect, ReactNode } from 'react';

function RoleSelector() {
  const navigate = useNavigate();
  const login = useStore(state => state.login);

  const handleSelectRole = (role: 'customer' | 'attendant' | 'admin') => {
    switch(role) {
      case 'customer':
        login({ id: 'u1', name: 'João Silva', role: 'customer', email: 'joao@exemplo.com' });
        navigate('/customer');
        break;
      case 'attendant':
        login({ id: 'a1', name: 'Carlos Santos', role: 'attendant', email: 'carlos@posto.com' });
        navigate('/attendant');
        break;
      case 'admin':
        login({ id: 'ad1', name: 'Maria Admin', role: 'admin', email: 'maria@admin.com' });
        navigate('/admin');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300">
      <div className="w-full max-w-lg bg-white dark:bg-[#0A192F] rounded-3xl border border-slate-200 dark:border-white/5 shadow-2xl overflow-hidden flex flex-col relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#ea580c] to-transparent opacity-50"></div>
        <div className="p-8 pb-6 border-b border-slate-100 dark:border-white/5 text-center">
          <p className="text-[#ea580c] font-bold tracking-[0.3em] text-xs mb-2 uppercase">Sistema de Descontos</p>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white mb-1">
            Tá no Posto<span className="text-[#ea580c]">.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-[10px] font-bold tracking-widest uppercase mt-4">Selecione o Ambiente</p>
        </div>
        
        <div className="p-6 space-y-4">
          <button 
            onClick={() => handleSelectRole('customer')}
            className="w-full relative group overflow-hidden bg-slate-50 dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#1F2937] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all rounded-2xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="bg-slate-800 dark:bg-white text-white dark:text-black text-[10px] font-black px-1.5 py-0.5 group-hover:bg-[#ea580c] group-hover:text-white transition-colors">01</span>
              <div className="text-left">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-800 dark:text-slate-200">Cliente PWA</h3>
                <p className="text-xs text-slate-500 font-medium">Encontrar descontos e gerar tokens</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-[#ea580c] transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            onClick={() => handleSelectRole('attendant')}
            className="w-full relative group overflow-hidden bg-slate-50 dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#1F2937] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all rounded-2xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="bg-slate-800 dark:bg-white text-white dark:text-black text-[10px] font-black px-1.5 py-0.5 group-hover:bg-[#ea580c] group-hover:text-white transition-colors">02</span>
              <div className="text-left">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-800 dark:text-slate-200">Frentista App</h3>
                <p className="text-xs text-slate-500 font-medium">Ler e validar tokens</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-[#ea580c] transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button 
            onClick={() => handleSelectRole('admin')}
            className="w-full relative group overflow-hidden bg-slate-50 dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-[#1F2937] border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all rounded-2xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <span className="bg-slate-800 dark:bg-white text-white dark:text-black text-[10px] font-black px-1.5 py-0.5 group-hover:bg-[#ea580c] group-hover:text-white transition-colors">03</span>
              <div className="text-left">
                <h3 className="text-sm font-bold tracking-widest uppercase text-slate-800 dark:text-slate-200">Painel de Controle</h3>
                <p className="text-xs text-slate-500 font-medium">Análises globais da plataforma</p>
              </div>
            </div>
            <svg className="w-5 h-5 text-slate-400 dark:text-slate-600 group-hover:text-[#ea580c] transform group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useStore(state => state.theme);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelector />} />
          <Route path="/customer/*" element={<CustomerApp />} />
          <Route path="/attendant/*" element={<AttendantApp />} />
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
