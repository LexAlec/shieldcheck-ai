'use server';
/**
 * @fileOverview A Genkit flow for analyzing suspicious text messages for digital scams.
 *
 * - analyzeSuspiciousText - A function that handles the analysis of suspicious text.
 * - AnalyzeSuspiciousTextInput - The input type for the analyzeSuspiciousText function.
 * - AnalyzeSuspiciousTextOutput - The return type for the analyzeSuspiciousText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

/**
 * Input schema for analyzing suspicious text.
 */
const AnalyzeSuspiciousTextInputSchema = z.object({
  text: z.string().describe('The suspicious text message to analyze for scams.'),
});
export type AnalyzeSuspiciousTextInput = z.infer<typeof AnalyzeSuspiciousTextInputSchema>;

/**
 * Output schema for the analysis of suspicious text.
 */
const AnalyzeSuspiciousTextOutputSchema = z.object({
  riskPercentage: z.number().int().min(0).max(100).describe('The probability of the text being a scam, as a percentage (0-100).'),
  riskLevel: z.enum(['Baixo risco', 'Médio risco', 'Alto risco', 'Muito alto risco']).describe('The categorized risk level of the text.'),
  scamType: z.string().describe('The identified type of digital scam (e.g., "Phishing / fraude bancária", "Falso suporte técnico", "Falsa entrega", "Falso emprego").'),
  reasons: z.array(z.string()).describe('A list of specific reasons why the text is suspicious.'),
  recommendations: z.array(z.string()).describe('A list of practical actions the user should take.'),
});
export type AnalyzeSuspiciousTextOutput = z.infer<typeof AnalyzeSuspiciousTextOutputSchema>;

/**
 * Genkit prompt definition for analyzing suspicious text.
 */
const analyzeSuspiciousTextPrompt = ai.definePrompt({
  name: 'analyzeSuspiciousTextPrompt',
  input: { schema: AnalyzeSuspiciousTextInputSchema },
  output: { schema: AnalyzeSuspiciousTextOutputSchema },
  prompt: `Você é um especialista em cibersegurança e detecção de fraudes digitais. Analise a mensagem de texto fornecida para identificar golpes, phishing ou burlas.

Sua análise deve ser rigorosa:
- "Baixo risco": Mensagens informativas claras de fontes conhecidas.
- "Médio risco": Promoções genéricas ou links encurtados sem contexto.
- "Alto risco": Linguagem de urgência, erros gramaticais, pedidos de dados pessoais.
- "Muito alto risco": Phishing bancário direto, links para domínios maliciosos confirmados, personificação de autoridades ou familiares.

Padrões a procurar:
- Urgência exagerada ("Sua conta será bloqueada AGORA").
- Links suspeitos (Ex: bit.ly, ou domínios que imitam marcas reais).
- Erros de português ou português de tradutor automático.
- Promessas irrealistas (Prêmios, empregos fáceis).
- Personificação (Bancos, CTT, Finanças, WhatsApp/Meta).

Mensagem Suspeita:
{{{text}}}`,
});

/**
 * Genkit flow definition for analyzing suspicious text.
 */
const analyzeSuspiciousTextFlow = ai.defineFlow(
  {
    name: 'analyzeSuspiciousTextFlow',
    inputSchema: AnalyzeSuspiciousTextInputSchema,
    outputSchema: AnalyzeSuspiciousTextOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeSuspiciousTextPrompt(input);
    if (!output) {
      throw new Error('Erro ao analisar o texto suspeito.');
    }
    return output;
  }
);

export async function analyzeSuspiciousText(input: AnalyzeSuspiciousTextInput): Promise<AnalyzeSuspiciousTextOutput> {
  return analyzeSuspiciousTextFlow(input);
}
