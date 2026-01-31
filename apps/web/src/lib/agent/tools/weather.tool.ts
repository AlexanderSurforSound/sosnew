/**
 * Weather Tool
 *
 * Provides current weather and forecasts for Hatteras Island.
 *
 * @module agent/tools/weather
 */

import { BaseTool } from './base';
import type { ToolDefinition, ToolResult, WeatherResult } from '../types';

/**
 * Input schema for weather
 */
export interface GetWeatherInput {
  /** Number of forecast days (1-7) */
  days?: number;
}

/**
 * Weather conditions with beach relevance
 */
const WEATHER_CONDITIONS = [
  { condition: 'Sunny', beachRating: 'Excellent' },
  { condition: 'Partly Cloudy', beachRating: 'Great' },
  { condition: 'Mostly Sunny', beachRating: 'Great' },
  { condition: 'Scattered Clouds', beachRating: 'Good' },
  { condition: 'Overcast', beachRating: 'Fair' },
];

/**
 * Weather Tool
 *
 * @example
 * ```typescript
 * const result = await tool.execute({ days: 5 });
 * // Returns current conditions and 5-day forecast
 * ```
 *
 * @remarks
 * In production, this should integrate with a real weather API
 * like OpenWeatherMap, Weather.gov, or similar.
 */
export class WeatherTool extends BaseTool<GetWeatherInput, WeatherResult> {
  readonly name = 'get_weather';

  readonly description = 'Get current weather and forecast for Hatteras Island';

  readonly definition: ToolDefinition = {
    name: 'get_weather',
    description:
      'Get current weather conditions and forecast for Hatteras Island. Use this when guests ask about weather or want to plan activities.',
    input_schema: {
      type: 'object' as const,
      properties: {
        days: {
          type: 'number',
          description: 'Number of forecast days (1-7, default 3)',
        },
      },
      required: [],
    },
  };

  /**
   * Execute weather lookup
   *
   * @remarks
   * Currently generates simulated weather data.
   * TODO: Integrate with real weather API
   */
  async execute(input: GetWeatherInput): Promise<ToolResult<WeatherResult>> {
    const days = Math.min(Math.max(input.days || 3, 1), 7);

    // Generate realistic beach weather
    // In production, call actual weather API
    const forecast = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      const conditionData = WEATHER_CONDITIONS[
        Math.floor(Math.random() * WEATHER_CONDITIONS.length)
      ];

      // Summer-like temperatures for beach area
      const baseHigh = 78 + Math.floor(Math.random() * 12); // 78-90
      const baseLow = baseHigh - 10 - Math.floor(Math.random() * 5); // 10-15 degrees lower

      forecast.push({
        date: date.toISOString().split('T')[0],
        high: baseHigh,
        low: baseLow,
        condition: conditionData.condition,
        precipChance: Math.floor(Math.random() * 30), // 0-30%
      });
    }

    const currentCondition = WEATHER_CONDITIONS[
      Math.floor(Math.random() * 3) // Bias toward better weather for "current"
    ];

    const result: WeatherResult = {
      current: {
        temperature: 78 + Math.floor(Math.random() * 8),
        condition: currentCondition.condition,
        humidity: 60 + Math.floor(Math.random() * 20),
        windSpeed: 8 + Math.floor(Math.random() * 10),
      },
      forecast,
    };

    const message = `Currently ${result.current.temperature}°F and ${result.current.condition.toLowerCase()} on Hatteras Island. ${this.getBeachAdvice(result.current.condition)}`;

    return this.success(result, message);
  }

  /**
   * Generate beach activity advice based on conditions
   */
  private getBeachAdvice(condition: string): string {
    switch (condition) {
      case 'Sunny':
        return "Perfect beach day! Don't forget sunscreen.";
      case 'Partly Cloudy':
      case 'Mostly Sunny':
        return 'Great day for the beach with some natural cloud cover.';
      case 'Scattered Clouds':
        return 'Good beach conditions, comfortable temperatures.';
      case 'Overcast':
        return 'Mild beach day, great for long walks.';
      default:
        return 'Check local conditions before heading out.';
    }
  }
}
