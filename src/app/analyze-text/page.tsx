"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { MessageSquare, Loader2, Sparkles } from "lucide-react";
import { analyzeSuspiciousText } from "@/ai/flows/analyze-suspicious-text";
import { ResultDisplay } from "@/components/scam/ResultDisplay";
import { addToHistory } from "@/lib/scam-history";
import { useToast } from "@/hooks/use-toast";

export default function AnalyzeTextPage() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, cola uma mensagem para analisar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const output = await analyzeSuspiciousText({ text });
      setResult(output);
      addToHistory({
        type: 'text',
        riskScore: output.riskPercentage,
        riskLevel: output.riskLevel,
        scamType: output.scamType,
        input: text.substring(0, 50) + (text.length > 50 ? "..." : ""),
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar o texto agora. Tenta de novo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-blue-500 p-2 rounded-xl text-white shadow-md">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Analisar Texto</h1>
      </div>

      {!result ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium px-1">
              Copia e cola aqui a mensagem suspeita que recebeste (SMS, WhatsApp, Email, etc).
            </p>
            <div className="glass-card p-2 !rounded-3xl border-2 border-transparent focus-within:border-primary/20 transition-all shadow-lg">
              <Textarea
                placeholder="Ex: Parabéns! Ganhou um prémio de 500€ no sorteio de verão. Clique aqui para resgatar..."
                className="min-h-[240px] border-0 focus-visible:ring-0 text-base p-4 resize-none bg-transparent"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl primary-gradient border-0 hover:scale-[1.01] transition-transform active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analisando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Analisar Agora
              </>
            )}
          </Button>
        </div>
      ) : (
        <ResultDisplay 
          result={{
            riskScore: result.riskPercentage,
            riskLevel: result.riskLevel,
            scamType: result.scamType,
            reasons: result.reasons,
            recommendations: result.recommendations
          }} 
          onReset={() => {
            setResult(null);
            setText("");
          }}
        />
      )}

      <Navbar />
    </div>
  );
}
