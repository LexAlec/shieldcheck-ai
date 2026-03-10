"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Phone, ShieldAlert, Ban, CheckCircle, Flag, X, Loader2, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { analyzePhoneNumber } from "@/ai/flows/analyze-phone-number";
import { cn } from "@/lib/utils";

export default function CallAlertPage() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [phoneNumber] = useState("+351 912 345 678");
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    async function runAnalysis() {
      try {
        const result = await analyzePhoneNumber({ phoneNumber });
        setAnalysis(result);
      } catch (e) {
        toast({ title: "Erro na análise", description: "Não foi possível analisar o número.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    runAnalysis();
  }, [phoneNumber, toast]);

  const handleAction = (action: 'block' | 'trust' | 'report' | 'ignore') => {
    if (!user || !firestore) return;

    const timestamp = new Date().toISOString();
    const historyRef = doc(collection(firestore, "users", user.uid, "analysis_history"));
    
    setDocumentNonBlocking(historyRef, {
      id: historyRef.id,
      analysisType: 'IncomingCall',
      phoneNumber,
      contentAnalyzed: '',
      analysisTimestamp: timestamp,
      riskLevel: analysis?.riskLevel || 'Unknown',
      scamType: analysis?.scamType || 'Potential Fraud',
      detectionReasons: analysis?.reasons || [],
      recommendations: analysis?.recommendations || [],
      userAction: action.charAt(0).toUpperCase() + action.slice(1),
      userActionTimestamp: timestamp
    }, { merge: true });

    if (action === 'block') {
      const blockRef = doc(collection(firestore, "users", user.uid, "blocked_numbers"));
      setDocumentNonBlocking(blockRef, {
        id: blockRef.id,
        phoneNumber,
        blockTimestamp: timestamp,
        reason: 'Aprovado pelo utilizador (IA detetou fraude)'
      }, { merge: true });
      toast({ title: "Número Bloqueado", description: "O número não voltará a incomodar." });
    } else if (action === 'trust') {
      const trustRef = doc(collection(firestore, "users", user.uid, "trusted_numbers"));
      setDocumentNonBlocking(trustRef, {
        id: trustRef.id,
        phoneNumber,
        trustTimestamp: timestamp,
        reason: 'Manual Trust'
      }, { merge: true });
      toast({ title: "Número Confiável", description: "Adicionado à tua lista branca." });
    } else if (action === 'report') {
      const reportRef = doc(collection(firestore, "community_scam_reports"));
      setDocumentNonBlocking(reportRef, {
        id: reportRef.id,
        phoneNumber,
        reportType: 'Call',
        scamType: analysis?.scamType || 'Unknown',
        reportedContent: 'Chamada suspeita detetada pela IA',
        reportTimestamp: timestamp,
        status: 'Submitted'
      }, { merge: true });
      toast({ title: "Reportado", description: "Obrigado por ajudares a comunidade." });
    }

    router.push('/protection');
  };

  const isVeryHighRisk = analysis?.riskLevel === 'Muito alto risco';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-500 text-white space-y-4">
        <Phone className="w-16 h-16 animate-bounce" />
        <h1 className="text-2xl font-bold">Chamada a Entrar...</h1>
        <div className="flex items-center gap-2 text-blue-100">
           <Loader2 className="w-4 h-4 animate-spin" />
           <span className="text-xs font-medium uppercase tracking-widest">Triagem por IA</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col p-6 space-y-8 animate-in fade-in duration-500 overflow-y-auto pb-24 text-white",
      isVeryHighRisk ? "bg-red-950" : "bg-slate-900"
    )}>
      <div className="flex flex-col items-center text-center space-y-4 pt-8">
        <div className={cn(
          "p-6 rounded-full border shadow-2xl",
          isVeryHighRisk ? "bg-red-500/20 border-red-500/50 shadow-red-500/30" : "bg-orange-500/20 border-orange-500/50 shadow-orange-500/30"
        )}>
          <ShieldAlert className={cn("w-16 h-16", isVeryHighRisk ? "text-red-500" : "text-orange-500")} />
        </div>
        <div className="space-y-1">
          <Badge variant="destructive" className="animate-pulse mb-2 px-4 py-1 font-bold text-xs">
            ALERTA DE SEGURANÇA
          </Badge>
          <p className="text-xs text-white/50 font-bold uppercase tracking-widest">Número Suspeito</p>
          <h1 className="text-4xl font-extrabold tracking-tighter">{phoneNumber}</h1>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 p-5 rounded-[2rem] space-y-4">
        <div className="flex items-center gap-2 text-amber-400">
          <AlertTriangle className="w-5 h-5" />
          <h4 className="text-sm font-bold uppercase tracking-wider">Análise de Risco</h4>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
              <span className="text-[10px] text-white/40 block mb-1 font-bold uppercase">Risco</span>
              <span className={cn("font-bold text-lg", isVeryHighRisk ? "text-red-400" : "text-orange-400")}>
                {analysis?.riskLevel}
              </span>
           </div>
           <div className="bg-white/5 p-4 rounded-2xl border border-white/10 overflow-hidden">
              <span className="text-[10px] text-white/40 block mb-1 font-bold uppercase">Tipo</span>
              <span className="font-bold text-white/90 truncate block text-sm">{analysis?.scamType}</span>
           </div>
        </div>

        <div className="space-y-3 pt-2">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Sinais Detetados:</p>
          <ul className="space-y-2">
            {analysis?.reasons.map((reason: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-white/70 leading-relaxed">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-center text-sm font-medium text-white/60 px-4">
          O ShieldCheck recomenda não atender. Desejas bloquear este número?
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleAction('block')} className="h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-lg font-bold shadow-xl shadow-red-600/20">
            <Ban className="w-5 h-5 mr-2" /> Bloquear
          </Button>
          <Button onClick={() => handleAction('ignore')} variant="outline" className="h-16 rounded-2xl border-white/20 hover:bg-white/10 text-lg font-bold bg-transparent">
            <X className="w-5 h-5 mr-2" /> Ignorar
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleAction('trust')} variant="ghost" className="h-14 rounded-2xl hover:bg-white/10 text-sm font-bold">
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Confiar
          </Button>
          <Button onClick={() => handleAction('report')} variant="ghost" className="h-14 rounded-2xl hover:bg-white/10 text-sm font-bold">
            <Flag className="w-4 h-4 mr-2 text-orange-500" /> Reportar
          </Button>
        </div>
      </div>

      <p className="text-center text-[10px] text-white/30 italic px-6 leading-relaxed">
        Privacidade: As chamadas são analisadas localmente. Nenhuma gravação de voz sai do dispositivo.
      </p>

      <Navbar />
    </div>
  );
}
