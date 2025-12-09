'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Clock, AlertCircle, Zap } from 'lucide-react';
import type { AnalysisLog, PipelineStep  } from '../types'; 

const INITIAL_PIPELINE: PipelineStep[] = [
    { id: 'read_sequences', label: 'Reading Sequences', status: 'pending' },
    { id: 'generate_embeddings', label: 'Generating Embeddings', status: 'pending' },
    { id: 'umap_hdbscan', label: 'UMAP & HDBSCAN', status: 'pending' },
    { id: 'clustering_result', label: 'Clustering Complete', status: 'pending' }, 
    { id: 'ncbi_verification', label: 'NCBI Verification', status: 'pending' },
    { id: 'analysis_complete', label: 'Analysis Complete', status: 'pending' },
];

interface LogDisplayProps {
  logs: AnalysisLog[];
}

export default function LogDisplay({ logs }: LogDisplayProps) {
    const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>(INITIAL_PIPELINE);
    const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set());
    const [lastVerificationUpdate, setLastVerificationUpdate] = useState<AnalysisLog | null>(null);

    useEffect(() => {
        if (logs.length === 0) {
            setPipelineSteps(INITIAL_PIPELINE);
            setLastVerificationUpdate(null);
            return;
        }

        const lastLog = logs[logs.length - 1];

        setPipelineSteps(prevSteps => {
            const newSteps = [...prevSteps];
            let changed = false;
            
            const findIndexById = (id: string) => newSteps.findIndex(s => s.id === id);

            const handleCompletion = (stepId: string, resultData?: any) => {
                const index = findIndexById(stepId);
                if (index !== -1 && newSteps[index].status !== 'complete') {
                    newSteps[index] = { ...newSteps[index], status: 'complete', resultData: resultData };
                    const nextIndex = index + 1;
                    if (nextIndex < newSteps.length && newSteps[nextIndex].status === 'pending') {
                        newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'active' };
                    }
                    changed = true;
                }
            };
            
            const activateStep = (stepId: string) => {
                const index = findIndexById(stepId);
                if (index !== -1 && newSteps[index].status === 'pending') {
                    newSteps[index] = { ...newSteps[index], status: 'active' };
                    changed = true;
                }
            };
            
            if (lastLog.type === 'log') {
                const message = lastLog.message.toLowerCase();
                
                if (message.includes('reading sequences')) {
                    activateStep('read_sequences');
                } else if (message.includes('found') && message.includes('sequences')) {
                    handleCompletion('read_sequences');
                } else if (message.includes('generating') && message.includes('embeddings')) {
                    activateStep('generate_embeddings');
                } else if (message.includes('running umap')) {
                    handleCompletion('generate_embeddings');
                    activateStep('umap_hdbscan');
                } else if (message.includes('clustering complete')) {
                    handleCompletion('umap_hdbscan');
                } else if (message.includes('ncbi verification')) {
                    activateStep('ncbi_verification');
                }
            }
            
            if (lastLog.type === 'progress' && lastLog.status === 'complete' && lastLog.step) {
                handleCompletion(lastLog.step);
            }
            
            if (lastLog.type === 'clustering_result') {
                handleCompletion('umap_hdbscan');
                handleCompletion('clustering_result', lastLog.data);
            }
            
            if (lastLog.type === 'complete') {
                handleCompletion('ncbi_verification');
                handleCompletion('analysis_complete');
            }

            if (lastLog.type === 'verification_update') {
                setLastVerificationUpdate(lastLog);
                activateStep('ncbi_verification');
            }
            
            return changed ? newSteps : prevSteps;
        });

    }, [logs]);
    
    const toggleLog = (id: string) => {
        const newExpanded = new Set(expandedLogs);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedLogs(newExpanded);
    };

    const STATUS_MAP = useMemo(() => ({
        pending: { icon: Clock, className: 'bg-gray-50 text-gray-400 border border-gray-200' },
        active: { icon: Zap, className: 'bg-blue-50 text-blue-600 border border-blue-200' },
        complete: { icon: CheckCircle, className: 'bg-green-50 text-green-600 border border-green-200' },
        error: { icon: AlertCircle, className: 'bg-red-50 text-red-600 border border-red-200' },
    }), []);

    const VERIFICATION_COLORS = useMemo(() => ({
        NOVEL: {bg: 'bg-purple-50', hover: 'hover:bg-purple-100', text: 'text-purple-600', border: 'border-purple-200'},
        MATCHED: {bg: 'bg-blue-50', hover: 'hover:bg-blue-100', text: 'text-blue-600', border: 'border-blue-200'},
        COMPLETE: {bg: 'bg-green-50', hover: 'hover:bg-green-100', text: 'text-green-600', border: 'border-green-200'},
    }), []);

    const renderPipelineStep = (step: PipelineStep) => {
        const { icon: Icon, className } = STATUS_MAP[step.status];
        const isExpanded = expandedLogs.has(step.id);
        
        // Clustering result
        if (step.id === 'clustering_result' && step.status === 'complete') {
            const log = step.resultData;
            if (!log) return null;

            return (
                <div key={step.id} className="border border-green-200 rounded overflow-hidden">
                    <button
                        onClick={() => toggleLog(step.id)}
                        className="w-full flex items-center justify-between p-2.5 bg-green-50 hover:bg-green-100 transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                            <span className="text-[10px] font-medium text-green-800">{step.label}</span>
                        </div>
                        {isExpanded ? <ChevronDown className="w-3 h-3 text-green-600" /> : <ChevronRight className="w-3 h-3 text-green-600" />}
                    </button>
                    {isExpanded && (
                        <div className="p-2.5 bg-white border-t border-green-200 space-y-2">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 bg-green-50 rounded">
                                    <p className="text-[9px] text-green-600 uppercase">Reads</p>
                                    <p className="text-sm font-bold text-green-900">{log.total_reads?.toLocaleString()}</p>
                                </div> 
                                <div className="p-2 bg-blue-50 rounded">
                                    <p className="text-[9px] text-blue-600 uppercase">Clusters</p>
                                    <p className="text-sm font-bold text-blue-900">{log.total_clusters?.toLocaleString()}</p>
                                </div>
                                <div className="p-2 bg-purple-50 rounded">
                                    <p className="text-[9px] text-purple-600 uppercase">Noise</p>
                                    <p className="text-sm font-bold text-purple-900">{log.noise_percentage}%</p>
                                </div>
                            </div>
                            {log.top_groups && (
                                <div>
                                    <p className="text-[10px] font-medium text-gray-700 mb-1.5">Top Groups</p>
                                    <div className="space-y-1">
                                      {log.top_groups.map((group: any) => (
                                        <div key={group.group_id} className="flex items-center justify-between p-1.5 bg-gray-50 rounded text-[10px]">
                                          <span className="text-gray-600">Group {group.group_id}</span>
                                          <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-800">{group.count}</span>
                                            <div className="w-12 h-1.5 bg-gray-200 rounded overflow-hidden">
                                              <div className="h-full bg-green-500" style={{width: `${group.percentage}%`}}></div>
                                            </div>
                                            <span className="font-medium text-green-600 w-8">{group.percentage}%</span>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        
        // NCBI Verification
        if (step.id === 'ncbi_verification' && step.status !== 'pending') {
            const log = lastVerificationUpdate || { data: { status: 'PENDING', cluster_id: 'N/A', match_percentage: 0, description: 'Waiting...' } };
            const statusKey = step.status === 'complete' ? 'COMPLETE' : log.data.status.includes('NOVEL') ? 'NOVEL' : 'MATCHED';
            const colorMap = VERIFICATION_COLORS[statusKey] || VERIFICATION_COLORS['MATCHED'];
            const IconComponent = step.status === 'complete' ? CheckCircle : AlertCircle;
            
            return (
                <div key={step.id} className={`border rounded overflow-hidden ${step.status === 'complete' ? 'border-green-200' : 'border-gray-200'}`}>
                    <button
                        onClick={() => toggleLog(step.id)}
                        className={`w-full flex items-center justify-between p-2.5 transition-all ${step.status === 'complete' ? 'bg-green-50' : colorMap.bg} ${step.status === 'complete' ? 'hover:bg-green-100' : colorMap.hover}`}
                    >
                        <div className="flex items-center gap-2">
                            <IconComponent className={`w-3.5 h-3.5 ${step.status === 'complete' ? 'text-green-600' : colorMap.text}`} />
                            <span className={`text-[10px] font-medium ${step.status === 'complete' ? 'text-green-800' : colorMap.text}`}>{step.label}</span>
                            <span className={`text-[9px] ${step.status === 'complete' ? 'text-green-600' : colorMap.text}`}>• C{log.data.cluster_id}</span>
                        </div>
                        {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    </button>
                    {isExpanded && (
                        <div className="p-2.5 bg-white border-t border-gray-100 space-y-1.5 text-[10px]">
                            <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                                <span className="text-gray-500">Status</span>
                                <span className={`font-medium ${step.status === 'complete' ? 'text-green-600' : colorMap.text}`}>{log.data.status}</span>
                            </div>
                            <div className="flex items-center justify-between p-1.5 bg-gray-50 rounded">
                                <span className="text-gray-500">Match</span>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-10 h-1 bg-gray-200 rounded overflow-hidden">
                                        <div className="h-full bg-blue-500" style={{width: `${log.data.match_percentage}%`}}></div>
                                    </div>
                                    <span className="font-medium text-blue-600">{log.data.match_percentage}%</span>
                                </div>
                            </div>
                            <div className="p-1.5 bg-gray-50 rounded">
                                <p className="text-gray-600 leading-relaxed">{log.data.description}</p>
                            </div>
                        </div>
                    )}
                </div>
            );
        }

        // Default steps
        return (
            <div key={step.id} className={`flex items-center gap-2 p-2 rounded text-[10px] ${className}`}>
                <Icon className="w-3 h-3" />
                <span className="font-medium">{step.label}</span>
                {step.status === 'complete' && <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />}
            </div>
        );
    };

    return (
        <div className="space-y-1.5">
            {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-400 rounded border border-dashed border-gray-200 bg-gray-50">
                    <Clock className="w-6 h-6 mx-auto mb-2 opacity-50" />
                    <p className="text-xs font-medium text-gray-500">No analysis running</p>
                    <p className="text-[10px] text-gray-400">Upload a file to start</p>
                </div>
            ) : (
                <div className="space-y-1.5">
                    {pipelineSteps.map((step) => renderPipelineStep(step))}
                </div>
            )}
        </div>
    );
}