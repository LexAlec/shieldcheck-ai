"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Link as LinkIcon, Loader2, Search } from "lucide-react";
import { analyzeSuspiciousLink } from "@/ai/flows/analyze-suspicious-link";
import { ResultDisplay } from "@/components/scam/ResultDisplay";
import { addToHistory } from "@/lib/scam-history";
import { useToast } from "@/hooks/use-toast";

export default function AnalyzeLinkPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, introduz um URL para verificar.",
        variant: "destructive",
      });
      return;
    }

    if (!url.startsWith("http")) {
       // Auto-prefix http if missing for simple check
       toast({
         title: "URL inválido",
         description: "Certifica-te que o link começa por http ou https.",
         variant: "destructive",
       });
       return;
    }

    setLoading(true);
    try {
      const output = await analyzeSuspiciousLink({ url });
      setResult(output);
      addToHistory({
        type: 'link',
        riskScore: output.riskScore,
        riskLevel: output.riskLevel,
        scamType: output.scamType,
        input: url.length > 40 ? url.substring(0, 37) + "..." : url,
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Ocorreu um problema ao verificar o link. Tenta novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-cyan-500 p-2 rounded-xl text-white shadow-md">
          <LinkIcon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Verificar Link</h1>
      </div>

      {!result ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground font-medium px-1">
              Insere o endereço do site suspeito que recebeste.
            </p>
            <div className="glass-card p-4 !rounded-3xl flex items-center gap-3 border-2 border-transparent focus-within:border-primary/20 transition-all shadow-lg">
              <LinkIcon className="w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Ex: https://sorteio-promo.net/resgate"
                className="border-0 focus-visible:ring-0 p-0 text-base h-auto bg-transparent"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
            </div>
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl bg-cyan-600 hover:bg-cyan-700 border-0 hover:scale-[1.01] transition-transform active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verificando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-5 w-5" /> Verificar Link
              </>
            )}
          </Button>

          <div className="p-6 bg-white/50 rounded-3xl border border-gray-100 text-sm space-y-3">
             <h4 className="font-bold text-gray-700">Porquê verificar links?</h4>
             <p className="text-muted-foreground">Muitos criminosos usam sites falsos que imitam bancos ou lojas para roubar passwords e cartões de crédito.</p>
          </div>
        </div>
      ) : (
        <ResultDisplay 
          result={{
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            scamType: result.scamType,
            reasons: result.reasonsForSuspicion,
            recommendations: result.recommendations
          }} 
          onReset={() => {
            setResult(null);
            setUrl("");
          }}
        />
      )}

      <Navbar />
    </div>
  );
}
