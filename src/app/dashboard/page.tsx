import Link from "next/link";
import { MessageSquare, Link as LinkIcon, Image as ImageIcon, History, BookOpen, Crown, ShieldCheck } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";

export default function Dashboard() {
  const actions = [
    {
      title: "Analisar Mensagem",
      description: "Cola o texto de um SMS, WhatsApp ou Email.",
      href: "/analyze-text",
      icon: MessageSquare,
      color: "bg-blue-500",
    },
    {
      title: "Analisar Link",
      description: "Verifica se um URL é seguro ou fraudulento.",
      href: "/analyze-link",
      icon: LinkIcon,
      color: "bg-cyan-500",
    },
    {
      title: "Analisar Imagem",
      description: "Carrega um screenshot para análise por IA.",
      href: "/analyze-image",
      icon: ImageIcon,
      color: "bg-indigo-500",
    },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-8 overflow-y-auto">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded-xl">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl leading-none">ShieldCheck AI</h1>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Smart Security</span>
          </div>
        </div>
        <Link href="/premium" className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Crown className="w-3 h-3" /> FREE
        </Link>
      </header>

      <section className="space-y-4">
        <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden shadow-lg shadow-primary/20">
          <div className="relative z-10 space-y-2">
            <h2 className="text-2xl font-bold leading-tight">Estás seguro hoje?</h2>
            <p className="text-white/80 text-sm">Protege os teus dados e evita burlas digitais antes que aconteçam.</p>
          </div>
          <div className="absolute right-[-20px] bottom-[-20px] opacity-10">
            <ShieldCheck className="w-32 h-32" />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg text-gray-800 px-1">Ferramentas de Análise</h3>
        <div className="grid grid-cols-1 gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.href} href={action.href}>
                <div className="glass-card flex items-center gap-4 hover:border-primary/50 transition-all active:scale-[0.98]">
                  <div className={`${action.color} p-4 rounded-2xl text-white shadow-md`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-800">{action.title}</h4>
                    <p className="text-xs text-muted-foreground leading-snug">{action.description}</p>
                  </div>
                  <div className="text-gray-300">
                    <History className="w-5 h-5 rotate-180" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="space-y-4 pb-4">
         <h3 className="font-bold text-lg text-gray-800 px-1">Atalhos Rápidos</h3>
         <div className="grid grid-cols-2 gap-4">
            <Link href="/history" className="glass-card flex flex-col items-center justify-center gap-2 py-6 text-center group">
              <History className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-bold text-gray-700">Histórico</span>
            </Link>
            <Link href="/education" className="glass-card flex flex-col items-center justify-center gap-2 py-6 text-center group">
              <BookOpen className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
              <span className="text-sm font-bold text-gray-700">Educação</span>
            </Link>
         </div>
      </section>
      
      <Navbar />
    </div>
  );
}
