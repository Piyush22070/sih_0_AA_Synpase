'use client';

import { useEffect, useState } from 'react';
import { Trash2, ChevronDown, FileText, Clock, Database, Activity, CheckCircle, AlertCircle, Info, BarChart3, PieChart } from 'lucide-react';
import { PieChart as RechartsPie, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface HistoryItem {
  id: number;
  type: 'training' | 'analysis';
  file_id: string;
  filename: string;
  file_type: string;
  status: string;
  created_at: string;
  num_rows?: number;
  training_time?: number;
  training_logs?: string;
  depth?: string;
  latitude?: string;
  longitude?: string;
  collection_date?: string;
  voyage?: string;
  sequence_count?: number;
  total_clusters?: number;
  total_reads?: number;
  result_data?: any;
}

export default function HistoryAnalytics() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/history');
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history || []);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (type: string, fileId: string) => {
    try {
      const response = await fetch(`http://localhost:8000/history/${type}/${fileId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setHistory(prev => prev.filter(item => item.file_id !== fileId));
      }
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Clear all history? This cannot be undone.')) {
      try {
        const response = await fetch('http://localhost:8000/history', {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setHistory([]);
        }
      } catch (error) {
        console.error('Error clearing history:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      case 'failed': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getFileTypeIcon = (fileType: string) => {
    switch (fileType) {
      case 'fasta':
      case 'fa': return '🧬';
      case 'fastq':
      case 'fq': return '📊';
      case 'csv': return '📝';
      default: return '📄';
    }
  };

  const parseTrainingLogs = (logs: string) => {
    if (!logs) return [];
    return logs.split('\n').filter(line => line.trim());
  };

  const getLogIcon = (logLine: string) => {
    if (logLine.includes('ERROR')) return <AlertCircle className="w-3 h-3 text-red-500" />;
    if (logLine.includes('WARNING')) return <AlertCircle className="w-3 h-3 text-yellow-500" />;
    if (logLine.includes('completed') || logLine.includes('Successfully')) return <CheckCircle className="w-3 h-3 text-green-500" />;
    return <Info className="w-3 h-3 text-blue-500" />;
  };

  const getLogColor = (logLine: string) => {
    if (logLine.includes('ERROR')) return 'text-red-600 bg-red-50';
    if (logLine.includes('WARNING')) return 'text-yellow-600 bg-yellow-50';
    if (logLine.includes('completed') || logLine.includes('Successfully')) return 'text-green-600 bg-green-50';
    return 'text-gray-700 bg-gray-50';
  };

  // Calculate statistics for overview charts
  const getOverviewStats = () => {
    const typeData = [
      { name: 'Training', value: history.filter(h => h.type === 'training').length, color: '#3b82f6' },
      { name: 'Analysis', value: history.filter(h => h.type === 'analysis').length, color: '#8b5cf6' },
    ].filter(d => d.value > 0);

    const statusData = [
      { name: 'Completed', value: history.filter(h => h.status === 'completed').length, color: '#10b981' },
      { name: 'In Progress', value: history.filter(h => h.status === 'in-progress').length, color: '#3b82f6' },
      { name: 'Failed', value: history.filter(h => h.status === 'failed').length, color: '#ef4444' },
    ].filter(d => d.value > 0);

    const fileTypeData = history.reduce((acc, item) => {
      const type = item.file_type || 'unknown';
      const existing = acc.find(d => d.name === type);
      if (existing) {
        existing.value++;
      } else {
        acc.push({ name: type.toUpperCase(), value: 1, color: type === 'fasta' || type === 'fa' ? '#0891b2' : type === 'fastq' || type === 'fq' ? '#6366f1' : '#84cc16' });
      }
      return acc;
    }, [] as { name: string; value: number; color: string }[]);

    const totalSequences = history.reduce((sum, item) => sum + (item.num_rows || item.sequence_count || 0), 0);
    const totalTime = history.reduce((sum, item) => sum + (item.training_time || 0), 0);

    return { typeData, statusData, fileTypeData, totalSequences, totalTime };
  };

  const stats = getOverviewStats();

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Upload History</h2>
          <p className="text-xs text-gray-500">View detailed logs and analytics of training and analysis</p>
        </div>
        {history.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-[10px] px-2 py-1 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="bg-white rounded border border-gray-200 p-8 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No upload history yet</p>
          <p className="text-xs text-gray-400 mt-1">Your uploads will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overview Statistics */}
          <div className="grid grid-cols-1 gap-3">
            {/* Total Records */}
            <div className="bg-white rounded border border-gray-200 p-3">
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-blue-600" />
                <p className="text-[10px] text-gray-500 uppercase font-medium">Total Records</p>
              </div>
              <p className="text-2xl font-bold text-gray-900">{history.length}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{stats.totalSequences.toLocaleString()} sequences</p>
            </div>
          </div>

          {/* History Items */}
          <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
            {history.map((item) => {
              const isExpanded = expandedId === item.file_id;
              const trainingLogs = item.training_logs ? parseTrainingLogs(item.training_logs) : [];
              
              // Get top species from result_data for analysis items
              const topSpecies = item.result_data?.top_groups?.slice(0, 5).map((group: any, idx: number) => ({
                name: group.genus || `Cluster ${group.group_id + 1}`,
                value: group.percentage || 0,
                color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5],
              })) || [];
              
              return (
                <div
                  key={item.file_id}
                  className={`bg-white rounded border transition-all ${
                    isExpanded ? 'border-teal-300 shadow-md' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : item.file_id)}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="text-2xl">{getFileTypeIcon(item.file_type)}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.filename}</p>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${
                            item.type === 'training' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {item.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleString()}
                          </p>
                          {item.num_rows !== undefined && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Database className="w-3 h-3" />
                              {item.num_rows.toLocaleString()} records
                            </p>
                          )}
                          {item.training_time !== undefined && (
                            <p className="text-[10px] text-gray-400 flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              {item.training_time.toFixed(2)}s
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-3">
                      <span className={`px-2 py-1 rounded text-[10px] font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-gray-200">
                      {/* Species Distribution Chart for Analysis */}
                      {item.type === 'analysis' && topSpecies.length > 0 && (
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <PieChart className="w-4 h-4 text-purple-600" />
                            <h3 className="text-xs font-semibold text-gray-700">Species Distribution</h3>
                          </div>
                          <div className="flex items-center gap-4">
                            <ResponsiveContainer width={120} height={120}>
                              <RechartsPie data={topSpecies}>
                                <Pie
                                  data={topSpecies}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={30}
                                  outerRadius={55}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {topSpecies.map((entry: any, index: number) => (
                                    <Cell key={`cell-species-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ fontSize: '10px', padding: '4px 8px', borderRadius: '4px' }}
                                  formatter={(value: any, name: any) => [`${value}%`, name]}
                                />
                              </RechartsPie>
                            </ResponsiveContainer>
                            <div className="flex-1 space-y-1">
                              {topSpecies.map((species: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-2 text-[10px]">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: species.color }} />
                                  <span className="flex-1 text-gray-700 truncate" title={species.name}>{species.name}</span>
                                  <span className="font-semibold text-gray-900">{species.value.toFixed(1)}%</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Training Logs Section */}
                      {item.type === 'training' && trainingLogs.length > 0 && (
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <div className="flex items-center gap-2 mb-3">
                            <FileText className="w-4 h-4 text-gray-600" />
                            <h3 className="text-xs font-semibold text-gray-700">Training Logs</h3>
                            <span className="ml-auto text-[10px] text-gray-500">{trainingLogs.length} entries</span>
                          </div>
                          <div className="bg-gray-900 rounded p-3 max-h-64 overflow-y-auto">
                            <div className="space-y-1 font-mono text-[10px]">
                              {trainingLogs.map((log, idx) => (
                                <div key={idx} className={`flex items-start gap-2 p-1.5 rounded ${getLogColor(log)}`}>
                                  {getLogIcon(log)}
                                  <span className="flex-1">{log}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Metadata Section */}
                      <div className="p-4">
                        <h3 className="text-xs font-semibold text-gray-700 mb-2">Metadata</h3>
                        <div className="grid grid-cols-3 gap-2 text-[10px]">
                          {item.type === 'training' && (
                            <>
                              {item.depth && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-gray-500">Depth</p>
                                  <p className="font-medium text-gray-800">{item.depth}m</p>
                                </div>
                              )}
                              {item.latitude && item.longitude && (
                                <div className="bg-blue-50 p-2 rounded col-span-2">
                                  <p className="text-gray-500">Location</p>
                                  <p className="font-medium text-gray-800">{item.latitude}, {item.longitude}</p>
                                </div>
                              )}
                              {item.collection_date && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-gray-500">Collection Date</p>
                                  <p className="font-medium text-gray-800">{item.collection_date}</p>
                                </div>
                              )}
                              {item.voyage && (
                                <div className="bg-blue-50 p-2 rounded col-span-2">
                                  <p className="text-gray-500">Voyage</p>
                                  <p className="font-medium text-gray-800 truncate">{item.voyage}</p>
                                </div>
                              )}
                            </>
                          )}
                          {item.type === 'analysis' && (
                            <>
                              {item.sequence_count !== undefined && (
                                <div className="bg-purple-50 p-2 rounded">
                                  <p className="text-gray-500">Sequences</p>
                                  <p className="font-medium text-gray-800">{item.sequence_count}</p>
                                </div>
                              )}
                              {item.total_reads !== undefined && (
                                <div className="bg-purple-50 p-2 rounded">
                                  <p className="text-gray-500">Reads</p>
                                  <p className="font-medium text-gray-800">{item.total_reads.toLocaleString()}</p>
                                </div>
                              )}
                              {item.total_clusters !== undefined && (
                                <div className="bg-purple-50 p-2 rounded">
                                  <p className="text-gray-500">Clusters</p>
                                  <p className="font-medium text-gray-800">{item.total_clusters}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Delete Button */}
                      <div className="px-4 pb-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.type, item.file_id);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors text-[10px] font-medium"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete Record
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
