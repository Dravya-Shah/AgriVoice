import Hero from "@/components/Hero";
import ImageUpload from "@/components/ImageUpload";
import CombinedPanel from "@/components/CombinedPanel";
import Chatbot from "@/components/Chatbot";
import { Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">CoffeeLeaf AI</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#detector-section" className="text-muted-foreground hover:text-foreground transition-colors">
              Detector
            </a>
            <a href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
              AI Chat
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <Hero />

      {/* Main Dashboard */}
      <section id="detector-section" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Disease Detection Dashboard
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Upload images, monitor weather conditions, and stay updated with the latest agricultural news.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <ImageUpload />
            
            {/* Image Showcase Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Leaf className="w-16 h-16 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-foreground">Healthy Leaves</h3>
                    <p className="text-sm text-muted-foreground mt-2">Monitor your crop health</p>
                  </div>
                </div>
              </Card>
              
              <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-accent/20 to-chart-1/20 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Leaf className="w-16 h-16 text-accent mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-foreground">Early Detection</h3>
                    <p className="text-sm text-muted-foreground mt-2">Catch diseases early</p>
                  </div>
                </div>
              </Card>
              
              <Card className="overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <div className="aspect-square bg-gradient-to-br from-chart-2/20 to-primary/20 flex items-center justify-center">
                  <div className="text-center p-6">
                    <Leaf className="w-16 h-16 text-chart-2 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                    <h3 className="font-semibold text-foreground">AI Analysis</h3>
                    <p className="text-sm text-muted-foreground mt-2">Smart diagnostics</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* News and Weather Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <CombinedPanel />
        </div>
      </section>

      {/* Floating Chatbot */}
      <Chatbot />

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2025 CoffeeLeaf AI. Protecting coffee crops with artificial intelligence.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;