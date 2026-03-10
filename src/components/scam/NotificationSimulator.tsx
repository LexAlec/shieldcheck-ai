'use client';

import { useState, useEffect } from 'react';
import { notificationService, ScamNotification } from '@/lib/notification-service';
import { ShieldAlert, X, MessageSquare, Phone, Ban, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function NotificationSimulator() {
  const [activeNotification, setActiveNotification] = useState<ScamNotification | null>(null);
  const router = useRouter();
  const { user } = useUser();
  const { firestore } = useFirestore();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = notificationService.subscribe((notification) => {
      setActiveNotification(notification);
      // Auto-dismiss after 8 seconds
      setTimeout(() => setActiveNotification(prev => prev?.id === notification.id ? null : prev), 8000);
    });
    return unsubscribe;
  }, []);

  const handleBlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!activeNotification || !user || !firestore) return;

    const timestamp = new Date().toISOString();
    const blockRef = doc(collection(firestore, "users", user.uid, "blocked_numbers"), activeNotification.phoneNumber.replace(/\s+/g, ''));
    
    setDocumentNonBlocking(blockRef, {
      id: blockRef.id,
      phoneNumber: activeNotification.phoneNumber,
      blockTimestamp: timestamp,
      reason: `Bloqueio rápido via notificação: ${activeNotification.scamType}`
    }, { merge: true });

    toast({
      title: "Número Bloqueado",
      description: `${activeNotification.phoneNumber} foi adicionado à lista negra.`,
    });
    setActiveNotification(null);
  };

  const handleViewDetails = () => {
    if (!activeNotification) return;
    const path = activeNotification.type === 'sms' ? '/protection/alerts/sms' : '/protection/alerts/call';
    router.push(path);
    setActiveNotification(null);
  };

  const handleIgnore = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveNotification(null);
  };

  if (!activeNotification) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] z-[100] animate-in slide-in-from-top duration-500">
      <div className="bg-slate-900 border border-white/10 shadow-2xl rounded-[1.5rem] overflow-hidden">
        <div className="p-4 flex gap-4">
          <div className="bg-red-500 p-2.5 rounded-2xl h-fit shrink-0 shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-start">
              <h4 className="text-white font-black text-sm tracking-tight">{activeNotification.title}</h4>
              <button onClick={handleIgnore} className="text-white/40 hover:text-white p-1">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-white/70 text-xs font-medium leading-relaxed">
              {activeNotification.body}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 border-t border-white/5 bg-white/5 divide-x divide-white/5">
          <button 
            onClick={handleBlock}
            className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-red-400 hover:bg-white/5 transition-colors"
          >
            <Ban className="w-3 h-3" /> Block
          </button>
          <button 
            onClick={handleViewDetails}
            className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-white/5 transition-colors"
          >
            <Eye className="w-3 h-3" /> View
          </button>
          <button 
            onClick={handleIgnore}
            className="flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase tracking-widest text-white/40 hover:bg-white/5 transition-colors"
          >
            Ignore
          </button>
        </div>
      </div>
      
      {/* Mock Android Handle */}
      <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mt-2 opacity-50" />
    </div>
  );
}
