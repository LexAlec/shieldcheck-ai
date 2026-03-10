import { Navbar } from "@/components/layout/Navbar";
import { BookOpen, AlertCircle, ShieldCheck, Banknote, Globe, UserCheck, MessageSquare, AlertTriangle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function EducationPage() {
  const guides = [
    {
      title: "O que é Phishing?",
      icon: Globe,
      color: "bg-blue-500",
      content: "Phishing é uma técnica onde criminosos se fazem passar por entidades confiáveis (bancos, lojas, serviços públicos) para roubar os teus dados pessoais, como passwords e números de cartão de crédito."
    },
    {
      title: "Fraude Bancária",
      icon: Banknote,
      color: "bg-green-500",
      content: "Geralmente envolve mensagens de 'bloqueio de conta' ou 'transferência pendente'. O objetivo é fazer-te clicar num link que imita o teu banco para capturares as tuas credenciais de acesso."
    },
    {
      title: "Falso Suporte Técnico",
      icon: UserCheck,
      color: "bg-orange-500",
      content: "Criminosos fingem ser da Microsoft, Apple ou Google, alegando que o teu computador tem um vírus. Pedem acesso remoto ou pagamento para 'resolver' um problema que não existe."
    },
    {
      title: "Burlas no WhatsApp",
      icon: MessageSquare,
      color: "bg-emerald-500",
      content: "A técnica do 'Olá pai, olá mãe'. O burlão finge ser um familiar que mudou de número e pede dinheiro urgente para uma emergência. Confirma sempre por chamada antes de transferir!"
    }
  ];

  return (
    <div className="flex-1 flex flex-col p-6 pb-24 space-y-6 overflow-y-auto bg-gray-50/50">
      <div className="flex items-center gap-2 mb-2">
        <div className="bg-gray-100 p-2 rounded-xl text-gray-700 shadow-sm border border-gray-200">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800">Guia de Segurança</h1>
      </div>

      <section className="space-y-4">
        <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10">
          <div className="flex items-center gap-3 mb-3">
             <ShieldCheck className="w-6 h-6 text-primary" />
             <h3 className="font-bold text-gray-800">Conhecimento é Proteção</h3>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            A melhor forma de evitar golpes é saber como eles funcionam. Explora os nossos mini guias abaixo para te tornares um perito em segurança digital.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="font-bold text-lg text-gray-800 px-1">Tipos Comuns de Golpes</h3>
        <Accordion type="single" collapsible className="space-y-3">
          {guides.map((guide, i) => {
            const Icon = guide.icon;
            return (
              <AccordionItem key={i} value={`item-${i}`} className="glass-card !border-0 px-0 overflow-hidden shadow-sm">
                <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-center gap-3 text-left">
                    <div className={`${guide.color} p-2 rounded-xl text-white`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-gray-800 text-sm">{guide.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-2 text-muted-foreground leading-relaxed text-sm">
                  {guide.content}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </section>

      <section className="bg-amber-50 rounded-3xl p-6 border border-amber-100 space-y-3">
        <div className="flex items-center gap-2 text-amber-700">
          <AlertCircle className="w-5 h-5" />
          <h4 className="font-bold uppercase text-xs tracking-wider">Regra de Ouro</h4>
        </div>
        <p className="text-sm text-amber-900 font-medium">
          Nenhuma instituição legítima (bancos, finanças, polícia) pede passwords, pins ou códigos de verificação por SMS ou Email. Na dúvida, desliga e liga para o número oficial.
        </p>
      </section>

      <Navbar />
    </div>
  );
}
