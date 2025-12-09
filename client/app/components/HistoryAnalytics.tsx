'use client';

import { useEffect, useState } from 'react';
import { Trash2, Download, ChevronDown } from 'lucide-react';
import { getUploadHistory, deleteHistoryItem, clearHistory, UploadHistoryItem } from '../utils/uploadHistory';

export default function HistoryAnalytics() {
  const [history, setHistory] = useState<UploadHistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const items = getUploadHistory();
    setHistory(items);
    setIsLoading(false);
  }, []);

  const handleDelete = (id: string) => {
    deleteHistoryItem(id);
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
      clearHistory();
      setHistory([]);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case '.fasta':
        return '🧬';
      case '.fastq':
        return '📊';
      case 'text':
        return '📝';
      default:
        return '📄';
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Upload History</h2>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-2">No upload history yet</p>
          <p className="text-gray-400">Your uploads will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-6 max-h-96 overflow-y-auto pr-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-lg hover:border-teal-300 transition-all bg-white"
            >
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
              >
                <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl">{getFileTypeIcon(item.fileType)}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{item.fileName}</p>
                    <p className="text-sm text-gray-500">{new Date(item.uploadDate).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(item.status)}`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedId === item.id ? 'transform rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {expandedId === item.id && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {item.fileSize && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">File Size</p>
                        <p className="font-semibold text-gray-900">
                          {(item.fileSize / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    )}
                    {item.totalReads !== undefined && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Total Reads</p>
                        <p className="font-semibold text-gray-900">{item.totalReads.toLocaleString()}</p>
                      </div>
                    )}
                    {item.totalClusters !== undefined && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Total Clusters</p>
                        <p className="font-semibold text-gray-900">{item.totalClusters}</p>
                      </div>
                    )}
                    {item.taxaCount !== undefined && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Taxa Identified</p>
                        <p className="font-semibold text-gray-900">{item.taxaCount}</p>
                      </div>
                    )}
                    {item.novelTaxaCount !== undefined && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-gray-600">Novel Taxa</p>
                        <p className="font-semibold text-gray-900">{item.novelTaxaCount}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 transition-colors text-sm font-medium">
                      <Download className="w-4 h-4" />
                      Export Results
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
