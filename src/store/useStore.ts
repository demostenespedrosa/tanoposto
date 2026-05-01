import { create } from 'zustand';

export type Role = 'admin' | 'attendant' | 'customer' | null;

export type FuelType = string;

export interface Station {
  id: string;
  name: string;
  address: string;
  openingTime: string;
  closingTime: string;
  logoUrl?: string;
  lat: number;
  lng: number;
  originalPrice: number;
  discountedPrice: number;
  distance: string;
  fuelPrices: {
    [key: string]: { original: number; discounted: number };
  };
  fuelTypes: FuelType[];
  rating: number;
  ratingCount?: number;
  userRating?: number;
  services?: string[];
}

export interface User {
  id: string;
  name: string;
  role: Role;
  email: string;
  stationId?: string; // Reference to the station for attendants
}

export interface ActiveToken {
  code: string;
  expiresAt: number;
  stationId: string;
  status: 'active' | 'used' | 'expired';
  fuelType?: FuelType;
  liters?: number;
  totalPrice?: number;
  originalPrice?: number;
  createdAt: number;
}

export interface Banner {
  id: string;
  imageUrl: string;
  linkUrl?: string;
  active: boolean;
}

export type Theme = 'light' | 'dark';

export interface AppSettings {
  appFee: number;
  maxDiscount: number;
  tokenExpirationMinutes: number;
  availableFuels: string[];
  availableServices: string[];
}

interface AppState {
  theme: Theme;
  currentUser: User | null;
  users: User[];
  stations: Station[];
  banners: Banner[];
  settings: AppSettings;
  activeToken: ActiveToken | null;
  logs: string[];
  setTheme: (theme: Theme) => void;
  login: (user: User) => void;
  logout: () => void;
  generateToken: (stationId: string, fuelType?: FuelType, liters?: number, totalPrice?: number, originalPrice?: number) => void;
  validateToken: (code: string) => boolean;
  addStation: (station: Station) => void;
  updateStation: (id: string, data: Partial<Station>) => void;
  deleteStation: (id: string) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  updateSettings: (settings: Partial<AppSettings>) => void;
  addLog: (message: string) => void;
  addBanner: (banner: Banner) => void;
  updateBanner: (id: string, data: Partial<Banner>) => void;
  deleteBanner: (id: string) => void;
}

const MOCK_STATIONS: Station[] = [
  {
    id: '1',
    name: 'Auto Posto Confiança',
    address: 'Av. Paulista, 1000 - Bela Vista',
    openingTime: '06:00',
    closingTime: '22:00',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Ipiranga_logo.svg/640px-Ipiranga_logo.svg.png',
    lat: -23.55052,
    lng: -46.633308,
    originalPrice: 5.89,
    discountedPrice: 5.49,
    distance: '1.2 km',
    fuelPrices: {
      'Gasolina comum': { original: 5.89, discounted: 5.49 },
      'Etanol': { original: 3.99, discounted: 3.69 },
      'Diesel S10': { original: 5.99, discounted: 5.59 },
      'Gasolina aditivada': { original: 6.09, discounted: 5.79 }
    },
    fuelTypes: ['Gasolina comum', 'Etanol', 'Diesel S10', 'Gasolina aditivada'],
    rating: 4.8,
    ratingCount: 156,
    services: ['Loja de Conveniência', 'Calibrador', 'Lava Rápido', 'Caixa Eletrônico'],
  },
  {
    id: '2',
    name: 'Posto Estrela',
    address: 'Rua Augusta, 1500 - Consolação',
    openingTime: '00:00',
    closingTime: '23:59',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Shell_logo.svg/640px-Shell_logo.svg.png',
    lat: -23.55252,
    lng: -46.635308,
    originalPrice: 5.95,
    discountedPrice: 5.60,
    distance: '2.5 km',
    fuelPrices: {
      'Gasolina comum': { original: 5.95, discounted: 5.60 },
      'Etanol': { original: 4.05, discounted: 3.75 },
      'Diesel S10': { original: 6.05, discounted: 5.70 },
      'Gasolina aditivada': { original: 6.15, discounted: 5.85 }
    },
    fuelTypes: ['Gasolina comum', 'Etanol', 'Diesel S10', 'Gasolina aditivada'],
    rating: 4.5,
    ratingCount: 89,
    services: ['Loja de Conveniência', 'Calibrador', 'Troca de Óleo'],
  },
  {
    id: '3',
    name: 'Rede Campeão',
    address: 'Av. Brigadeiro Faria Lima, 2000 - Pinheiros',
    openingTime: '05:00',
    closingTime: '23:00',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/BR_Petrobras_Logo.svg/640px-BR_Petrobras_Logo.svg.png',
    lat: -23.55152,
    lng: -46.631308,
    originalPrice: 5.80,
    discountedPrice: 5.25,
    distance: '0.8 km',
    fuelPrices: {
      'Gasolina comum': { original: 5.80, discounted: 5.25 },
      'Gasolina aditivada': { original: 6.00, discounted: 5.50 }
    },
    fuelTypes: ['Gasolina comum', 'Gasolina aditivada'],
    rating: 4.9,
    ratingCount: 312,
    services: ['Loja de Conveniência', 'Calibrador', 'Farmácia', 'Borracharia'],
  },
];

const MOCK_BANNERS: Banner[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1627065969145-eb4d90ce3785?w=800&q=80', // Gas station
    active: true,
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800&q=80', // Driving/Road
    active: true,
  }
];

const MOCK_USERS: User[] = [
  { id: '1', name: 'João Silva', email: 'joao@example.com', role: 'customer' },
  { id: '2', name: 'Maria Souza', email: 'maria@example.com', role: 'customer' },
  { id: '3', name: 'Frentista Carlos', email: 'carlos@postoestrela.com', role: 'attendant' },
  { id: '4', name: 'Admin Master', email: 'admin@sistema.com', role: 'admin' },
];

export const useStore = create<AppState>((set, get) => ({
  theme: 'light',
  currentUser: null,
  users: MOCK_USERS,
  settings: {
    appFee: 2.5,
    maxDiscount: 15,
    tokenExpirationMinutes: 10,
    availableFuels: ['Gasolina comum', 'Etanol', 'Diesel S10', 'Gasolina aditivada'],
    availableServices: ['Loja de Conveniência', 'Calibrador de Pneus', 'Ducha', 'Troca de Óleo', 'Borracharia', 'Banheiro']
  },
  stations: MOCK_STATIONS,
  banners: MOCK_BANNERS,
  activeToken: null,
  logs: [],
  
  setTheme: (theme) => set({ theme }),
  login: (user) => set({ currentUser: user }),
  logout: () => set({ currentUser: null }),
  
  generateToken: (stationId, fuelType, liters, totalPrice, originalPrice) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const createdAt = Date.now();
    const expiresAt = Date.now() + get().settings.tokenExpirationMinutes * 60 * 1000;
    set({ activeToken: { code, createdAt, expiresAt, stationId, status: 'active', fuelType, liters, totalPrice, originalPrice } });
    get().addLog(`Token gerado para o posto ${stationId} pelo usuário ${get().currentUser?.name}`);
  },
  
  validateToken: (code) => {
    const { activeToken } = get();
    if (activeToken && activeToken.code === code && activeToken.status === 'active' && activeToken.expiresAt > Date.now()) {
      set({ activeToken: { ...activeToken, status: 'used' } });
      get().addLog(`Token ${code} validado pelo frentista ${get().currentUser?.name}`);
      return true;
    }
    get().addLog(`Falha na validação do token ${code}`);
    return false;
  },

  addStation: (station) => {
    set((state) => ({ stations: [...state.stations, station] }));
    get().addLog(`Novo posto adicionado: ${station.name}`);
  },

  updateStation: (id, data) => {
    set((state) => ({
      stations: state.stations.map((s) => (s.id === id ? { ...s, ...data } : s)),
    }));
    get().addLog(`Posto ${id} atualizado`);
  },

  deleteStation: (id) => {
    set((state) => ({
      stations: state.stations.filter((s) => s.id !== id),
    }));
    get().addLog(`Posto ${id} excluído`);
  },

  addBanner: (banner) => {
    set((state) => ({ banners: [...state.banners, banner] }));
    get().addLog(`Novo banner adicionado`);
  },

  updateBanner: (id, data) => {
    set((state) => ({
      banners: state.banners.map((b) => (b.id === id ? { ...b, ...data } : b)),
    }));
    get().addLog(`Banner ${id} atualizado`);
  },

  deleteBanner: (id) => {
    set((state) => ({
      banners: state.banners.filter((b) => b.id !== id),
    }));
    get().addLog(`Banner ${id} excluído`);
  },

  addUser: (user) => {
    set((state) => ({ users: [...state.users, user] }));
    get().addLog(`Usuário ${user.name} adicionado`);
  },

  updateUser: (id, data) => {
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
    }));
    get().addLog(`Usuário ${id} atualizado`);
  },

  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
    }));
    get().addLog(`Usuário ${id} excluído`);
  },

  updateSettings: (settings) => {
    set((state) => ({ settings: { ...state.settings, ...settings } }));
    get().addLog(`Configurações atualizadas`);
  },

  addLog: (message) => set((state) => ({ logs: [`[${new Date().toISOString()}] ${message}`, ...state.logs].slice(0, 100) })),
}));
