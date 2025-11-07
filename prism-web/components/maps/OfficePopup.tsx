"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import {
  MapPin,
  Users,
  Cloud,
  Droplets,
  Wind,
  Clock,
  Building2,
} from "lucide-react";

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

interface OfficePopupProps {
  office: Office;
  weather?: WeatherData | null;
  tempUnit?: "F" | "C";
}

export function OfficePopup({ office, weather, tempUnit = "F" }: OfficePopupProps) {
  const [localTime, setLocalTime] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      if (office.timezone) {
        try {
          const time = formatInTimeZone(
            new Date(),
            office.timezone,
            "h:mm:ss a"
          );
          setLocalTime(time);
        } catch (error) {
          setLocalTime(format(new Date(), "h:mm:ss a"));
        }
      } else {
        setLocalTime(format(new Date(), "h:mm:ss a"));
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, [office.timezone]);

  const getWeatherIcon = (icon: string) => {
    return `https://openweathermap.org/img/wn/${icon}@2x.png`;
  };

  const temperature = tempUnit === "F"
    ? (weather?.temp ?? 70)
    : (weather?.temp_celsius ?? 21);

  const feelsLike = weather?.feels_like ?? 70;
  const feelsLikeCelsius = Math.round((feelsLike - 32) * (5 / 9));

  return (
    <div className="min-w-[320px] max-w-[380px]">
      {/* Header */}
      <div className="mb-3">
        <div className="flex items-start justify-between mb-1">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-gray-900 leading-tight">
              {office.office_name}
            </h3>
            {office.is_headquarters && (
              <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full">
                <Building2 className="w-3 h-3 text-yellow-900" />
                <span className="text-xs font-semibold text-yellow-900">
                  Headquarters
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>
            {office.city && office.country
              ? `${office.city}, ${office.country}`
              : office.city || office.country || "Location not specified"}
          </span>
        </div>

        {office.address && (
          <div className="text-xs text-gray-500 mt-1 ml-5">{office.address}</div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* Employee Count */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">Employees</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {office.employee_count.toLocaleString()}
          </div>
        </div>

        {/* Local Time */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-900">Local Time</span>
          </div>
          <div className="text-lg font-bold text-purple-900 tabular-nums">
            {localTime}
          </div>
        </div>
      </div>

      {/* Weather Section */}
      {weather && (
        <div className="bg-gradient-to-br from-sky-50 to-sky-100 rounded-lg p-3 border border-sky-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {weather.icon && (
                <img
                  src={getWeatherIcon(weather.icon)}
                  alt={weather.description || "Weather"}
                  className="w-16 h-16"
                />
              )}
              <div>
                <div className="text-3xl font-bold text-sky-900">
                  {temperature}°{tempUnit}
                </div>
                <div className="text-sm text-sky-700 capitalize">
                  {weather.description || "Current conditions"}
                </div>
              </div>
            </div>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-sky-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Cloud className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="text-xs text-sky-600 mb-0.5">Feels Like</div>
              <div className="text-sm font-semibold text-sky-900">
                {tempUnit === "F" ? feelsLike : feelsLikeCelsius}°
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="text-xs text-sky-600 mb-0.5">Humidity</div>
              <div className="text-sm font-semibold text-sky-900">
                {weather?.humidity ?? 50}%
              </div>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Wind className="w-3.5 h-3.5 text-sky-600" />
              </div>
              <div className="text-xs text-sky-600 mb-0.5">Wind</div>
              <div className="text-sm font-semibold text-sky-900">
                {weather?.wind_speed ?? 0} mph
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Coordinates (subtle) */}
      <div className="mt-2 text-xs text-gray-400 text-center font-mono">
        {office.latitude.toFixed(4)}, {office.longitude.toFixed(4)}
      </div>
    </div>
  );
}
