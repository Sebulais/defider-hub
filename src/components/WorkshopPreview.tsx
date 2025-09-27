import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Clock, 
  MapPin, 
  Star,
  ArrowRight,
  Calendar,
  Zap
} from "lucide-react";

const WorkshopPreview = () => {
  const workshops = [
    {
      id: 1,
      name: "Yoga Integral",
      instructor: "Prof. María González",
      schedule: "Lun-Mié-Vie 7:00 AM",
      location: "Salón A - Gimnasio Principal",
      capacity: 20,
      enrolled: 15,
      level: "Principiante",
      rating: 4.8,
      color: "bg-secondary",
      available: true
    },
    {
      id: 2,
      name: "CrossFit Intensivo",
      instructor: "Prof. Carlos Ruiz",
      schedule: "Mar-Jue 6:00 PM",
      location: "Área Funcional - Gimnasio 2",
      capacity: 15,
      enrolled: 14,
      level: "Avanzado",
      rating: 4.9,
      color: "bg-accent",
      available: true
    },
    {
      id: 3,
      name: "Natación Libre",
      instructor: "Prof. Ana López",
      schedule: "Sáb 9:00 AM",
      location: "Piscina Olímpica",
      capacity: 25,
      enrolled: 25,
      level: "Todos los niveles",
      rating: 4.7,
      color: "bg-primary",
      available: false
    },
    {
      id: 4,
      name: "Fútbol Recreativo",
      instructor: "Prof. Diego Morales",
      schedule: "Dom 4:00 PM",
      location: "Cancha Principal",
      capacity: 22,
      enrolled: 18,
      level: "Intermedio",
      rating: 4.6,
      color: "bg-secondary",
      available: true
    }
  ];

  const getAvailabilityColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 80) return "text-accent";
    return "text-secondary";
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Talleres Disponibles
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Descubre nuestra amplia variedad de talleres deportivos diseñados 
            para todos los niveles y horarios.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {workshops.map((workshop) => (
            <Card key={workshop.id} className="card-sport relative overflow-hidden">
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                {workshop.available ? (
                  <Badge variant="secondary" className="bg-secondary text-white">
                    Disponible
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    Completo
                  </Badge>
                )}
              </div>

              {/* Color accent */}
              <div className={`absolute top-0 left-0 w-2 h-full ${workshop.color}`}></div>
              
              <div className="pl-6 pr-4 py-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-foreground mb-1">
                      {workshop.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {workshop.instructor}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-accent fill-current" />
                    <span className="text-sm font-medium">{workshop.rating}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 mr-2" />
                    {workshop.schedule}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-2" />
                    {workshop.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Zap className="w-4 h-4 mr-2" />
                    Nivel: {workshop.level}
                  </div>
                </div>

                {/* Capacity */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center text-sm">
                    <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span className={getAvailabilityColor(workshop.enrolled, workshop.capacity)}>
                      {workshop.enrolled}/{workshop.capacity} inscritos
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {workshop.capacity - workshop.enrolled} cupos disponibles
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-muted rounded-full h-2 mb-6">
                  <div 
                    className={`h-2 rounded-full ${workshop.color} transition-all duration-300`}
                    style={{ width: `${(workshop.enrolled / workshop.capacity) * 100}%` }}
                  ></div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant={workshop.available ? "sport" : "ghost"} 
                    size="sm" 
                    className="flex-1"
                    disabled={!workshop.available}
                  >
                    {workshop.available ? "Inscribirse" : "Lista de Espera"}
                  </Button>
                  <Button variant="outline" size="sm">
                    Ver Detalles
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <Button variant="hero" size="lg" className="px-8">
            Ver Todos los Talleres
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default WorkshopPreview;