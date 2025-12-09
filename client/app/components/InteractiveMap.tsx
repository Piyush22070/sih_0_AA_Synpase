'use client';

import { useContext, useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AnalysisContext } from '../context/AnalysisContext';

const InteractiveMap = () => {
  const { analysisData } = useContext(AnalysisContext)!;
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // Define organism locations (latitude, longitude)
  const organismLocations: Record<string, { lat: number; lng: number; label: string }> = {
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

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      center: [0, 20],
      zoom: 2,
    });

    // Wait for map to load before adding sources and layers
    map.current.on('load', () => {
      // Create GeoJSON features for heatmap from real data
      const heatmapFeatures: any[] = [];
      
      analysisData.taxaAbundance.slice(0, 10).forEach((taxa: any) => {
        const location = organismLocations[taxa.genus];
        if (location) {
          heatmapFeatures.push({
            type: 'Feature',
            properties: {
              intensity: taxa.percentage / 100,
              percentage: taxa.percentage,
              name: taxa.genus,
            },
            geometry: {
              type: 'Point',
              coordinates: [location.lng, location.lat],
            },
          });
        }
      });

      // Only add heatmap if we have data
      if (heatmapFeatures.length > 0) {
        // Check if source already exists
        if (!map.current?.getSource('heatmap-source')) {
          map.current?.addSource('heatmap-source', {
            type: 'geojson',
            data: {
              type: 'FeatureCollection',
              features: heatmapFeatures,
            } as any,
          });

          // Add heatmap layer
          map.current?.addLayer(
            {
              id: 'heatmap-layer',
              type: 'heatmap',
              source: 'heatmap-source',
              paint: {
                'heatmap-weight': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0,
                  0.8,
                  9,
                  ['get', 'intensity'],
                ],
                'heatmap-intensity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0,
                  1.2,
                  9,
                  2,
                ],
                'heatmap-color': [
                  'interpolate',
                  ['linear'],
                  ['heatmap-density'],
                  0,
                  'rgba(0, 255, 0, 0)',
                  0.05,
                  'rgba(144, 238, 144, 0.4)',
                  0.1,
                  'rgba(50, 205, 50, 0.5)',
                  0.2,
                  'rgba(255, 255, 0, 0.6)',
                  0.35,
                  'rgba(255, 165, 0, 0.7)',
                  0.55,
                  'rgba(255, 69, 0, 0.8)',
                  0.75,
                  'rgba(220, 20, 60, 0.85)',
                  1,
                  'rgba(139, 0, 0, 0.9)',
                ],
                'heatmap-radius': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0,
                  30,
                  5,
                  50,
                  9,
                  100,
                  15,
                  200,
                ],
                'heatmap-opacity': [
                  'interpolate',
                  ['linear'],
                  ['zoom'],
                  0,
                  0.8,
                  9,
                  1,
                ],
              },
            } as any,
            'water'
          );
        }
      }

      // Add markers to map
      analysisData.taxaAbundance.slice(0, 10).forEach((taxa: any) => {
        const location = organismLocations[taxa.genus];
        if (!location) return;

        // Determine marker color based on percentage
        let markerColor = '#60a5fa'; // blue

        if (taxa.percentage >= 75) {
          markerColor = '#991b1b'; // dark red
        } else if (taxa.percentage >= 50) {
          markerColor = '#dc2626'; // red
        } else if (taxa.percentage >= 30) {
          markerColor = '#f97316'; // orange
        } else if (taxa.percentage >= 15) {
          markerColor = '#fbbf24'; // yellow
        }

        const el = document.createElement('div');
        el.style.width = '32px';
        el.style.height = '32px';
        el.style.backgroundColor = markerColor;
        el.style.border = '3px solid white';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        el.style.boxShadow = `0 0 15px ${markerColor}80`;
        el.style.display = 'flex';
        el.style.alignItems = 'center';
        el.style.justifyContent = 'center';
        el.style.fontSize = '12px';
        el.style.fontWeight = 'bold';
        el.style.color = 'white';
        el.title = `${taxa.genus}: ${taxa.percentage.toFixed(1)}%`;
        el.textContent = taxa.percentage > 10 ? taxa.percentage.toFixed(0) : '';

        // Create popup content
        const popupContent = document.createElement('div');
        popupContent.style.padding = '12px';
        popupContent.style.fontFamily = 'Arial, sans-serif';
        popupContent.innerHTML = `
          <div style="text-align: center;">
            <div style="font-weight: bold; font-size: 14px; color: #1f2937; margin-bottom: 4px;">
              ${taxa.genus}
            </div>
            <div style="font-size: 12px; color: ${markerColor}; font-weight: 600;">
              ${taxa.percentage.toFixed(1)}%
            </div>
            <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
              ${location.label}
            </div>
          </div>
        `;

        // Create popup
        const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupContent);

        new maplibregl.Marker({ element: el })
          .setLngLat([location.lng, location.lat])
          .setPopup(popup)
          .addTo(map.current!);
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [analysisData.taxaAbundance]);

  if (analysisData.taxaAbundance.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg" style={{ minHeight: '500px' }}>
        <div className="text-center">
          <p className="text-gray-500 text-xl font-semibold">No organisms detected yet</p>
          <p className="text-gray-400 text-sm mt-2">Upload a FASTA file to visualize organisms on the map</p>
        </div>
      </div>
    );
  }

  return <div ref={mapContainer} style={{ width: '100%', height: '100%', minHeight: '500px' }} />;
};

export default InteractiveMap;
