import { Cloud, Droplets, Wind, Sun } from "lucide-react";
import { Card } from "@/components/ui/card";

const WeatherPanel = () => {
  // Mock weather data - in production, this would come from a weather API
  const weatherData = {
    temperature: 24,
    condition: "Partly Cloudy",
    humidity: 68,
    windSpeed: 12,
    precipitation: 20,
  };

  return (
    <Card className="fixed top-24 right-6 w-80 z-40 p-6 shadow-2xl backdrop-blur-xl bg-card/70 border border-border/50 rounded-2xl"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1), inset 0 1px 0 0 rgba(255,255,255,0.2)',
      }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-primary/20 backdrop-blur-sm rounded-lg">
          <Cloud className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground drop-shadow-sm">Weather</h2>
      </div>

      <div className="space-y-6">
        {/* Main Temperature */}
        <div className="text-center py-4">
          <div className="text-5xl font-bold text-foreground mb-2">
            {weatherData.temperature}°C
          </div>
          <p className="text-muted-foreground">{weatherData.condition}</p>
        </div>

        {/* Weather Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-card/40 backdrop-blur-sm rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Humidity</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {weatherData.humidity}%
            </div>
          </div>

          <div className="bg-card/40 backdrop-blur-sm rounded-lg p-4 border border-border/30">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Wind</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">
              {weatherData.windSpeed} km/h
            </div>
          </div>
        </div>

        {/* Disease Risk Alert */}
        <div className="bg-accent/10 backdrop-blur-sm border border-accent/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sun className="w-5 h-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-medium text-foreground mb-1">Disease Risk: Moderate</h4>
              <p className="text-sm text-muted-foreground">
                Current conditions favor fungal growth. Monitor your crops closely.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default WeatherPanel;