"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Map as MapGL, Marker, Popup, NavigationControl, FullscreenControl } from "react-map-gl/maplibre";
import { MapPin, List, Map as MapIcon, Thermometer } from "lucide-react";
import { OfficePopup } from "./OfficePopup";
import { OfficeListSidebar } from "./OfficeListSidebar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import "maplibre-gl/dist/maplibre-gl.css";

interface Office {
  id: string;
  office_name: string;
  city: string | null;
  country: string | null;
  address: string | null;
  latitude: number;
  longitude: number;
  employee_count: number;
  is_headquarters: boolean;
  timezone: string | null;
}

interface WeatherData {
  temp: number;
  temp_celsius: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  feels_like: number;
  wind_speed: number;
}

interface OfficeMapProps {
  offices: Office[];
  companyId: string;
}

// MapLibre doesn't require a Mapbox token - we use free OSM styles
const MAP_STYLE = "https://demotiles.maplibre.org/style.json";

export function OfficeMap({ offices, companyId }: OfficeMapProps) {
  const mapRef = useRef<any>(null);
  const [viewState, setViewState] = useState({
    longitude: 0,
    latitude: 20,
    zoom: 1.5,
  });

  const [selectedOffice, setSelectedOffice] = useState<Office | null>(null);
  const [weatherData, setWeatherData] = useState<Map<string, WeatherData>>(
    new Map<string, WeatherData>()
  );
  const [tempUnit, setTempUnit] = useState<"F" | "C">("F");
  const [showList, setShowList] = useState(true);
  const [loadingWeather, setLoadingWeather] = useState(false);

  // Fetch weather for all offices on mount
  useEffect(() => {
    fetchWeatherForOffices();
  }, [offices]);

  const fetchWeatherForOffices = async () => {
    setLoadingWeather(true);
    try {
      const weatherPromises = offices.map(async (office) => {
        const response = await fetch(
          `/api/weather?lat=${office.latitude}&lon=${office.longitude}`
        );
        const result = await response.json();
        if (result.success) {
          return { officeId: office.id, weather: result.data };
        }
        return null;
      });

      const results = await Promise.all(weatherPromises);
      const newWeatherData = new Map<string, WeatherData>();

      results.forEach((result) => {
        if (result) {
          newWeatherData.set(result.officeId, result.weather);
        }
      });

      setWeatherData(newWeatherData);
    } catch (error) {
      console.error("Error fetching weather data:", error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleMarkerClick = useCallback(
    (office: Office, e: any) => {
      e.originalEvent.stopPropagation();
      setSelectedOffice(office);

      // Smooth fly to location
      mapRef.current?.flyTo({
        center: [office.longitude, office.latitude],
        zoom: 10,
        duration: 2000,
        essential: true,
      });
    },
    []
  );

  const handleOfficeSelect = useCallback((office: Office) => {
    setSelectedOffice(office);

    // Smooth fly to location
    mapRef.current?.flyTo({
      center: [office.longitude, office.latitude],
      zoom: 10,
      duration: 2000,
      essential: true,
    });
  }, []);

  // Pulsing marker animation CSS
  const getPulseAnimation = (isHQ: boolean) => {
    return `
      @keyframes pulse {
        0%, 100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `;
  };

  // MapLibre works without tokens - no need for token check

  return (
    <div className="relative">
      <style>{getPulseAnimation(false)}</style>

      {/* Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Toggle List View */}
        <Button
          onClick={() => setShowList(!showList)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <List className="w-4 h-4 mr-2" />
          {showList ? "Hide" : "Show"} List
        </Button>

        {/* Temperature Unit Toggle */}
        <Button
          onClick={() => setTempUnit(tempUnit === "F" ? "C" : "F")}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <Thermometer className="w-4 h-4 mr-2" />
          °{tempUnit === "F" ? "C" : "F"}
        </Button>
      </div>

      {/* Office List Sidebar */}
      <OfficeListSidebar
        offices={offices}
        selectedOffice={selectedOffice}
        onSelect={handleOfficeSelect}
        isOpen={showList}
        onClose={() => setShowList(false)}
      />

      {/* Map */}
      <div className="relative w-full h-[calc(100vh-200px)] rounded-xl overflow-hidden shadow-2xl border border-gray-200">
        <MapGL
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle={MAP_STYLE}
          style={{ width: "100%", height: "100%" }}
          attributionControl={false}
        >
          {/* Navigation Controls */}
          <NavigationControl position="bottom-right" />
          <FullscreenControl position="bottom-right" />

          {/* Office Markers */}
          {offices.map((office) => (
            <Marker
              key={office.id}
              longitude={office.longitude}
              latitude={office.latitude}
              anchor="bottom"
              onClick={(e) => handleMarkerClick(office, e)}
            >
              <div className="relative cursor-pointer group">
                {/* Pulsing background */}
                <div
                  className={cn(
                    "absolute -inset-2 rounded-full opacity-75",
                    office.is_headquarters
                      ? "bg-yellow-400 animate-pulse"
                      : "bg-blue-400 animate-pulse"
                  )}
                  style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
                />

                {/* Main marker */}
                <div
                  className={cn(
                    "relative transform transition-all duration-200 group-hover:scale-125",
                    office.is_headquarters ? "text-yellow-400" : "text-blue-400"
                  )}
                >
                  <MapPin
                    size={office.is_headquarters ? 40 : 32}
                    fill="currentColor"
                    className="drop-shadow-lg"
                  />
                </div>

                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-1 px-2 whitespace-nowrap">
                    {office.office_name}
                  </div>
                </div>
              </div>
            </Marker>
          ))}

          {/* Selected Office Popup */}
          {selectedOffice && (
            <Popup
              longitude={selectedOffice.longitude}
              latitude={selectedOffice.latitude}
              anchor="bottom"
              onClose={() => setSelectedOffice(null)}
              closeButton={true}
              closeOnClick={false}
              offset={25}
              className="office-popup"
            >
              <OfficePopup
                office={selectedOffice}
                weather={weatherData.get(selectedOffice.id)}
                tempUnit={tempUnit}
              />
            </Popup>
          )}
        </MapGL>

        {/* Loading indicator for weather */}
        {loadingWeather && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-2 flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-prism-primary"></div>
            <span className="text-sm text-gray-600">Loading weather data...</span>
          </div>
        )}

        {/* Attribution */}
        <div className="absolute bottom-2 left-2 text-xs text-gray-400 bg-black/50 px-2 py-1 rounded">
          © MapLibre © OpenStreetMap
        </div>
      </div>

      {/* Global popup styles */}
      <style jsx global>{`
        .office-popup .maplibregl-popup-content {
          padding: 16px;
          background: rgba(255, 255, 255, 0.98);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .office-popup .maplibregl-popup-close-button {
          font-size: 24px;
          padding: 4px 8px;
          color: #6b7280;
        }

        .office-popup .maplibregl-popup-close-button:hover {
          background-color: #f3f4f6;
          color: #111827;
        }

        .office-popup .maplibregl-popup-tip {
          border-top-color: rgba(255, 255, 255, 0.98);
        }
      `}</style>
    </div>
  );
}
