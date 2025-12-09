// Upload history management utilities

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileType: '.fasta' | '.fastq' | 'text';
  uploadDate: string;
  fileSize?: number;
  status: 'completed' | 'in-progress' | 'failed';
  totalReads?: number;
  totalClusters?: number;
  taxaCount?: number;
  novelTaxaCount?: number;
}

const HISTORY_STORAGE_KEY = 'edna_upload_history';
const MAX_HISTORY_ITEMS = 50;

export function getUploadHistory(): UploadHistoryItem[] {
  try {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading upload history:', error);
    return [];
  }
}

export function addToHistory(item: UploadHistoryItem): void {
  try {
    if (typeof window === 'undefined') return;
    const history = getUploadHistory();
    const newHistory = [item, ...history].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(newHistory));
  } catch (error) {
    console.error('Error saving to upload history:', error);
  }
}

export function updateHistoryItem(id: string, updates: Partial<UploadHistoryItem>): void {
  try {
    if (typeof window === 'undefined') return;
    const history = getUploadHistory();
    const updated = history.map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating upload history:', error);
  }
}

export function clearHistory(): void {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing upload history:', error);
  }
}

export function deleteHistoryItem(id: string): void {
  try {
    if (typeof window === 'undefined') return;
    const history = getUploadHistory();
    const filtered = history.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting from upload history:', error);
  }
}
