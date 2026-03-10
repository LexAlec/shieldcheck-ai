"use client";

import { Navbar } from "@/components/layout/Navbar";
import { ShieldCheck, Trash2, ArrowLeft, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";

export default function TrustedNumbersPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();

  const trustedQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "trusted_numbers"), orderBy("trustTimestamp", "desc"));
  }, [firestore, user]);

  const { data: trustedNumbers, isLoading } = useCollection(trustedQuery);

  const removeTrust = (id: string) => {
    if (!firestore || !user) return;
    if (confirm("Remover este número da lista de confiança?")) {
      const docRef = doc(firestore, "users", user.uid, "trusted_numbers", id);
      deleteDocumentNonBlocking(docRef);
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Link href="/protection">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Confiáveis</h1>
        </div>
        <Button size="icon" className="rounded-xl bg-green-500 hover:bg-green-600">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="glass-card flex items-center gap-2 px-4 py-2 border-2 border-transparent focus-within:border-primary/20 transition-all">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input placeholder="Pesquisar contacto..." className="border-0 focus-visible:ring-0 bg-transparent" />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">A carregar lista...</p>
        ) : trustedNumbers && trustedNumbers.length > 0 ? (
          trustedNumbers.map((num) => (
            <div key={num.id} className="glass-card flex items-center justify-between hover:border-green-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-2xl text-green-500">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{num.phoneNumber}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    Adicionado em {format(new Date(num.trustTimestamp), "dd MMM", { locale: pt })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeTrust(num.id)} className="text-gray-300 hover:text-destructive">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
            <ShieldCheck className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum número confiável ainda.</p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
}
