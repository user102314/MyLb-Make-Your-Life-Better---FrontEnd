import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroBg from "@/assets/hero-bg.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="MyLB Background" 
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 gradient-hero"></div>
        <div className="absolute inset-0 circuit-lines opacity-20"></div>
      </div>

      {/* Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent"></div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-block">
            <span className="text-primary text-sm font-semibold tracking-wider uppercase mb-4 inline-block glow-text">
              Plateforme d'Investissement Participatif
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
            <span className="text-foreground">Make Your Life </span>
            <span className="text-primary glow-text">Better</span>
          </h1>

          <p className="text-xl sm:text-2xl text-metallic-dark max-w-2xl mx-auto leading-relaxed">
            MyLB est votre passerelle vers l'investissement participatif intelligent. 
            Investissez dans des projets vérifiés avec <span className="text-primary font-semibold">sécurité</span>, 
            <span className="text-primary font-semibold"> transparence</span> et 
            <span className="text-primary font-semibold"> rendement optimal</span>.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link to="/login">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold text-lg px-8 py-6 glow-border transition-all duration-300 hover:shadow-[0_0_50px_hsla(189,100%,50%,0.5)]"
              >
                Commencer Maintenant
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 font-semibold text-lg px-8 py-6 transition-all duration-300"
            >
              En Savoir Plus
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary glow-text">10M€+</div>
              <div className="text-sm text-muted-foreground">Investis</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary glow-text">5000+</div>
              <div className="text-sm text-muted-foreground">Investisseurs</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-primary glow-text">12%</div>
              <div className="text-sm text-muted-foreground">Rendement Moyen</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent"></div>
    </section>
  );
};

export default Hero;
