import React, { useState } from 'react';
import { useStore, Station } from '../../store/useStore';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Activity, Fuel, Settings, LogOut, ArrowUpRight, ArrowDownRight, 
  MapPin, Edit3, Trash2, Plus, ArrowLeft, BarChart3, Clock, Image, Eye, EyeOff, Droplet
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationPicker({ position, setPosition }: { position: [number, number]; setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return <Marker position={position} />;
}

const analyticsData = [
  { name: 'Mon', active: 4000, new: 2400 },
  { name: 'Tue', active: 3000, new: 1398 },
  { name: 'Wed', active: 2000, new: 9800 },
  { name: 'Thu', active: 2780, new: 3908 },
  { name: 'Fri', active: 1890, new: 4800 },
  { name: 'Sat', active: 2390, new: 3800 },
  { name: 'Sun', active: 3490, new: 4300 },
];

export function AdminApp() {
  const { stations, banners, users, settings, currentUser, logout, logs, addStation, updateStation, deleteStation, addBanner, updateBanner, deleteBanner, addUser, updateUser, deleteUser, updateSettings } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stations' | 'users' | 'fuels' | 'services' | 'banners' | 'settings' | 'logs'>('dashboard');
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [isCreatingStation, setIsCreatingStation] = useState(false);
  const [newFuel, setNewFuel] = useState('');
  const [newService, setNewService] = useState('');
  const [newStation, setNewStation] = useState<Partial<Station>>({
    name: '', address: '', lat: -23.55052, lng: -46.633308, originalPrice: 0, discountedPrice: 0,
    distance: '0.0 km', fuelTypes: ['Gasolina comum'], fuelPrices: { 'Gasolina comum': { original: 0, discounted: 0 } },
    rating: 0, ratingCount: 0, services: [], openingTime: '06:00', closingTime: '22:00', logoUrl: ''
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSaveStation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingStation) {
      updateStation(editingStation.id, editingStation);
      setEditingStation(null);
    }
  };

  const handleCreateStation = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = Math.random().toString(36).substr(2, 9);
    addStation({ ...(newStation as Station), id });
    setIsCreatingStation(false);
    setNewStation({
      name: '', address: '', lat: -23.55052, lng: -46.633308, originalPrice: 0, discountedPrice: 0,
      distance: '0.0 km', fuelTypes: ['Gasolina comum'], fuelPrices: { 'Gasolina comum': { original: 0, discounted: 0 } },
      rating: 0, ratingCount: 0, services: [], openingTime: '06:00', closingTime: '22:00', logoUrl: ''
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-white flex font-sans transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#0A192F] border-r border-slate-200 dark:border-white/5 flex flex-col fixed h-full z-20 transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-white/5">
          <div className="flex items-center gap-3 text-[#ea580c] mb-2">
            <Fuel className="w-8 h-8" />
            <h1 className="text-2xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">Tá no Posto<span className="text-[#ea580c]">.</span></h1>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">Painel Admin</p>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'dashboard' ? 'bg-[#ea580c] text-white dark:text-black shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-white'}`}
          >
            <BarChart3 className="w-4 h-4" /> <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'users' ? 'bg-[#ea580c] text-white dark:text-black shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> <span>Usuários</span>
          </button>
          <button 
            onClick={() => setActiveTab('fuels')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'fuels' ? 'bg-[#ea580c] text-white dark:text-black shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Droplet className="w-4 h-4" /> <span>Combustíveis</span>
          </button>
          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'services' ? 'bg-[#ea580c] text-white dark:text-black shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Settings className="w-4 h-4" /> <span>Serviços</span>
          </button>
          <button 
            onClick={() => setActiveTab('stations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'stations' ? 'bg-[#ea580c] text-white dark:text-black shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-white'}`}
          >
            <MapPin className="w-4 h-4" /> <span>Parceiros</span>
          </button>
          <button 
            onClick={() => setActiveTab('banners')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'banners' ? 'bg-[#ea580c] text-white dark:text-black shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Image className="w-4 h-4" /> <span>Banners</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'settings' ? 'bg-[#ea580c] text-white dark:text-black shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Settings className="w-4 h-4" /> <span>Configurações</span>
          </button>
          <button 
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-xs font-bold uppercase tracking-widest ${activeTab === 'logs' ? 'bg-[#ea580c] text-white dark:text-black shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#111827] hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Clock className="w-4 h-4" /> <span>Logs do Sistema</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-black/20">
          <div className="flex items-center gap-3 px-4 py-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/5 rounded-xl mb-4 shadow-sm">
             <div className="w-10 h-10 rounded-lg bg-[#ea580c] flex items-center justify-center text-sm font-black text-white dark:text-black uppercase">
               {currentUser?.name.charAt(0) || 'A'}
             </div>
             <div>
               <p className="text-xs font-bold uppercase tracking-widest text-slate-800 dark:text-white">{currentUser?.name}</p>
               <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-widest mt-0.5">{currentUser?.role}</p>
             </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-[#ea580c] transition-colors text-[10px] font-bold uppercase tracking-widest">
            <LogOut className="w-4 h-4" /> <span>Sair</span>
          </button>
          <button onClick={() => navigate('/')} className="w-full flex items-center gap-3 px-4 py-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mt-2 text-[10px] font-bold uppercase tracking-widest">
            <ArrowLeft className="w-4 h-4" /> <span>Sair do Admin</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 p-8">
        <header className="flex justify-between items-end border-b border-slate-200 dark:border-white/10 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-slate-800 dark:bg-white text-white dark:text-black text-[10px] font-black px-1.5 py-0.5">03</span>
               <h2 className="text-[10px] font-bold tracking-widest uppercase text-slate-500 dark:text-slate-400">Dashboard Global</h2>
            </div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">{activeTab === 'dashboard' ? 'Geral' : activeTab === 'stations' ? 'Parceiros' : activeTab === 'banners' ? 'Banners' : activeTab === 'users' ? 'Usuários' : activeTab === 'fuels' ? 'Combustíveis' : activeTab === 'services' ? 'Serviços' : activeTab === 'settings' ? 'Configurações' : 'Logs'}</h2>
          </div>
          <div className="text-right">
             <p className="text-[#ea580c] font-bold tracking-[0.3em] text-[10px] mb-1">ESTADO DO SISTEMA</p>
             <p className="text-sm font-mono text-slate-800 dark:text-white">OPTIMAL</p>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { label: 'Total de Usuários', value: '45.2k', trend: '+12.5%', isUp: true, icon: Users },
                { label: 'Tokens Ativos', value: '1,204', trend: '+5.2%', isUp: true, icon: Activity },
                { label: 'Postos Parceiros', value: stations.length.toString(), trend: '0%', isUp: true, icon: MapPin },
                { label: 'Saúde', value: '99.9%', trend: 'Ótimo', isUp: true, icon: Settings },
              ].map((metric, i) => (
                <div key={i} className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-white/5 flex flex-col justify-between shadow-sm dark:shadow-none">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">{metric.label}</p>
                    <span className={`text-[10px] font-bold flex items-center gap-1 ${metric.isUp ? 'text-green-500 dark:text-green-400' : 'text-slate-500'}`}>
                      {metric.trend}
                      {metric.isUp && metric.trend !== '0%' && metric.trend !== 'Ótimo' && <ArrowUpRight className="w-3 h-3" />}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                     <p className="text-3xl font-black italic leading-none text-slate-900 dark:text-white">{metric.value}</p>
                     <metric.icon className="w-6 h-6 text-[#ea580c] opacity-50" />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Area */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 bg-white dark:bg-[#111827] p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm dark:shadow-none">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 mb-6 uppercase tracking-widest">Atividade da Rede</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analyticsData}>
                      <defs>
                        <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563EB" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1F2937" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10}} />
                      <Tooltip contentStyle={{backgroundColor: '#0A192F', borderColor: '#1F2937', color: '#fff'}} itemStyle={{color: '#fff'}} />
                      <Area type="step" dataKey="new" stroke="#ea580c" strokeWidth={2} fillOpacity={1} fill="url(#colorNew)" />
                      <Area type="step" dataKey="active" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorActive)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="bg-[#ea580c] p-6 rounded-3xl text-black flex flex-col border border-[#ea580c] shadow-lg">
                 <h3 className="text-sm font-black mb-6 uppercase tracking-widest flex items-center justify-between">
                   <span>Crescimento Parceiros</span>
                   <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">AO VIVO</span>
                 </h3>
                 <div className="flex-1">
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={analyticsData.slice(0, 5)}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#000', fontSize: 10, fontWeight: 'bold'}} />
                        <Tooltip cursor={{fill: 'rgba(0,0,0,0.1)'}} contentStyle={{backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '8px'}} itemStyle={{color: '#ea580c'}} />
                        <Bar type="step" dataKey="new" fill="#000" radius={[4, 4, 0, 0]} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stations' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
             <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
               <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Topologia da Rede</h3>
               <button 
                 onClick={() => setIsCreatingStation(true)}
                 className="bg-slate-900 dark:bg-[#ea580c] hover:bg-black dark:hover:bg-orange-600 text-white dark:text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors active:scale-95"
               >
                 <Plus className="w-4 h-4" /> Adicionar Posto
               </button>
             </div>
             <div className="overflow-x-auto p-4">
               <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                 <thead className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                   <tr>
                     <th className="px-6 py-4">ID do Posto</th>
                     <th className="px-6 py-4">Preço Original</th>
                     <th className="px-6 py-4 text-[#ea580c]">Preço App</th>
                     <th className="px-6 py-4">Inventário</th>
                     <th className="px-6 py-4 text-right">Controle</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                   {stations.map(st => (
                     <tr key={st.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase text-xs">{st.name}</td>
                       <td className="px-6 py-4 line-through text-slate-500 text-xs font-mono">
                         {st.fuelTypes.length > 0 ? `R$ ${st.fuelPrices?.[st.fuelTypes[0]]?.original?.toFixed(2).replace('.', ',') || '0,00'}` : '-'}
                       </td>
                       <td className="px-6 py-4 font-black italic text-[#ea580c] text-sm">
                         {st.fuelTypes.length > 0 ? `R$ ${st.fuelPrices?.[st.fuelTypes[0]]?.discounted?.toFixed(2).replace('.', ',') || '0,00'}` : '-'}
                       </td>
                       <td className="px-6 py-4">
                         <div className="flex gap-1 flex-wrap">
                           {st.fuelTypes.map(f => (
                             <span key={f} className="bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-white px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider">{f}</span>
                           ))}
                         </div>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => setEditingStation(st)}
                             className="p-2 text-blue-500 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-400/10 rounded transition-colors"
                           >
                             <Edit3 className="w-4 h-4" />
                           </button>
                           <button 
                             onClick={() => deleteStation(st.id)}
                             className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'banners' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
             <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
               <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Gerenciamento de Banners</h3>
               <button 
                 onClick={() => {
                   const id = Math.random().toString(36).substr(2, 9);
                   addBanner({
                     id, 
                     imageUrl: 'https://images.unsplash.com/photo-1627065969145-eb4d90ce3785?w=800&q=80',
                     active: true
                   });
                 }}
                 className="bg-slate-900 dark:bg-[#ea580c] hover:bg-black dark:hover:bg-orange-600 text-white dark:text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors active:scale-95"
               >
                 <Plus className="w-4 h-4" /> Adicionar Banner
               </button>
             </div>
             <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {banners.map(banner => (
                  <div key={banner.id} className="border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden bg-slate-50 dark:bg-[#0A192F] flex flex-col group relative">
                    <div className="aspect-[21/9] relative overflow-hidden bg-slate-200 dark:bg-slate-800">
                      <img src={banner.imageUrl} alt="Banner" className={`w-full h-full object-cover transition-opacity ${banner.active ? 'opacity-100' : 'opacity-40 grayscale'}`} />
                      {!banner.active && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black/80 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><EyeOff className="w-3 h-3" /> Inativo</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div className="mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">URL da Imagem</label>
                        <input 
                          type="text" 
                          value={banner.imageUrl}
                          onChange={(e) => updateBanner(banner.id, { imageUrl: e.target.value })}
                          className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-slate-600 dark:text-slate-300 outline-none focus:border-[#ea580c]"
                        />
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200 dark:border-white/5">
                        <button 
                          onClick={() => updateBanner(banner.id, { active: !banner.active })}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors ${banner.active ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'}`}
                        >
                          {banner.active ? <><EyeOff className="w-3.5 h-3.5" /> Desativar</> : <><Eye className="w-3.5 h-3.5" /> Ativar</>}
                        </button>
                        <button 
                          onClick={() => deleteBanner(banner.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
             <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
               <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Contas Cadastradas</h3>
               <button 
                 onClick={() => {
                   const id = Math.random().toString(36).substr(2, 9);
                   addUser({ id, name: 'Novo Usuário', email: 'novo@email.com', role: 'customer' });
                 }}
                 className="bg-slate-900 dark:bg-[#ea580c] hover:bg-black dark:hover:bg-orange-600 text-white dark:text-black px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-colors active:scale-95"
               >
                 <Plus className="w-4 h-4" /> Cadastrar Usuário
               </button>
             </div>
             <div className="overflow-x-auto p-4">
               <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                 <thead className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                   <tr>
                     <th className="px-6 py-4">Nome</th>
                     <th className="px-6 py-4">E-mail</th>
                     <th className="px-6 py-4">Categoria/Função</th>
                     <th className="px-6 py-4 text-right">Ações</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                   {users.map(u => (
                     <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                       <td className="px-6 py-4 font-bold text-slate-900 dark:text-white uppercase text-xs">{u.name}</td>
                       <td className="px-6 py-4 text-slate-500 text-xs font-mono">{u.email}</td>
                       <td className="px-6 py-4">
                         <span className={`px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider ${u.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300' : u.role === 'attendant' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300' : 'bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300'}`}>
                            {u.role === 'customer' ? 'Cliente' : u.role === 'attendant' ? 'Frentista' : 'Administrador'}
                         </span>
                       </td>
                       <td className="px-6 py-4 text-right">
                         <div className="flex justify-end gap-2">
                           <button 
                             onClick={() => deleteUser(u.id)}
                             className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                           >
                             <Trash2 className="w-4 h-4" />
                           </button>
                         </div>
                       </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>
        )}

        {activeTab === 'fuels' && (
          <div className="w-full max-w-3xl">
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
              <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Tipos de Combustíveis</h3>
              </div>
              <div className="p-6">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newFuel.trim() && !settings.availableFuels.includes(newFuel.trim())) {
                      updateSettings({ availableFuels: [...settings.availableFuels, newFuel.trim()] });
                      setNewFuel('');
                    }
                  }}
                  className="flex gap-3 mb-6"
                >
                  <input
                    type="text"
                    value={newFuel}
                    onChange={(e) => setNewFuel(e.target.value)}
                    placeholder="Nome do Combustível (ex: Gasolina Premium)"
                    className="flex-1 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                  />
                  <button type="submit" className="bg-[#ea580c] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </form>

                <div className="space-y-2">
                  {settings.availableFuels.map((fuel, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">{fuel}</span>
                      <button
                        onClick={() => updateSettings({ availableFuels: settings.availableFuels.filter((f) => f !== fuel) })}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {settings.availableFuels.length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-bold py-4">Nenhum combustível cadastrado.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'services' && (
          <div className="w-full max-w-3xl">
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none">
              <div className="p-6 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-black/20">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Serviços Adicionais</h3>
              </div>
              <div className="p-6">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newService.trim() && !settings.availableServices.includes(newService.trim())) {
                      updateSettings({ availableServices: [...settings.availableServices, newService.trim()] });
                      setNewService('');
                    }
                  }}
                  className="flex gap-3 mb-6"
                >
                  <input
                    type="text"
                    value={newService}
                    onChange={(e) => setNewService(e.target.value)}
                    placeholder="Nome do Serviço (ex: Lava-rápido)"
                    className="flex-1 bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                  />
                  <button type="submit" className="bg-[#ea580c] text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                </form>

                <div className="space-y-2">
                  {settings.availableServices.map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                      <span className="font-bold text-sm text-slate-800 dark:text-white uppercase tracking-wider">{service}</span>
                      <button
                        onClick={() => updateSettings({ availableServices: settings.availableServices.filter((s) => s !== service) })}
                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {settings.availableServices.length === 0 && (
                    <p className="text-center text-slate-500 dark:text-slate-400 text-sm font-bold py-4">Nenhum serviço cadastrado.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="w-full max-w-3xl">
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm dark:shadow-none p-6">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest border-b border-slate-200 dark:border-white/5 pb-4 mb-6">Parâmetros Globais</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Taxa por uso do App / Serviço (Fixo via App)</label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black italic">R$</span>
                     <input type="number" step="0.1" value={settings.appFee} onChange={e => updateSettings({ appFee: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-[#0A192F] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Desconto Máximo Base (%)</label>
                  <div className="relative">
                     <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                     <input type="number" value={settings.maxDiscount} onChange={e => updateSettings({ maxDiscount: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-[#0A192F] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors" />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2 px-1">Tempo de Expiração do Token (Minutos)</label>
                  <div className="relative">
                     <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Clock className="w-4 h-4"/></span>
                     <input type="number" value={settings.tokenExpirationMinutes} onChange={e => updateSettings({ tokenExpirationMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-slate-50 dark:bg-[#0A192F] border border-slate-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors" />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 px-1">Tempo máximo que o frentista tem para validar o token no PDV após a recarga.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-white/5 p-6 shadow-sm dark:shadow-none">
             <div className="flex justify-between items-center mb-6">
               <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300 uppercase tracking-widest">Telemetria do Sistema</h3>
               <span className="text-[10px] font-black text-[#ea580c] uppercase tracking-[0.2em] animate-pulse">Ao Vivo</span>
             </div>
             <div className="space-y-3 font-mono text-xs bg-slate-50 dark:bg-black/40 p-4 rounded-xl h-[400px] overflow-y-auto border border-slate-100 dark:border-white/5">
               {logs.length === 0 ? (
                 <p className="text-slate-500 italic">SISTEMA INATIVO. AGUARDANDO EVENTOS...</p>
               ) : (
                 logs.map((log, i) => (
                   <div key={i} className="py-2 border-b border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 break-words flex gap-2">
                     <span className="text-[#ea580c] shrink-0">{log.split('] ')[0]}]</span>
                     <span className={`${log.includes('Falha') || log.includes('exclu') ? 'text-red-500 dark:text-red-400' : log.includes('validado') ? 'text-green-600 dark:text-green-400' : 'text-slate-700 dark:text-slate-200'}`}>
                       {log.split('] ')[1]}
                     </span>
                   </div>
                 ))
               )}
             </div>
          </div>
        )}

      </main>

      {/* Creating Modal */}
      {isCreatingStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 shrink-0">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">
                Cadastrar <span className="text-[#ea580c]">Parceiro</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="create-station-form" onSubmit={handleCreateStation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nome do Posto</label>
                      <input
                        required
                        type="text"
                        value={newStation.name}
                        onChange={(e) => setNewStation({ ...newStation, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Endereço Completo</label>
                      <input
                        required
                        type="text"
                        value={newStation.address}
                        onChange={(e) => setNewStation({ ...newStation, address: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Abertura</label>
                        <input
                          type="time"
                          value={newStation.openingTime}
                          onChange={(e) => setNewStation({ ...newStation, openingTime: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fechamento</label>
                        <input
                          type="time"
                          value={newStation.closingTime}
                          onChange={(e) => setNewStation({ ...newStation, closingTime: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-black/20">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tipos de Combustíveis</label>
                      {settings.availableFuels.map((fuel) => {
                        const isActive = newStation.fuelTypes?.includes(fuel);
                        return (
                          <div key={fuel} className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => {
                                  const types = newStation.fuelTypes || [];
                                  if (e.target.checked) {
                                    setNewStation({ ...newStation, fuelTypes: [...types, fuel] });
                                  } else {
                                    setNewStation({ ...newStation, fuelTypes: types.filter(t => t !== fuel) });
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#ea580c] focus:ring-[#ea580c] focus:ring-offset-slate-50 dark:focus:ring-offset-[#111827] bg-slate-100 border-slate-300 dark:bg-black/30 dark:border-white/10"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{fuel}</span>
                            </label>
                            {isActive && (
                              <div className="grid grid-cols-2 gap-4 pl-6">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Preço Original</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={newStation.fuelPrices?.[fuel]?.original || ''}
                                    onChange={(e) => {
                                      const prices = newStation.fuelPrices || {};
                                      setNewStation({
                                        ...newStation,
                                        fuelPrices: {
                                          ...prices,
                                          [fuel]: { ...prices[fuel], original: parseFloat(e.target.value) || 0, discounted: prices[fuel]?.discounted || 0 }
                                        }
                                      });
                                    }}
                                    className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Preço com Desconto</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={newStation.fuelPrices?.[fuel]?.discounted || ''}
                                    onChange={(e) => {
                                      const prices = newStation.fuelPrices || {};
                                      setNewStation({
                                        ...newStation,
                                        fuelPrices: {
                                          ...prices,
                                          [fuel]: { ...prices[fuel], original: prices[fuel]?.original || 0, discounted: parseFloat(e.target.value) || 0 }
                                        }
                                      });
                                    }}
                                    className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">URL da Logo (Opcional)</label>
                      <input
                        type="url"
                        value={newStation.logoUrl}
                        onChange={(e) => setNewStation({ ...newStation, logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                      />
                    </div>
                    <div className="space-y-2 border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-black/20">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Serviços</label>
                      <div className="grid grid-cols-2 gap-2">
                        {settings.availableServices.map((service) => (
                          <label key={service} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newStation.services?.includes(service) || false}
                              onChange={(e) => {
                                const services = newStation.services || [];
                                if (e.target.checked) {
                                  setNewStation({ ...newStation, services: [...services, service] });
                                } else {
                                  setNewStation({ ...newStation, services: services.filter(s => s !== service) });
                                }
                              }}
                              className="w-4 h-4 rounded text-[#ea580c] focus:ring-[#ea580c] focus:ring-offset-slate-50 dark:focus:ring-offset-[#111827] bg-slate-100 border-slate-300 dark:bg-black/30 dark:border-white/10"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Map */}
                  <div className="flex flex-col h-[400px] md:h-auto border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-bold shadow-lg pointer-events-none border border-black/5 dark:border-white/10">
                      Clique no mapa para marcar a localização exata do posto
                    </div>
                    <MapContainer 
                      center={[-23.55052, -46.633308]} 
                      zoom={13} 
                      style={{ width: '100%', height: '100%', zIndex: 1 }}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationPicker 
                        position={[newStation.lat || -23.55052, newStation.lng || -46.633308]} 
                        setPosition={(pos) => setNewStation({ ...newStation, lat: pos[0], lng: pos[1] })} 
                      />
                    </MapContainer>
                  </div>
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 shrink-0 flex justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setIsCreatingStation(false)}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="create-station-form"
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-[#ea580c] text-white hover:bg-orange-600 transition-colors shadow-m"
              >
                Cadastrar Parceiro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Editing Modal */}
      {editingStation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#111827] rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-200 dark:border-white/10 shadow-2xl flex flex-col">
            <div className="p-6 border-b border-slate-200 dark:border-white/10 shrink-0">
              <h3 className="text-2xl font-black uppercase tracking-tighter italic text-slate-900 dark:text-white">
                Editar <span className="text-[#ea580c]">Parceiro</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <form id="edit-station-form" onSubmit={handleSaveStation} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column - Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nome</label>
                      <input
                        type="text"
                        value={editingStation.name}
                        onChange={(e) => setEditingStation({ ...editingStation, name: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Endereço</label>
                      <input
                        type="text"
                        value={editingStation.address}
                        onChange={(e) => setEditingStation({ ...editingStation, address: e.target.value })}
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Abertura</label>
                        <input
                          type="time"
                          value={editingStation.openingTime}
                          onChange={(e) => setEditingStation({ ...editingStation, openingTime: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Fechamento</label>
                        <input
                          type="time"
                          value={editingStation.closingTime}
                          onChange={(e) => setEditingStation({ ...editingStation, closingTime: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-4 border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-black/20">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Tipos de Combustíveis</label>
                      {settings.availableFuels.map((fuel) => {
                        const isActive = editingStation.fuelTypes?.includes(fuel);
                        return (
                          <div key={fuel} className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => {
                                  const types = editingStation.fuelTypes || [];
                                  if (e.target.checked) {
                                    setEditingStation({ ...editingStation, fuelTypes: [...types, fuel] });
                                  } else {
                                    setEditingStation({ ...editingStation, fuelTypes: types.filter(t => t !== fuel) });
                                  }
                                }}
                                className="w-4 h-4 rounded text-[#ea580c] focus:ring-[#ea580c] focus:ring-offset-slate-50 dark:focus:ring-offset-[#111827] bg-slate-100 border-slate-300 dark:bg-black/30 dark:border-white/10"
                              />
                              <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{fuel}</span>
                            </label>
                            {isActive && (
                              <div className="grid grid-cols-2 gap-4 pl-6">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Preço Original</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editingStation.fuelPrices?.[fuel]?.original || ''}
                                    onChange={(e) => {
                                      const prices = editingStation.fuelPrices || {};
                                      setEditingStation({
                                        ...editingStation,
                                        fuelPrices: {
                                          ...prices,
                                          [fuel]: { ...prices[fuel], original: parseFloat(e.target.value) || 0, discounted: prices[fuel]?.discounted || 0 }
                                        }
                                      });
                                    }}
                                    className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Preço com Desconto</label>
                                  <input
                                    type="number"
                                    step="0.01"
                                    required
                                    value={editingStation.fuelPrices?.[fuel]?.discounted || ''}
                                    onChange={(e) => {
                                      const prices = editingStation.fuelPrices || {};
                                      setEditingStation({
                                        ...editingStation,
                                        fuelPrices: {
                                          ...prices,
                                          [fuel]: { ...prices[fuel], original: prices[fuel]?.original || 0, discounted: parseFloat(e.target.value) || 0 }
                                        }
                                      });
                                    }}
                                    className="w-full bg-white dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">URL da Logo (Opcional)</label>
                      <input
                        type="url"
                        value={editingStation.logoUrl || ''}
                        onChange={(e) => setEditingStation({ ...editingStation, logoUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] transition-colors"
                      />
                    </div>
                    <div className="space-y-2 border border-slate-200 dark:border-white/10 rounded-xl p-4 bg-slate-50 dark:bg-black/20">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Serviços</label>
                      <div className="grid grid-cols-2 gap-2">
                        {settings.availableServices.map((service) => (
                          <label key={service} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingStation.services?.includes(service) || false}
                              onChange={(e) => {
                                const services = editingStation.services || [];
                                if (e.target.checked) {
                                  setEditingStation({ ...editingStation, services: [...services, service] });
                                } else {
                                  setEditingStation({ ...editingStation, services: services.filter(s => s !== service) });
                                }
                              }}
                              className="w-4 h-4 rounded text-[#ea580c] focus:ring-[#ea580c] focus:ring-offset-slate-50 dark:focus:ring-offset-[#111827] bg-slate-100 border-slate-300 dark:bg-black/30 dark:border-white/10"
                            />
                            <span className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">{service}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  
                    <div className="pt-4 mt-4 border-t border-slate-200 dark:border-white/5">
                      <div className="flex justify-between items-center mb-4">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">PDVs (Frentistas) Vinculados</label>
                        <button 
                          type="button"
                          onClick={() => {
                            const id = Math.random().toString(36).substr(2, 9);
                            addUser({ id, name: 'Novo Frentista', email: `frentista${Math.floor(Math.random() * 1000)}@posto.com`, role: 'attendant', stationId: editingStation.id });
                          }}
                          className="text-[10px] font-bold uppercase tracking-widest text-[#ea580c] hover:bg-orange-50 dark:hover:bg-orange-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Adicionar PDV
                        </button>
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {users.filter(u => u.role === 'attendant' && u.stationId === editingStation.id).length === 0 ? (
                          <div className="text-center py-4 bg-slate-50 dark:bg-black/20 rounded-xl border border-slate-200 dark:border-white/5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nenhum frentista vinculado</p>
                          </div>
                        ) : (
                          users.filter(u => u.role === 'attendant' && u.stationId === editingStation.id).map(u => (
                            <div key={u.id} className="flex justify-between items-center bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-slate-200 dark:border-white/5">
                              <div>
                                <p className="text-xs font-bold text-slate-800 dark:text-white uppercase">{u.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{u.email}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => deleteUser(u.id)}
                                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Map */}
                  <div className="flex flex-col h-[400px] md:h-auto border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden relative">
                    <div className="absolute top-4 left-4 z-[400] bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-2 rounded-lg text-xs font-bold shadow-lg pointer-events-none border border-black/5 dark:border-white/10">
                      Clique no mapa para marcar a localização exata do posto
                    </div>
                    <MapContainer 
                      center={[editingStation.lat || -23.55052, editingStation.lng || -46.633308]} 
                      zoom={14} 
                      style={{ width: '100%', height: '100%', zIndex: 1 }}
                    >
                      <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />
                      <LocationPicker 
                        position={[editingStation.lat || -23.55052, editingStation.lng || -46.633308]} 
                        setPosition={(pos) => setEditingStation({ ...editingStation, lat: pos[0], lng: pos[1] })} 
                      />
                    </MapContainer>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 shrink-0 flex justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setEditingStation(null)}
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="edit-station-form"
                className="px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-widest bg-[#ea580c] text-white hover:bg-orange-600 transition-colors shadow-m"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
