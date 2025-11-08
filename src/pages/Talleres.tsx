import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users, 
  Clock, 
  MapPin, 
  Star,
  Calendar,
  User,
  Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const Talleres = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("all");
  const [filtroCampus, setFiltroCampus] = useState<string>("all");
  const [talleres, setTalleres] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inscribing, setInscribing] = useState<string | null>(null);
  const [misInscripciones, setMisInscripciones] = useState<Set<string>>(new Set());
  
  // Estado para el diálogo de confirmación
  const [dialogState, setDialogState] = useState<{
    open: boolean;
    tallerId: string | null;
    tallerName: string;
    action: 'inscribir' | 'desinscribir';
  }>({
    open: false,
    tallerId: null,
    tallerName: '',
    action: 'inscribir'
  });

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchTalleres();
    fetchMisInscripciones();
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

  const fetchMisInscripciones = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('inscripciones_talleres')
        .select('taller_id')
        .eq('user_id', user.id);

      if (error) throw error;
      
      const inscripcionesSet = new Set(data?.map(i => i.taller_id) || []);
      setMisInscripciones(inscripcionesSet);
    } catch (error) {
      console.error('Error fetching inscripciones:', error);
    }
  };

  const openConfirmDialog = (tallerId: string, tallerName: string, action: 'inscribir' | 'desinscribir') => {
    setDialogState({
      open: true,
      tallerId,
      tallerName,
      action
    });
  };

  const handleConfirmAction = async () => {
    if (!dialogState.tallerId) return;

    if (dialogState.action === 'inscribir') {
      await handleInscription(dialogState.tallerId);
    } else {
      await handleDesinscription(dialogState.tallerId);
    }

    setDialogState({ open: false, tallerId: null, tallerName: '', action: 'inscribir' });
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
        await fetchMisInscripciones();
        await fetchTalleres();
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

  const handleDesinscription = async (tallerId: string) => {
    if (!user) return;

    setInscribing(tallerId);
    try {
      const { error } = await supabase
        .from('inscripciones_talleres')
        .delete()
        .eq('user_id', user.id)
        .eq('taller_id', tallerId);

      if (error) throw error;

      toast({
        title: "Desinscrito",
        description: "Te has desinscrito del taller exitosamente"
      });
      await fetchMisInscripciones();
      await fetchTalleres();
    } catch (error) {
      console.error('Error unsubscribing:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la desinscripción",
        variant: "destructive"
      });
    } finally {
      setInscribing(null);
    }
  };

  const talleresFiltrados = talleres.filter((taller) => {
    const matchCategoria = filtroCategoria === "all" || taller.category === filtroCategoria;
    const matchCampus = filtroCampus === "all" || taller.campus === filtroCampus;
    const matchSearch = taller.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       taller.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchCampus && matchSearch;
  });

  // Helper para convertir formato de horarios a tiempo legible
  const formatSchedule = (schedule: string) => {
    const bloqueMap: { [key: string]: string } = {
      "1": "08:15", "2": "09:25",
      "3": "09:40", "4": "10:50",
      "5": "11:05", "6": "12:15",
      "7": "12:30", "8": "13:40",
      "9": "14:40", "10": "15:50",
      "11": "16:05", "12": "17:15",
      "13": "17:30", "14": "18:40"
    };
  
    const bloqueMatch = schedule.match(/Bloque (\d+)-(\d+)/);
    if (bloqueMatch) {
      const inicio = bloqueMatch[1];
      const fin = bloqueMatch[2];
      const horaInicio = bloqueMap[inicio];
      const horaFin = bloqueMap[fin];
      if (horaInicio && horaFin) {
        return `${schedule} (${horaInicio}-${horaFin})`;
      }
    }
    return schedule;
  };

  const getCampusLabel = (campus: string) => {
    const labels: { [key: string]: string } = {
      'casa_central': 'Casa Central',
      'san_joaquin': 'San Joaquín',
      'vitacura': 'Vitacura'
    };
    return labels[campus] || campus;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando talleres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Talleres Deportivos
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto opacity-90">
              Descubre nuestra variedad de talleres deportivos en todos los campus
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-6 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar talleres..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                <SelectItem value="Deportes de Equipo">Deportes de Equipo</SelectItem>
                <SelectItem value="Deportes Individuales">Deportes Individuales</SelectItem>
                <SelectItem value="Fitness">Fitness</SelectItem>
                <SelectItem value="Danza">Danza</SelectItem>
                <SelectItem value="Deportes de Aventura">Deportes de Aventura</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filtroCampus} onValueChange={setFiltroCampus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Campus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los campus</SelectItem>
                <SelectItem value="casa_central">Casa Central</SelectItem>
                <SelectItem value="san_joaquin">San Joaquín</SelectItem>
                <SelectItem value="vitacura">Vitacura</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-3 text-sm text-muted-foreground">
            Mostrando {talleresFiltrados.length} de {talleres.length} talleres
          </div>
        </div>
      </section>

      {/* Talleres Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {talleresFiltrados.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No se encontraron talleres con los filtros aplicados.
              </p>
              <Button 
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setFiltroCategoria("all");
                  setFiltroCampus("all");
                }}
              >
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {talleresFiltrados.map((taller) => {
                const estaInscrito = misInscripciones.has(taller.id);
                
                return (
                  <Card key={taller.id} className="card-sport hover-scale overflow-hidden">
                    <div className={`h-1 ${taller.color}`}></div>
                    
                    <div className="p-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {taller.category}
                          </Badge>
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {getCampusLabel(taller.campus)}
                            </Badge>
                            {estaInscrito && (
                              <Badge variant="default" className="text-xs bg-green-600">
                                Inscrito
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2">{taller.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{taller.description}</p>
                        </div>

                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="h-4 w-4" />
                            <span>{taller.instructor}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatSchedule(taller.schedule)}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>{taller.location}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {taller.enrolled}/{taller.capacity}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-accent fill-current" />
                            <span className="text-sm font-medium">{taller.rating}</span>
                          </div>
                        </div>

                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${taller.color} transition-all duration-300`}
                            style={{ width: `${(taller.enrolled / taller.capacity) * 100}%` }}
                          ></div>
                        </div>

                        <div className="pt-2">
                          {taller.enrolled >= taller.capacity && !misInscripciones.has(taller.id) ? (
                            <Button variant="outline" size="sm" className="w-full" disabled>
                              Cupos Agotados
                            </Button>
                          ) : (
                            <Button
                              variant={estaInscrito ? "outline" : "default"}
                              size="sm"
                              className="w-full"
                              disabled={inscribing === taller.id}
                              onClick={() => {
                                if (estaInscrito) {
                                  openConfirmDialog(taller.id, taller.name, "desinscribir");
                                } else {
                                  openConfirmDialog(taller.id, taller.name, "inscribir");
                                }
                              }}
                            >
                              {inscribing === taller.id
                                ? "Procesando..."
                                : estaInscrito
                                ? "Desinscribirse"
                                : "Inscribirse"}
                            </Button>
                          )}
                        </div>

                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Diálogo de Confirmación */}
      <AlertDialog open={dialogState.open} onOpenChange={(open) => 
        setDialogState(prev => ({ ...prev, open }))
      }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {dialogState.action === 'inscribir' ? '¿Confirmar inscripción?' : '¿Confirmar desinscripción?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {dialogState.action === 'inscribir' 
                ? `¿Estás seguro de que deseas inscribirte en "${dialogState.tallerName}"?`
                : `¿Estás seguro de que deseas desinscribirte de "${dialogState.tallerName}"? Esta acción liberará tu cupo.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Talleres;