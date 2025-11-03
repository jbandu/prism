# Global Presence Feature - Setup Guide

This guide will help you set up the interactive world map feature for PRISM.

## Overview

The Global Presence feature provides:
- Interactive 3D Mapbox globe showing all office locations
- Real-time weather data for each location
- Live local time display for each office
- Beautiful glassmorphism UI with smooth animations
- List view with search and filtering capabilities
- Responsive design optimized for desktop and tablet

## Prerequisites

1. **Mapbox Account** (Free tier available)
2. **OpenWeather API Account** (Free tier: 1000 calls/day)
3. **PostgreSQL Database** (Neon or local)

## Step 1: Database Setup

### Run the Migration

Execute the following SQL migration file in your database:

```bash
# If using psql command line
psql $DATABASE_URL -f database/migrations/003_office_locations.sql

# Or run directly in your database UI (Neon, pgAdmin, etc.)
```

The migration creates:
- `office_locations` table with proper indexes
- Sample data for EasyJet and BioRad (if those companies exist)
- Proper constraints and validations

### Verify the Table

```sql
-- Check if table exists
SELECT * FROM office_locations LIMIT 5;

-- Count offices per company
SELECT company_id, COUNT(*) as office_count
FROM office_locations
GROUP BY company_id;
```

## Step 2: API Keys Setup

### 2.1 Mapbox Token

1. Visit [Mapbox Account](https://account.mapbox.com/)
2. Sign up or log in
3. Go to [Access Tokens](https://account.mapbox.com/access-tokens/)
4. Create a new token or copy your default public token
5. The token should start with `pk.`

### 2.2 OpenWeather API Key

1. Visit [OpenWeather](https://openweathermap.org/api)
2. Sign up for a free account
3. Go to [API Keys](https://home.openweathermap.org/api_keys)
4. Generate a new API key
5. Wait 10-15 minutes for activation

### 2.3 Configure Environment Variables

Update your `.env.local` file:

```bash
# Map & Weather APIs (for Global Presence feature)
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_actual_token_here
OPENWEATHER_API_KEY=your_actual_api_key_here
```

**Important Notes:**
- `NEXT_PUBLIC_MAPBOX_TOKEN` must have the `NEXT_PUBLIC_` prefix (it's used client-side)
- `OPENWEATHER_API_KEY` does NOT have the prefix (server-side only)
- Restart your dev server after adding these variables

## Step 3: Verify Installation

### Check Dependencies

The following packages should be installed:

```json
{
  "react-map-gl": "^7.x.x",
  "mapbox-gl": "^3.x.x",
  "date-fns-tz": "^2.x.x"
}
```

If not installed, run:

```bash
npm install react-map-gl mapbox-gl date-fns-tz
```

### Test the APIs

#### Test Office Locations API

```bash
# Start your dev server
npm run dev

# In another terminal, test the API
curl "http://localhost:3000/api/offices?companyId=YOUR_COMPANY_ID"
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "office_name": "Global Headquarters",
      "city": "London",
      "country": "United Kingdom",
      "latitude": 51.5074,
      "longitude": -0.1278,
      "employee_count": 1200,
      "is_headquarters": true,
      "timezone": "Europe/London"
    }
  ]
}
```

#### Test Weather API

```bash
curl "http://localhost:3000/api/weather?lat=51.5074&lon=-0.1278"
```

Expected response:
```json
{
  "success": true,
  "data": {
    "temp": 72,
    "temp_celsius": 22,
    "condition": "Clear",
    "description": "clear sky",
    "icon": "01d",
    "humidity": 50,
    "feels_like": 70,
    "wind_speed": 5.2
  }
}
```

## Step 4: Add Sample Data

If you don't have existing companies, you can add sample office locations:

```sql
-- Replace YOUR_COMPANY_ID with your actual company ID
INSERT INTO office_locations (
    company_id, office_name, city, country,
    latitude, longitude, employee_count, is_headquarters, timezone
) VALUES
(
    'YOUR_COMPANY_ID',
    'Global Headquarters',
    'San Francisco, CA',
    'United States',
    37.7749,
    -122.4194,
    1500,
    true,
    'America/Los_Angeles'
),
(
    'YOUR_COMPANY_ID',
    'European Office',
    'London',
    'United Kingdom',
    51.5074,
    -0.1278,
    800,
    false,
    'Europe/London'
),
(
    'YOUR_COMPANY_ID',
    'Asia Pacific HQ',
    'Singapore',
    'Singapore',
    1.3521,
    103.8198,
    1200,
    false,
    'Asia/Singapore'
);
```

## Step 5: Access the Feature

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Log in to your PRISM account

3. Navigate to any company dashboard

4. Click on **"Global Presence"** in the sidebar (Globe icon)

5. You should see:
   - Interactive dark-themed map
   - Office location markers (yellow for HQ, blue for others)
   - List sidebar on the left
   - Weather and time data when clicking markers

## Features & Usage

### Interactive Map
- **Pan**: Click and drag
- **Zoom**: Scroll wheel or use controls
- **Marker Click**: View detailed popup with weather and time
- **Smooth Animation**: Automatic flyTo when selecting offices

### List Sidebar
- **Search**: Filter offices by name, city, or country
- **Region Filter**: Quick filter by country
- **Toggle**: Show/hide using the "List" button

### Controls
- **List Toggle**: Show/hide the office list sidebar
- **Temperature Unit**: Switch between °F and °C
- **Navigation**: Zoom in/out, rotate, reset bearing
- **Fullscreen**: Expand map to fullscreen

### Popup Information
- Office name and location
- Headquarters badge (if applicable)
- Employee count
- Real-time local time (updates every second)
- Current weather with icon
- Temperature, humidity, wind speed
- Coordinates

## Troubleshooting

### "Mapbox Token Required" Error
- Check that `NEXT_PUBLIC_MAPBOX_TOKEN` is set in `.env.local`
- Verify the token starts with `pk.`
- Restart your dev server after adding the variable

### Weather Data Not Loading
- Check that `OPENWEATHER_API_KEY` is set correctly
- Verify the API key is activated (wait 10-15 minutes after creation)
- Check browser console for API errors
- The feature will show fallback data if weather API fails

### No Office Locations Showing
- Verify the migration ran successfully
- Check that you have offices in the database for your company
- Verify the company_id matches in the URL and database

### Map Not Rendering
- Check browser console for errors
- Verify mapbox-gl CSS is imported
- Try clearing browser cache
- Check that your Mapbox token has the correct permissions

## API Rate Limits

### Mapbox (Free Tier)
- 50,000 map loads/month
- Unlimited vector tiles
- No credit card required

### OpenWeather (Free Tier)
- 1,000 API calls/day
- 60 calls/minute
- Weather data cached for 15 minutes

## Production Deployment

### Environment Variables

Add these to your Vercel/production environment:

```bash
NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_production_token
OPENWEATHER_API_KEY=your_production_key
```

### Database Migration

Run the migration in your production database:

```bash
psql $PRODUCTION_DATABASE_URL -f database/migrations/003_office_locations.sql
```

### Monitoring

- Monitor OpenWeather API usage in your dashboard
- Check Mapbox usage in your account
- Set up alerts for API rate limits

## Advanced Customization

### Change Map Style

Edit `components/maps/OfficeMap.tsx`:

```tsx
// Available styles:
// - mapbox://styles/mapbox/dark-v11 (current)
// - mapbox://styles/mapbox/light-v11
// - mapbox://styles/mapbox/streets-v12
// - mapbox://styles/mapbox/satellite-v9

<Map
  mapStyle="mapbox://styles/mapbox/light-v11"
  // ...
/>
```

### Customize Marker Colors

Edit marker colors in `OfficeMap.tsx`:

```tsx
const markerColor = office.is_headquarters
  ? "text-yellow-400"  // Headquarters
  : "text-blue-400";   // Regular offices
```

### Add More Weather Details

Edit `components/maps/OfficePopup.tsx` to show additional weather data like:
- UV Index
- Visibility
- Pressure
- Sunrise/Sunset times

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review API documentation:
   - [Mapbox GL JS](https://docs.mapbox.com/mapbox-gl-js/)
   - [OpenWeather API](https://openweathermap.org/api)
   - [react-map-gl](https://visgl.github.io/react-map-gl/)
3. Check browser console for errors

## Credits

- Maps: [Mapbox](https://www.mapbox.com/)
- Weather: [OpenWeather](https://openweathermap.org/)
- Icons: [Lucide Icons](https://lucide.dev/)
- UI Components: [shadcn/ui](https://ui.shadcn.com/)
