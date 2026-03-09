"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, ShieldAlert, ArrowLeft, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface ResultDisplayProps {
  result: {
    riskScore: number;
    riskLevel: string;
    scamType: string;
    reasons: string[];
    recommendations: string[];
  };
  onReset: () => void;
}

export function ResultDisplay({ result, onReset }: ResultDisplayProps) {
  const isHighRisk = result.riskScore > 60 || result.riskLevel.includes("Alto") || result.riskLevel.includes("Muito alto");
  const isMediumRisk = !isHighRisk && result.riskScore > 30;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 pb-20">
      <div className="flex items-center justify-between mb-2">
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-primary">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
      </div>

      <Card className={cn(
        "border-2",
        isHighRisk ? "border-destructive/30" : isMediumRisk ? "border-orange-400/30" : "border-green-400/30"
      )}>
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            {isHighRisk ? (
              <div className="p-4 bg-destructive/10 rounded-full">
                <ShieldAlert className="w-12 h-12 text-destructive" />
              </div>
            ) : isMediumRisk ? (
              <div className="p-4 bg-orange-100 rounded-full">
                <AlertTriangle className="w-12 h-12 text-orange-500" />
              </div>
            ) : (
              <div className="p-4 bg-green-100 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            )}
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">
            {result.riskScore}%
          </CardTitle>
          <p className="text-muted-foreground text-sm font-medium">Probabilidade de Golpe</p>
          <Badge variant={isHighRisk ? "destructive" : isMediumRisk ? "secondary" : "outline"} className="mt-2 text-sm px-4 py-1">
            {result.riskLevel}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="text-center">
            <h3 className="font-semibold text-lg text-primary">{result.scamType}</h3>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Sinais detetados</h4>
            <ul className="space-y-2">
              {result.reasons.map((reason, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <h4 className="text-sm font-bold uppercase tracking-wider text-primary">O que deves fazer</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 flex gap-3">
             <Button className="flex-1 rounded-xl h-12" onClick={onReset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Nova Análise
             </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-[10px] text-center text-muted-foreground px-8 italic">
        Aviso: Esta análise é baseada em IA e deve ser usada apenas como guia. Confirma sempre com canais oficiais em caso de dúvida.
      </p>
    </div>
  );
}
