# Mapbox Setup Guide

The office locations map feature requires a Mapbox access token to display the interactive map.

## Quick Setup

### 1. Get a Mapbox Token

1. Visit [Mapbox Access Tokens](https://account.mapbox.com/access-tokens/)
2. Create a free account or sign in (Free tier includes 50,000 map loads/month)
3. Copy your **Default public token** (starts with `pk.`)

### 2. Add Token to Environment Variables

#### For Local Development

Add the token to your `.env` file:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here
```

Then restart your development server:

```bash
npm run dev
```

#### For Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add a new variable:
   - **Name**: `NEXT_PUBLIC_MAPBOX_TOKEN`
   - **Value**: Your Mapbox token (pk.xxx...)
   - **Environment**: Production, Preview, Development
4. Redeploy your application

#### For Other Platforms

Add `NEXT_PUBLIC_MAPBOX_TOKEN` as an environment variable in your deployment platform's settings.

## Features Enabled

Once configured, the following features will work:

- **Interactive World Map**: Pan, zoom, and explore office locations
- **Office Markers**: Color-coded pins (yellow for HQ, blue for regional offices)
- **Hover Tooltips**: Office names displayed on hover
- **Office Details Popup**: Click markers to view detailed office information
- **Smooth Animations**: Flying transitions when selecting offices
- **Dark Theme Map**: Professional dark-themed map styling

## Optional: Weather Data

The map can also display real-time weather data for each office location. To enable this feature:

1. Get an API key from [OpenWeatherMap](https://openweathermap.org/api) (Free tier available)
2. Add it to your `.env`:

```bash
OPENWEATHER_API_KEY=your_api_key_here
```

## Troubleshooting

### Map Not Showing?

1. **Check Token**: Ensure `NEXT_PUBLIC_MAPBOX_TOKEN` is set correctly
2. **Restart Server**: Always restart after adding environment variables
3. **Check Browser Console**: Look for error messages
4. **Verify Token**: Make sure it starts with `pk.` (public token)

### No Office Locations?

The locations page requires office data in the `office_locations` table. If you see "No Office Locations Yet", you need to add office data through:

1. The "Add Office Location" button on the locations page
2. Database seeding scripts
3. API imports

## Free Tier Limits

Mapbox free tier includes:

- 50,000 map loads per month
- Unlimited map tiles
- Free geocoding and directions

This is more than sufficient for most applications.

## Support

For issues with Mapbox:
- [Mapbox Documentation](https://docs.mapbox.com/)
- [Mapbox Help](https://support.mapbox.com/)
