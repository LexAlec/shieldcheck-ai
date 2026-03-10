"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Zap, Phone, MessageSquare, Ban, ShieldCheck, Settings, Users, AlertCircle, ChevronRight, Lock, Shield, ArrowRight, ShieldAlert, ShieldIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDoc, useUser, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { notificationService } from "@/lib/notification-service";
import { cn } from "@/lib/utils";

export default function ProtectionPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();

  const settingsRef = user && firestore ? doc(firestore, "users", user.uid, "settings") : null;
  const { data: settings } = useDoc(settingsRef);

  const stats = [
    { label: "Alertas Evitados", value: "12", icon: ShieldCheck, color: "text-green-500" },
    { label: "Números Bloqueados", value: "24", icon: Ban, color: "text-red-500" },
  ];

  const tools = [
    { 
      title: "Simular Alerta de Chamada", 
      onClick: () => notificationService.simulateScam('call'),
      icon: Phone, 
      color: "bg-blue-500", 
      desc: "Simular detecção de voz fraudulenta" 
    },
    { 
      title: "Simular Alerta de SMS", 
      onClick: () => notificationService.simulateScam('sms'),
      icon: MessageSquare, 
      color: "bg-cyan-500", 
      desc: "Simular análise de links phishing" 
    },
  ];

  const lists = [
    { title: "Números Bloqueados", href: "/protection/blocked", icon: Ban, color: "bg-red-500" },
    { title: "Números Confiáveis", href: "/protection/trusted", icon: ShieldCheck, color: "bg-green-500" },
    { title: "Base Comunitária", href: "/protection/community", icon: Users, color: "bg-indigo-500" },
  ];

  const isSmsActive = !!settings?.isSmsProtectionEnabled;
  const isCallActive = !!settings?.isCallProtectionEnabled;
  const isScreeningActive = !!settings?.perm_screening;

  const allActive = isSmsActive && isCallActive && isScreeningActive;
  const someActive = isSmsActive || isCallActive || isScreeningActive;

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-8 overflow-y-auto bg-gray-50/50">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-amber-500 p-2 rounded-xl text-white shadow-md">
            <Zap className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Proteção Ativa</h1>
        </div>
        <Link href="/protection/settings">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Settings className="w-6 h-6 text-gray-400" />
          </Button>
        </Link>
      </header>

      {/* Status Indicator Banner */}
      <section className="animate-in fade-in slide-in-from-top-2 duration-500">
        <div className={cn(
          "rounded-[2rem] p-6 shadow-lg border transition-all duration-300",
          allActive 
            ? "bg-green-600 border-green-500 text-white" 
            : someActive 
              ? "bg-amber-500 border-amber-400 text-white"
              : "bg-white border-gray-100 text-gray-800"
        )}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-3 rounded-2xl",
                allActive ? "bg-white/20" : someActive ? "bg-white/20" : "bg-gray-100"
              )}>
                {allActive ? (
                  <ShieldCheck className="w-6 h-6" />
                ) : someActive ? (
                  <ShieldAlert className="w-6 h-6" />
                ) : (
                  <ShieldIcon className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div className="space-y-0.5">
                <h2 className="text-xl font-black leading-tight">
                  {allActive ? "Maximum protection enabled" : someActive ? "Protection incomplete" : "Proteção Desativada"}
                </h2>
                <p className={cn(
                  "text-xs font-medium opacity-80",
                  !someActive && "text-muted-foreground"
                )}>
                  {allActive 
                    ? "Todos os filtros de IA estão ativos." 
                    : someActive 
                      ? "Algumas permissões estão em falta." 
                      : "Ativa os filtros para estares seguro."}
                </p>
              </div>
            </div>
          </div>

          {!allActive && (
            <Link href="/protection/settings">
              <Button 
                variant="secondary" 
                className={cn(
                  "w-full rounded-xl font-bold h-10 shadow-sm",
                  someActive ? "bg-white/20 hover:bg-white/30 text-white border-0" : ""
                )}
              >
                {someActive ? "Resolver Problemas" : "Ativar Proteção"} <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}

          <div className="grid grid-cols-2 gap-3 mt-6">
            {stats.map((s, i) => (
              <div key={i} className={cn(
                "rounded-2xl p-4 space-y-1",
                allActive || someActive ? "bg-white/10" : "bg-gray-50"
              )}>
                <s.icon className={cn(
                  "w-4 h-4",
                  allActive || someActive ? "text-white" : s.color
                )} />
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-[8px] uppercase font-black tracking-widest opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <Card className="rounded-[2rem] border-0 shadow-sm bg-blue-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="relative z-10 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-200" />
                <h3 className="font-bold">Privacidade Android</h3>
              </div>
              <p className="text-xs text-blue-100 leading-relaxed">
                As tuas mensagens e chamadas são analisadas localmente. O ShieldCheck nunca bloqueia nada sem a tua autorização explícita.
              </p>
              <Link href="/protection/settings">
                <Button variant="link" className="text-white p-0 h-auto font-bold text-xs underline">
                  Ver Permissões
                </Button>
              </Link>
            </div>
            <Shield className="absolute right-[-20px] bottom-[-20px] w-32 h-32 text-white/10" />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg text-gray-800 px-1">Gestão de Listas</h3>
        <div className="grid grid-cols-1 gap-3">
          {lists.map((list) => (
            <Link key={list.href} href={list.href}>
              <div className="glass-card flex items-center gap-4 hover:border-primary/20 transition-all active:scale-[0.98]">
                <div className={`${list.color} p-3 rounded-xl text-white`}>
                  <list.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{list.title}</h4>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4 pb-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-lg text-gray-800">Simulação em Tempo Real</h3>
          <AlertCircle className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          {tools.map((tool, idx) => (
            <button key={idx} onClick={tool.onClick} className="w-full text-left">
              <div className="glass-card border-dashed border-2 flex items-center gap-4 hover:bg-white transition-all active:scale-[0.98]">
                <div className={`${tool.color} p-3 rounded-xl text-white`}>
                  <tool.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{tool.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-none mt-1">{tool.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <Navbar />
    </div>
  );
}
