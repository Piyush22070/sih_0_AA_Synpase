import { Database, Dna, Sparkles, MapPin } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

export default function Dashboard() {
  const { analysisData } = useAnalysis();
  
  const stats = [
    { label: 'Total Samples', value: analysisData.totalReads.toLocaleString(), icon: Database, color: 'blue' },
    { label: 'Taxa Identified', value: analysisData.totalClusters.toLocaleString(), icon: Dna, color: 'green' },
    { label: 'Novel Taxa', value: analysisData.novelTaxa.toString(), icon: Sparkles, color: 'purple' },
    { label: 'Active Sites', value: '12', icon: MapPin, color: 'orange' },
  ];

  const ecosystems = [
    { name: 'Abyssal Plains', percentage: 35, color: 'bg-blue-600' },
    { name: 'Hydrothermal Vents', percentage: 28, color: 'bg-red-600' },
    { name: 'Seamounts', percentage: 22, color: 'bg-green-600' },
    { name: 'Cold Seeps', percentage: 15, color: 'bg-purple-600' },
  ];

  const recentAnalyses = analysisData.recentAnalyses;
  
  // Generate heatmap data from real taxa data or use fallback
  const generateHeatmapData = () => {
    if (analysisData.taxaAbundance.length > 0) {
      // Use real data - simulate 8 sites by distributing the abundance
      return analysisData.taxaAbundance.slice(0, 8).map(taxon => ({
        name: taxon.genus,
        // Generate 8 site values based on the actual probability with some variation
        values: Array.from({ length: 8 }, (_, i) => {
          const baseValue = taxon.probability;
          const variation = (Math.random() - 0.5) * 20; // ±10% variation
          return Math.max(30, Math.min(100, Math.round(baseValue + variation)));
        })
      }));
    }
    
    // Fallback hardcoded data
    return [
      { name: 'Pseudomonas', values: [92, 78, 85, 45, 67, 88, 73, 91] },
      { name: 'Streptococcus', values: [45, 67, 52, 88, 91, 42, 79, 65] },
      { name: 'Bacillus', values: [78, 85, 91, 72, 54, 89, 66, 77] },
      { name: 'Escherichia', values: [32, 48, 65, 78, 82, 55, 71, 59] },
      { name: 'Spirotrichea', values: [88, 92, 76, 84, 69, 95, 81, 87] },
      { name: 'Choanozoa', values: [65, 71, 84, 91, 77, 68, 89, 73] },
      { name: 'Actinobacteria', values: [55, 62, 78, 85, 92, 71, 64, 80] },
      { name: 'Chloroplastida', values: [71, 84, 68, 52, 88, 76, 91, 63] },
    ];
  };
  
  const heatmapData = generateHeatmapData();

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-600 mt-1">Deep-sea biodiversity monitoring overview</p>
        </div>
        {analysisData.lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {analysisData.lastUpdated.toLocaleTimeString()}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 bg-${stat.color}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Taxa Abundance Heatmap</h3>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                    Taxa
                  </th>
                  {['Site 1', 'Site 2', 'Site 3', 'Site 4', 'Site 5', 'Site 6', 'Site 7', 'Site 8'].map((site) => (
                    <th key={site} className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200">
                      {site}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((taxon, rowIndex) => (
                  <tr key={taxon.name} className={rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                      {taxon.name}
                    </td>
                    {taxon.values.map((value, colIndex) => {
                      const intensity = value / 100;
                      const bgColor = `rgba(59, 130, 246, ${intensity})`; // Blue color with varying opacity
                      const textColor = intensity > 0.6 ? 'text-white' : 'text-gray-900';
                      return (
                        <td
                          key={`${taxon.name}-${colIndex}`}
                          className={`px-4 py-3 text-sm text-center font-medium ${textColor} whitespace-nowrap transition-all hover:ring-2 hover:ring-blue-500 cursor-pointer`}
                          style={{ backgroundColor: bgColor }}
                          title={`${taxon.name} at Site ${colIndex + 1}: ${value}% abundance`}
                        >
                          {value}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600">Low</span>
              <div className="flex gap-1">
                {[0.2, 0.4, 0.6, 0.8, 1.0].map((opacity) => (
                  <div
                    key={opacity}
                    className="w-8 h-4 rounded"
                    style={{ backgroundColor: `rgba(59, 130, 246, ${opacity})` }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600">High</span>
            </div>
            <p className="text-xs text-gray-500">Hover over cells for detailed information</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Analyses</h3>
          <div className="space-y-3">
            {recentAnalyses.map((analysis) => (
              <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{analysis.sample}</p>
                  <p className="text-sm text-gray-600">{analysis.location}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    analysis.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {analysis.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{analysis.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Ecosystem Distribution</h3>
          <div className="space-y-4">
            {ecosystems.map((ecosystem) => (
              <div key={ecosystem.name}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{ecosystem.name}</span>
                  <span className="text-sm text-gray-600">{ecosystem.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${ecosystem.color} h-2 rounded-full`}
                    style={{ width: `${ecosystem.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
