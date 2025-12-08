'use client';

import { Database, Dna, Sparkles, MapPin } from 'lucide-react';
import 'maplibre-gl/dist/maplibre-gl.css';

// ✅ Correct imports for MapLibre
import Map, { NavigationControl, Source, Layer } from "react-map-gl/maplibre";


export default function Dashboard() {
  const stats = [
    { label: 'Total Samples', value: '1,247', icon: Database, color: 'blue' },
    { label: 'Taxa Identified', value: '3,892', icon: Dna, color: 'green' },
    { label: 'Novel Taxa', value: '156', icon: Sparkles, color: 'purple' },
    { label: 'Active Sites', value: '12', icon: MapPin, color: 'orange' },
  ];

  const ecosystems = [
    { name: 'Abyssal Plains', percentage: 35, color: 'bg-blue-600' },
    { name: 'Hydrothermal Vents', percentage: 28, color: 'bg-red-600' },
    { name: 'Seamounts', percentage: 22, color: 'bg-green-600' },
    { name: 'Cold Seeps', percentage: 15, color: 'bg-purple-600' },
  ];

  const recentAnalyses = [
    { id: '1', sample: 'DS-2024-001', location: 'Central Indian Basin', status: 'Completed', date: '2024-12-07' },
    { id: '2', sample: 'DS-2024-002', location: 'Carlsberg Ridge', status: 'Processing', date: '2024-12-08' },
    { id: '3', sample: 'DS-2024-003', location: 'Arabian Sea', status: 'Completed', date: '2024-12-06' },
  ];

  // Hardcoded novel taxa data points (deep-sea locations with intensity values)
  const novelTaxaData = {
    type: 'FeatureCollection',
    features: [
      // Indian Ocean - Central Indian Basin
      { type: 'Feature', geometry: { type: 'Point', coordinates: [75.0, -5.0] }, properties: { intensity: 0.8 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [77.0, -6.0] }, properties: { intensity: 0.9 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [73.0, -4.5] }, properties: { intensity: 0.7 } },
      
      // Carlsberg Ridge
      { type: 'Feature', geometry: { type: 'Point', coordinates: [57.0, 0.0] }, properties: { intensity: 0.85 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [58.5, 1.0] }, properties: { intensity: 0.75 } },
      
      // Arabian Sea
      { type: 'Feature', geometry: { type: 'Point', coordinates: [65.0, 15.0] }, properties: { intensity: 0.6 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [67.0, 14.0] }, properties: { intensity: 0.65 } },
      
      // Pacific Ocean - Mariana Trench area
      { type: 'Feature', geometry: { type: 'Point', coordinates: [145.0, 12.0] }, properties: { intensity: 0.95 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [146.5, 11.5] }, properties: { intensity: 0.9 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [144.0, 12.5] }, properties: { intensity: 0.85 } },
      
      // Atlantic Ocean - Mid-Atlantic Ridge
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-30.0, 25.0] }, properties: { intensity: 0.7 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [-28.0, 24.0] }, properties: { intensity: 0.75 } },
      
      // Southern Ocean - near Antarctica
      { type: 'Feature', geometry: { type: 'Point', coordinates: [0.0, -60.0] }, properties: { intensity: 0.6 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [10.0, -58.0] }, properties: { intensity: 0.55 } },
      
      // Additional Indian Ocean sites
      { type: 'Feature', geometry: { type: 'Point', coordinates: [80.0, -8.0] }, properties: { intensity: 0.7 } },
      { type: 'Feature', geometry: { type: 'Point', coordinates: [72.0, -3.0] }, properties: { intensity: 0.65 } },
    ]
  };

  const heatmapLayer = {
    id: 'novel-taxa-heatmap',
    type: 'heatmap',
    source: 'novel-taxa',
    maxzoom: 9,
    paint: {
      'heatmap-weight': {
        property: 'intensity',
        type: 'exponential',
        stops: [
          [0, 0],
          [1, 1]
        ]
      },
      'heatmap-intensity': {
        stops: [
          [0, 1],
          [9, 2]
        ]
      },
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0, 'rgba(147, 51, 234, 0)',
        0.2, 'rgba(147, 51, 234, 0.2)',
        0.4, 'rgba(168, 85, 247, 0.4)',
        0.6, 'rgba(192, 132, 252, 0.5)',
        0.8, 'rgba(217, 70, 239, 0.6)',
        1, 'rgba(236, 72, 153, 0.7)'
      ],
      'heatmap-radius': {
        stops: [
          [0, 25],
          [9, 50]
        ]
      },
      'heatmap-opacity': 0.5
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Deep-sea biodiversity monitoring overview</p>
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
        <h3 className="text-xl font-bold text-gray-900 mb-4">Abundance Heatmap</h3>
        <div className="bg-gray-50 rounded-lg h-96 overflow-hidden relative">
          <Map
            initialViewState={{
              longitude: 75,
              latitude: 0,
              zoom: 2,
            }}
            mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            style={{ width: "100%", height: "100%" }}
            projection="mercator"
          >
            {/* Heatmap Source and Layer */}
            <Source id="novel-taxa" type="geojson" data={novelTaxaData}>
              <Layer {...heatmapLayer} />
            </Source>
            
            {/* Navigation Control */}
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <NavigationControl />
            </div>
          </Map>
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
