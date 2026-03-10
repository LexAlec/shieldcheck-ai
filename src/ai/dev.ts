import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-suspicious-text.ts';
import '@/ai/flows/analyze-suspicious-link.ts';
import '@/ai/flows/analyze-screenshot-for-scams.ts';
import '@/ai/flows/analyze-phone-number.ts';
