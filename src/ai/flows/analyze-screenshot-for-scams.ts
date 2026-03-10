'use server';
/**
 * @fileOverview A Genkit flow for analyzing screenshots for potential digital scams.
 *
 * - analyzeScreenshotForScams - A function that handles the screenshot analysis process.
 * - AnalyzeScreenshotForScamsInput - The input type for the analyzeScreenshotForScams function.
 * - AnalyzeScreenshotForScamsOutput - The return type for the analyzeScreenshotForScams function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AnalyzeScreenshotForScamsInputSchema = z.object({
  screenshotDataUri: z
    .string()
    .describe(
      "A screenshot of a suspicious message or content, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeScreenshotForScamsInput = z.infer<typeof AnalyzeScreenshotForScamsInputSchema>;

// Output Schema
const AnalyzeScreenshotForScamsOutputSchema = z.object({
  riskScore: z.number().min(0).max(100).describe('The probability of the content being a scam, from 0 to 100.'),
  riskLevel: z.enum(['Baixo risco', 'Médio risco', 'Alto risco', 'Muito alto risco']).describe('A categorized risk level.'),
  scamType: z.string().describe('The identified type of scam (e.g., Phishing, Fraude bancária, Falso suporte técnico, Falso prémio, Falsa transferência bancária, Falso emprego, Outro tipo de golpe digital).'),
  reasons: z.array(z.string()).describe('A list of specific reasons why the content is considered suspicious.'),
  recommendations: z.array(z.string()).describe('A list of actionable recommendations for the user.'),
});
export type AnalyzeScreenshotForScamsOutput = z.infer<typeof AnalyzeScreenshotForScamsOutputSchema>;

// OCR Prompt to extract text from the image
const extractTextFromImagePrompt = ai.definePrompt({
  name: 'extractTextFromImagePrompt',
  input: {
    schema: AnalyzeScreenshotForScamsInputSchema,
  },
  output: {
    schema: z.object({extractedText: z.string()}),
  },
  model: 'googleai/gemini-1.5-flash', // A multimodal model suitable for OCR
  prompt: `Extract all visible text from the provided image. Focus on any conversational text, links, or important details. Do not include any additional commentary, just the extracted text as a single string. If no significant text is found, return an empty string.\n\nImage: {{media url=screenshotDataUri}}`,
});

// Scam Analysis Prompt
const analyzeScamPrompt = ai.definePrompt({
  name: 'analyzeScamPrompt',
  input: {
    schema: z.object({textToAnalyze: z.string()}),
  },
  output: {
    schema: AnalyzeScreenshotForScamsOutputSchema,
  },
  prompt: `You are an expert in digital scam detection. Analyze the following text for potential scams, phishing, or fraud. Your analysis should be thorough, clear, and based on common scam patterns.\n\nConsider the following scam indicators:\n- Exaggerated urgency or threats.\n- Requests for money, personal data, bank details, or passwords.\n- Suspicious links, strange domains, or shortened URLs.\n- Unusual writing errors or grammar.\n- Unrealistic promises or offers (e.g., false prizes, jobs).\n- Messages impersonating legitimate entities (banks, carriers, tech support).\n- Fake senders or manipulative language.\n\nBased on your analysis, provide:\n1.  A 'riskScore' (0-100) indicating the likelihood of a scam.\n2.  A 'riskLevel' (Baixo risco, Médio risco, Alto risco, Muito alto risco).\n3.  A 'scamType' (e.g., Phishing, Fraude bancária, Falso suporte técnico, Falso prémio, Falsa transferência bancária, Falso emprego, Outro tipo de golpe digital).\n4.  A list of 'reasons' explaining why the content is suspicious.\n5.  A list of 'recommendations' on what the user should do.\n\nText to analyze:\n{{{textToAnalyze}}}`,
});

const analyzeScreenshotForScamsFlow = ai.defineFlow(
  {
    name: 'analyzeScreenshotForScamsFlow',
    inputSchema: AnalyzeScreenshotForScamsInputSchema,
    outputSchema: AnalyzeScreenshotForScamsOutputSchema,
  },
  async (input) => {
    // Step 1: Extract text from the screenshot using OCR prompt
    const ocrResult = await extractTextFromImagePrompt(input);
    const extractedText = ocrResult.output!.extractedText;

    if (!extractedText || extractedText.trim() === '') {
        return {
            riskScore: 0,
            riskLevel: 'Baixo risco',
            scamType: 'Nenhum golpe detectado',
            reasons: ['Nenhum texto significativo foi extraído da imagem.'],
            recommendations: ['Certifique-se de que a imagem contém texto claro e legível.']
        };
    }

    // Step 2: Analyze the extracted text for scams
    const scamAnalysisResult = await analyzeScamPrompt({ textToAnalyze: extractedText });

    // The output from the prompt is already of type AnalyzeScreenshotForScamsOutput
    return scamAnalysisResult.output!;
  }
);

export async function analyzeScreenshotForScams(
  input: AnalyzeScreenshotForScamsInput
): Promise<AnalyzeScreenshotForScamsOutput> {
  return analyzeScreenshotForScamsFlow(input);
}
