import React, { useState, useEffect, useRef } from "react";
import { useStore, Station, FuelType } from "../../store/useStore";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Search,
  AlertCircle,
  Ticket,
  User,
  LogOut,
  Sun,
  Moon,
  Map as MapIconComponent,
  Home,
  Flame,
  Gift,
  ChevronRight,
  List as ListIcon,
  Map as MapIcon,
  Clock,
  Bell,
  History,
  Wallet,
  Navigation,
  X,
  Edit3,
  Settings,
  HelpCircle,
  FileText,
  Trash2,
  Star,
  CheckCircle2,
  Coffee,
  Wrench,
  Droplet,
  Store,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { format } from "date-fns";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { motion, AnimatePresence } from "motion/react";

// Fix for default marker icons in Leaflet with React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create custom icon for Tá no Posto
const fuelIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/2.0.2/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function StationDetailsOverlay({
  station,
  onClose,
  onGenerateToken,
}: {
  station: Station;
  onClose: () => void;
  onGenerateToken: (
    stationId: string,
    fuelType?: FuelType,
    liters?: number,
    totalPrice?: number,
    originalPrice?: number,
  ) => void;
  key?: React.Key;
}) {
  const { updateStation } = useStore();
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedFuel, setSelectedFuel] = useState<FuelType | null>(null);
  const [moneyValue, setMoneyValue] = useState<string>("");
  const [litersValue, setLitersValue] = useState<string>("");
  const [isCalculating, setIsCalculating] = useState<"money" | "liters" | null>(
    null,
  );

  const currentPrice = selectedFuel
    ? station.fuelPrices[selectedFuel]?.discounted || 0
    : 0;

  const handleMoneyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    setMoneyValue(val);
    setIsCalculating("money");

    if (val && currentPrice > 0) {
      setLitersValue(
        (parseFloat(val) / currentPrice).toFixed(3).replace(".", ","),
      );
    } else {
      setLitersValue("");
    }
  };

  const handleLitersChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/,/g, ".").replace(/[^0-9.]/g, "");
    const parts = val.split(".");
    if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
    setLitersValue(val);
    setIsCalculating("liters");

    if (val && currentPrice > 0) {
      setMoneyValue(
        (parseFloat(val) * currentPrice).toFixed(2).replace(".", ","),
      );
    } else {
      setMoneyValue("");
    }
  };

  const moneyDisplay =
    isCalculating === "money" ? moneyValue : moneyValue.replace(".", ",");
  const litersDisplay =
    isCalculating === "liters" ? litersValue : litersValue.replace(".", ",");

  const openNav = () => {
    const defaultLat = station.lat || -23.55052;
    const defaultLng = station.lng || -46.633308;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${defaultLat},${defaultLng}`;
    window.open(url, "_blank");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="absolute inset-0 z-[100] bg-slate-50 dark:bg-[#020617] flex flex-col hide-scrollbar"
    >
      <header className="flex justify-between items-center p-6 pb-4 relative z-10 bg-white/80 dark:bg-[#020617]/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#111827] flex items-center justify-center border border-slate-200 dark:border-white/5 active:scale-95 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Detalhes do Posto
        </span>
        <div className="w-10 h-10" />
      </header>

      <div className="flex-1 overflow-y-auto pb-32 hide-scrollbar">
        <div className="p-6">
          <div className="flex items-center gap-5 mb-8">
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center p-3 shrink-0 border border-slate-200 dark:border-white/10 shadow-sm relative overflow-hidden">
              {station.logoUrl ? (
                <img
                  src={station.logoUrl}
                  alt={station.name}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <span className="text-3xl font-black text-slate-400">
                  {station.name.charAt(0)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-black text-slate-900 dark:text-white text-2xl uppercase tracking-tighter leading-none mb-2">
                {station.name}
              </h2>
              <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400">
                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-xs font-bold uppercase tracking-wider leading-snug line-clamp-2">
                  {station.address || "Endereço não informado"}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white dark:bg-[#0A192F] p-4 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Clock className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Horário
                </span>
              </div>
              <p className="font-bold text-sm text-slate-700 dark:text-slate-300">
                {station.openingTime && station.closingTime
                  ? `${station.openingTime} às ${station.closingTime}`
                  : "Indisponível"}
              </p>
            </div>
            <div className="bg-white dark:bg-[#0A192F] p-4 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Navigation className="w-4 h-4" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Distância
                </span>
              </div>
              <p className="font-black text-xl text-[#ea580c] italic tracking-tighter">
                {station.distance}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0A192F] p-4 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm mb-8 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-slate-400 mb-1">
                <Star className="w-4 h-4 fill-orange-400 text-orange-400" />
                <span className="text-[9px] font-black uppercase tracking-widest">
                  Avaliação dos Usuários
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                Baseado em {station.ratingCount || 12} avaliações
              </p>
            </div>
            <div className="text-3xl font-black italic tracking-tighter text-slate-800 dark:text-white">
              {station.rating.toFixed(1)}
            </div>
          </div>

          {station.services && station.services.length > 0 && (
            <div className="mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 mt-2">
                Serviços no Local
              </h3>
              <div className="flex gap-2 flex-wrap">
                {station.services.map((service, idx) => {
                  let Icon = CheckCircle2;
                  let colorClass = "text-slate-500 bg-slate-50 dark:bg-white/5";
                  if (service.toLowerCase().includes("conveni")) {
                    Icon = Store;
                    colorClass =
                      "text-orange-600 bg-orange-50 dark:bg-orange-500/10";
                  } else if (service.toLowerCase().includes("calibrador")) {
                    Icon = Wrench;
                    colorClass =
                      "text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10";
                  } else if (service.toLowerCase().includes("lava")) {
                    Icon = Droplet;
                    colorClass = "text-orange-600 bg-orange-50 dark:bg-orange-500/10";
                  } else if (service.toLowerCase().includes("caixa")) {
                    Icon = Wallet;
                    colorClass =
                      "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10";
                  }

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${colorClass}`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {service}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4">
            Combustíveis
          </h3>
          <div className="space-y-3 mb-8">
            {station.fuelPrices &&
              Object.entries(station.fuelPrices).map(([fuelType, prices]) => {
                const discountPercent = (
                  (1 - prices.discounted / prices.original) *
                  100
                ).toFixed(0);
                return (
                  <div
                    key={fuelType}
                    className="bg-white dark:bg-[#0A192F] p-5 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm flex items-center justify-between"
                  >
                    <span className="font-black text-slate-800 dark:text-white uppercase tracking-tight text-sm">
                      {fuelType}
                    </span>
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-black italic text-[#ea580c] tracking-tighter leading-none mb-1">
                        R$ {prices.discounted.toFixed(2).replace(".", ",")}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 line-through">
                          R$ {prices.original.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="text-[9px] font-black text-green-500 bg-green-50 dark:bg-green-500/10 px-1.5 py-0.5 rounded uppercase tracking-widest">
                          -{discountPercent}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>

          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 mt-2">
            Avalie o Posto
          </h3>
          <div className="bg-white dark:bg-[#0A192F] p-4 rounded-[2rem] border border-slate-200 dark:border-white/5 shadow-sm mb-8 flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => updateStation(station.id, { userRating: star })}
                className="p-2 transition-transform active:scale-95 outline-none"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${station.userRating && station.userRating >= star ? "fill-orange-400 text-orange-400" : "text-slate-200 dark:text-white/10"}`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-slate-50 via-slate-50 to-transparent dark:from-[#020617] dark:via-[#020617] dark:to-transparent pt-12 flex gap-3">
        <button
          onClick={openNav}
          className="flex-1 bg-white dark:bg-[#111827] text-slate-800 dark:text-white border border-slate-200 dark:border-white/10 py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-transform active:scale-95 text-center flex items-center justify-center gap-2 shadow-sm"
        >
          <Navigation className="w-5 h-5 text-slate-400" />
          Rota
        </button>
        <button
          onClick={() => setIsBottomSheetOpen(true)}
          className="flex-[2] bg-[#ea580c] text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-transform active:scale-95 text-center shadow-xl shadow-orange-500/20"
        >
          Abastecer Aqui
        </button>
      </div>

      {/* Bottom Sheet Modal */}
      <AnimatePresence>
        {isBottomSheetOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBottomSheetOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm z-[110]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-[#020617] rounded-t-[2.5rem] z-[120] flex flex-col shadow-2xl border-t border-white/10"
              style={{ maxHeight: "90vh" }}
            >
              <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mt-4 mb-6" />

              <div className="px-6 pb-8 overflow-y-auto hide-scrollbar">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white">
                    Configure seu
                    <br />
                    <span className="text-[#ea580c]">Abastecimento.</span>
                  </h3>
                  <button
                    onClick={() => setIsBottomSheetOpen(false)}
                    className="w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Fuel Selection */}
                <div className="mb-6">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-3">
                    Escolha o Combustível
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {station.fuelPrices &&
                      Object.entries(station.fuelPrices).map(
                        ([fuelType, prices]) => (
                          <button
                            key={fuelType}
                            onClick={() => {
                              setSelectedFuel(fuelType as FuelType);
                              // recalculate opposite if something is typed
                              if (moneyValue) {
                                const p = prices.discounted;
                                setLitersValue(
                                  (parseFloat(moneyValue.replace(",", ".")) / p)
                                    .toFixed(3)
                                    .replace(".", ","),
                                );
                              }
                            }}
                            className={cn(
                              "p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all",
                              selectedFuel === fuelType
                                ? "bg-[#ea580c]/10 border-[#ea580c] shadow-sm"
                                : "bg-slate-50 dark:bg-transparent border-slate-200 dark:border-white/10",
                            )}
                          >
                            <span
                              className={cn(
                                "text-[9px] font-black uppercase tracking-widest truncate",
                                selectedFuel === fuelType
                                  ? "text-[#ea580c]"
                                  : "text-slate-600 dark:text-slate-400",
                              )}
                            >
                              {fuelType}
                            </span>
                            <span
                              className={cn(
                                "text-base font-black italic tracking-tighter",
                                selectedFuel === fuelType
                                  ? "text-slate-900 dark:text-white"
                                  : "text-slate-500 dark:text-slate-500",
                              )}
                            >
                              R${" "}
                              {prices.discounted.toFixed(2).replace(".", ",")}
                            </span>
                          </button>
                        ),
                      )}
                  </div>
                </div>

                {/* Amount Inputs */}
                <div className="space-y-4 mb-8">
                  <div className="bg-slate-50 dark:bg-black/30 rounded-[2rem] p-4 border border-slate-200 dark:border-white/5 relative flex items-center focus-within:border-[#ea580c] transition-colors">
                    <span className="text-[#ea580c] font-black text-xl italic absolute left-6 tracking-tighter">
                      R$
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,00"
                      value={moneyDisplay}
                      onChange={handleMoneyChange}
                      disabled={!selectedFuel}
                      className="w-full bg-transparent border-none outline-none text-right text-3xl font-black text-slate-900 dark:text-white pl-16 disabled:opacity-50 tracking-tighter placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>

                  <div className="flex items-center gap-4 justify-center">
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      Ou
                    </span>
                    <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10" />
                  </div>

                  <div className="bg-slate-50 dark:bg-black/30 rounded-[2rem] p-4 border border-slate-200 dark:border-white/5 relative flex items-center focus-within:border-[#ea580c] transition-colors">
                    <span className="text-[#ea580c] font-black text-xl italic absolute left-6 tracking-tighter">
                      L
                    </span>
                    <input
                      type="text"
                      inputMode="decimal"
                      placeholder="0,000"
                      value={litersDisplay}
                      onChange={handleLitersChange}
                      disabled={!selectedFuel}
                      className="w-full bg-transparent border-none outline-none text-right text-3xl font-black text-slate-900 dark:text-white pl-16 disabled:opacity-50 tracking-tighter placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (selectedFuel && moneyValue && litersValue) {
                      const origCost = station.fuelPrices[selectedFuel]
                        ?.original
                        ? station.fuelPrices[selectedFuel]!.original *
                          parseFloat(litersValue.replace(",", "."))
                        : undefined;
                      onGenerateToken(
                        station.id,
                        selectedFuel,
                        parseFloat(litersValue.replace(",", ".")),
                        parseFloat(moneyValue.replace(",", ".")),
                        origCost,
                      );
                      setIsBottomSheetOpen(false);
                      onClose();
                    }
                  }}
                  disabled={!selectedFuel || !moneyValue}
                  className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white py-5 rounded-2xl text-xs font-black uppercase tracking-[0.2em] transition-transform active:scale-95 text-center shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:active:scale-100"
                >
                  Gerar Token
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function CustomerApp() {
  const {
    stations,
    banners,
    activeToken,
    generateToken,
    currentUser,
    logout,
    theme,
    setTheme,
  } = useStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    | "home"
    | "stations"
    | "tokens"
    | "profile"
    | "history"
    | "edit-profile"
    | "settings"
  >("home");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"distance" | "price">("distance");
  const [mapFuelFilter, setMapFuelFilter] = useState<
    "Gasolina comum" | "Etanol" | "Diesel S10" | "Gasolina aditivada"
  >("Gasolina comum");
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter out stations to simulate "nearby"
  const nearbyStations = stations
    .filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.address &&
          s.address.toLowerCase().includes(searchQuery.toLowerCase())),
    )
    .sort((a, b) => {
      if (sortBy === "distance") {
        return parseFloat(a.distance) - parseFloat(b.distance);
      } else {
        return a.discountedPrice - b.discountedPrice;
      }
    });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [activeTab]);

  useEffect(() => {
    const activeBanners = banners ? banners.filter((b) => b.active) : [];
    if (activeBanners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % activeBanners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  useEffect(() => {
    if (activeToken && activeToken.status === "active") {
      const interval = setInterval(() => {
        const remaining = Math.max(0, activeToken.expiresAt - Date.now());
        setTimeLeft(remaining);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [activeToken]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleActivate = (
    stationId: string,
    fuelType?: FuelType,
    liters?: number,
    totalPrice?: number,
    originalPrice?: number,
  ) => {
    generateToken(stationId, fuelType, liters, totalPrice, originalPrice);
    setActiveTab("tokens");
  };

  const isExpired = activeToken
    ? timeLeft <= 0 || activeToken.status !== "active"
    : true;

  return (
    <div className="h-[100dvh] bg-gradient-to-b from-orange-50 to-white dark:from-[#061024] dark:to-[#020617] text-slate-900 dark:text-white flex flex-col font-sans transition-colors duration-300 md:max-w-md md:mx-auto md:border-x md:border-orange-100 dark:md:border-white/10 md:shadow-2xl overflow-hidden relative">
      {/* Content Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto pb-24 relative hide-scrollbar"
      >
        {/* --- HOME TAB --- */}
        {activeTab === "home" && (
          <div className="p-6 pt-12 min-h-full flex flex-col">
            <header className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ea580c] to-red-600 text-white flex items-center justify-center text-lg font-black uppercase shadow-lg shadow-orange-500/30 cursor-pointer"
                  onClick={() => setActiveTab("profile")}
                >
                  {currentUser?.name.charAt(0)}
                </div>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-[#ea580c] uppercase mb-0.5 mt-0.5">
                    Olá, de volta!
                  </p>
                  <h2 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                    {currentUser?.name.split(" ")[0]}
                  </h2>
                </div>
              </div>
              <button className="relative w-10 h-10 rounded-full bg-white dark:bg-[#111827] flex items-center justify-center shadow-md shadow-orange-100 dark:shadow-none border border-orange-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:text-orange-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-orange-500 rounded-full border-2 border-white dark:border-[#111827]"></span>
              </button>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Card 1: Valor Economizado */}
              <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-[#051F14] dark:to-[#0A192F] p-4 rounded-3xl border border-emerald-100 dark:border-emerald-500/20 shadow-sm shadow-emerald-100/50 dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <div className="w-8 h-8 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-500">
                    Economia
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-500/70 uppercase tracking-widest">
                    Saldo Atual
                  </span>
                  <p className="font-black text-2xl text-emerald-900 dark:text-white tracking-tighter mt-0.5 flex items-baseline gap-1">
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">
                      R$
                    </span>{" "}
                    124
                    <span className="text-sm text-emerald-700 dark:text-emerald-400">
                      ,50
                    </span>
                  </p>
                </div>
              </div>

              {/* Card 2: Pontos flux (ml) */}
              <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-[#1E1B4B] dark:to-[#0A192F] p-4 rounded-3xl border border-indigo-100 dark:border-indigo-500/20 shadow-sm shadow-indigo-100/50 dark:shadow-none flex flex-col justify-between">
                <div className="flex items-center gap-2 text-slate-400 mb-4">
                  <div className="w-8 h-8 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                    <Flame className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-indigo-800 dark:text-indigo-400">
                    Meus Pontos
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-500/70 uppercase tracking-widest">
                    Disponível
                  </span>
                  <p className="font-black text-2xl text-indigo-900 dark:text-white tracking-tighter mt-0.5 flex items-baseline gap-1">
                    2.500{" "}
                    <span className="text-sm text-indigo-700 dark:text-indigo-400">
                      ml
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Promotional Banners */}
            {banners && banners.filter((b) => b.active).length > 0 && (
              <div className="mb-8 relative rounded-3xl overflow-hidden aspect-[21/9] bg-slate-100 dark:bg-[#0A192F] shadow-sm border border-slate-200 dark:border-white/5 group">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={
                      currentBannerIndex %
                      banners.filter((b) => b.active).length
                    }
                    src={
                      banners.filter((b) => b.active)[
                        currentBannerIndex %
                          banners.filter((b) => b.active).length
                      ].imageUrl
                    }
                    alt={`Banner ${(currentBannerIndex % banners.filter((b) => b.active).length) + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </AnimatePresence>

                {/* Dots indicator */}
                {banners.filter((b) => b.active).length > 1 && (
                  <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                    {banners
                      .filter((b) => b.active)
                      .map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentBannerIndex(idx)}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            idx ===
                              currentBannerIndex %
                                banners.filter((b) => b.active).length
                              ? "w-4 bg-white"
                              : "w-1.5 bg-white/50",
                          )}
                        />
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 mb-4 px-2">
                Acesso Rápido
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <button
                  onClick={() => setActiveTab("stations")}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-[1.4rem] bg-gradient-to-br from-[#ea580c]/20 to-orange-100 dark:from-[#ea580c]/30 dark:to-orange-900/40 text-[#ea580c] dark:text-orange-400 flex items-center justify-center group-active:scale-95 transition-all shadow-sm shadow-[#ea580c]/10">
                    <Navigation className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#ea580c] dark:text-orange-400">
                    Abastecer
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("tokens")}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-[1.4rem] bg-gradient-to-br from-orange-100 to-red-50 dark:from-orange-500/20 dark:to-red-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-active:scale-95 transition-all shadow-sm shadow-orange-200/50 dark:shadow-none">
                    <Ticket className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    Tokens
                  </span>
                </button>

                <button
                  onClick={() => setActiveTab("history")}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="w-14 h-14 rounded-[1.4rem] bg-gradient-to-br from-orange-100 to-orange-50 dark:from-amber-500/20 dark:to-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-active:scale-95 transition-all shadow-sm shadow-orange-200/50 dark:shadow-none">
                    <History className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    Histórico
                  </span>
                </button>

                <button className="flex flex-col items-center gap-2 group">
                  <div className="w-14 h-14 rounded-[1.4rem] bg-gradient-to-br from-orange-100 to-red-50 dark:from-orange-500/20 dark:to-red-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center group-active:scale-95 transition-all shadow-sm shadow-orange-200/50 dark:shadow-none">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    Cartões
                  </span>
                </button>
              </div>
            </div>

            {/* Near Stations horizontal scroll preview */}
            <div className="mb-4">
              <div className="flex justify-between items-end mb-4 px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                  Postos Próximos
                </h3>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveTab("stations");
                  }}
                  className="text-[10px] font-black uppercase tracking-widest text-[#ea580c]"
                >
                  Ver Mapa
                </button>
              </div>

              <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 snap-x">
                {nearbyStations.slice(0, 3).map((station) => (
                  <div
                    key={station.id}
                    onClick={() => setSelectedStation(station)}
                    className="snap-start shrink-0 w-[240px] bg-white dark:bg-[#0A192F] border border-orange-100 dark:border-orange-500/10 rounded-3xl p-4 shadow-sm shadow-orange-100/50 dark:shadow-none active:scale-95 transition-all cursor-pointer hover:border-orange-300 dark:hover:border-orange-500/30"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="w-10 h-10 bg-white dark:bg-white rounded-xl flex items-center justify-center p-1.5 shrink-0 shadow-sm border border-slate-100 dark:border-slate-300">
                        {station.logoUrl ? (
                          <img
                            src={station.logoUrl}
                            alt={station.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-sm font-black text-slate-300">
                            {station.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="bg-[#ea580c]/10 text-[#ea580c] px-2 py-1 rounded-lg">
                        <span className="text-[9px] font-black uppercase tracking-widest">
                          {station.distance}
                        </span>
                      </div>
                    </div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight leading-tight mb-1 truncate">
                      {station.name}
                    </h4>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest truncate mb-2">
                      {station.address || "Endereço não informado"}
                    </p>
                    <div className="flex items-baseline gap-1.5 mt-2 bg-gradient-to-r from-orange-50 to-white dark:from-orange-900/20 dark:to-[#0A192F] p-2.5 rounded-xl border border-orange-100/50 dark:border-white/5">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        A partir de
                      </span>
                      <span className="text-sm font-black text-[#ea580c] tracking-tighter">
                        R${" "}
                        {station.discountedPrice.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- STATIONS TAB --- */}
        {activeTab === "stations" && (
          <div className="flex flex-col min-h-full">
            <header className="p-6 pb-4 pt-12 shrink-0 bg-transparent relative z-20">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-tight">
                    Postos
                    <br />
                    <span className="text-[#ea580c]">Parceiros.</span>
                  </h1>
                </div>
                {/* View Toggle */}
                <div className="flex bg-orange-100/50 dark:bg-slate-800/80 rounded-xl p-1 shadow-inner border border-orange-100 dark:border-white/5">
                  <button
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      viewMode === "list"
                        ? "bg-white dark:bg-[#111827] text-[#ea580c] shadow-sm"
                        : "text-orange-600 dark:text-slate-400 hover:text-orange-800 dark:hover:text-slate-300",
                    )}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("map")}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      viewMode === "map"
                        ? "bg-white dark:bg-[#111827] text-[#ea580c] shadow-sm"
                        : "text-orange-600 dark:text-slate-400 hover:text-orange-800 dark:hover:text-slate-300",
                    )}
                  >
                    <MapIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-orange-100 dark:border-white/10 shadow-sm shadow-orange-100/50 dark:shadow-none p-3 rounded-xl flex gap-3 items-center mb-3">
                <Search className="w-5 h-5 text-orange-400 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar postos..."
                  className="bg-transparent border-none outline-none text-sm w-full font-bold text-slate-800 dark:text-white placeholder-slate-400 uppercase tracking-widest"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort Controls */}
              {viewMode === "list" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setSortBy("distance")}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-[10px] uppercase font-black tracking-widest border transition-all active:scale-95",
                      sortBy === "distance"
                        ? "bg-[#ea580c] text-white border-[#ea580c]"
                        : "bg-white dark:bg-[#111827] text-slate-500 border-slate-200 dark:border-white/10",
                    )}
                  >
                    Mais Próximo
                  </button>
                  <button
                    onClick={() => setSortBy("price")}
                    className={cn(
                      "flex-1 py-2 px-3 rounded-xl text-[10px] uppercase font-black tracking-widest border transition-all active:scale-95",
                      sortBy === "price"
                        ? "bg-[#ea580c] text-white border-[#ea580c]"
                        : "bg-white dark:bg-[#111827] text-slate-500 border-slate-200 dark:border-white/10",
                    )}
                  >
                    Menor Preço
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
                  {(
                    [
                      "Gasolina comum",
                      "Etanol",
                      "Diesel S10",
                      "Gasolina aditivada",
                    ] as const
                  ).map((fuel) => (
                    <button
                      key={fuel}
                      onClick={() => setMapFuelFilter(fuel)}
                      className={cn(
                        "shrink-0 py-2 px-3 rounded-xl text-[10px] uppercase font-black tracking-widest border transition-all active:scale-95",
                        mapFuelFilter === fuel
                          ? "bg-[#ea580c] text-white border-[#ea580c] shadow-sm"
                          : "bg-white dark:bg-[#111827] text-slate-500 border-slate-200 dark:border-white/10",
                      )}
                    >
                      {fuel}
                    </button>
                  ))}
                </div>
              )}
            </header>

            {viewMode === "list" ? (
              <div className="flex-1 px-6 space-y-4 pb-4">
                {nearbyStations.map((station) => (
                  <div
                    key={station.id}
                    className="bg-white dark:bg-[#0A192F] rounded-[2rem] p-5 border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden relative"
                  >
                    {/* Header: Logo, Name */}
                    <div className="flex gap-4 items-center mb-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center p-2 shrink-0 border border-slate-100 dark:border-white/10 shadow-sm">
                        {station.logoUrl ? (
                          <img
                            src={station.logoUrl}
                            alt={station.name}
                            className="max-w-full max-h-full object-contain"
                          />
                        ) : (
                          <span className="text-xl font-black text-slate-400">
                            {station.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-slate-900 dark:text-white text-base uppercase tracking-tight leading-none mb-1.5 truncate">
                          {station.name}
                        </h3>
                        <div className="flex items-start gap-1.5 text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-bold uppercase tracking-widest leading-snug line-clamp-2">
                            {station.address || "Endereço não informado"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 mb-5 pb-5 border-b border-slate-100 dark:border-white/5">
                      {/* Schedule */}
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-white/5 px-2.5 py-1.5 rounded-lg shrink min-w-0 truncate">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-widest truncate">
                          {station.openingTime && station.closingTime
                            ? `${station.openingTime} às ${station.closingTime}`
                            : "Indisponível"}
                        </span>
                      </div>

                      {/* Distance */}
                      <div className="bg-[#ea580c]/10 text-[#ea580c] px-2.5 py-1.5 rounded-lg shrink-0">
                        <span className="text-[10px] font-black uppercase tracking-widest">
                          {station.distance}
                        </span>
                      </div>
                    </div>

                    {/* Fuel Prices Accordion / Badges */}
                    <div className="space-y-3 mb-6">
                      <p className="text-[10px] uppercase font-black tracking-widest text-[#ea580c]">
                        Preços no App
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {station.fuelPrices &&
                          Object.entries(station.fuelPrices).map(
                            ([fuelType, prices]) => {
                              const discountPercent = (
                                (1 - prices.discounted / prices.original) *
                                100
                              ).toFixed(0);
                              return (
                                <div
                                  key={fuelType}
                                  className="bg-slate-50 dark:bg-black/30 border border-slate-200 dark:border-white/5 rounded-2xl p-3 flex flex-col justify-between"
                                >
                                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-2 truncate">
                                    {fuelType}
                                  </span>
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center justify-between gap-1">
                                      <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                        R${" "}
                                        {prices.discounted
                                          .toFixed(2)
                                          .replace(".", ",")}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-[9px] font-bold text-slate-400 line-through">
                                        R${" "}
                                        {prices.original
                                          .toFixed(2)
                                          .replace(".", ",")}
                                      </span>
                                      <span className="text-[8px] font-bold text-green-500 bg-green-50 dark:bg-green-500/10 px-1 py-0.5 rounded uppercase tracking-widest shrink-0">
                                        -{discountPercent}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              );
                            },
                          )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedStation(station)}
                      className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-colors active:scale-95 text-center shadow-lg shadow-orange-500/20"
                    >
                      Abastecer Aqui
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 relative z-10 w-full min-h-[400px] h-full bg-slate-200 dark:bg-slate-800">
                <MapContainer
                  center={[-23.55052, -46.633308]} // Default to SP
                  zoom={13}
                  style={{
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                  }}
                  zoomControl={false}
                >
                  <TileLayer
                    url={
                      theme === "dark"
                        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    }
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />
                  {/* Simulate markers based on stations array */}
                  {nearbyStations.map((station, i) => {
                    const prices = station.fuelPrices?.[mapFuelFilter];
                    if (!prices) return null; // Only show stations that have selected fuel

                    // Very simple mock offsets for demo purposes
                    const offsetLat = i === 0 ? 0.01 : i === 1 ? -0.015 : 0.02;
                    const offsetLng = i === 0 ? 0.02 : i === 1 ? -0.01 : -0.02;
                    const pos: [number, number] = [
                      -23.55052 + offsetLat,
                      -46.633308 + offsetLng,
                    ];

                    const html = `
                      <div class="bg-[#ea580c] text-white px-2.5 py-1.5 rounded-xl font-sans flex flex-col items-center shadow-lg border-2 border-white dark:border-[#020617] scale-100 hover:scale-110 transition-transform origin-bottom relative">
                        <span class="text-sm font-black italic leading-none tracking-tighter">R$ ${prices.discounted.toFixed(2).replace(".", ",")}</span>
                        <span class="text-[8px] font-bold line-through opacity-80 leading-tight">R$ ${prices.original.toFixed(2).replace(".", ",")}</span>
                        <div class="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white dark:border-t-[#020617]"></div>
                        <div class="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-l-transparent border-r-transparent border-t-[#ea580c]"></div>
                      </div>
                    `;

                    const customIcon = L.divIcon({
                      html,
                      className: "bg-transparent border-none",
                      iconSize: [60, 40],
                      iconAnchor: [30, 46],
                      popupAnchor: [0, -46],
                    });

                    return (
                      <Marker key={station.id} position={pos} icon={customIcon}>
                        <Popup className="rounded-xl overflow-hidden min-w-[200px] !p-0">
                          <div className="p-3 font-sans text-center">
                            <h3 className="font-black text-[10px] uppercase tracking-wider text-slate-800 mb-1 leading-tight">
                              {station.name}
                            </h3>
                            <div className="flex flex-col items-center gap-0.5 mb-2">
                              <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest leading-none">
                                {mapFuelFilter}
                              </span>
                              <p className="text-xl font-black italic tracking-tighter text-[#ea580c]">
                                R${" "}
                                {prices.discounted.toFixed(2).replace(".", ",")}
                              </p>
                            </div>
                            <button
                              onClick={() => setSelectedStation(station)}
                              className="w-full bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest py-2 rounded-lg transition-transform active:scale-95"
                            >
                              Ver Detalhes
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
                {/* Floating center marker to simulate user location */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full ring-4 ring-blue-500/30 z-[400] shadow-xl pointer-events-none" />
              </div>
            )}
          </div>
        )}

        {/* --- TOKENS TAB --- */}
        {activeTab === "tokens" && (
          <div className="p-6 pt-12 min-h-full flex flex-col">
            <header className="mb-8">
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#ea580c] uppercase mb-1">
                Carteira
              </p>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                Meus
                <br />
                Tokens.
              </h2>
            </header>

            {activeToken ? (
              <div className="bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-white/5 rounded-3xl p-6 relative mb-6 flex flex-col shadow-xl mt-4">
                {isExpired ? (
                  <div className="text-center text-slate-500 dark:text-slate-400 py-12">
                    <AlertCircle className="w-16 h-16 text-[#ea580c] mx-auto mb-4 opacity-50" />
                    <p className="font-black text-2xl uppercase tracking-widest text-slate-800 dark:text-white text-center">
                      Código
                      <br />
                      {activeToken.status === "used" ? "Usado" : "Expirado"}
                    </p>
                    <p className="text-xs mt-3 font-medium uppercase tracking-widest">
                      Este token não é mais válido.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="text-center mb-8 pt-4">
                      <p className="text-[10px] font-bold tracking-[0.3em] text-slate-400 uppercase mb-2">
                        Seu Código de Abastecimento
                      </p>
                      <div className="text-6xl font-black tracking-[0.2em] text-[#ea580c] bg-orange-50 dark:bg-orange-500/10 py-6 rounded-3xl border border-orange-100 dark:border-orange-500/20">
                        {activeToken.code}
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-white/5 p-5 rounded-2xl shadow-inner mb-6">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-orange-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300">
                          Tempo Restante
                        </span>
                      </div>
                      <span className="font-mono text-2xl font-black text-orange-500">
                        {formatTime(timeLeft)}
                      </span>
                    </div>

                    <div className="space-y-4">
                      {stations.find((s) => s.id === activeToken.stationId) && (
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            Posto
                          </span>
                          <span className="text-sm font-black text-slate-800 dark:text-white text-right">
                            {
                              stations.find(
                                (s) => s.id === activeToken.stationId,
                              )?.name
                            }
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Gerado em
                        </span>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                          {format(
                            new Date(activeToken.createdAt),
                            "dd/MM/yyyy 'às' HH:mm",
                          )}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-white/5">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          Combustível
                        </span>
                        <span className="text-sm font-black text-slate-800 dark:text-white flex flex-col items-end">
                          {activeToken.fuelType}
                          {activeToken.liters && (
                            <span className="text-[10px] text-slate-400 tracking-widest uppercase mt-0.5">
                              {activeToken.liters.toFixed(3).replace(".", ",")}{" "}
                              Litros
                            </span>
                          )}
                        </span>
                      </div>

                      {activeToken.originalPrice && activeToken.totalPrice && (
                        <div className="flex justify-between items-end pt-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                              Valor Original
                            </span>
                            <span className="text-xs font-bold text-slate-400 line-through">
                              R${" "}
                              {activeToken.originalPrice
                                .toFixed(2)
                                .replace(".", ",")}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#ea580c] block mb-1">
                              Você Paga
                            </span>
                            <span className="text-2xl font-black text-emerald-500 tracking-tighter">
                              R${" "}
                              {activeToken.totalPrice
                                .toFixed(2)
                                .replace(".", ",")}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Visual corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#ea580c] rounded-tl-3xl"></div>
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#ea580c] rounded-tr-3xl"></div>
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#ea580c] rounded-bl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#ea580c] rounded-br-3xl"></div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 mt-12 bg-orange-50/50 dark:bg-orange-900/10 border-2 border-dashed border-orange-200 dark:border-orange-500/20 rounded-[2.5rem]">
                <div className="w-20 h-20 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center mb-6">
                  <Ticket className="w-10 h-10 text-orange-500 dark:text-orange-400" />
                </div>
                <p className="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">
                  Nenhum token ativo
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-8 max-w-[200px]">
                  Gere um token em um posto parceiro para começar a abastecer.
                </p>
                <button
                  onClick={() => setActiveTab("stations")}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-orange-500/30 transition-all active:scale-95"
                >
                  Buscar Postos
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- HISTORY TAB --- */}
        {activeTab === "history" && (
          <div className="p-6 pt-12 min-h-full flex flex-col hide-scrollbar pb-32">
            <header className="mb-8">
              <button
                onClick={() => setActiveTab("home")}
                className="w-10 h-10 bg-orange-50 dark:bg-orange-500/10 rounded-full border border-orange-200/50 dark:border-orange-500/20 flex items-center justify-center text-orange-600 dark:text-orange-400 shadow-sm shadow-orange-100 dark:shadow-none mb-6 hover:bg-orange-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <p className="text-[10px] font-bold tracking-[0.3em] text-orange-600 dark:text-orange-500 uppercase mb-1">
                Seus Gastos
              </p>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                Histórico.
              </h2>
            </header>

            <div className="space-y-4">
              {[
                {
                  id: "1",
                  date: "2023-10-25T14:30:00Z",
                  stationName: "Posto Estrela do Sul",
                  originalValue: 154.0,
                  paidValue: 142.5,
                  fuel: "Gasolina comum",
                  liters: 25,
                },
                {
                  id: "2",
                  date: "2023-10-18T09:15:00Z",
                  stationName: "Auto Posto Avenida",
                  originalValue: 210.0,
                  paidValue: 195.0,
                  fuel: "Etanol",
                  liters: 40,
                },
                {
                  id: "3",
                  date: "2023-10-05T18:20:00Z",
                  stationName: "Posto Central",
                  originalValue: 98.5,
                  paidValue: 90.0,
                  fuel: "Gasolina aditivada",
                  liters: 15,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="bg-gradient-to-br from-white to-orange-50/30 dark:from-[#0A192F] dark:to-[#1a130a] p-5 rounded-[2rem] border border-orange-100/50 dark:border-orange-500/10 shadow-sm shadow-orange-100/20 dark:shadow-none mb-4"
                >
                  <div className="flex justify-between items-start mb-4 pb-4 border-b border-orange-100/50 dark:border-white/5">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        {item.stationName}
                      </h4>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">
                        {format(new Date(item.date), "dd/MM/yyyy 'às' HH:mm")}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-[1rem] bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center border border-orange-200 dark:border-orange-500/30">
                      <History className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                        {item.liters}L • {item.fuel}
                      </p>
                      <p className="text-xs text-slate-400 line-through">
                        R$ {item.originalValue.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-0.5">
                        Pago no App
                      </p>
                      <p className="font-black text-xl text-slate-900 dark:text-white tracking-tighter">
                        <span className="text-sm">R$</span>{" "}
                        {item.paidValue.toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- PROFILE TAB --- */}
        {activeTab === "profile" && (
          <div className="p-6 pt-12 min-h-full flex flex-col hide-scrollbar pb-32">
            <header className="mb-8 flex justify-between items-center">
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] text-orange-500 uppercase mb-1">
                  Conta & Opções
                </p>
                <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                  Meu
                  <br />
                  Perfil.
                </h2>
              </div>
              <button className="bg-orange-50 dark:bg-orange-500/10 p-3 rounded-full text-orange-500 hover:text-orange-600 transition-colors shadow-sm shadow-orange-100 dark:shadow-none">
                <Edit3 className="w-5 h-5" />
              </button>
            </header>

            {/* Profile Info */}
            <div className="bg-gradient-to-br from-orange-50 to-white dark:from-[#3f0f1c] dark:to-[#0A192F] rounded-3xl p-6 border border-orange-100 dark:border-orange-500/20 shadow-sm shadow-orange-100/50 dark:shadow-none mb-6 flex items-center gap-5">
              <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-tr from-orange-500 to-red-400 text-white flex items-center justify-center text-3xl font-black uppercase shadow-lg shadow-orange-500/30 shrink-0">
                {currentUser?.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tight truncate">
                  {currentUser?.name}
                </h3>
                <p className="text-xs text-orange-600/70 dark:text-orange-400/70 font-bold uppercase tracking-widest mt-1 truncate">
                  {currentUser?.email}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="px-2.5 py-1.5 bg-orange-100 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5" />
                    Membro Pro
                  </div>
                </div>
              </div>
            </div>

            {/* Application Settings Group */}
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
              Configurações
            </h4>
            <div className="bg-white dark:bg-[#0A192F] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm mb-6 overflow-hidden">
              <button
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500 transition-colors">
                    {theme === "light" ? (
                      <Moon className="w-5 h-5" />
                    ) : (
                      <Sun className="w-5 h-5" />
                    )}
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    Modo Escuro
                  </span>
                </div>
                <div
                  className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === "dark" ? "bg-[#ea580c]" : "bg-slate-300 dark:bg-slate-600"}`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-0"}`}
                  />
                </div>
              </button>

              <button
                onClick={() => setActiveTab("edit-profile")}
                className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300 block">
                      Meus Dados
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                      Alterar informações
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button
                onClick={() => setActiveTab("settings")}
                className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500 transition-colors">
                    <Settings className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    Configurações Avançadas
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* History Link */}
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
              Atividades
            </h4>
            <div className="bg-white dark:bg-[#0A192F] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm mb-6 overflow-hidden">
              <button
                onClick={() => setActiveTab("history")}
                className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500 transition-colors">
                    <History className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300 block">
                      Histórico de Abastecimentos
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                      Últimos abastecimentos
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Support Group */}
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
              Suporte & Legal
            </h4>
            <div className="bg-white dark:bg-[#0A192F] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm mb-8 overflow-hidden">
              <button className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5 group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 transition-colors">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    Central de Ajuda
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 text-sm font-black italic transition-colors">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="font-bold text-sm text-slate-700 dark:text-slate-300">
                    Termos de Uso
                  </span>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600 group-hover:text-slate-400 group-hover:translate-x-1 transition-all" />
              </button>
            </div>

            {/* Logout */}
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="w-full flex items-center justify-center gap-3 p-4 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-100 dark:border-red-500/10 rounded-3xl transition-colors text-red-600 dark:text-red-400 group"
            >
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-black uppercase tracking-widest text-xs">
                Sair da Conta
              </span>
            </button>
            <div className="text-center mt-6 opacity-30">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">
                Tá no Posto v1.0.0
              </span>
            </div>
          </div>
        )}

        {/* --- EDIT PROFILE TAB --- */}
        {activeTab === "edit-profile" && (
          <div className="p-6 pt-12 min-h-full flex flex-col hide-scrollbar pb-32">
            <header className="mb-8">
              <button
                onClick={() => setActiveTab("profile")}
                className="w-10 h-10 bg-white dark:bg-[#111827] rounded-full border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-800 dark:text-white shadow-sm mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#ea580c] uppercase mb-1">
                Informações Pessoais
              </p>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                Meus
                <br />
                Dados.
              </h2>
            </header>

            <div className="flex-1">
              <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#ea580c] to-red-500 text-white flex items-center justify-center text-4xl font-black uppercase shadow-lg shadow-orange-500/30 mb-4 relative">
                  {currentUser?.name?.charAt(0) || "U"}
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white dark:bg-[#0A192F] text-slate-800 dark:text-white rounded-full border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-sm">
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#ea580c]">
                  Alterar Foto
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.name || ""}
                    className="w-full bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] dark:focus:border-[#ea580c] transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    defaultValue={currentUser?.email || ""}
                    className="w-full bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] dark:focus:border-[#ea580c] transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    defaultValue="***.***.***-**"
                    disabled
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-400 outline-none cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 px-1">
                    Para alterar o CPF, entre em contato com o suporte.
                  </p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 px-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    defaultValue="(11) 98765-4321"
                    className="w-full bg-white dark:bg-[#0A192F] border border-slate-200 dark:border-white/5 rounded-2xl px-5 py-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:border-[#ea580c] dark:focus:border-[#ea580c] transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => setActiveTab("profile")}
                className="w-full bg-[#ea580c] text-white px-6 py-4 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-orange-500/30 active:scale-95 transition-transform"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        )}

        {/* --- SETTINGS TAB --- */}
        {activeTab === "settings" && (
          <div className="p-6 pt-12 min-h-full flex flex-col hide-scrollbar pb-32">
            <header className="mb-8">
              <button
                onClick={() => setActiveTab("profile")}
                className="w-10 h-10 bg-white dark:bg-[#111827] rounded-full border border-slate-200 dark:border-white/5 flex items-center justify-center text-slate-800 dark:text-white shadow-sm mb-6"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <p className="text-[10px] font-bold tracking-[0.3em] text-[#ea580c] uppercase mb-1">
                Específicas
              </p>
              <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white leading-none">
                Ajustes.
              </h2>
            </header>

            <div className="space-y-6">
              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
                  Notificações
                </h4>
                <div className="bg-white dark:bg-[#0A192F] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                  <div className="w-full flex items-center justify-between p-4 bg-transparent border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300 block">
                          Promoções e Ofertas
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                          Push na tela
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full p-1 transition-colors bg-[#ea580c] cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between p-4 bg-transparent">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300 block">
                          Status de Tokens
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                          Expirações
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-6 rounded-full p-1 transition-colors bg-[#ea580c] cursor-pointer">
                      <div className="w-4 h-4 rounded-full bg-white transition-transform translate-x-6" />
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 px-2">
                  Privacidade
                </h4>
                <div className="bg-white dark:bg-[#0A192F] rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm overflow-hidden">
                  <div className="w-full flex items-center justify-between p-4 bg-transparent border-b border-slate-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300 block">
                          Localização
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">
                          Apenas em uso
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                  </div>
                  <button className="w-full flex items-center justify-between p-4 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </div>
                      <span className="font-bold text-sm text-red-600 dark:text-red-400">
                        Excluir Conta Permanentemente
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- BOTTOM NAVIGATION --- */}
      <nav className="absolute bottom-0 w-full bg-white/80 dark:bg-[#061024]/80 backdrop-blur-xl border-t border-orange-100 dark:border-white/10 flex justify-around items-center p-2 pb-6 pt-4 z-50 shadow-[0_-10px_40px_-15px_rgba(2,132,199,0.15)] dark:shadow-none">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex flex-col items-center gap-1.5 p-2 px-6 rounded-[1.2rem] transition-all duration-300 ${activeTab === "home" ? "text-[#ea580c] bg-gradient-to-tr from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 shadow-sm shadow-orange-200/50 dark:shadow-none scale-105" : "text-slate-400 hover:text-orange-500 dark:hover:text-orange-300"}`}
        >
          <Home
            className={`w-6 h-6 transition-transform ${activeTab === "home" ? "fill-[#ea580c]/20 scale-110 text-[#ea580c]" : ""}`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${activeTab === "home" ? "text-[#ea580c] dark:text-orange-400" : ""}`}
          >
            Início
          </span>
        </button>
        <button
          onClick={() => setActiveTab("stations")}
          className={`flex flex-col items-center gap-1.5 p-2 px-6 rounded-[1.2rem] transition-all duration-300 ${activeTab === "stations" ? "text-[#ea580c] bg-gradient-to-tr from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 shadow-sm shadow-orange-200/50 dark:shadow-none scale-105" : "text-slate-400 hover:text-orange-500 dark:hover:text-orange-300"}`}
        >
          <MapPin
            className={`w-6 h-6 transition-transform ${activeTab === "stations" ? "fill-[#ea580c]/20 scale-110 text-[#ea580c]" : ""}`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${activeTab === "stations" ? "text-[#ea580c] dark:text-orange-400" : ""}`}
          >
            Postos
          </span>
        </button>
        <button
          onClick={() => setActiveTab("tokens")}
          className={`flex flex-col items-center gap-1.5 p-2 px-6 rounded-[1.2rem] transition-all duration-300 ${activeTab === "tokens" ? "text-orange-600 dark:text-orange-400 bg-gradient-to-tr from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 shadow-sm shadow-orange-200/50 dark:shadow-none scale-105" : "text-slate-400 hover:text-orange-500 dark:hover:text-orange-300"}`}
        >
          <Ticket
            className={`w-6 h-6 transition-transform ${activeTab === "tokens" ? "fill-orange-600/20 scale-110 text-orange-600" : ""}`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${activeTab === "tokens" ? "text-orange-600 dark:text-orange-400" : ""}`}
          >
            Tokens
          </span>
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex flex-col items-center gap-1.5 p-2 px-6 rounded-[1.2rem] transition-all duration-300 ${activeTab === "profile" ? "text-orange-600 dark:text-orange-400 bg-gradient-to-tr from-orange-100 to-orange-50 dark:from-orange-900/40 dark:to-orange-800/20 shadow-sm shadow-orange-200/50 dark:shadow-none scale-105" : "text-slate-400 hover:text-orange-500 dark:hover:text-orange-300"}`}
        >
          <User
            className={`w-6 h-6 transition-transform ${activeTab === "profile" ? "fill-orange-600/20 scale-110 text-orange-600" : ""}`}
          />
          <span
            className={`text-[10px] font-black uppercase tracking-widest ${activeTab === "profile" ? "text-orange-600 dark:text-orange-400" : ""}`}
          >
            Perfil
          </span>
        </button>
      </nav>

      <AnimatePresence>
        {selectedStation && (
          <StationDetailsOverlay
            key="station-details"
            station={selectedStation}
            onClose={() => setSelectedStation(null)}
            onGenerateToken={handleActivate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
