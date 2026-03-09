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
  scamType: z.string().describe('The identified type of digital scam (e.g., "Phishing / fraude bancária", "Falso suporte técnico").'),
  reasons: z.array(z.string()).describe('A list of specific reasons why the text is suspicious.'),
  recommendations: z.array(z.string()).describe('A list of practical actions the user should take.'),
});
export type AnalyzeSuspiciousTextOutput = z.infer<typeof AnalyzeSuspiciousTextOutputSchema>;

/**
 * Analyzes a suspicious text message for potential scams.
 *
 * @param input The text message to analyze.
 * @returns The analysis result including risk level, scam type, reasons, and recommendations.
 */
export async function analyzeSuspiciousText(input: AnalyzeSuspiciousTextInput): Promise<AnalyzeSuspiciousTextOutput> {
  return analyzeSuspiciousTextFlow(input);
}

/**
 * Genkit prompt definition for analyzing suspicious text.
 * Instructs the AI to act as a scam detection expert and output a structured JSON response.
 */
const analyzeSuspiciousTextPrompt = ai.definePrompt({
  name: 'analyzeSuspiciousTextPrompt',
  input: { schema: AnalyzeSuspiciousTextInputSchema },
  output: { schema: AnalyzeSuspiciousTextOutputSchema },
  prompt: `You are an expert in digital scam detection, product manager, UX designer, and senior software engineer specializing in AI mobile applications. Your task is to analyze the provided text message and determine if it is a digital scam, phishing attempt, or other fraudulent activity.

Analyze the following text message for any signs of scams, phishing, fraud, fake technical support, fake prizes, fake bank transfers, fake jobs, or other digital fraud.
Look for the following patterns:
- Exaggerated urgency, threats, or pressure.
- Requests for money, personal data, bank details, or passwords.
- Suspicious links, strange domains, or URL shorteners.
- Spelling or grammatical errors.
- Unrealistic promises or offers (e.g., fake prizes).
- Messages impersonating known entities like banks, mobile operators, delivery services, or technical support.
- False senders or manipulative language.

Based on your analysis, provide a structured response in JSON format according to the output schema.
The risk level should be one of "Baixo risco", "Médio risco", "Alto risco", or "Muito alto risco".
Provide a clear percentage of risk.
Identify the type of scam.
List specific reasons for suspicion.
Provide practical recommendations on what the user should do next.

Suspicious Text:
{{{text}}}`,
});

/**
 * Genkit flow definition for analyzing suspicious text.
 * Orchestrates the call to the AI prompt and handles the output.
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
      throw new Error('Failed to analyze suspicious text: no output from AI model.');
    }
    return output;
  }
);
