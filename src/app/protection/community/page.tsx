"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Users, AlertTriangle, ArrowLeft, Search, Filter, ShieldAlert, Calendar, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";

export default function CommunityReportsPage() {
  const { firestore } = useFirestore();

  const reportsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, "community_scam_reports"), orderBy("reportTimestamp", "desc"), limit(30));
  }, [firestore]);

  const { data: reports, isLoading } = useCollection(reportsQuery);

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Link href="/protection">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Relatos da Comunidade</h1>
        </div>
      </div>

      <div className="bg-indigo-600 rounded-[2rem] p-6 text-white space-y-3 shadow-lg shadow-indigo-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
           <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-200" />
              <h2 className="font-bold">Inteligência Coletiva</h2>
           </div>
           <p className="text-xs text-indigo-100 leading-relaxed">
             Estes números foram reportados por utilizadores como tu. Juntos criamos um escudo contra burlas em tempo real.
           </p>
        </div>
        <ShieldAlert className="absolute right-[-20px] bottom-[-20px] w-24 h-24 text-white/10" />
      </div>

      <div className="flex gap-2">
        <div className="glass-card flex-1 flex items-center gap-2 px-4 py-2 border-2 border-transparent focus-within:border-primary/20 transition-all">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input placeholder="Pesquisar número ou tipo..." className="border-0 focus-visible:ring-0 bg-transparent h-8 text-sm" />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Números Recentemente Reportados</h3>
        {isLoading ? (
          <div className="space-y-3">
             {[1, 2, 3].map(i => (
               <div key={i} className="glass-card h-32 animate-pulse bg-gray-100" />
             ))}
          </div>
        ) : reports && reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="glass-card border-l-4 border-red-400 space-y-3 hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    {report.reportType === 'Call' ? <Phone className="w-3 h-3 text-blue-500" /> : <MessageSquare className="w-3 h-3 text-cyan-500" />}
                    {report.phoneNumber}
                  </h4>
                  <Badge variant="outline" className="text-[9px] h-4 uppercase font-extrabold bg-red-50 text-red-700 border-red-100">
                    {report.scamType}
                  </Badge>
                </div>
                <div className="flex flex-col items-end">
                   <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verificado
                   </span>
                   <span className="text-[9px] text-muted-foreground font-medium flex items-center gap-1 mt-1">
                      <Calendar className="w-2.5 h-2.5" />
                      {format(new Date(report.reportTimestamp), "dd MMM HH:mm", { locale: pt })}
                   </span>
                </div>
              </div>
              
              {report.reportedContent && (
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                   <p className="text-xs text-gray-600 italic line-clamp-2">
                    "{report.reportedContent}"
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-gray-100 mt-2 text-[10px]">
                <div className="flex gap-3">
                   <span className="text-muted-foreground"><span className="font-bold text-gray-700">1</span> Relato</span>
                   <span className="text-muted-foreground"><span className="font-bold text-gray-700">8</span> Bloqueios</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-[10px] font-bold text-indigo-600 hover:bg-indigo-50">
                   Ver Detalhes
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
            <AlertTriangle className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm font-medium">Sem relatos recentes na base de dados.</p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
}
