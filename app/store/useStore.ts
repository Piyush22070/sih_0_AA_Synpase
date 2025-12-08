import { create } from 'zustand';
import { Sample, AnalysisResult, ProgressStep, VerificationUpdate } from '../types';
import { saveSample, getSamples, initDatabase, clearAllSamples, deleteSampleFromDb } from '../services/database';

interface AppState {
  samples: Sample[];
  isLoading: boolean;
  initializeStore: () => Promise<void>;
  clearStore: () => Promise<void>;
  deleteSample: (fileId: string) => Promise<void>;
  addSample: (sample: Sample) => void;
  updateSampleStatus: (fileId: string, status: Sample['status']) => void;
  addSampleLog: (fileId: string, log: string) => void;
  updateSampleProgress: (fileId: string, progress: ProgressStep) => void;
  setSampleAnalysisResult: (fileId: string, result: AnalysisResult) => void;
  addSampleVerificationUpdate: (fileId: string, update: VerificationUpdate) => void;
  getSample: (fileId: string) => Sample | undefined;
}

export const useStore = create<AppState>((set, get) => ({
  samples: [],
  isLoading: true,
  initializeStore: async () => {
    try {
      await initDatabase();
      const samples = await getSamples();
      set({ samples, isLoading: false });
    } catch (error) {
      console.error('Failed to initialize store:', error);
      set({ isLoading: false });
    }
  },
  clearStore: async () => {
    try {
      await clearAllSamples();
      set({ samples: [] });
    } catch (error) {
      console.error('Failed to clear store:', error);
    }
  },
  deleteSample: async (fileId) => {
    try {
      await deleteSampleFromDb(fileId);
      set((state) => ({
        samples: state.samples.filter((s) => s.fileId !== fileId),
      }));
    } catch (error) {
      console.error('Failed to delete sample:', error);
    }
  },
  addSample: (sample) => {
    saveSample(sample);
    set((state) => ({ samples: [...state.samples, sample] }));
  },
  updateSampleStatus: (fileId, status) => {
    set((state) => {
      const updatedSamples = state.samples.map((s) =>
        s.fileId === fileId ? { ...s, status } : s
      );
      const updatedSample = updatedSamples.find(s => s.fileId === fileId);
      if (updatedSample) saveSample(updatedSample);
      return { samples: updatedSamples };
    });
  },
  addSampleLog: (fileId, log) => {
    set((state) => {
      const updatedSamples = state.samples.map((s) =>
        s.fileId === fileId ? { ...s, logs: [...s.logs, log] } : s
      );
      const updatedSample = updatedSamples.find(s => s.fileId === fileId);
      if (updatedSample) saveSample(updatedSample);
      return { samples: updatedSamples };
    });
  },
  updateSampleProgress: (fileId, progress) => {
    set((state) => {
      const updatedSamples = state.samples.map((s) =>
        s.fileId === fileId ? { ...s, progress: [...s.progress, progress] } : s
      );
      const updatedSample = updatedSamples.find(s => s.fileId === fileId);
      if (updatedSample) saveSample(updatedSample);
      return { samples: updatedSamples };
    });
  },
  setSampleAnalysisResult: (fileId, result) => {
    set((state) => {
      const updatedSamples = state.samples.map((s) =>
        s.fileId === fileId ? { ...s, latestAnalysis: result } : s
      );
      const updatedSample = updatedSamples.find(s => s.fileId === fileId);
      if (updatedSample) saveSample(updatedSample);
      return { samples: updatedSamples };
    });
  },
  addSampleVerificationUpdate: (fileId, update) => {
    set((state) => {
      const updatedSamples = state.samples.map((s) =>
        s.fileId === fileId
          ? { ...s, verificationUpdates: [...s.verificationUpdates, update] }
          : s
      );
      const updatedSample = updatedSamples.find(s => s.fileId === fileId);
      if (updatedSample) saveSample(updatedSample);
      return { samples: updatedSamples };
    });
  },
  getSample: (fileId) => get().samples.find((s) => s.fileId === fileId),
}));
