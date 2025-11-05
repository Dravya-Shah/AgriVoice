import { Cloud, Droplets, Wind, Sun, Newspaper, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const CombinedPanel = () => {
  // Mock weather data
  const weatherData = {
    temperature: 24,
    condition: "Partly Cloudy",
    humidity: 68,
    windSpeed: 12,
  };

  // Mock news data
  const newsItems = [
    {
      id: 1,
      title: "New Coffee Rust Resistant Varieties Released",
      summary: "Agricultural researchers announce breakthrough in disease-resistant coffee plants.",
      category: "Research",
      date: "2025-10-25",
    },
    {
      id: 2,
      title: "Climate Change Impact on Coffee Production",
      summary: "Study reveals changing weather patterns affecting global coffee yields.",
      category: "Climate",
      date: "2025-10-24",
    },
    {
      id: 3,
      title: "Organic Pest Control Methods Gain Popularity",
      summary: "Farmers turning to sustainable practices for coffee disease management.",
      category: "Farming",
      date: "2025-10-23",
    },
  ];

  const categoryColors: Record<string, string> = {
    Research: "bg-primary/20 text-primary border-primary/30",
    Climate: "bg-accent/20 text-accent border-accent/30",
    Farming: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  };

  return (
    <div className="flex gap-6 max-w-7xl mx-auto">
      {/* News Panel - Left */}
      <Card 
        className="flex-1 p-6 shadow-2xl backdrop-blur-xl bg-card/40 border-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.2) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.25), inset 0 2px 0 0 rgba(255,255,255,0.6), inset 0 -1px 0 0 rgba(255,255,255,0.2)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-primary/20 backdrop-blur-sm rounded-lg">
            <Newspaper className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground drop-shadow-sm">Latest News</h2>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {newsItems.map((item) => (
            <div
              key={item.id}
              className="bg-card/40 backdrop-blur-sm border border-border/30 rounded-lg p-4 hover:bg-card/60 transition-all hover:shadow-lg"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <Badge variant="outline" className={categoryColors[item.category]}>
                  {item.category}
                </Badge>
                <span className="text-xs text-muted-foreground">{item.date}</span>
              </div>
              <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                {item.title}
              </h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {item.summary}
              </p>
              <a
                href="#"
                className="text-xs text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1"
              >
                Read more <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>
      </Card>

      {/* Weather Panel - Right */}
      <Card 
        className="w-80 p-6 shadow-2xl backdrop-blur-xl bg-card/40 border-0 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.2) 100%)',
          backdropFilter: 'blur(40px) saturate(200%)',
          boxShadow: '0 8px 40px 0 rgba(31, 38, 135, 0.25), inset 0 2px 0 0 rgba(255,255,255,0.6), inset 0 -1px 0 0 rgba(255,255,255,0.2)',
          border: '2px solid rgba(255, 255, 255, 0.4)',
          WebkitBackdropFilter: 'blur(40px) saturate(200%)',
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
    </div>
  );
};

export default CombinedPanel;
