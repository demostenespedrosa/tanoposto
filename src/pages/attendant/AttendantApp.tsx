import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import { CheckCircle2, XCircle, ArrowLeft, Fuel, Droplet, DollarSign, Terminal, History, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

export function AttendantApp() {
  const { validateToken, activeToken, stations, currentUser } = useStore();
  const navigate = useNavigate();
  const [codeInput, setCodeInput] = useState('');
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount and when returning to input state
  useEffect(() => {
    if (!validationResult) {
      inputRef.current?.focus();
    }
  }, [validationResult]);

  const handleValidate = (e?: React.FormEvent) => {
    e?.preventDefault();
    const cleanCode = codeInput.trim().toUpperCase();
    if (cleanCode.length !== 6) return;
    
    // Check if the current token matches exactly
    // since validateToken marks it as used, we want to know if it *was* valid
    const isValid = validateToken(cleanCode);
    setValidationResult(isValid ? 'success' : 'error');
  };

  const resetForm = () => {
    setValidationResult(null);
    setCodeInput('');
  };

  const getStationName = () => {
    if (!activeToken) return 'Posto Desconhecido';
    return stations.find(s => s.id === activeToken.stationId)?.name || 'Posto Desconhecido';
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#020617] text-slate-900 dark:text-white flex font-sans transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-white dark:bg-[#0A192F] border-r border-slate-200 dark:border-white/5 flex flex-col shadow-sm z-10 hidden md:flex">
        <div className="p-6 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-5 h-5 text-[#ea580c]" />
            <h1 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Terminal</h1>
          </div>
          <p className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase">Frentista App</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-[#ea580c]/10 text-[#ea580c] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
            <Search className="w-4 h-4" /> <span>Validar Token</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
            <History className="w-4 h-4" /> <span>Histórico</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-xl mb-4 shadow-sm">
             <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center text-sm font-black text-white uppercase">
               {currentUser?.name?.charAt(0) || 'F'}
             </div>
             <div>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white leading-tight">{currentUser?.name}</p>
               <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{currentUser?.role}</p>
             </div>
          </div>
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> <span>Sair do Sistema</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header className="md:hidden p-4 border-b border-slate-200 dark:border-white/5 flex items-center justify-between bg-white dark:bg-[#0A192F]">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#ea580c]" />
            <h1 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Terminal</h1>
          </div>
          <button onClick={() => navigate('/')} className="text-slate-500 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft className="w-3 h-3" /> Sair
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-[#020617] overflow-y-auto w-full">
          {!validationResult ? (
            <div className="w-full max-w-2xl bg-white dark:bg-[#0A192F] p-10 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-orange-50 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mb-6 border border-orange-100 dark:border-orange-500/20">
                <Search className="w-8 h-8 text-[#ea580c]" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-2">
                Validar Token
              </h2>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-10">
                Digite o código de 6 dígitos apresentado pelo cliente
              </p>

              <form onSubmit={handleValidate} className="w-full max-w-md">
                <input
                  ref={inputRef}
                  type="text"
                  maxLength={6}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                  placeholder="EX: A1B2C3"
                  className="w-full bg-slate-50 dark:bg-[#111827] border-2 border-slate-200 dark:border-white/10 rounded-2xl px-6 py-6 text-center text-4xl md:text-5xl font-black tracking-[0.2em] text-[#ea580c] uppercase outline-none focus:border-[#ea580c] dark:focus:border-[#ea580c] transition-colors shadow-inner placeholder:text-slate-300 dark:placeholder:text-slate-800"
                />
                
                <button
                  type="submit"
                  disabled={codeInput.length !== 6}
                  className="w-full mt-8 bg-[#ea580c] hover:bg-[#c2410c] disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white py-5 rounded-2xl font-black tracking-[0.2em] uppercase text-sm transition-colors active:scale-95 shadow-xl shadow-orange-500/20 disabled:shadow-none"
                >
                  Confirmar Validação
                </button>
              </form>
            </div>
          ) : (
            <div className={`w-full max-w-2xl bg-white dark:bg-[#0A192F] p-8 md:p-12 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-2xl flex flex-col ${validationResult === 'success' ? 'border-t-8 border-t-emerald-500' : 'border-t-8 border-t-red-500'}`}>
              
              {validationResult === 'success' ? (
                <>
                  <div className="flex items-center gap-4 mb-8 pb-8 border-b border-slate-100 dark:border-white/5">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 shrink-0" strokeWidth={2.5} />
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">Autorizado</h2>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mt-1">
                        Token Válido e Desconto Aprovado
                      </p>
                    </div>
                  </div>

                  {activeToken && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 dark:bg-[#111827] p-5 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex gap-2 items-center mb-2">
                          <Fuel className="w-4 h-4 text-amber-500 text-opacity-80" />
                          <p className="text-[9px] font-black tracking-widest uppercase text-slate-500">Combustível</p>
                        </div>
                        <p className="text-xl font-black uppercase text-slate-800 dark:text-white truncate">{activeToken.fuelType || '-'}</p>
                      </div>
                      
                      <div className="bg-slate-50 dark:bg-[#111827] p-5 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex gap-2 items-center mb-2">
                          <Droplet className="w-4 h-4 text-orange-500 text-opacity-80" />
                          <p className="text-[9px] font-black tracking-widest uppercase text-slate-500">Volume Abastecido</p>
                        </div>
                        <p className="text-xl font-black text-slate-800 dark:text-white truncate">{activeToken.liters?.toFixed(3).replace('.', ',') || '-'} <span className="text-sm text-slate-400">Litros</span></p>
                      </div>

                      <div className="bg-slate-50 dark:bg-[#111827] p-5 rounded-2xl border border-slate-100 dark:border-white/5">
                        <div className="flex gap-2 items-center mb-2">
                          <DollarSign className="w-4 h-4 text-slate-500 text-opacity-80" />
                          <p className="text-[9px] font-black tracking-widest uppercase text-slate-500">Valor da Bomba (Original)</p>
                        </div>
                        <p className="text-lg font-bold text-slate-500 line-through truncate">R$ {activeToken.originalPrice?.toFixed(2).replace('.', ',') || '-'}</p>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-500/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                        <div className="flex gap-2 items-center mb-2">
                          <DollarSign className="w-4 h-4 text-emerald-600" />
                          <p className="text-[9px] font-black tracking-widest uppercase text-emerald-700 dark:text-emerald-400">Total a Pagar (com Desconto)</p>
                        </div>
                        <p className="text-3xl font-black italic tracking-tighter text-emerald-600 dark:text-emerald-400 truncate">R$ {activeToken.totalPrice?.toFixed(2).replace('.', ',') || '-'}</p>
                      </div>
                    </div>
                  )}

                  {activeToken && (
                    <div className="mb-8 pt-4 border-t border-slate-100 dark:border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <span>Posto: {getStationName()} {activeToken.stationId}</span>
                      <span>Código: {codeInput}</span>
                    </div>
                  )}

                  <button
                    onClick={resetForm}
                    className="w-full bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black py-5 rounded-2xl font-black tracking-[0.2em] uppercase text-sm transition-colors active:scale-95 shadow-xl"
                  >
                    Novo Atendimento
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-8">
                  <XCircle className="w-20 h-20 text-red-500 mb-6" strokeWidth={2} />
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white mb-2">Token Inválido</h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-10">
                    O código {codeInput} não existe<br/>ou já foi utilizado / expirou.
                  </p>
                  <button
                    onClick={resetForm}
                    className="w-full max-w-sm bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black py-5 rounded-2xl font-black tracking-[0.2em] uppercase text-sm transition-colors active:scale-95 shadow-xl"
                  >
                    Tentar Novamente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

