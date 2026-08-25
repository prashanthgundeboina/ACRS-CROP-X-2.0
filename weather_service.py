import requests
import os

class WeatherService:
    def __init__(self, api_key=None):
        # Default to an environment variable if not provided
        self.api_key = api_key or os.getenv('OPENWEATHER_API_KEY')
        self.base_url = "http://api.openweathermap.org/data/2.5/weather"

    def get_weather(self, city):
        """Fetches real-time weather and 24h forecast for a given city."""
        if not self.api_key:
            return {"error": f"API Key missing for {city}."}

        # Current Weather
        current_data = {}
        try:
            res = requests.get(self.base_url, params={"q": city, "appid": self.api_key, "units": "metric"})
            if res.status_code != 200:
                return {"error": f"City '{city}' not found or API error."}
            current_data = res.json()
        except Exception as e:
            return {"error": f"Failed to fetch current weather for {city}: {e}"}

        # 5-Day / 3-Hour Forecast
        forecast_url = "http://api.openweathermap.org/data/2.5/forecast"
        predicted_rain_24h = 0
        try:
            f_res = requests.get(forecast_url, params={"q": city, "appid": self.api_key, "units": "metric"})
            f_res.raise_for_status()
            f_data = f_res.json()
            for item in f_data.get('list', [])[:8]:
                predicted_rain_24h += item.get('rain', {}).get('3h', 0)
        except:
            predicted_rain_24h = 0

        return {
            "temperature": current_data['main']['temp'],
            "humidity": current_data['main']['humidity'],
            "rainfall": current_data.get('rain', {}).get('1h', 0) * 10,
            "predicted_rain_24h": predicted_rain_24h,
            "wind_speed": current_data['wind']['speed'] * 3.6,
            "city": current_data['name'],
            "description": current_data['weather'][0]['description']
        }

    def compare_locations(self, cities):
        """Returns a comparative analysis of multiple locations."""
        results = []
        for city in cities:
            if city.strip():
                data = self.get_weather(city.strip())
                if "error" not in data:
                    results.append(data)
        return results

if __name__ == "__main__":
    # Test with a dummy or real key
    svc = WeatherService()
    print(svc.get_weather("London"))
