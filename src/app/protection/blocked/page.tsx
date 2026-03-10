"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Ban, Trash2, ArrowLeft, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCollection, useUser, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc } from "firebase/firestore";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";

export default function BlockedNumbersPage() {
  const { user } = useUser();
  const { firestore } = useFirestore();

  const blockedQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, "users", user.uid, "blocked_numbers"), orderBy("blockTimestamp", "desc"));
  }, [firestore, user]);

  const { data: blockedNumbers, isLoading } = useCollection(blockedQuery);

  const removeBlock = (id: string) => {
    if (!firestore || !user) return;
    if (confirm("Tens a certeza que queres desbloquear este número?")) {
      const docRef = doc(firestore, "users", user.uid, "blocked_numbers", id);
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
          <h1 className="text-2xl font-bold text-gray-800">Bloqueados</h1>
        </div>
        <Button size="icon" className="rounded-xl bg-red-500 hover:bg-red-600">
          <Plus className="w-5 h-5" />
        </Button>
      </div>

      <div className="glass-card flex items-center gap-2 px-4 py-2 border-2 border-transparent focus-within:border-primary/20 transition-all">
        <Search className="w-5 h-5 text-muted-foreground" />
        <Input placeholder="Pesquisar número..." className="border-0 focus-visible:ring-0 bg-transparent" />
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-muted-foreground py-10">A carregar lista...</p>
        ) : blockedNumbers && blockedNumbers.length > 0 ? (
          blockedNumbers.map((num) => (
            <div key={num.id} className="glass-card flex items-center justify-between hover:border-red-200 transition-all">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-2xl text-red-500">
                  <Ban className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{num.phoneNumber}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase font-medium">
                    {format(new Date(num.blockTimestamp), "dd 'de' MMMM", { locale: pt })}
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeBlock(num.id)} className="text-gray-300 hover:text-destructive">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 opacity-50">
            <Ban className="w-12 h-12 text-muted-foreground" />
            <p className="text-sm font-medium">Nenhum número bloqueado.</p>
          </div>
        )}
      </div>

      <Navbar />
    </div>
  );
}
