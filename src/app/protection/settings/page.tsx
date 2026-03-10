
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Settings, ShieldCheck, Phone, MessageSquare, ArrowLeft, Lock, Info, Key, Shield, Smartphone, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useUser, useFirestore, useDoc } from "@/firebase";
import { doc } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProtectionSettingsPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();

  const settingsRef = user ? doc(firestore, "users", user.uid, "settings") : null;
  const { data: settings } = useDoc(settingsRef);

  const [pendingPermission, setPendingPermission] = useState<{
    key: string;
    title: string;
    description: string;
    permissions: string[];
  } | null>(null);

  const handleToggle = (key: string, checked: boolean) => {
    if (!checked) {
      // If turning off, just update Firestore directly
      updateSettings(key, false);
      return;
    }

    // If turning on, request "Android" permissions
    if (key === 'isSmsProtectionEnabled') {
      setPendingPermission({
        key,
        title: "Permitir que ShieldCheck AI envie e veja mensagens SMS?",
        description: "Necessário para analisar links e detetar phishing em tempo real.",
        permissions: ["READ_SMS", "RECEIVE_SMS"]
      });
    } else if (key === 'isCallProtectionEnabled') {
      setPendingPermission({
        key,
        title: "Permitir que ShieldCheck AI faça e gira chamadas telefónicas?",
        description: "Necessário para identificar números fraudulentos e exibir alertas de risco.",
        permissions: ["READ_PHONE_STATE", "READ_CALL_LOG", "ANSWER_PHONE_CALLS"]
      });
    } else if (key === 'perm_screening') {
      setPendingPermission({
        key,
        title: "Ativar Serviço de Triagem de Chamadas?",
        description: "Isto permitirá que o ShieldCheck AI filtre chamadas de spam conhecidas automaticamente.",
        permissions: ["CALL_SCREENING_SERVICE"]
      });
    } else {
      updateSettings(key, true);
    }
  };

  const updateSettings = (key: string, value: boolean) => {
    if (!settingsRef) return;
    
    setDocumentNonBlocking(settingsRef, {
      ...settings,
      id: user?.uid,
      [key]: value,
      lastUpdated: new Date().toISOString()
    }, { merge: true });

    if (value) {
      toast({
        title: "Proteção Ativada",
        description: "O teu dispositivo está agora mais seguro."
      });
    }
  };

  const handlePermissionDenied = () => {
    toast({
      variant: "destructive",
      title: "Permissão Negada",
      description: "Sem estas permissões, o ShieldCheck não consegue proteger-te contra golpes em tempo real.",
    });
    setPendingPermission(null);
  };

  const handlePermissionAllowed = () => {
    if (pendingPermission) {
      updateSettings(pendingPermission.key, true);
      setPendingPermission(null);
    }
  };

  const permissions = [
    { label: "Acesso a SMS", desc: "READ_SMS, RECEIVE_SMS", key: "isSmsProtectionEnabled", default: settings?.isSmsProtectionEnabled ?? false },
    { label: "Registo de Chamadas", desc: "READ_CALL_LOG", key: "isCallProtectionEnabled", default: settings?.isCallProtectionEnabled ?? false },
    { label: "Serviço de Triagem", desc: "CALL_SCREENING_SERVICE", key: "perm_screening", default: settings?.perm_screening ?? false },
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
        <div className="flex items-center gap-2 px-1">
          <Smartphone className="w-4 h-4 text-gray-400" />
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Permissões e Proteção</h3>
        </div>
        <div className="glass-card space-y-6">
          {permissions.map((perm) => (
            <div key={perm.key} className="flex items-center justify-between">
              <div className="space-y-0.5 max-w-[70%]">
                <Label className="text-sm font-bold">{perm.label}</Label>
                <p className="text-[10px] text-muted-foreground font-mono leading-none break-all">{perm.desc}</p>
              </div>
              <Switch 
                checked={perm.default} 
                onCheckedChange={(val) => handleToggle(perm.key, val)}
              />
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

      <AlertDialog open={!!pendingPermission} onOpenChange={(open) => !open && setPendingPermission(null)}>
        <AlertDialogContent className="rounded-[2rem] max-w-[320px]">
          <AlertDialogHeader className="items-center text-center">
            <div className="bg-primary/10 p-4 rounded-full mb-2">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <AlertDialogTitle className="text-lg leading-tight">
              {pendingPermission?.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground pt-2">
              {pendingPermission?.description}
              <div className="mt-4 p-3 bg-gray-50 rounded-2xl text-[10px] font-mono text-left space-y-1">
                {pendingPermission?.permissions.map(p => (
                   <div key={p} className="flex items-center gap-2">
                     <Key className="w-3 h-3" /> {p}
                   </div>
                ))}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-col gap-2">
            <AlertDialogAction onClick={handlePermissionAllowed} className="w-full h-12 rounded-2xl bg-primary font-bold">
              Permitir
            </AlertDialogAction>
            <AlertDialogCancel onClick={handlePermissionDenied} className="w-full h-12 rounded-2xl border-0 font-bold">
              Negar
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Navbar />
    </div>
  );
}
