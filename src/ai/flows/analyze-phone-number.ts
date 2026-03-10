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
  scamType: z.string().describe('The identified category of fraud (e.g., Telemarketing agressivo, Robocall, Spoofing, Fraude bancária).'),
  reasons: z.array(z.string()).describe('Specific reasons for the risk assessment.'),
  recommendations: z.array(z.string()).describe('Actionable safety steps.'),
});
export type AnalyzePhoneNumberOutput = z.infer<typeof AnalyzePhoneNumberOutputSchema>;

const analyzePhoneNumberPrompt = ai.definePrompt({
  name: 'analyzePhoneNumberPrompt',
  input: { schema: AnalyzePhoneNumberInputSchema },
  output: { schema: AnalyzePhoneNumberOutputSchema },
  prompt: `Você é um especialista em segurança de telecomunicações. Analise o seguinte número de telefone para detectar sinais de golpes, spam ou fraude.
Considere padrões comuns:
- Números com prefixos estranhos ou internacionais inesperados.
- Padrões de "robocalls" ou chamadas em massa.
- Relatos comuns de "fraude do CEO" ou "falso parente".
- Números que tentam se passar por entidades oficiais (bancos, transportadoras).

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
    return output!;
  }
);

export async function analyzePhoneNumber(input: AnalyzePhoneNumberInput): Promise<AnalyzePhoneNumberOutput> {
  return analyzePhoneNumberFlow(input);
}
