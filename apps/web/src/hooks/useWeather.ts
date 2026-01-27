'use client';

import { useState, useEffect } from 'react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: string;
  condition: string;
  icon: string;
  description: string;
  sunrise: string;
  sunset: string;
  uvIndex: number;
}

interface WeatherForecast {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
  precipitation: number;
}

// Hatteras Island coordinates
const HATTERAS_LAT = 35.2668;
const HATTERAS_LON = -75.5272;

/**
 * Hook for fetching live weather data for Hatteras Island
 */
export function useWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `/api/weather?lat=${HATTERAS_LAT}&lon=${HATTERAS_LON}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch weather');
        }

        const data = await response.json();

        if (isMounted) {
          setWeather(data.current);
          setForecast(data.forecast || []);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          setIsLoading(false);
          // Set fallback data
          setWeather({
            temp: 75,
            feelsLike: 78,
            humidity: 65,
            windSpeed: 12,
            windDirection: 'SW',
            condition: 'Partly Cloudy',
            icon: 'cloud-sun',
            description: 'Partly Cloudy',
            uvIndex: 6,
            sunrise: '6:30 AM',
            sunset: '7:45 PM',
          });
        }
      }
    };

    fetchWeather();

    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    weather,
    forecast,
    isLoading,
    error,
  };
}

/**
 * Get weather icon component name based on condition
 */
export function getWeatherIcon(condition: string): string {
  const conditionLower = condition.toLowerCase();

  if (conditionLower.includes('clear') || conditionLower.includes('sunny')) return 'sun';
  if (conditionLower.includes('partly cloudy')) return 'cloud-sun';
  if (conditionLower.includes('cloud') || conditionLower.includes('overcast')) return 'cloud';
  if (conditionLower.includes('rain') || conditionLower.includes('drizzle')) return 'cloud-rain';
  if (conditionLower.includes('thunder') || conditionLower.includes('storm')) return 'cloud-lightning';
  if (conditionLower.includes('snow')) return 'snowflake';
  if (conditionLower.includes('fog') || conditionLower.includes('mist')) return 'cloud-fog';
  if (conditionLower.includes('wind')) return 'wind';

  return 'sun';
}
