import { Users, Dice6, Map, BookOpen } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Gestión de Personajes",
    description:
      "Crea y administra fichas de personaje completas para D&D y Warhammer.",
  },
  {
    icon: Dice6,
    title: "Tiradas de Dados",
    description:
      "Sistema integrado de dados con historial y modificadores automáticos.",
  },
  {
    icon: Map,
    title: "Mapas de Batalla",
    description:
      "Diseña y comparte mapas tácticos para tus encuentros épicos.",
  },
  {
    icon: BookOpen,
    title: "Bestiario",
    description:
      "Accede a criaturas, enemigos y NPCs con estadísticas detalladas.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Forja Tu Leyenda
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-pretty">
            Herramientas diseñadas para llevar tus partidas al siguiente nivel.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group p-6 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <feature.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
