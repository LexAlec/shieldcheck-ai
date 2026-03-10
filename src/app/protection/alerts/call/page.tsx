"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Phone, ShieldAlert, Ban, CheckCircle, Flag, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useFirestore, useUser } from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { analyzePhoneNumber } from "@/ai/flows/analyze-phone-number";

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
    
    // Save to history
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
        reason: 'AI Detected Scam'
      }, { merge: true });
      toast({ title: "Número Bloqueado", description: "O número foi adicionado à tua lista negra." });
    } else if (action === 'trust') {
      const trustRef = doc(collection(firestore, "users", user.uid, "trusted_numbers"));
      setDocumentNonBlocking(trustRef, {
        id: trustRef.id,
        phoneNumber,
        trustTimestamp: timestamp,
        reason: 'Manual Trust'
      }, { merge: true });
      toast({ title: "Número Confiável", description: "O número foi adicionado à lista branca." });
    }

    router.push('/protection');
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-500 text-white space-y-4">
        <Phone className="w-16 h-16 animate-bounce" />
        <h1 className="text-2xl font-bold">Chamada a Entrar...</h1>
        <div className="flex items-center gap-2">
           <Loader2 className="w-4 h-4 animate-spin" />
           <span className="text-sm font-medium">IA a verificar segurança</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-slate-900 text-white p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center space-y-4 pt-12">
        <div className="bg-red-500/20 p-6 rounded-full border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
          <ShieldAlert className="w-16 h-16 text-red-500" />
        </div>
        <div className="space-y-1">
          <Badge variant="destructive" className="animate-pulse">PERIGO DETETADO</Badge>
          <h1 className="text-4xl font-extrabold">{phoneNumber}</h1>
          <p className="text-red-400 font-bold uppercase tracking-widest text-xs">Provável {analysis?.scamType}</p>
        </div>
      </div>

      <Card className="bg-white/10 border-white/10 text-white rounded-3xl">
        <CardContent className="p-6 space-y-4">
          <div>
            <h4 className="text-xs font-bold text-white/50 uppercase mb-2">Porquê este aviso?</h4>
            <ul className="space-y-2">
              {analysis?.reasons.map((reason: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1.5" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <p className="text-center text-sm font-medium text-white/70 px-4">
          Este número parece suspeito. Desejas bloqueá-lo?
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Button onClick={() => handleAction('block')} className="h-16 rounded-2xl bg-red-600 hover:bg-red-700 text-lg font-bold">
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
            <Flag className="w-4 h-4 mr-2 text-orange-500" /> Denunciar
          </Button>
        </div>
      </div>

      <Navbar />
    </div>
  );
}
