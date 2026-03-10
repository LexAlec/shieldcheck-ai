"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Zap, Phone, MessageSquare, Ban, ShieldCheck, Settings, Users, AlertCircle, ChevronRight, Lock, Shield, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDoc, useUser, useFirestore } from "@/firebase";
import { doc } from "firebase/firestore";
import { notificationService } from "@/lib/notification-service";

export default function ProtectionPage() {
  const { user } = user ? useUser() : { user: null };
  const { firestore } = firestore ? useFirestore() : { firestore: null };

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

  const isProtectionActive = settings?.isCallProtectionEnabled || settings?.isSmsProtectionEnabled;

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

      <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${isProtectionActive ? "bg-green-500 animate-pulse" : "bg-gray-300"}`} />
            <span className="font-bold text-gray-700">Monitorização em Tempo Real</span>
          </div>
          <Badge className={isProtectionActive ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"}>
            {isProtectionActive ? "Ativa" : "Desativada"}
          </Badge>
        </div>

        {!isProtectionActive && (
          <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100 flex gap-3 items-start">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-amber-800 leading-none">Proteção Desligada</p>
              <p className="text-[10px] text-amber-700 leading-tight">Ativa os filtros nas definições para detetar burlas automaticamente.</p>
              <Link href="/protection/settings" className="text-[10px] font-bold text-amber-600 underline flex items-center gap-1">
                Ativar Agora <ArrowRight className="w-2 h-2" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 space-y-1">
              <s.icon className={`w-5 h-5 ${s.color}`} />
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">{s.label}</p>
            </div>
          ))}
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
