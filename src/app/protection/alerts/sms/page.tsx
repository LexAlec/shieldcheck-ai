"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MessageSquare, ShieldAlert, Ban, CheckCircle, Flag, X, Loader2, Sparkles, ShieldCheck, Lock, AlertTriangle, ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { analyzeSuspiciousText } from "@/ai/flows/analyze-suspicious-text";
import { cn } from "@/lib/utils";

export default function SmsAlertPage() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [phoneNumber] = useState("+351 931 112 233");
  const [message] = useState("Atenção! A sua conta bancária foi suspensa por motivos de segurança. Verifique o seu acesso imediatamente aqui para evitar o bloqueio permanente: http://banco-seguro-login.net/verificar-agora");
  const router = useRouter();
  const { toast } = useToast();
  const { firestore } = useFirestore();
  const { user } = useUser();

  useEffect(() => {
    async function runAnalysis() {
      try {
        const result = await analyzeSuspiciousText({ text: message });
        setAnalysis(result);
      } catch (e) {
        toast({ title: "Erro na análise", description: "Não foi possível analisar o SMS.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    runAnalysis();
  }, [message, toast]);

  const handleAction = (action: 'block' | 'trust' | 'report' | 'ignore') => {
    if (!user || !firestore) {
      router.push('/protection');
      return;
    }

    const timestamp = new Date().toISOString();
    const historyRef = doc(collection(firestore, "users", user.uid, "analysis_history"));
    
    setDocumentNonBlocking(historyRef, {
      id: historyRef.id,
      analysisType: 'IncomingSMS',
      phoneNumber,
      contentAnalyzed: message,
      analysisTimestamp: timestamp,
      riskLevel: analysis?.riskLevel || 'Unknown',
      scamType: analysis?.scamType || 'SMS Fraud',
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
        reason: `SMS de burla: ${analysis?.scamType}` 
      }, { merge: true });
      toast({ title: "Número Bloqueado", description: "O remetente não te voltará a incomodar." });
    } else if (action === 'report') {
      const reportRef = doc(collection(firestore, "community_scam_reports"));
      setDocumentNonBlocking(reportRef, {
        id: reportRef.id,
        phoneNumber,
        reportType: 'SMS',
        scamType: analysis?.scamType || 'SMS Scam',
        reportedContent: message,
        reportTimestamp: timestamp,
        status: 'Submitted'
      }, { merge: true });
      toast({ title: "SMS Reportado", description: "Obrigado por proteger a comunidade." });
    } else if (action === 'trust') {
      const trustRef = doc(collection(firestore, "users", user.uid, "trusted_numbers"), phoneNumber.replace(/\s+/g, ''));
      setDocumentNonBlocking(trustRef, {
        id: trustRef.id,
        phoneNumber,
        trustTimestamp: timestamp,
        reason: 'Aprovado manualmente'
      }, { merge: true });
      toast({ title: "Contacto Confiável", description: "Remetente adicionado à lista branca." });
    }

    router.push('/protection');
  };

  const isHighRisk = analysis?.riskLevel === 'Muito alto risco' || analysis?.riskLevel === 'Alto risco';

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-cyan-900 text-white space-y-6">
        <MessageSquare className="w-16 h-16 animate-bounce text-cyan-400" />
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">SMS Detetado...</h1>
          <p className="text-xs text-cyan-300 font-medium tracking-widest uppercase">Análise ShieldCheck AI</p>
        </div>
        <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
           <Loader2 className="w-4 h-4 animate-spin" />
           <span className="text-[10px] font-bold">Escaneando Conteúdo...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 flex flex-col p-6 space-y-6 overflow-y-auto pb-24 animate-in slide-in-from-bottom duration-500",
      isHighRisk ? "bg-red-50" : "bg-white"
    )}>
      <div className="flex flex-col items-center text-center space-y-4 pt-6">
        <div className={cn(
          "p-5 rounded-[2rem] shadow-2xl relative",
          isHighRisk ? "bg-red-500 shadow-red-500/20" : "bg-amber-500 shadow-amber-500/20"
        )}>
          {isHighRisk ? <ShieldX className="w-10 h-10 text-white" /> : <ShieldAlert className="w-10 h-10 text-white" />}
        </div>
        <div className="space-y-1">
          <Badge variant="destructive" className={cn(
            "mb-2 px-4 py-1 rounded-full font-bold",
            isHighRisk ? "bg-red-600" : "bg-amber-600"
          )}>
            SMS PERIGOSO
          </Badge>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Alerta de Fraude</h2>
          <p className="text-sm font-medium text-muted-foreground">De: <span className="font-bold text-gray-900">{phoneNumber}</span></p>
        </div>
      </div>

      <Card className="bg-slate-900 border-0 rounded-[2rem] shadow-2xl overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Mensagem Recebida</span>
            <Lock className="w-3 h-3 text-slate-600" />
          </div>
          <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
            <p className="text-sm text-slate-100 font-medium italic leading-relaxed leading-7">
              "{message}"
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-5">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-800 uppercase tracking-wider text-xs">Veredito da ShieldCheck AI</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-600 p-4 rounded-[1.5rem] shadow-lg shadow-red-600/10 text-white">
            <p className="text-[9px] font-bold text-red-100 uppercase opacity-70">Nível de Risco</p>
            <p className="text-base font-black uppercase">{analysis?.riskLevel}</p>
          </div>
          <div className="bg-slate-100 p-4 rounded-[1.5rem] border border-slate-200">
            <p className="text-[9px] font-bold text-slate-400 uppercase">Tipo de Golpe</p>
            <p className="text-base font-black text-slate-800 truncate">{analysis?.scamType}</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border-2 border-slate-100 p-6 space-y-4 shadow-sm">
           <div className="flex items-center gap-2 text-red-600">
             <AlertTriangle className="w-4 h-4" />
             <h4 className="text-[10px] font-black uppercase tracking-widest">Padrões Suspeitos</h4>
           </div>
           <ul className="space-y-3">
              {analysis?.reasons.map((r: string, i: number) => (
                <li key={i} className="flex gap-3 text-sm text-slate-700 leading-snug font-medium">
                  <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
           </ul>
        </div>
      </div>

      <div className="space-y-3 pt-4">
        <Button 
          onClick={() => handleAction('block')} 
          className="w-full h-16 rounded-[1.5rem] bg-red-600 hover:bg-red-700 text-lg font-black shadow-2xl shadow-red-600/20 border-0"
        >
          Bloquear e Apagar
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => handleAction('ignore')} 
            variant="outline" 
            className="h-14 rounded-[1.5rem] border-slate-200 text-sm font-bold bg-white hover:bg-slate-50"
          >
            Ignorar
          </Button>
          <Button 
            onClick={() => handleAction('report')} 
            variant="outline" 
            className="h-14 rounded-[1.5rem] border-slate-200 text-sm font-bold bg-white hover:bg-slate-50"
          >
            <Flag className="w-4 h-4 mr-2 text-orange-500" /> Reportar
          </Button>
        </div>
        
        <Button 
          onClick={() => handleAction('trust')} 
          variant="ghost" 
          className="w-full h-12 text-[10px] font-bold uppercase tracking-widest text-slate-400"
        >
          <CheckCircle className="w-4 h-4 mr-2 text-green-500" /> Confiar neste contacto
        </Button>
      </div>

      <div className="text-center px-6">
        <p className="text-[9px] text-slate-400 italic">
          O ShieldCheck AI protege-te sem nunca bloquear mensagens automaticamente. <br />
          A decisão final é sempre tua.
        </p>
      </div>

      <Navbar />
    </div>
  );
}
