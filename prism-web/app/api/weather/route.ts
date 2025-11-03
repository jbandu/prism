import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import type { ApiResponse } from "@/types";

export interface WeatherData {
  temp: number;
  temp_celsius: number;
  condition: string;
  description: string;
  icon: string;
  humidity: number;
  feels_like: number;
  wind_speed: number;
}

// In-memory cache for weather data (15 minutes TTL)
const weatherCache = new Map<string, { data: WeatherData; timestamp: number }>();
const CACHE_TTL = 15 * 60 * 1000; // 15 minutes

// GET /api/weather - Get current weather for a location
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (!lat || !lon) {
      return NextResponse.json<ApiResponse>(
        { success: false, error: "Latitude and longitude are required" },
        { status: 400 }
      );
    }

    // Check cache first
    const cacheKey = `${lat},${lon}`;
    const cached = weatherCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { ...cached.data, cached: true },
      });
    }

    // Fetch from OpenWeather API
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) {
      console.warn("OPENWEATHER_API_KEY not configured, returning mock data");
      // Return mock data if API key is not configured
      const mockData: WeatherData = {
        temp: 72,
        temp_celsius: 22,
        condition: "Clear",
        description: "Clear sky",
        icon: "01d",
        humidity: 50,
        feels_like: 70,
        wind_speed: 5.2,
      };
      return NextResponse.json<ApiResponse>({
        success: true,
        data: { ...mockData, mock: true },
      });
    }

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

    const response = await fetch(weatherUrl, {
      next: { revalidate: 900 }, // Cache for 15 minutes
    });

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    const weatherData: WeatherData = {
      temp: Math.round(data.main.temp),
      temp_celsius: Math.round((data.main.temp - 32) * (5 / 9)),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      humidity: data.main.humidity,
      feels_like: Math.round(data.main.feels_like),
      wind_speed: data.wind.speed,
    };

    // Update cache
    weatherCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now(),
    });

    // Clean up old cache entries (simple cleanup on each request)
    const now = Date.now();
    for (const [key, value] of weatherCache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        weatherCache.delete(key);
      }
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      data: weatherData,
    });
  } catch (error) {
    console.error("Error fetching weather data:", error);

    // Return fallback data on error
    const fallbackData: WeatherData = {
      temp: 70,
      temp_celsius: 21,
      condition: "Unknown",
      description: "Weather data unavailable",
      icon: "01d",
      humidity: 50,
      feels_like: 68,
      wind_speed: 0,
    };

    return NextResponse.json<ApiResponse>({
      success: true,
      data: { ...fallbackData, error: true },
      message: "Using fallback weather data",
    });
  }
}
