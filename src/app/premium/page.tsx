import { Navbar } from "@/components/layout/Navbar";
import { Crown, Check, ShieldCheck, Zap, Bell, History, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PremiumPage() {
  const features = [
    { text: "Análises ilimitadas de mensagens", icon: Zap },
    { text: "Verificação profunda de links", icon: ShieldCheck },
    { text: "Histórico completo e sem limites", icon: History },
    { text: "Alertas avançados de novos golpes", icon: Bell },
    { text: "Suporte prioritário 24/7", icon: ShieldCheck },
    { text: "Zero anúncios ou interrupções", icon: Check },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-amber-500 p-2 rounded-xl text-white shadow-md">
          <Crown className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">ShieldCheck Plus</h1>
      </div>

      <div className="bg-gradient-to-br from-amber-400 to-amber-600 rounded-[2.5rem] p-8 text-white text-center space-y-4 shadow-xl shadow-amber-500/20 relative overflow-hidden">
        <div className="relative z-10 space-y-2">
           <h2 className="text-3xl font-extrabold">Proteção Total</h2>
           <p className="text-white/90 font-medium">O teu escudo definitivo contra todas as burlas digitais.</p>
           <div className="pt-4 flex items-end justify-center gap-1">
              <span className="text-4xl font-bold">4,99€</span>
              <span className="text-white/80 pb-1">/mês</span>
           </div>
        </div>
        <div className="absolute right-[-30px] top-[-30px] opacity-10">
           <Crown className="w-40 h-40" />
        </div>
      </div>

      <div className="space-y-6 py-4">
        <h3 className="font-bold text-lg text-gray-800 px-1">O que está incluído:</h3>
        <div className="grid grid-cols-1 gap-4">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="flex items-center gap-4 px-1">
                <div className="bg-amber-100 p-2 rounded-full text-amber-600">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-semibold text-gray-700">{feature.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <Button className="w-full h-14 rounded-2xl text-lg font-bold bg-amber-500 hover:bg-amber-600 border-0 shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all">
          Assinar Premium Agora <ArrowRight className="ml-2 w-5 h-5" />
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Podes cancelar a qualquer momento. Experimenta grátis por 7 dias.
        </p>
      </div>

      <div className="glass-card p-6 border-dashed border-2 border-amber-200">
         <div className="flex items-center gap-2 text-amber-600 mb-2">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-bold">Garantia Familiar</h4>
         </div>
         <p className="text-xs text-muted-foreground leading-relaxed">
           Adiciona até 3 membros da tua família à tua subscrição premium por apenas mais 2€/mês. Mantém os teus pais e filhos seguros.
         </p>
      </div>

      <Navbar />
    </div>
  );
}
