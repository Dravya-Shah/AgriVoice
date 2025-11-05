import { Newspaper, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  date: string;
}

const NewsPanel = () => {
  // Mock news data - in production, this would come from a news API
  const newsItems: NewsItem[] = [
    {
      id: 1,
      title: "New Coffee Rust Resistant Varieties Released",
      summary: "Scientists develop new coffee strains with enhanced resistance to leaf rust disease.",
      category: "Research",
      date: "2 days ago",
    },
    {
      id: 2,
      title: "Climate Change Impact on Coffee Diseases",
      summary: "Study shows increasing temperatures affecting disease patterns in coffee plantations.",
      category: "Climate",
      date: "4 days ago",
    },
    {
      id: 3,
      title: "Best Practices for Disease Prevention",
      summary: "Agricultural experts share proven methods for maintaining healthy coffee crops.",
      category: "Tips",
      date: "1 week ago",
    },
  ];

  const categoryColors: Record<string, string> = {
    Research: "bg-primary/10 text-primary",
    Climate: "bg-secondary/10 text-secondary",
    Tips: "bg-accent/20 text-accent-foreground",
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-card to-accent-light/10 border-border shadow-lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Newspaper className="w-5 h-5 text-accent-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Latest News</h2>
      </div>

      <div className="space-y-4">
        {newsItems.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-lg bg-accent-light hover:bg-accent-light/70 transition-colors cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge
                variant="secondary"
                className={categoryColors[item.category]}
              >
                {item.category}
              </Badge>
              <span className="text-xs text-muted-foreground">{item.date}</span>
            </div>
            
            <h3 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">
              {item.title}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-3">
              {item.summary}
            </p>
            
            <div className="flex items-center gap-1 text-primary text-sm font-medium">
              <span>Read more</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default NewsPanel;