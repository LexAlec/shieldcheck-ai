"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Users, AlertTriangle, ArrowLeft, Search, Filter } from "lucide-react";
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
    return query(collection(firestore, "community_scam_reports"), orderBy("reportTimestamp", "desc"), limit(20));
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

      <div className="bg-indigo-600 rounded-3xl p-6 text-white space-y-2 shadow-lg shadow-indigo-500/20">
        <div className="flex items-center gap-2">
           <Users className="w-5 h-5 text-indigo-200" />
           <h2 className="font-bold">Inteligência Coletiva</h2>
        </div>
        <p className="text-xs text-indigo-100 leading-relaxed">
          Estes números foram reportados por outros utilizadores do ShieldCheck. Ajuda a comunidade denunciando chamadas suspeitas.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="glass-card flex-1 flex items-center gap-2 px-4 py-2">
          <Search className="w-5 h-5 text-muted-foreground" />
          <Input placeholder="Pesquisar..." className="border-0 focus-visible:ring-0 bg-transparent h-8" />
        </div>
        <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-white/20 bg-white">
          <Filter className="w-5 h-5 text-gray-400" />
        </Button>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">A carregar base comunitária...</p>
        ) : reports && reports.length > 0 ? (
          reports.map((report) => (
            <div key={report.id} className="glass-card border-l-4 border-orange-400 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800">{report.phoneNumber}</h4>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase">{report.scamType}</p>
                </div>
                <Badge variant="outline" className="text-[10px] h-5 bg-orange-50 text-orange-700 border-orange-100">
                  {report.reportType}
                </Badge>
              </div>
              {report.reportedContent && (
                <p className="text-xs text-muted-foreground italic line-clamp-2 bg-gray-50 p-2 rounded-lg">
                  "{report.reportedContent}"
                </p>
              )}
              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-muted-foreground">
                  Reportado em {format(new Date(report.reportTimestamp), "dd MMM", { locale: pt })}
                </span>
                <span className="text-[10px] font-bold text-indigo-600">Verificado</span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
            <AlertTriangle className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm font-medium">Sem relatos recentes na tua área.</p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
}
