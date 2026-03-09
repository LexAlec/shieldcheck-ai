"use client";

import { useEffect, useState } from "react";
import { getHistory, ScamAnalysisEntry } from "@/lib/scam-history";
import { Navbar } from "@/components/layout/Navbar";
import { History, MessageSquare, Link as LinkIcon, Image as ImageIcon, Trash2, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function HistoryPage() {
  const [history, setHistory] = useState<ScamAnalysisEntry[]>([]);

  useEffect(() => {
    setHistory(getHistory());
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'text': return MessageSquare;
      case 'link': return LinkIcon;
      case 'image': return ImageIcon;
      default: return History;
    }
  };

  const clearHistory = () => {
    if (confirm("Tens a certeza que queres limpar todo o histórico?")) {
      localStorage.removeItem('shieldcheck_history');
      setHistory([]);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-2 rounded-xl text-gray-700 shadow-sm border border-gray-200">
            <History className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Histórico</h1>
        </div>
        {history.length > 0 && (
          <button onClick={clearHistory} className="text-destructive text-sm font-bold flex items-center gap-1 hover:opacity-80">
            <Trash2 className="w-4 h-4" /> Limpar
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-4">
          <div className="bg-white p-8 rounded-full shadow-inner border border-gray-100 opacity-50">
            <History className="w-12 h-12 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-700">Sem análises ainda</h3>
            <p className="text-sm text-muted-foreground max-w-[200px]">As tuas verificações recentes vão aparecer aqui para consulta rápida.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => {
            const Icon = getIcon(entry.type);
            const isHighRisk = entry.riskScore > 60 || entry.riskLevel.includes("Alto");
            
            return (
              <div key={entry.id} className="glass-card flex items-center gap-4 hover:border-primary/20 transition-all cursor-default">
                <div className={cn(
                  "p-3 rounded-2xl shadow-sm text-white",
                  entry.type === 'text' ? 'bg-blue-500' : entry.type === 'link' ? 'bg-cyan-500' : 'bg-indigo-500'
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="font-bold text-gray-800 truncate text-sm">{entry.input}</h4>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{format(new Date(entry.date), "dd MMM", { locale: pt })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={isHighRisk ? "destructive" : "outline"} className="text-[10px] h-4 px-1.5 font-bold">
                      {entry.riskLevel}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground truncate">{entry.scamType}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            );
          })}
          <p className="text-center text-[10px] text-muted-foreground pt-4">Histórico limitado a 10 entradas no plano gratuito.</p>
        </div>
      )}

      <Navbar />
    </div>
  );
}
