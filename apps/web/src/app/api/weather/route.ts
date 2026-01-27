/**
 * Weather API for Hatteras Island
 *
 * Uses National Weather Service (weather.gov) API - Official US Government source
 * No API key required, free to use
 */

import { NextRequest, NextResponse } from 'next/server';

// Hatteras Island coordinates (Buxton area - central island)
const DEFAULT_LAT = 35.2668;
const DEFAULT_LON = -75.5466;

// NWS requires a User-Agent header
const NWS_HEADERS = {
  'User-Agent': '(surforsound.com, support@surforsound.com)',
  'Accept': 'application/geo+json',
};

// Map NWS icon URLs to simple icon names
function mapNwsIcon(iconUrl: string): string {
  if (!iconUrl) return 'sun';
  const url = iconUrl.toLowerCase();
  if (url.includes('tsra') || url.includes('thunder')) return 'cloud-lightning';
  if (url.includes('rain') || url.includes('showers')) return 'cloud-rain';
  if (url.includes('snow') || url.includes('blizzard')) return 'snowflake';
  if (url.includes('fog') || url.includes('haze')) return 'cloud-fog';
  if (url.includes('wind') || url.includes('blustery')) return 'wind';
  if (url.includes('ovc') || url.includes('cloudy')) return 'cloud';
  if (url.includes('bkn') || url.includes('sct')) return 'cloud-sun';
  if (url.includes('few')) return 'sun';
  if (url.includes('skc') || url.includes('clear') || url.includes('sunny')) return 'sun';
  return 'cloud-sun';
}

// Extract short condition from detailed forecast
function getShortCondition(detailed: string, shortForecast: string): string {
  // Use the short forecast if available, otherwise extract from detailed
  if (shortForecast && shortForecast.length < 30) {
    return shortForecast;
  }
  // Truncate if too long
  return shortForecast?.split('.')[0] || 'Unknown';
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const lat = parseFloat(searchParams.get('lat') || String(DEFAULT_LAT));
  const lon = parseFloat(searchParams.get('lon') || String(DEFAULT_LON));

  try {
    // Step 1: Get the forecast grid point from NWS
    const pointsUrl = `https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`;
    const pointsResponse = await fetch(pointsUrl, {
      headers: NWS_HEADERS,
      next: { revalidate: 3600 }, // Cache grid point for 1 hour
    });

    if (!pointsResponse.ok) {
      throw new Error(`NWS Points API error: ${pointsResponse.status}`);
    }

    const pointsData = await pointsResponse.json();
    const forecastUrl = pointsData.properties?.forecast;
    const forecastHourlyUrl = pointsData.properties?.forecastHourly;
    const observationStationsUrl = pointsData.properties?.observationStations;

    if (!forecastUrl) {
      throw new Error('No forecast URL returned from NWS');
    }

    // Step 2: Fetch forecast and current conditions in parallel
    const [forecastResponse, hourlyResponse] = await Promise.all([
      fetch(forecastUrl, {
        headers: NWS_HEADERS,
        next: { revalidate: 1800 }, // Cache forecast for 30 minutes
      }),
      fetch(forecastHourlyUrl, {
        headers: NWS_HEADERS,
        next: { revalidate: 1800 },
      }),
    ]);

    if (!forecastResponse.ok) {
      throw new Error(`NWS Forecast API error: ${forecastResponse.status}`);
    }

    const forecastData = await forecastResponse.json();
    const hourlyData = hourlyResponse.ok ? await hourlyResponse.json() : null;

    // Get periods from forecast (day/night pairs)
    const periods = forecastData.properties?.periods || [];

    // Current conditions from first hourly period
    const currentHourly = hourlyData?.properties?.periods?.[0];
    const currentPeriod = periods[0];

    // Build daily forecast - NWS returns day/night pairs
    const dailyForecast: any[] = [];
    const processedDates = new Set<string>();

    for (const period of periods) {
      const startTime = new Date(period.startTime);
      const dateKey = startTime.toISOString().split('T')[0];

      // Skip if we already have this date
      if (processedDates.has(dateKey)) continue;
      processedDates.add(dateKey);

      // Find the corresponding night period
      const nightPeriod = periods.find((p: any) => {
        const pDate = new Date(p.startTime).toISOString().split('T')[0];
        return pDate === dateKey && !p.isDaytime;
      });

      const dayPeriod = periods.find((p: any) => {
        const pDate = new Date(p.startTime).toISOString().split('T')[0];
        return pDate === dateKey && p.isDaytime;
      });

      dailyForecast.push({
        date: dateKey,
        high: dayPeriod?.temperature || period.temperature,
        low: nightPeriod?.temperature || (dayPeriod?.temperature ? dayPeriod.temperature - 15 : period.temperature - 10),
        condition: getShortCondition(
          dayPeriod?.detailedForecast || period.detailedForecast,
          dayPeriod?.shortForecast || period.shortForecast
        ),
        icon: mapNwsIcon(dayPeriod?.icon || period.icon),
        precipitation: period.probabilityOfPrecipitation?.value || 0,
      });

      if (dailyForecast.length >= 7) break;
    }

    // Get wind direction from wind string (e.g., "NW 10 mph")
    const windMatch = currentPeriod?.windDirection || '';
    const windSpeedMatch = currentPeriod?.windSpeed?.match(/(\d+)/);
    const windSpeed = windSpeedMatch ? parseInt(windSpeedMatch[1]) : 0;

    // Build response
    const result = {
      current: {
        temp: currentHourly?.temperature || currentPeriod?.temperature || 70,
        feelsLike: currentHourly?.temperature || currentPeriod?.temperature || 70,
        humidity: currentHourly?.relativeHumidity?.value || 50,
        windSpeed: windSpeed,
        windDirection: windMatch,
        condition: getShortCondition(
          currentPeriod?.detailedForecast || '',
          currentPeriod?.shortForecast || 'Unknown'
        ),
        icon: mapNwsIcon(currentPeriod?.icon || ''),
        description: currentPeriod?.shortForecast || 'Unknown',
        uvIndex: 5, // NWS doesn't provide UV in basic forecast
        sunrise: '7:06 AM', // Would need separate sun API call
        sunset: '5:30 PM',
      },
      forecast: dailyForecast.slice(0, 7),
      location: 'Hatteras Island, NC',
      lastUpdated: new Date().toISOString(),
      source: 'National Weather Service',
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
      },
    });
  } catch (error) {
    console.error('Weather API error:', error);

    // Return fallback data if API fails
    return NextResponse.json({
      current: {
        temp: 45,
        feelsLike: 42,
        humidity: 65,
        windSpeed: 12,
        windDirection: 'NE',
        condition: 'Partly Cloudy',
        icon: 'cloud-sun',
        description: 'Partly Cloudy',
        uvIndex: 3,
        sunrise: '7:06 AM',
        sunset: '5:30 PM',
      },
      forecast: [],
      location: 'Hatteras Island, NC',
      lastUpdated: new Date().toISOString(),
      cached: true,
      error: 'Weather service temporarily unavailable',
    });
  }
}
