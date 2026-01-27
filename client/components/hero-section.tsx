import { Button } from "@/components/ui/button";
import { Sword, Shield, Scroll } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/hero-bg.jpg')" }}
      >
        <div className="absolute inset-0 bg-background/80" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Logo/Icon */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <Sword className="w-8 h-8 text-primary" />
          <Shield className="w-10 h-10 text-primary" />
          <Sword className="w-8 h-8 text-primary transform scale-x-[-1]" />
        </div>

        {/* Title */}
        <h1 className="text-5xl md:text-7xl font-bold tracking-wider text-foreground mb-4">
          <span className="text-balance">OBSIDIAN CIRCLE</span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed text-pretty">
          Reserva tu aventura de rol y domina el campo de batalla.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" className="text-lg px-8 py-6 font-semibold">
            <Scroll className="w-5 h-5 mr-2" />
            Comenzar Aventura
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="text-lg px-8 py-6 font-semibold border-primary/50 text-foreground hover:bg-primary/10 bg-transparent"
          >
            Explorar Características
          </Button>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
