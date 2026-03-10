
"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Users, AlertTriangle, ArrowLeft, Search, ShieldAlert, Calendar, MessageSquare, Phone, TrendingUp, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CommunityReportsPage() {
  const { firestore } = useFirestore();

  // Query aggregate statistics for scam numbers
  const statsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "scam_stats"), orderBy("reportCount", "desc"), limit(20));
  }, [firestore]);

  const { data: stats, isLoading } = useCollection(statsQuery);

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Link href="/protection">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Comunidade</h1>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[2rem] p-6 text-white space-y-3 shadow-lg shadow-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
           <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-200" />
              <h2 className="font-bold">Tendências de Fraude</h2>
           </div>
           <p className="text-xs text-indigo-100 leading-relaxed">
             Estes são os números mais reportados pela comunidade. A ShieldCheck AI monitoriza estes padrões em tempo real.
           </p>
        </div>
        <AlertTriangle className="absolute right-[-20px] bottom-[-20px] w-24 h-24 text-white/10" />
      </div>

      <div className="flex gap-2">
        <div className="glass-card flex-1 flex items-center gap-2 px-4 py-2 border-2 border-transparent focus-within:border-primary/20 transition-all">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input placeholder="Pesquisar número..." className="border-0 focus-visible:ring-0 bg-transparent h-8 text-sm" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Números Mais Perigosos</h3>
        {isLoading ? (
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
               <div key={i} className="glass-card h-32 animate-pulse bg-gray-100" />
             ))}
          </div>
        ) : stats && stats.length > 0 ? (
          stats.map((stat) => {
            const isHighRisk = stat.reportCount >= 5 || stat.isHighRisk;
            
            return (
              <div key={stat.id} className={cn(
                "glass-card border-l-4 space-y-3 hover:scale-[1.01] transition-transform",
                isHighRisk ? "border-red-500" : "border-amber-400"
              )}>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {stat.phoneNumber}
                    </h4>
                    <div className="flex gap-2">
                      <Badge variant="outline" className={cn(
                        "text-[9px] h-4 uppercase font-extrabold",
                        isHighRisk ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"
                      )}>
                        {stat.scamType || "Fraude Detetada"}
                      </Badge>
                      {isHighRisk && (
                        <Badge className="text-[9px] h-4 bg-red-600 text-white border-0">
                          RISCO ALTO
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                     <span className="text-xl font-black text-gray-900 leading-none">
                        {stat.reportCount}
                     </span>
                     <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">Reportes</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2 border-t border-gray-100 mt-2">
                  <div className="flex items-center gap-1 text-[9px] text-muted-foreground font-medium">
                    <Calendar className="w-2.5 h-2.5" />
                    Último: {format(new Date(stat.lastReportDate), "dd MMM HH:mm", { locale: pt })}
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50">
                     Ver Detalhes
                  </Button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
            <Users className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm font-medium">A base de dados comunitária está a carregar...</p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
}
