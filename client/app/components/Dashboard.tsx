'use client';

import { useContext, useEffect, useState } from 'react';
import { Database, Dna, Sparkles, FileText, Clock } from 'lucide-react';
import { AnalysisContext } from '../context/AnalysisContext';
import dynamic from 'next/dynamic';

const InteractiveMap = dynamic(() => import('./InteractiveMap'), { ssr: false });
const OrganismBarChart = dynamic(() => import('./OrganismBarChart'), { ssr: false });
const OrganismTreemap = dynamic(() => import('./OrganismTreemap'), { ssr: false });

interface DashboardStats {
  totalSamples: number;
  totalSequences: number;
  totalClusters: number;
  novelTaxa: number;
  recentAnalyses: any[];
  topSpecies: { name: string; percentage: number; color: string }[];
}

export default function Dashboard() {
  const { analysisData } = useContext(AnalysisContext)!;
  const [stats, setStats] = useState<DashboardStats>({
    totalSamples: 0,
    totalSequences: 0,
    totalClusters: 0,
    novelTaxa: 0,
    recentAnalyses: [],
    topSpecies: [],
  });
  const [loading, setLoading] = useState(true);

  const speciesColors = ['#1e3a5f', '#c53030', '#22863a', '#6f42c1', '#d97706', '#0891b2', '#be185d', '#4f46e5'];

  useEffect(() => {
    fetchDashboardStats();
  }, [analysisData]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/history');
      if (response.ok) {
        const data = await response.json();
        const history = data.history || [];
        
        const analyses = history.filter((item: any) => item.type === 'analysis');
        const trainings = history.filter((item: any) => item.type === 'training');
        
        let totalSequences = 0;
        let totalClusters = 0;
        let novelCount = 0;
        const speciesCount: { [key: string]: number } = {};
        
        analyses.forEach((item: any) => {
          if (item.result_data) {
            totalSequences += item.result_data.total_reads || 0;
            totalClusters += item.result_data.total_clusters || 0;
            
            if (item.result_data.top_groups) {
              item.result_data.top_groups.forEach((group: any) => {
                const name = group.genus || `Cluster ${group.group_id + 1}`;
                speciesCount[name] = (speciesCount[name] || 0) + group.count;
                
                if (group.genus?.toLowerCase().includes('unknown') || group.avg_prob < 0.5) {
                  novelCount++;
                }
              });
            }
          }
        });
        
        const totalSpeciesCount = Object.values(speciesCount).reduce((a, b) => a + b, 0);
        const topSpecies = Object.entries(speciesCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6)
          .map(([name, count], idx) => ({
            name,
            percentage: totalSpeciesCount > 0 ? Math.round((count / totalSpeciesCount) * 100) : 0,
            color: speciesColors[idx % speciesColors.length],
          }));
        
        const recentAnalyses = analyses.slice(0, 3).map((item: any) => ({
          id: item.id,
          sample: item.filename || 'Unknown file',
          location: item.metadata?.location || 'Not specified',
          status: 'Completed',
          date: new Date(item.timestamp).toLocaleDateString(),
        }));
        
        setStats({
          totalSamples: analyses.length + trainings.length,
          totalSequences,
          totalClusters,
          novelTaxa: novelCount,
          recentAnalyses,
          topSpecies,
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  let cumulativeAngle = 0;
  const pieSegments = stats.topSpecies.length > 0 
    ? stats.topSpecies.map((species) => {
        const sliceAngle = (species.percentage / 100) * 360;
        const startAngle = cumulativeAngle;
        const endAngle = cumulativeAngle + sliceAngle;
        
        const startRad = (startAngle * Math.PI) / 180;
        const endRad = (endAngle * Math.PI) / 180;
        
        const x1 = 50 + 40 * Math.cos(startRad);
        const y1 = 50 + 40 * Math.sin(startRad);
        const x2 = 50 + 40 * Math.cos(endRad);
        const y2 = 50 + 40 * Math.sin(endRad);
        
        const largeArc = sliceAngle > 180 ? 1 : 0;
        const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;
        
        cumulativeAngle = endAngle;
        
        return { ...species, pathData };
      })
    : [];

  return (
    <div className="p-6 space-y-4 bg-gradient-to-br from-gray-900 to-gray-800 min-h-screen">
      {/* Header */}
      <div className="mb-2">
        <h1 className="text-xl font-semibold text-white">Dashboard</h1>
        <p className="text-xs text-gray-400">Deep-sea biodiversity monitoring overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Total Samples</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : stats.totalSamples}
              </p>
              <p className="text-[10px] text-gray-400">{stats.totalSequences.toLocaleString()} sequences</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded flex items-center justify-center">
              <Database className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Taxa Identified</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : stats.totalClusters}
              </p>
              <p className="text-[10px] text-gray-400">unique species/clusters</p>
            </div>
            <div className="w-10 h-10 bg-teal-50 rounded flex items-center justify-center">
              <Dna className="w-5 h-5 text-teal-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">Novel Taxa</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {loading ? '...' : stats.novelTaxa}
              </p>
              <p className="text-[10px] text-gray-400">potentially new species</p>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Map */}
      <div className="bg-white rounded overflow-hidden">
        <div className="bg-blue-600 px-4 py-2">
          <h2 className="text-sm font-medium text-white">Global Organism Distribution</h2>
        </div>
        <div style={{ height: '360px' }}>
          <InteractiveMap />
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        <OrganismBarChart />
        <OrganismTreemap />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Recent Analyses */}
        <div className="bg-teal-600 rounded p-4">
          <h2 className="text-sm font-medium text-white mb-3">Recent Analyses</h2>
          <div className="space-y-2">
            {loading ? (
              <p className="text-xs text-teal-100 text-center py-3">Loading...</p>
            ) : stats.recentAnalyses.length > 0 ? (
              stats.recentAnalyses.map((analysis: any) => (
                <div key={analysis.id} className="bg-teal-700/50 rounded p-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-teal-200" />
                      <div>
                        <p className="text-xs font-medium text-white truncate max-w-[150px]">{analysis.sample}</p>
                        <p className="text-[10px] text-teal-100">{analysis.date}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                      {analysis.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <Clock className="w-6 h-6 mx-auto text-teal-200 opacity-50 mb-2" />
                <p className="text-xs text-teal-100">No analyses yet</p>
                <p className="text-[10px] text-teal-200">Upload a FASTA file to start</p>
              </div>
            )}
          </div>
        </div>

        {/* Species Distribution - From Real Data */}
        <div className="bg-white rounded p-4">
          <h2 className="text-sm font-medium text-gray-900 mb-3">Species Distribution</h2>
          {stats.topSpecies.length > 0 ? (
            <div className="flex items-center gap-6">
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                {pieSegments.map((segment, idx) => (
                  <path
                    key={idx}
                    d={segment.pathData}
                    fill={segment.color}
                    stroke="white"
                    strokeWidth="2"
                  />
                ))}
                <circle cx="50" cy="50" r="20" fill="white" />
              </svg>

              <div className="space-y-1.5 flex-1">
                {stats.topSpecies.map((species) => (
                  <div key={species.name} className="flex items-center gap-2 text-[10px]">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: species.color }}
                    />
                    <span className="text-gray-600 flex-1 truncate" title={species.name}>{species.name}</span>
                    <span className="font-semibold text-gray-900">{species.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-6">
              <Dna className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-xs text-gray-500">No species data</p>
              <p className="text-[10px] text-gray-400">Analyze files to see distribution</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
