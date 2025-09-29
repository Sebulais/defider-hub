import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Talleres = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Todos");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [talleres, setTalleres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inscribing, setInscribing] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchTalleres();
  }, []);

  const fetchTalleres = async () => {
    try {
      const { data, error } = await supabase
        .from('talleres')
        .select('*')
        .order('name');

      if (error) throw error;
      setTalleres(data || []);
    } catch (error) {
      console.error('Error fetching talleres:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los talleres",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInscription = async (tallerId: string) => {
    if (!user) return;

    setInscribing(tallerId);
    try {
      const { error } = await supabase
        .from('inscripciones_talleres')
        .insert([
          {
            user_id: user.id,
            taller_id: tallerId
          }
        ]);

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Ya inscrito",
            description: "Ya estás inscrito en este taller",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "¡Inscrito!",
          description: "Te has inscrito exitosamente al taller"
        });
        // Refresh talleres to get updated counts
        fetchTalleres();
      }
    } catch (error) {
      console.error('Error inscribing:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la inscripción",
        variant: "destructive"
      });
    } finally {
      setInscribing(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando talleres...</p>
        </div>
      </div>
    );
  }

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
                      disabled={!taller.available || inscribing === taller.id}
                      onClick={() => handleInscription(taller.id)}
                    >
                      {inscribing === taller.id ? "Inscribiendo..." : 
                       taller.available ? "Inscribirse" : "Lista de Espera"}
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