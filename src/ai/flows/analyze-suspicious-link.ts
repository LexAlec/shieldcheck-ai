'use server';
/**
 * @fileOverview A Genkit flow for analyzing suspicious URLs to detect phishing or other fraudulent patterns.
 *
 * - analyzeSuspiciousLink - A function that handles the link analysis process.
 * - AnalyzeSuspiciousLinkInput - The input type for the analyzeSuspiciousLink function.
 * - AnalyzeSuspiciousLinkOutput - The return type for the analyzeSuspiciousLink function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AnalyzeSuspiciousLinkInputSchema = z.object({
  url: z.string().url().describe('The suspicious URL to analyze for fraud and phishing patterns.'),
});
export type AnalyzeSuspiciousLinkInput = z.infer<typeof AnalyzeSuspiciousLinkInputSchema>;

const AnalyzeSuspiciousLinkOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe('The probability (0-100%) that the URL is a scam.'),
  riskLevel: z.enum(['Baixo risco', 'Médio risco', 'Alto risco', 'Muito alto risco']).describe('The classified risk level of the URL.'),
  scamType: z.string().describe('The identified type of digital scam, e.g., Phishing, Fraude bancária, Falso suporte técnico, Falso prémio, Falsa transferência bancária, Falso emprego.'),
  reasonsForSuspicion: z.array(z.string()).describe('A list of specific reasons why the link is considered suspicious, such as "O link parece imitar uma marca conhecida" or "Pede dados pessoais ou bancários".'),
  recommendations: z.array(z.string()).describe('A list of practical, actionable recommendations for the user, e.g., "Não clicar no link", "Bloquear remetente".'),
});
export type AnalyzeSuspiciousLinkOutput = z.infer<typeof AnalyzeSuspiciousLinkOutputSchema>;

const analyzeLinkPrompt = ai.definePrompt({
  name: 'analyzeSuspiciousLinkPrompt',
  input: { schema: AnalyzeSuspiciousLinkInputSchema },
  output: { schema: AnalyzeSuspiciousLinkOutputSchema },
  prompt: `Você é um analista de segurança digital especializado em detecção de golpes e phishing.
Sua tarefa é analisar o URL fornecido e identificar sinais de fraude, phishing, burla, falso suporte técnico, falso prémio, falsa transferência bancária, falso emprego ou outros tipos de golpes digitais.
Com base na sua análise, você deve determinar:
1.  Uma pontuação de risco (riskScore) de 0 a 100, onde 100 é certeza de golpe.
2.  Um nível de risco (riskLevel) que pode ser "Baixo risco", "Médio risco", "Alto risco" ou "Muito alto risco".
3.  O tipo de golpe (scamType), sendo específico. Exemplos: "Phishing", "Fraude bancária", "Falso suporte técnico".
4.  Uma lista de motivos específicos (reasonsForSuspicion) para a sua suspeita. Utilize linguagem clara e exemplos como:
    -   "O domínio do link é estranho e não corresponde à empresa oficial."
    -   "O link contém palavras suspeitas ou caracteres incomuns."
    -   "O link usa um encurtador de URL, dificultando a visualização do destino real."
    -   "A estrutura do URL tenta imitar um site legítimo (homograph attack)."
    -   "Promessas irrealistas ou ofertas "boas demais para ser verdade"".
    -   "Pede dados pessoais, financeiros ou credenciais de login."
5.  Uma lista de recomendações práticas (recommendations) sobre o que o utilizador deve fazer. Exemplos:
    -   "Não clique no link."
    -   "Não insira quaisquer dados pessoais ou financeiros."
    -   "Bloqueie o remetente e denuncie a mensagem."
    -   "Confirme a legitimidade da mensagem diretamente com a empresa através dos seus canais oficiais."
    -   "Apague a mensagem imediatamente."

Analise o seguinte URL: {{{url}}}

Certifique-se de que a sua resposta é um objeto JSON válido, aderindo estritamente ao esquema de saída fornecido.`,
});

const analyzeSuspiciousLinkFlow = ai.defineFlow(
  {
    name: 'analyzeSuspiciousLinkFlow',
    inputSchema: AnalyzeSuspiciousLinkInputSchema,
    outputSchema: AnalyzeSuspiciousLinkOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeLinkPrompt(input);
    return output!;
  }
);

export async function analyzeSuspiciousLink(input: AnalyzeSuspiciousLinkInput): Promise<AnalyzeSuspiciousLinkOutput> {
  return analyzeSuspiciousLinkFlow(input);
}
