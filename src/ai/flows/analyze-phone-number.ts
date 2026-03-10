'use server';
/**
 * @fileOverview A Genkit flow for analyzing phone numbers for potential scam or spam patterns.
 *
 * - analyzePhoneNumber - A function that handles the phone number analysis process.
 * - AnalyzePhoneNumberInput - The input type for the analyzePhoneNumber function.
 * - AnalyzePhoneNumberOutput - The return type for the analyzePhoneNumber function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzePhoneNumberInputSchema = z.object({
  phoneNumber: z.string().describe('The phone number to analyze for fraud patterns.'),
});
export type AnalyzePhoneNumberInput = z.infer<typeof AnalyzePhoneNumberInputSchema>;

const AnalyzePhoneNumberOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe('The probability of the number being a scammer (0-100).'),
  riskLevel: z.enum(['Baixo risco', 'Médio risco', 'Alto risco', 'Muito alto risco']),
  scamType: z.string().describe('The identified category of fraud (e.g., Phishing, Telemarketing agressivo, Robocall, Spoofing, Fraude bancária).'),
  reasons: z.array(z.string()).describe('Specific reasons for the risk assessment.'),
  recommendations: z.array(z.string()).describe('Actionable safety steps.'),
});
export type AnalyzePhoneNumberOutput = z.infer<typeof AnalyzePhoneNumberOutputSchema>;

const analyzePhoneNumberPrompt = ai.definePrompt({
  name: 'analyzePhoneNumberPrompt',
  input: { schema: AnalyzePhoneNumberInputSchema },
  output: { schema: AnalyzePhoneNumberOutputSchema },
  prompt: `Você é um especialista em segurança de telecomunicações e analista de fraudes. Analise o seguinte número de telefone para detectar sinais de golpes, spam ou fraude.

Sua tarefa é classificar o risco de forma precisa:
- "Baixo risco": Números que parecem legítimos ou sem histórico negativo.
- "Médio risco": Números com padrões de telemarketing ou sem identificação clara.
- "Alto risco": Números com padrões de spoofing, robocalls em massa ou prefixos suspeitos.
- "Muito alto risco": Números confirmados em bases de dados de golpes ou que utilizam táticas de engenharia social agressiva (Ex: Falso parente, Fraude do CEO, Agendamento de entrega falso).

Considere:
- Números com prefixos internacionais inesperados.
- Padrões de chamadas curtas repetitivas.
- Relatos de tentativas de phishing por voz (vishing).
- Números que tentam se passar por bancos ou serviços governamentais.

Número a analisar: {{{phoneNumber}}}`,
});

const analyzePhoneNumberFlow = ai.defineFlow(
  {
    name: 'analyzePhoneNumberFlow',
    inputSchema: AnalyzePhoneNumberInputSchema,
    outputSchema: AnalyzePhoneNumberOutputSchema,
  },
  async (input) => {
    const { output } = await analyzePhoneNumberPrompt(input);
    if (!output) {
      throw new Error('Falha na análise do número de telefone.');
    }
    return output;
  }
);

export async function analyzePhoneNumber(input: AnalyzePhoneNumberInput): Promise<AnalyzePhoneNumberOutput> {
  return analyzePhoneNumberFlow(input);
}
