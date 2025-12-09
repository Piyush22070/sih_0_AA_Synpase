'use client';

import { useContext, useMemo } from 'react';
import { AnalysisContext } from '../context/AnalysisContext';

const WorldMap = () => {
  const { analysisData } = useContext(AnalysisContext)!;

  // Define organism locations (latitude, longitude) 
  const organismLocations: any = {
    'Metakinetoplastina': { lat: -15, lng: -30, label: 'South Atlantic' },
    'Choanozoa': { lat: 40, lng: -45, label: 'North Atlantic' },
    'Salmonella': { lat: 35, lng: 15, label: 'Mediterranean' },
    'Gymnodiniphycidae': { lat: 0, lng: -120, label: 'Central Pacific' },
    'Enterobacter': { lat: 10, lng: 80, label: 'Bay of Bengal' },
    'Streptococcus': { lat: 20, lng: -60, label: 'Caribbean Sea' },
    'Streptomyces': { lat: 30, lng: 20, label: 'Mediterranean' },
    'Pseudomonas': { lat: 8, lng: 88, label: 'Indian Ocean' },
    'Vibrio': { lat: -20, lng: 100, label: 'Southern Indian' },
    'Bacillus': { lat: 50, lng: 10, label: 'North Sea' },
  };

  // Web Mercator projection for better geographic accuracy
  const projectPoint = (lat: number, lng: number, width: number, height: number) => {
    const x = ((lng + 180) / 360) * width;
    const sinLat = Math.sin((lat * Math.PI) / 180);
    const y = ((Math.log((1 + sinLat) / (1 - sinLat)) / -2 / Math.PI) + 0.5) * height;
    return { x, y };
  };

  // Get markers for top 5 organisms with size and color based on abundance
  const markers = useMemo(() => {
    return analysisData.taxaAbundance.slice(0, 5).map((taxa: any) => {
      const location = organismLocations[taxa.genus];
      if (!location) return null;
      
      const { x, y } = projectPoint(location.lat, location.lng, 1200, 700);
      
      // Determine marker size and color based on percentage
      let markerSize = 6;
      let markerColor = '#60a5fa';

      if (taxa.percentage >= 75) {
        markerSize = 14;
        markerColor = '#991b1b';
      } else if (taxa.percentage >= 50) {
        markerSize = 12;
        markerColor = '#dc2626';
      } else if (taxa.percentage >= 30) {
        markerSize = 10;
        markerColor = '#f97316';
      } else if (taxa.percentage >= 15) {
        markerSize = 8;
        markerColor = '#fbbf24';
      } else if (taxa.percentage >= 5) {
        markerSize = 7;
        markerColor = '#60a5fa';
      }

      return {
        name: taxa.genus,
        lat: location.lat,
        lng: location.lng,
        percentage: taxa.percentage,
        size: markerSize,
        color: markerColor,
        label: location.label,
        x,
        y,
      };
    });
  }, [analysisData.taxaAbundance]);

  return (
    <div className="w-full space-y-6">
      {/* World Map SVG Container */}
      <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg overflow-hidden">
        <svg viewBox="0 0 1200 700" className="w-full h-auto" style={{ minHeight: '600px' }}>
          {/* Ocean background */}
          <defs>
            <linearGradient id="ocean" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#e0f2fe', stopOpacity: 1 }} />
              <stop offset="100%" style={{ stopColor: '#bae6fd', stopOpacity: 1 }} />
            </linearGradient>
            <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#d0d0d0" strokeWidth="0.5" opacity="0.3" />
            </pattern>
          </defs>
          
          <rect width="1200" height="700" fill="url(#ocean)" />
          <rect width="1200" height="700" fill="url(#grid)" />

          {/* Country outlines - Political World Map */}
          <g fill="#e5e7eb" stroke="#999" strokeWidth="0.8" opacity="0.8">
            {/* North America */}
            <path d="M 100 150 L 150 140 L 170 160 L 180 200 L 160 250 L 120 240 L 100 200 Z" />
            {/* Canada regions */}
            <path d="M 150 100 L 200 95 L 210 140 L 170 145 Z" />
            {/* Greenland */}
            <path d="M 220 60 L 260 55 L 270 120 L 240 130 Z" />
            
            {/* Central America & Caribbean */}
            <path d="M 150 240 L 180 235 L 185 280 L 155 285 Z" />
            
            {/* South America */}
            <path d="M 140 300 L 180 305 L 175 480 L 135 490 L 130 400 Z" />
            {/* Brazil subdivision */}
            <path d="M 165 340 L 185 335 L 180 430 L 160 435 Z" />
            
            {/* Europe */}
            <path d="M 380 80 L 450 75 L 460 160 L 400 170 L 380 140 Z" />
            {/* UK & Ireland */}
            <path d="M 340 100 L 365 95 L 370 130 L 350 135 Z" />
            {/* Scandinavia */}
            <path d="M 400 40 L 440 35 L 450 80 L 410 85 Z" />
            
            {/* Africa */}
            <path d="M 420 160 L 520 155 L 530 440 L 420 445 Z" />
            {/* North Africa regions */}
            <path d="M 420 160 L 480 155 L 485 210 L 450 215 Z" />
            {/* West Africa */}
            <path d="M 420 220 L 460 215 L 465 350 L 430 355 Z" />
            {/* East Africa */}
            <path d="M 470 220 L 520 215 L 525 380 L 480 385 Z" />
            {/* Southern Africa */}
            <path d="M 440 380 L 520 375 L 525 440 L 450 445 Z" />
            
            {/* Middle East */}
            <path d="M 480 160 L 560 165 L 565 240 L 500 245 Z" />
            
            {/* Russia */}
            <path d="M 420 50 L 620 40 L 630 140 L 470 150 Z" />
            {/* Siberia divisions */}
            <path d="M 500 60 L 600 50 L 610 110 L 530 120 Z" />
            
            {/* Central Asia */}
            <path d="M 520 130 L 620 125 L 630 210 L 540 215 Z" />
            
            {/* South Asia */}
            <path d="M 560 210 L 650 205 L 660 310 L 580 315 Z" />
            {/* India detailed */}
            <path d="M 580 230 L 630 225 L 635 310 L 590 315 Z" />
            {/* Pakistan */}
            <path d="M 560 220 L 600 215 L 605 270 L 570 275 Z" />
            
            {/* East Asia */}
            <path d="M 650 120 L 750 115 L 760 240 L 680 250 Z" />
            {/* China regions */}
            <path d="M 670 140 L 750 135 L 755 220 L 700 225 Z" />
            {/* Japan */}
            <path d="M 760 160 L 790 165 L 795 220 L 770 225 Z" />
            {/* Korea */}
            <path d="M 730 150 L 760 155 L 765 190 L 740 195 Z" />
            
            {/* Southeast Asia */}
            <path d="M 680 240 L 750 235 L 760 340 L 700 345 Z" />
            {/* Indonesia */}
            <path d="M 720 310 L 800 305 L 810 380 L 750 385 Z" />
            {/* Philippines */}
            <path d="M 780 260 L 810 265 L 815 320 L 795 325 Z" />
            
            {/* Australia & Oceania */}
            <path d="M 800 400 L 880 395 L 890 520 L 820 530 Z" />
            {/* New Zealand */}
            <path d="M 920 480 L 960 485 L 965 560 L 940 565 Z" />
            
            {/* Oceania islands (simplified) */}
            <circle cx="900" cy="350" r="8" />
            <circle cx="850" cy="320" r="6" />
          </g>

          {/* Country borders (darker lines) */}
          <g stroke="#666" strokeWidth="1.2" fill="none" opacity="0.6">
            {/* Longitude lines (meridians) */}
            <line x1="120" y1="0" x2="120" y2="700" />
            <line x1="300" y1="0" x2="300" y2="700" />
            <line x1="600" y1="0" x2="600" y2="700" />
            <line x1="900" y1="0" x2="900" y2="700" />
            
            {/* Equator line */}
            <line x1="0" y1="350" x2="1200" y2="350" strokeDasharray="5,5" opacity="0.3" />
            {/* Prime Meridian approximation */}
            <line x1="380" y1="0" x2="380" y2="700" strokeDasharray="5,5" opacity="0.3" />
          </g>

          {/* Render markers for organisms */}
          {markers.map((marker: any, idx: number) => {
            if (!marker) return null;
            return (
              <g key={idx}>
                {/* Glow effect - larger */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={marker.size + 8}
                  fill={marker.color}
                  opacity="0.15"
                />
                {/* Outer ring */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={marker.size + 5}
                  fill="none"
                  stroke={marker.color}
                  strokeWidth="2"
                  opacity="0.6"
                />
                {/* Main marker circle */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={marker.size}
                  fill={marker.color}
                  stroke="white"
                  strokeWidth="2.5"
                  opacity="0.95"
                  style={{ cursor: 'pointer' }}
                />
                
                {/* Label background */}
                <rect
                  x={marker.x + marker.size + 10}
                  y={marker.y - 18}
                  width="120"
                  height="36"
                  fill="white"
                  stroke={marker.color}
                  strokeWidth="2"
                  rx="6"
                  opacity="0.95"
                  style={{ cursor: 'pointer' }}
                />
                
                {/* Organism name */}
                <text
                  x={marker.x + marker.size + 16}
                  y={marker.y - 6}
                  fontSize="12"
                  fontWeight="bold"
                  fill="#1f2937"
                  style={{ userSelect: 'none' }}
                >
                  {marker.name}
                </text>
                
                {/* Percentage */}
                <text
                  x={marker.x + marker.size + 16}
                  y={marker.y + 10}
                  fontSize="11"
                  fill={marker.color}
                  fontWeight="600"
                  style={{ userSelect: 'none' }}
                >
                  {marker.percentage.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg shadow p-4">
        <h3 className="text-base font-bold text-gray-800 mb-3">Abundance Scale</h3>
        <div className="flex items-center gap-6 flex-wrap">
          {[
            { color: '#991b1b', label: '75-100%', size: 8 },
            { color: '#dc2626', label: '50-75%', size: 7 },
            { color: '#f97316', label: '30-50%', size: 6 },
            { color: '#fbbf24', label: '15-30%', size: 5 },
            { color: '#60a5fa', label: '5-15%', size: 4 },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r={item.size}
                  fill={item.color}
                  stroke="white"
                  strokeWidth="1.5"
                />
              </svg>
              <span className="text-sm font-semibold text-gray-800">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Taxa Information */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Detected Organisms by Location</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {analysisData.taxaAbundance.slice(0, 5).map((taxa: any, index: number) => {
            const location = organismLocations[taxa.genus];
            return (
              <div
                key={`taxa-detail-${index}`}
                className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg border-2 border-teal-300 shadow-sm"
              >
                <div className="font-bold text-gray-800 text-sm mb-2">{taxa.genus}</div>
                <div className="text-xs text-gray-600 mb-2">{location?.label || 'Location TBD'}</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-gray-600 mb-1">Abundance</div>
                    <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                        style={{ width: `${taxa.percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-sm font-bold text-teal-700">{taxa.percentage.toFixed(1)}%</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WorldMap;
