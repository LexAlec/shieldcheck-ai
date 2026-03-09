"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import { Image as ImageIcon, Loader2, Upload, X, ShieldCheck } from "lucide-react";
import { analyzeScreenshotForScams } from "@/ai/flows/analyze-screenshot-for-scams";
import { ResultDisplay } from "@/components/scam/ResultDisplay";
import { addToHistory } from "@/lib/scam-history";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

export default function AnalyzeImagePage() {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        toast({
          title: "Ficheiro muito grande",
          description: "Por favor, escolhe uma imagem com menos de 4MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) {
      toast({
        title: "Nenhuma imagem",
        description: "Por favor, carrega um print do ecrã para analisar.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const output = await analyzeScreenshotForScams({ screenshotDataUri: image });
      setResult(output);
      addToHistory({
        type: 'image',
        riskScore: output.riskScore,
        riskLevel: output.riskLevel,
        scamType: output.scamType,
        input: "Análise de Screenshot",
      });
    } catch (error) {
      toast({
        title: "Erro na análise",
        description: "Não conseguimos ler a imagem. Tenta outro print.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-indigo-500 p-2 rounded-xl text-white shadow-md">
          <ImageIcon className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Analisar Imagem</h1>
      </div>

      {!result ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          <p className="text-sm text-muted-foreground font-medium px-1">
            Tira um print à mensagem suspeita e carrega-o aqui. A nossa IA vai ler e analisar o conteúdo por ti.
          </p>

          <div 
            onClick={() => !image && fileInputRef.current?.click()}
            className={`
              relative flex flex-col items-center justify-center border-2 border-dashed rounded-[2.5rem] p-8 transition-all cursor-pointer min-h-[320px]
              ${image ? "border-primary/20 bg-white" : "border-gray-200 bg-white hover:border-primary/30"}
            `}
          >
            {image ? (
              <div className="relative w-full h-full flex flex-col items-center space-y-4">
                <div className="relative w-full aspect-[3/4] max-h-[400px] rounded-3xl overflow-hidden shadow-2xl border border-gray-100">
                  <Image src={image} alt="Preview" fill className="object-contain" />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setImage(null); }}
                    className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground font-medium">Imagem pronta para análise</p>
              </div>
            ) : (
              <>
                <div className="bg-indigo-50 p-6 rounded-full mb-4">
                  <Upload className="w-10 h-10 text-indigo-500" />
                </div>
                <p className="text-gray-800 font-bold">Carregar Screenshot</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG ou JPEG (máx. 4MB)</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>

          <Button
            onClick={handleAnalyze}
            disabled={loading || !image}
            className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl bg-indigo-600 hover:bg-indigo-700 border-0 hover:scale-[1.01] transition-transform active:scale-[0.98]"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Escaneando...
              </>
            ) : (
              <>
                <ShieldCheck className="mr-2 h-5 w-5" /> Analisar Imagem
              </>
            )}
          </Button>
        </div>
      ) : (
        <ResultDisplay 
          result={{
            riskScore: result.riskScore,
            riskLevel: result.riskLevel,
            scamType: result.scamType,
            reasons: result.reasons,
            recommendations: result.recommendations
          }} 
          onReset={() => {
            setResult(null);
            setImage(null);
          }}
        />
      )}

      <Navbar />
    </div>
  );
}
