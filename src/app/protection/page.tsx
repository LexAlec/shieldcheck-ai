"use client";

import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Zap, Phone, MessageSquare, Ban, ShieldCheck, Settings, Users, AlertCircle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function ProtectionPage() {
  const stats = [
    { label: "Chamadas Bloqueadas", value: "0", icon: Phone, color: "text-blue-500" },
    { label: "SMS Suspeitos", value: "0", icon: MessageSquare, color: "text-cyan-500" },
  ];

  const tools = [
    { title: "Simular Alerta de Chamada", href: "/protection/alerts/call", icon: Phone, color: "bg-blue-500", desc: "Teste o sistema de detecção de voz" },
    { title: "Simular Alerta de SMS", href: "/protection/alerts/sms", icon: MessageSquare, color: "bg-cyan-500", desc: "Teste a análise de mensagens curtas" },
  ];

  const lists = [
    { title: "Números Bloqueados", href: "/protection/blocked", icon: Ban, color: "bg-red-500" },
    { title: "Números Confiáveis", href: "/protection/trusted", icon: ShieldCheck, color: "bg-green-500" },
    { title: "Base Comunitária", href: "/protection/community", icon: Users, color: "bg-indigo-500" },
  ];

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
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="font-bold text-gray-700">Sistema Ligado</span>
          </div>
          <Badge className="bg-green-100 text-green-700 border-green-200">Seguro</Badge>
        </div>

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

      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-bold text-lg text-gray-800">Ferramentas de Teste</h3>
          <AlertCircle className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-1 gap-3">
          {tools.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <div className="glass-card border-dashed border-2 flex items-center gap-4 hover:bg-white transition-all active:scale-[0.98]">
                <div className={`${tool.color} p-3 rounded-xl text-white`}>
                  <tool.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-sm">{tool.title}</h4>
                  <p className="text-[10px] text-muted-foreground leading-none mt-1">{tool.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Navbar />
    </div>
  );
}
