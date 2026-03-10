import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WelcomePage() {
  return (
    <div className="flex-1 flex flex-col justify-between p-8 pt-20 primary-gradient text-white">
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="bg-white/20 p-6 rounded-[2rem] backdrop-blur-sm border border-white/30 shadow-2xl">
          <ShieldCheck className="w-20 h-20 text-white" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">ShieldCheck AI</h1>
          <p className="text-white/80 text-lg font-medium max-w-[280px]">
            Proteção inteligente contra golpes e fraudes digitais em tempo real.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 w-full pt-8">
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
            <CheckCircle className="w-6 h-6 text-[#66DBDB]" />
            <span className="text-sm font-medium">Analisa mensagens e emails</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
            <CheckCircle className="w-6 h-6 text-[#66DBDB]" />
            <span className="text-sm font-medium">Verifica links suspeitos</span>
          </div>
          <div className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/10">
            <CheckCircle className="w-6 h-6 text-[#66DBDB]" />
            <span className="text-sm font-medium">Escaneia prints do ecrã</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 pt-12">
        <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold bg-white text-primary hover:bg-gray-100 shadow-xl border-0">
          <Link href="/dashboard">
            Começar Agora <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </Button>
        <p className="text-center text-xs text-white/60 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3" /> Privacidade garantida pela ShieldCheck
        </p>
      </div>
    </div>
  );
}
