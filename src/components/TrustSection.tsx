import securityIcon from "@/assets/security-icon.png";
import transparencyIcon from "@/assets/transparency-icon.png";
import growthIcon from "@/assets/growth-icon.png";

const TrustSection = () => {
  const features = [
    {
      icon: securityIcon,
      title: "Sécurité",
      description: "Vos investissements sont protégés par une infrastructure de niveau bancaire avec cryptage de bout en bout et authentification multi-facteurs."
    },
    {
      icon: transparencyIcon,
      title: "Transparence",
      description: "Accédez à toutes les informations sur chaque projet : documents vérifiés, historique complet et rapports financiers en temps réel."
    },
    {
      icon: growthIcon,
      title: "Rendement",
      description: "Optimisez votre portefeuille avec des projets soigneusement sélectionnés offrant des rendements attractifs et durables."
    }
  ];

  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            <span className="text-foreground">Pourquoi choisir </span>
            <span className="text-primary glow-text">MyLB</span>
            <span className="text-foreground"> ?</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Nous mettons votre confiance au cœur de notre plateforme avec trois piliers fondamentaux
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="group relative"
            >
              {/* Card */}
              <div className="h-full p-8 rounded-2xl gradient-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_40px_hsla(189,100%,50%,0.1)]">
                {/* Icon */}
                <div className="mb-6 relative">
                  <div className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <img 
                      src={feature.icon} 
                      alt={feature.title}
                      className="w-12 h-12 object-contain group-hover:drop-shadow-[0_0_15px_hsla(189,100%,50%,0.8)] transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            Prêt à transformer votre avenir financier ?
          </p>
          <a 
            href="/login"
            className="inline-flex items-center text-primary font-semibold hover:underline glow-text transition-all duration-300"
          >
            Rejoignez MyLB dès aujourd'hui
            <svg 
              className="ml-2 w-5 h-5" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M17 8l4 4m0 0l-4 4m4-4H3" 
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
