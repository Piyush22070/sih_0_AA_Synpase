'use client';
import { useState, useRef, JSX } from 'react';
import { Upload, Brain, CheckCircle, BarChart3 } from 'lucide-react';
import type { AnalysisLog } from '../types';

interface TrainingMetadata {
  depth: string;
  latitude: string;
  longitude: string;
  collectionDate: string;
  voyage: string;
  modelTrained: boolean;
  numRows: number;
  trainingTime: number;
  datasetName: string;
  timestamp: string;
}

interface TrainingResult {
  metadata: TrainingMetadata;
  topRows: any[];
}

export default function Training(): JSX.Element {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingResult, setTrainingResult] = useState<TrainingResult | null>(null);
  const [logs, setLogs] = useState<AnalysisLog[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [depth, setDepth] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [collectionDate, setCollectionDate] = useState('');
  const [voyage, setVoyage] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && isValidFileType(file.name)) {
      setSelectedFile(file);
      setTrainingResult(null);
      setLogs([]);
    } else {
      alert('Please select a valid file (.fasta, .fastq, or .csv)');
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && isValidFileType(file.name)) {
      setSelectedFile(file);
      setTrainingResult(null);
      setLogs([]);
    } else {
      alert('Please select a valid file (.fasta, .fastq, or .csv)');
    }
  };

  const isValidFileType = (filename: string): boolean => {
    const validExtensions = ['.fasta', '.fastq', '.csv'];
    return validExtensions.some(ext => filename.toLowerCase().endsWith(ext));
  };

  const handleTrainDataset = async (): Promise<void> => {
    if (!selectedFile) return;

    setIsTraining(true);
    setLogs([{ type: 'log', message: 'Starting training...' }]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('depth', depth);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('collectionDate', collectionDate);
      formData.append('voyage', voyage);

      const response = await fetch('http://localhost:8000/train', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Training failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      
      const metadata: TrainingMetadata = {
        depth: result.metadata?.depth || depth,
        latitude: result.metadata?.latitude || latitude,
        longitude: result.metadata?.longitude || longitude,
        collectionDate: result.metadata?.collectionDate || collectionDate,
        voyage: result.metadata?.voyage || voyage,
        modelTrained: result.model_trained || true,
        numRows: result.num_rows || 0,
        trainingTime: result.training_time || 0,
        datasetName: selectedFile.name,
        timestamp: new Date().toISOString(),
      };

      setTrainingResult({ metadata, topRows: result.top_rows || [] });
      setLogs([
        ...logs,
        { type: 'log', message: 'Training completed' },
        { type: 'log', message: `Processed ${metadata.numRows} sequences` },
      ]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setLogs([...logs, { type: 'log', message: `Failed: ${errorMessage}` }]);
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className="p-6 h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Model Training</h2>
        <p className="text-xs text-gray-500">Upload datasets to train on FASTA, FASTQ, or CSV files</p>
      </div>

      <div className="flex-1 grid grid-cols-3 gap-4 min-h-0 overflow-hidden">
        {/* Main Panel */}
        <div className="col-span-2 space-y-3 flex flex-col overflow-y-auto">
          {/* Upload */}
          <div className="bg-white rounded border border-gray-200 p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Dataset</p>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="h-16 border border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".fasta,.fastq,.csv"
                className="hidden"
              />
              <Upload className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-xs text-gray-600">
                {selectedFile ? selectedFile.name : 'Drop file or click to browse'}
              </span>
            </div>
          </div>

          {/* Metadata Form */}
          <div className="bg-white rounded border border-gray-200 p-3">
            <p className="text-xs font-medium text-gray-700 mb-2">Sample Metadata</p>
            
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Depth (m)</label>
                <input
                  type="text"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  placeholder="1500"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Collection Date</label>
                <input
                  type="date"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-2">
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Latitude</label>
                <input
                  type="text"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="23.5"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-500 mb-0.5">Longitude</label>
                <input
                  type="text"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="75.5"
                  className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="block text-[10px] text-gray-500 mb-0.5">Voyage</label>
              <input
                type="text"
                value={voyage}
                onChange={(e) => setVoyage(e.target.value)}
                placeholder="RV Samudra Manthan - Leg 2"
                className="w-full px-2 py-1.5 text-xs border border-gray-200 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <button
              onClick={handleTrainDataset}
              disabled={isTraining || !selectedFile}
              className="w-full bg-blue-600 text-white py-1.5 rounded text-xs font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-1.5"
            >
              <Brain className="w-3 h-3" />
              {isTraining ? 'Training...' : 'Train Model'}
            </button>
          </div>

          {/* Results Table */}
          {trainingResult && (
            <div className="bg-white rounded border border-gray-200 p-3 flex-1 min-h-0 flex flex-col">
              <p className="text-xs font-medium text-gray-700 mb-2">Sample Data (Top 10)</p>
              <div className="flex-1 overflow-auto">
                <table className="w-full text-[10px]">
                  <thead className="sticky top-0">
                    <tr className="bg-gray-50 border-b border-gray-200">
                      {trainingResult.topRows[0] && Object.keys(trainingResult.topRows[0]).map((key) => (
                        <th key={key} className="px-2 py-1.5 text-left font-medium text-gray-600 whitespace-nowrap">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {trainingResult.topRows.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {Object.values(row).map((value: any, vidx) => (
                          <td key={vidx} className="px-2 py-1.5 text-gray-600 truncate max-w-[200px]">
                            {String(value).substring(0, 40)}{String(value).length > 40 ? '...' : ''}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Info */}
        <div className="col-span-1 bg-white rounded border border-gray-200 p-3 flex flex-col overflow-y-auto">
          <div className="flex items-center gap-1.5 mb-3">
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <p className="text-xs font-medium text-gray-700">Training Info</p>
          </div>

          {trainingResult ? (
            <div className="space-y-2 text-[10px]">
              {/* Status */}
              <div className="flex items-center gap-1.5 p-2 bg-green-50 rounded border border-green-200">
                <CheckCircle className="w-3 h-3 text-green-600" />
                <span className="text-green-700 font-medium">Model Trained</span>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Depth</p>
                  <p className="font-medium text-gray-800">{trainingResult.metadata.depth || '-'} m</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Date</p>
                  <p className="font-medium text-gray-800">{trainingResult.metadata.collectionDate || '-'}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Latitude</p>
                  <p className="font-medium text-gray-800">{trainingResult.metadata.latitude || '-'}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Longitude</p>
                  <p className="font-medium text-gray-800">{trainingResult.metadata.longitude || '-'}</p>
                </div>
              </div>

              <div className="p-2 bg-gray-50 rounded">
                <p className="text-gray-500">Voyage</p>
                <p className="font-medium text-gray-800 truncate">{trainingResult.metadata.voyage || '-'}</p>
              </div>

              <div className="border-t border-gray-200 pt-2 mt-2 space-y-1.5">
                <div className="flex justify-between p-2 bg-blue-50 rounded">
                  <span className="text-gray-600">Rows</span>
                  <span className="font-semibold text-blue-700">{trainingResult.metadata.numRows.toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-gray-50 rounded">
                  <span className="text-gray-600">Time</span>
                  <span className="font-medium text-gray-800">{trainingResult.metadata.trainingTime.toFixed(2)}s</span>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                  <p className="text-gray-500">Dataset</p>
                  <p className="font-medium text-gray-800 truncate">{trainingResult.metadata.datasetName}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Brain className="w-6 h-6 text-gray-300 mb-1.5" />
              <p className="text-xs text-gray-400">No results yet</p>
              <p className="text-[10px] text-gray-300">Upload and train a model</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}