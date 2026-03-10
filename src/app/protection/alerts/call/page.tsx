"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Phone, ShieldAlert, Ban, CheckCircle, Flag, X, Loader2, Info, AlertTriangle, ShieldX } from "lucide-react";
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
    if (!user || !firestore) {
      router.push('/protection');
      return;
    }

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
      const blockRef = doc(collection(firestore, "users", user.uid, "blocked_numbers"), phoneNumber.replace(/\s+/g, ''));
      setDocumentNonBlocking(blockRef, {
        id: blockRef.id,
        phoneNumber,
        blockTimestamp: timestamp,
        reason: `IA detetou ${analysis?.scamType || 'fraude'}`
      }, { merge: true });
      toast({ title: "Número Bloqueado", description: "O número foi adicionado à tua lista negra." });
    } else if (action === 'trust') {
      const trustRef = doc(collection(firestore, "users", user.uid, "trusted_numbers"), phoneNumber.replace(/\s+/g, ''));
      setDocumentNonBlocking(trustRef, {
        id: trustRef.id,
        phoneNumber,
        trustTimestamp: timestamp,
        reason: 'Aprovado manualmente pelo utilizador'
      }, { merge: true });
      toast({ title: "Número Confiável", description: "Adicionado aos teus contactos seguros." });
    } else if (action === 'report') {
      const reportRef = doc(collection(firestore, "community_scam_reports"));
      setDocumentNonBlocking(reportRef, {
        id: reportRef.id,
        phoneNumber,
        reportType: 'Call',
        scamType: analysis?.scamType || 'Unknown',
        reportedContent: 'Chamada suspeita detetada pela ShieldCheck AI',
        reportTimestamp: timestamp,
        status: 'Submitted'
      }, { merge: true });
      toast({ title: "Reportado", description: "Ajuda coletiva enviada com sucesso." });
    }

    router.push('/protection');
  };

  const isHighRisk = analysis?.riskLevel === 'Muito alto risco' || analysis?.riskLevel === 'Alto risco';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-900 text-white space-y-6">
        <div className="relative">
          <Phone className="w-20 h-20 text-blue-500 animate-pulse" />
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-ping" />
        </div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Chamada a Entrar...</h1>
          <p className="text-sm text-slate-400">Escudo ShieldCheck AI Ativo</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
           <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
           <span className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Analisando Risco...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col p-6 space-y-8 animate-in fade-in zoom-in duration-300 overflow-y-auto pb-24 text-white",
      isHighRisk ? "bg-red-950" : "bg-slate-900"
    )}>
      <div className="flex flex-col items-center text-center space-y-4 pt-10">
        <div className={cn(
          "p-8 rounded-[2.5rem] border shadow-2xl relative",
          isHighRisk ? "bg-red-500/20 border-red-500/50 shadow-red-500/40" : "bg-amber-500/20 border-amber-500/50 shadow-amber-500/40"
        )}>
          {isHighRisk ? <ShieldX className="w-20 h-20 text-red-500" /> : <ShieldAlert className="w-20 h-20 text-amber-500" />}
          <div className={cn(
            "absolute -top-2 -right-2 w-6 h-6 rounded-full animate-ping",
            isHighRisk ? "bg-red-500" : "bg-amber-500"
          )} />
        </div>
        
        <div className="space-y-2">
          <Badge variant="destructive" className={cn(
            "animate-pulse mb-2 px-6 py-1.5 font-bold text-xs rounded-full",
            isHighRisk ? "bg-red-600" : "bg-amber-600"
          )}>
            ALERTA DE SEGURANÇA
          </Badge>
          <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">Número Altamente Suspeito</p>
          <h1 className="text-4xl font-black tracking-tighter">{phoneNumber}</h1>
        </div>
      </div>

      <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-[2.5rem] space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Análise da ShieldCheck</h4>
          </div>
          <Badge variant="outline" className="border-white/20 text-white font-bold">{analysis?.riskLevel}</Badge>
        </div>
        
        <div className="space-y-1">
          <span className="text-[10px] text-white/40 font-bold uppercase">Tipo de Fraude Detetado</span>
          <p className={cn(
            "text-xl font-black italic",
            isHighRisk ? "text-red-400" : "text-amber-400"
          )}>
            {analysis?.scamType}
          </p>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Porquê é perigoso?</p>
          <ul className="space-y-3">
            {analysis?.reasons.map((reason: string, i: number) => (
              <li key={i} className="flex gap-4 text-sm text-white/80 leading-relaxed font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-2" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <p className="text-center text-sm font-bold text-white/60 px-6">
          O ShieldCheck detetou padrões de burla. Bloquear este número agora?
        </p>
        
        <div className="grid grid-cols-1 gap-3 px-2">
          <Button 
            onClick={() => handleAction('block')} 
            className="h-16 rounded-[1.5rem] bg-red-600 hover:bg-red-700 text-lg font-black shadow-2xl shadow-red-600/30 border-0"
          >
            <Ban className="w-6 h-6 mr-2" /> Bloquear Agora
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
             <Button 
               onClick={() => handleAction('ignore')} 
               variant="outline" 
               className="h-14 rounded-[1.5rem] border-white/10 hover:bg-white/5 text-sm font-bold bg-transparent"
             >
               <X className="w-4 h-4 mr-2" /> Ignorar
             </Button>
             <Button 
               onClick={() => handleAction('report')} 
               variant="outline" 
               className="h-14 rounded-[1.5rem] border-white/10 hover:bg-white/5 text-sm font-bold bg-transparent"
             >
               <Flag className="w-4 h-4 mr-2 text-orange-500" /> Reportar
             </Button>
          </div>
          
          <Button 
            onClick={() => handleAction('trust')} 
            variant="ghost" 
            className="h-12 rounded-[1.5rem] hover:bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40"
          >
            <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Marcar como Seguro
          </Button>
        </div>
      </div>

      <div className="text-center px-8">
        <p className="text-[9px] text-white/20 italic leading-relaxed">
          Privacidade ShieldCheck: A análise é feita no dispositivo. <br />
          Nenhuma gravação de áudio é enviada para os nossos servidores.
        </p>
      </div>

      <Navbar />
    </div>
  );
}
