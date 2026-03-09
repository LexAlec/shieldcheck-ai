export type ScamAnalysisEntry = {
  id: string;
  type: 'text' | 'link' | 'image';
  date: string;
  riskScore: number;
  riskLevel: string;
  scamType: string;
  input: string;
};

const HISTORY_KEY = 'shieldcheck_history';

export function getHistory(): ScamAnalysisEntry[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function addToHistory(entry: Omit<ScamAnalysisEntry, 'id' | 'date'>) {
  if (typeof window === 'undefined') return;
  const history = getHistory();
  const newEntry: ScamAnalysisEntry = {
    ...entry,
    id: Math.random().toString(36).substring(7),
    date: new Date().toISOString(),
  };
  const updated = [newEntry, ...history].slice(0, 10); // Keep last 10
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}