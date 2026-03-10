
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Settings, ShieldCheck, Phone, MessageSquare, ArrowLeft, Lock, Info, Key, Shield, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";

export default function ProtectionSettingsPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();

  const settingsRef = user ? doc(firestore, "users", user.uid, "settings") : null;
  const { data: settings } = useDoc(settingsRef);

  const toggleProtection = (key: string, value: boolean) => {
    if (!settingsRef) return;
    
    setDocumentNonBlocking(settingsRef, {
      ...settings,
      id: user?.uid,
      [key]: value,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    toast({
      title: "Definições atualizadas",
      description: "A tua preferência de proteção foi guardada."
    });
  };

  const permissions = [
    { label: "Acesso a SMS", desc: "READ_SMS, RECEIVE_SMS", key: "perm_sms", default: true },
    { label: "Registo de Chamadas", desc: "READ_CALL_LOG", key: "perm_call_log", default: true },
    { label: "Serviço de Triagem", desc: "CALL_SCREENING_SERVICE", key: "perm_screening", default: true },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        <Link href="/protection">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <ArrowLeft className="w-6 h-6" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Definições</h1>
      </div>

      <section className="space-y-4">
        <h3 className="text-xs font-bold text-muted-foreground uppercase px-1 tracking-wider">Proteção Geral</h3>
        <div className="glass-card space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
                <Phone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Proteção de Chamadas</Label>
                <p className="text-[10px] text-muted-foreground leading-none">Analisa chamadas em tempo real</p>
              </div>
            </div>
            <Switch 
              checked={settings?.isCallProtectionEnabled ?? true} 
              onCheckedChange={(val) => toggleProtection('isCallProtectionEnabled', val)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-cyan-100 p-2 rounded-xl text-cyan-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">Proteção de SMS</Label>
                <p className="text-[10px] text-muted-foreground leading-none">Deteta links e textos fraudulentos</p>
              </div>
            </div>
            <Switch 
              checked={settings?.isSmsProtectionEnabled ?? true} 
              onCheckedChange={(val) => toggleProtection('isSmsProtectionEnabled', val)}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Smartphone className="w-4 h-4 text-gray-400" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Permissões Android</h3>
        </div>
        <div className="glass-card space-y-6">
          {permissions.map((perm) => (
            <div key={perm.key} className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold">{perm.label}</Label>
                <p className="text-[10px] text-muted-foreground font-mono leading-none">{perm.desc}</p>
              </div>
              <Switch checked={perm.default} />
            </div>
          ))}
        </div>
      </section>

      <div className="bg-blue-50 border border-blue-100 rounded-3xl p-5 space-y-4">
        <div className="flex items-center gap-2 text-blue-700">
          <Shield className="w-5 h-5" />
          <h4 className="text-sm font-bold">Compromisso de Privacidade</h4>
        </div>
        <p className="text-xs text-blue-900 leading-relaxed">
          O ShieldCheck AI foi desenhado para respeitar a tua privacidade. Todo o conteúdo de SMS e registos de chamadas é analisado **localmente** utilizando modelos de IA otimizados para o dispositivo.
        </p>
        <ul className="space-y-2">
          <li className="flex gap-2 text-[10px] text-blue-800 font-medium">
            <ShieldCheck className="w-3 h-3 shrink-0" /> Sem envio de mensagens privadas para a cloud.
          </li>
          <li className="flex gap-2 text-[10px] text-blue-800 font-medium">
            <ShieldCheck className="w-3 h-3 shrink-0" /> Bloqueio apenas com o teu consentimento explícito.
          </li>
        </ul>
      </div>

      <div className="flex flex-col items-center gap-2 pt-6 opacity-30">
        <Lock className="w-4 h-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest">Segurança Android-First</span>
      </div>

      <Navbar />
    </div>
  );
}
