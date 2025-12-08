'use client';
import { useState, useEffect, useRef, useCallback, JSX } from 'react';
import { Upload, FileText, Type } from 'lucide-react';
import LogDisplay from './LogDisplay'; 
import type { AnalysisLog } from '../types'; 

// --- Constants ---
const API_BASE_URL = 'http://localhost:8000'; 
const UPLOAD_ENDPOINT = `${API_BASE_URL}/upload`;
// FIX: Point to local proxy to avoid CORS
const TEXT_API_ENDPOINT = `${API_BASE_URL}/api/text-analysis`; 
const WS_BASE_URL = 'ws://localhost:8000';
const FILE_ID_KEY = 'edna_analysis_file_id';

interface UploadResponse {
    file_id: string;
    message: string;
}

export default function Analysis(): JSX.Element {
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [fileType, setFileType] = useState<'.fasta' | '.fastq'>('.fasta');
  const [textInput, setTextInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'checking' | 'online' | 'offline'>('unknown');
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connectWebSocket = useCallback((fileId: string) => {
    if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
    }

    const wsUrl = `${WS_BASE_URL}/ws/${fileId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
        setLogs(prev => [...prev, { type: 'log', message: 'Connected to server' }]);
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            setLogs(prev => [...prev, message]);
            if (message.type === 'complete' || message.type === 'error') setIsAnalyzing(false);
        } catch (e) {
            console.error('WS Error', e);
        }
    };

    ws.onerror = () => {
        setLogs(prev => [...prev, { type: 'error', message: 'WebSocket connection failed.' }]);
        setIsAnalyzing(false);
    };

    ws.onclose = () => { wsRef.current = null; };
  }, []);

  useEffect(() => {
    fetch(`${API_BASE_URL}/health`).then(r => setBackendStatus(r.ok ? 'online' : 'offline')).catch(() => setBackendStatus('offline'));
  }, []);

  useEffect(() => {
    return () => { if (wsRef.current) wsRef.current.close(); };
  }, []);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if ((uploadMode === 'file' && !selectedFile) || (uploadMode === 'text' && !textInput.trim())) {
        alert('Please select a file or enter text.');
        return;
    }

    setIsAnalyzing(true);
    setLogs([]);
    setCurrentFileId(null);

    try {
        if (uploadMode === 'text') {
            const response = await fetch(TEXT_API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sequence: textInput }), 
            });

            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errText}`);
            }
            
            const result = await response.json();
            setLogs([{ type: 'json_result', data: result } as any]);
            setIsAnalyzing(false);

        } else {
            const formData = new FormData();
            formData.append('file', selectedFile!);

            const response = await fetch(UPLOAD_ENDPOINT, { method: 'POST', body: formData });
            if (!response.ok) throw new Error(`Upload failed: ${response.statusText}`);
            
            const result: UploadResponse = await response.json();
            if (!result.file_id) throw new Error('No file ID returned');

            setCurrentFileId(result.file_id);
            localStorage.setItem(FILE_ID_KEY, result.file_id);
            connectWebSocket(result.file_id);
        }

    } catch (error) {
        setLogs(prev => [...prev, { type: 'error', message: `Error: ${error instanceof Error ? error.message : String(error)}` }]);
        setIsAnalyzing(false);
    }
  };

  const logHeaderMessage = logs.length > 0 && logs[0].type === 'json_result'
    ? 'Analysis Result (JSON)'
    : currentFileId ? `Analysis Logs (ID: ${currentFileId.substring(0, 8)}...)` : 'Analysis Logs';

  return (
    <div className="p-8 h-screen flex flex-col bg-gray-50">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">eDNA Analysis</h2>
        <div className="mt-3 flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${backendStatus === 'online' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {backendStatus === 'online' ? '🟢 Backend Online' : '🔴 Backend Offline'}
          </div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Input Data</h3>
          <div className="flex gap-2 mb-4">
            <button onClick={() => { setUploadMode('file'); setSelectedFile(null); setLogs([]); }} disabled={isAnalyzing} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${uploadMode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              <FileText className="w-4 h-4 inline mr-2" /> File Upload
            </button>
            <button onClick={() => { setUploadMode('text'); setTextInput(''); setLogs([]); }} disabled={isAnalyzing} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${uploadMode === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}>
              <Type className="w-4 h-4 inline mr-2" /> Text Input
            </button>
          </div>

          {uploadMode === 'file' ? (
            <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => !isAnalyzing && fileInputRef.current?.click()} className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 transition-colors">
              <input ref={fileInputRef} type="file" onChange={handleFileSelect} className="hidden" />
              <Upload className="w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-700 font-medium mb-1">{selectedFile ? selectedFile.name : 'Click to browse'}</p>
            </div>
          ) : (
            <textarea value={textInput} onChange={(e) => setTextInput(e.target.value)} disabled={isAnalyzing} placeholder="Paste sequence text here..." className="flex-1 border border-gray-300 rounded-lg p-4 font-mono text-sm resize-none" />
          )}

          <button onClick={handleAnalyze} disabled={isAnalyzing || (uploadMode === 'file' && !selectedFile) || (uploadMode === 'text' && !textInput.trim())} className="mt-4 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50">
            {isAnalyzing ? 'Processing...' : 'Start Analysis'}
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6 flex flex-col shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">{logHeaderMessage}</h3>
          <div className="flex-1 overflow-y-auto">
            <LogDisplay logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}