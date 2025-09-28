import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  Clock, 
  MapPin, 
  Star,
  Calendar,
  Zap,
  Search,
  Filter,
  Heart
} from "lucide-react";

const Talleres = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  const talleres = [
    {
      id: 1,
      name: "Básquetbol Competitivo",
      instructor: "Prof. Juan Carlos Méndez",
      schedule: "Lun-Mié-Vie 8:00 AM",
      location: "Cancha Central - Gimnasio Principal",
      capacity: 24,
      enrolled: 20,
      level: "Intermedio",
      category: "Deportes de Equipo",
      rating: 4.8,
      price: "$25.000/mes",
      duration: "90 min",
      color: "bg-accent",
      available: true,
      description: "Mejora tu técnica y táctica en básquetbol con entrenamientos intensivos."
    },
    {
      id: 2,
      name: "Voleibol Femenino",
      instructor: "Prof. Sandra Ramírez",
      schedule: "Mar-Jue 6:30 PM",
      location: "Cancha de Voleibol - Gimnasio 2",
      capacity: 18,
      enrolled: 16,
      level: "Principiante",
      category: "Deportes de Equipo",
      rating: 4.9,
      price: "$20.000/mes",
      duration: "75 min",
      color: "bg-secondary",
      available: true,
      description: "Aprende los fundamentos del voleibol en un ambiente inclusivo y divertido."
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
      category: "Deportes Acuáticos",
      rating: 4.7,
      price: "$30.000/mes",
      duration: "60 min",
      color: "bg-primary",
      available: false,
      description: "Sesiones de natación libre con supervisión profesional y técnicas de mejora."
    },
    {
      id: 4,
      name: "CrossFit Intensivo",
      instructor: "Prof. Carlos Ruiz",
      schedule: "Mar-Jue-Sáb 6:00 PM",
      location: "Área Funcional - Gimnasio 2",
      capacity: 15,
      enrolled: 14,
      level: "Avanzado",
      category: "Fitness",
      rating: 4.9,
      price: "$40.000/mes",
      duration: "60 min",
      color: "bg-accent",
      available: true,
      description: "Entrenamiento funcional de alta intensidad para mejorar fuerza y resistencia."
    },
    {
      id: 5,
      name: "Yoga Integral",
      instructor: "Prof. María González",
      schedule: "Lun-Mié-Vie 7:00 AM",
      location: "Salón A - Gimnasio Principal",
      capacity: 20,
      enrolled: 18,
      level: "Principiante",
      category: "Bienestar",
      rating: 4.8,
      price: "$25.000/mes",
      duration: "75 min",
      color: "bg-secondary",
      available: true,
      description: "Práctica integral de yoga para mejorar flexibilidad, fuerza y bienestar mental."
    },
    {
      id: 6,
      name: "Fútbol Recreativo",
      instructor: "Prof. Diego Morales",
      schedule: "Dom 4:00 PM",
      location: "Cancha Principal",
      capacity: 22,
      enrolled: 19,
      level: "Intermedio",
      category: "Deportes de Equipo",
      rating: 4.6,
      price: "$22.000/mes",
      duration: "90 min",
      color: "bg-primary",
      available: true,
      description: "Partidos recreativos de fútbol con enfoque en técnica y trabajo en equipo."
    },
    {
      id: 7,
      name: "Tenis de Mesa",
      instructor: "Prof. Luis Chen",
      schedule: "Mié-Vie 5:00 PM",
      location: "Salón de Tenis de Mesa",
      capacity: 16,
      enrolled: 12,
      level: "Principiante",
      category: "Deportes de Raqueta",
      rating: 4.5,
      price: "$18.000/mes",
      duration: "60 min",
      color: "bg-secondary",
      available: true,
      description: "Desarrolla precisión y reflejos en el deporte de tenis de mesa."
    },
    {
      id: 8,
      name: "Atletismo y Pista",
      instructor: "Prof. Carmen Torres",
      schedule: "Lun-Jue 7:30 AM",
      location: "Pista de Atletismo",
      capacity: 30,
      enrolled: 22,
      level: "Todos los niveles",
      category: "Atletismo",
      rating: 4.7,
      price: "$25.000/mes",
      duration: "90 min",
      color: "bg-accent",
      available: true,
      description: "Entrenamiento completo de atletismo: velocidad, resistencia y técnica."
    },
    {
      id: 9,
      name: "Boxeo Deportivo",
      instructor: "Prof. Roberto Silva",
      schedule: "Mar-Jue-Sáb 7:00 PM",
      location: "Sala de Boxeo",
      capacity: 12,
      enrolled: 10,
      level: "Intermedio",
      category: "Deportes de Combate",
      rating: 4.8,
      price: "$35.000/mes",
      duration: "75 min",
      color: "bg-primary",
      available: true,
      description: "Técnicas de boxeo deportivo con enfoque en acondicionamiento físico."
    },
    {
      id: 10,
      name: "Aeróbicos Acuáticos",
      instructor: "Prof. Patricia Vega",
      schedule: "Mar-Jue 8:00 AM",
      location: "Piscina Semiolímpica",
      capacity: 20,
      enrolled: 17,
      level: "Principiante",
      category: "Deportes Acuáticos",
      rating: 4.6,
      price: "$28.000/mes",
      duration: "60 min",
      color: "bg-secondary",
      available: true,
      description: "Ejercicios aeróbicos en el agua para mejorar la condición física."
    },
    {
      id: 11,
      name: "Escalada Deportiva",
      instructor: "Prof. Andrés Rojas",
      schedule: "Sáb-Dom 10:00 AM",
      location: "Muro de Escalada",
      capacity: 10,
      enrolled: 8,
      level: "Intermedio",
      category: "Deportes Extremos",
      rating: 4.9,
      price: "$45.000/mes",
      duration: "120 min",
      color: "bg-accent",
      available: true,
      description: "Aprende técnicas de escalada deportiva en muro artificial con seguridad profesional."
    },
    {
      id: 12,
      name: "Spinning Avanzado",
      instructor: "Prof. Mónica Herrera",
      schedule: "Lun-Mié-Vie 6:00 PM",
      location: "Sala de Spinning",
      capacity: 25,
      enrolled: 23,
      level: "Avanzado",
      category: "Fitness",
      rating: 4.7,
      price: "$30.000/mes",
      duration: "50 min",
      color: "bg-primary",
      available: true,
      description: "Clases intensivas de spinning con música motivacional y rutinas desafiantes."
    }
  ];

  const categories = ["Todos", "Deportes de Equipo", "Fitness", "Bienestar", "Deportes Acuáticos", "Deportes de Raqueta", "Atletismo", "Deportes de Combate", "Deportes Extremos"];
  const levels = ["Todos", "Principiante", "Intermedio", "Avanzado", "Todos los niveles"];

  const filteredTalleres = talleres.filter(taller => {
    const matchesSearch = taller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         taller.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === "Todos" || taller.level === selectedLevel;
    const matchesCategory = selectedCategory === "Todos" || taller.category === selectedCategory;
    
    return matchesSearch && matchesLevel && matchesCategory;
  });

  const getAvailabilityColor = (enrolled: number, capacity: number) => {
    const percentage = (enrolled / capacity) * 100;
    if (percentage >= 100) return "text-destructive";
    if (percentage >= 80) return "text-accent";
    return "text-secondary";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Talleres Deportivos
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Descubre nuestra amplia variedad de talleres deportivos diseñados 
              para todos los niveles. Encuentra tu pasión deportiva con nosotros.
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar talleres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-background border border-input rounded-md px-3 py-2 text-sm"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-background border border-input rounded-md px-3 py-2 text-sm"
              >
                {levels.map(level => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Mostrando {filteredTalleres.length} de {talleres.length} talleres
          </div>
        </div>
      </section>

      {/* Talleres Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTalleres.map((taller) => (
              <Card key={taller.id} className="card-sport relative overflow-hidden hover-scale">
                {/* Status Badge */}
                <div className="absolute top-4 right-4 z-10">
                  {taller.available ? (
                    <Badge variant="secondary" className="bg-secondary text-white">
                      Disponible
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Completo
                    </Badge>
                  )}
                </div>

                {/* Category Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <Badge variant="outline" className="bg-background/80 text-foreground border-white/20">
                    {taller.category}
                  </Badge>
                </div>

                {/* Color accent */}
                <div className={`absolute top-0 left-0 w-2 h-full ${taller.color}`}></div>
                
                <div className="pl-6 pr-4 py-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">
                        {taller.name}
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        {taller.instructor}
                      </p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-accent fill-current" />
                      <span className="text-sm font-medium">{taller.rating}</span>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {taller.description}
                  </p>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4 mr-2" />
                      {taller.schedule}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2" />
                      {taller.location}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="w-4 h-4 mr-2" />
                      {taller.duration}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Zap className="w-4 h-4 mr-2" />
                      Nivel: {taller.level}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-lg font-bold text-primary mb-4">
                    {taller.price}
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-sm">
                      <Users className="w-4 h-4 mr-2 text-muted-foreground" />
                      <span className={getAvailabilityColor(taller.enrolled, taller.capacity)}>
                        {taller.enrolled}/{taller.capacity} inscritos
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {taller.capacity - taller.enrolled} cupos
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-muted rounded-full h-2 mb-6">
                    <div 
                      className={`h-2 rounded-full ${taller.color} transition-all duration-300`}
                      style={{ width: `${(taller.enrolled / taller.capacity) * 100}%` }}
                    ></div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant={taller.available ? "sport" : "ghost"} 
                      size="sm" 
                      className="flex-1"
                      disabled={!taller.available}
                    >
                      {taller.available ? "Inscribirse" : "Lista de Espera"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredTalleres.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No se encontraron talleres con los filtros aplicados.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("Todos");
                  setSelectedLevel("Todos");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Talleres;