
"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { MessageSquare, ShieldAlert, Ban, CheckCircle, Flag, X, Loader2, Sparkles, ShieldCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { analyzeSuspiciousText } from "@/ai/flows/analyze-suspicious-text";

export default function SmsAlertPage() {
  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState<any>(null);
  const [phoneNumber] = useState("+351 931 112 233");
  const [message] = useState("Atenção! A sua conta bancária foi suspensa. Verifique o seu acesso aqui: http://banco-seguro-login.net/verificar");
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
    if (!user || !firestore) return;

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
      const blockRef = doc(collection(firestore, "users", user.uid, "blocked_numbers"));
      setDocumentNonBlocking(blockRef, { id: blockRef.id, phoneNumber, blockTimestamp: timestamp, reason: 'AI Reported SMS' }, { merge: true });
      toast({ title: "Número Bloqueado", description: "Manual e aprovado por ti." });
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
      toast({ title: "SMS Reportado", description: "Obrigado por ajudares a comunidade." });
    }

    router.push('/protection');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-cyan-600 text-white space-y-4">
        <MessageSquare className="w-16 h-16 animate-pulse" />
        <h1 className="text-2xl font-bold">SMS Recebido...</h1>
        <div className="flex items-center gap-2 text-cyan-100">
           <Loader2 className="w-4 h-4 animate-spin" />
           <span className="text-xs font-medium uppercase tracking-widest">IA a analisar localmente</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white p-6 space-y-6 overflow-y-auto pb-24 animate-in slide-in-from-bottom duration-500">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="bg-red-500 p-4 rounded-3xl shadow-xl shadow-red-500/20">
          <ShieldAlert className="w-10 h-10 text-white" />
        </div>
        <div className="space-y-1">
          <Badge variant="destructive" className="mb-1">SMS SUSPEITO</Badge>
          <h2 className="text-2xl font-extrabold text-gray-900">Alerta de Fraude</h2>
          <p className="text-sm text-muted-foreground">Remetente: <span className="font-bold text-gray-700">{phoneNumber}</span></p>
        </div>
      </div>

      <Card className="bg-slate-50 border-slate-100 rounded-3xl shadow-inner">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Conteúdo da Mensagem</span>
            <Lock className="w-3 h-3 text-slate-300" />
          </div>
          <p className="text-sm text-slate-700 font-medium italic leading-relaxed">"{message}"</p>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-gray-800">Resultado da Análise IA</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
            <p className="text-[10px] font-bold text-red-700 uppercase">Risco</p>
            <p className="text-lg font-extrabold text-red-900">{analysis?.riskLevel}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
            <p className="text-[10px] font-bold text-orange-700 uppercase">Golpe</p>
            <p className="text-lg font-extrabold text-orange-900 truncate">{analysis?.scamType}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-5 space-y-3 shadow-sm">
           <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Sinais Detetados</h4>
           <ul className="space-y-3">
              {analysis?.reasons.map((r: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm text-gray-700 leading-tight">
                  <ShieldCheck className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  {r}
                </li>
              ))}
           </ul>
        </div>
      </div>

      <div className="space-y-3">
        <Button onClick={() => handleAction('block')} className="w-full h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-lg font-bold shadow-lg shadow-red-600/20">
          Bloquear Número
        </Button>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => handleAction('ignore')} variant="outline" className="h-14 rounded-2xl border-gray-200 text-sm font-bold bg-white">
            Ignorar
          </Button>
          <Button onClick={() => handleAction('trust')} variant="outline" className="h-14 rounded-2xl border-gray-200 text-sm font-bold bg-white">
            Confiar
          </Button>
        </div>
        <Button onClick={() => handleAction('report')} variant="ghost" className="w-full h-12 text-xs font-bold text-muted-foreground">
          <Flag className="w-3 h-3 mr-2" /> Reportar à Comunidade
        </Button>
      </div>

      <Navbar />
    </div>
  );
}
