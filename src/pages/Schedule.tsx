import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Dumbbell,
  GraduationCap,
  X,
  CalendarDays
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TallerInscription {
  id: string;
  taller_id: string;
  talleres: {
    id: string;
    name: string;
    instructor: string;
    schedule: string;
    location: string;
    level: string;
    category: string;
    color: string;
    duration: string;
  };
}

interface GymReservation {
  id: string;
  horario_gym_id: string;
  horarios_gym: {
    id: string;
    dia: string;
    bloque: string;
    hora_inicio: string;
    hora_fin: string;
  };
}

const Schedule = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tallerInscriptions, setTallerInscriptions] = useState<TallerInscription[]>([]);
  const [gymReservations, setGymReservations] = useState<GymReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    fetchUserSchedule();
  }, [user]);

  const fetchUserSchedule = async () => {
    try {
      // Fetch taller inscriptions
      const { data: talleres, error: talleresError } = await supabase
        .from('inscripciones_talleres')
        .select(`
          id,
          taller_id,
          talleres (
            id,
            name,
            instructor,
            schedule,
            location,
            level,
            category,
            color,
            duration
          )
        `)
        .eq('user_id', user.id);

      if (talleresError) throw talleresError;

      // Fetch gym reservations
      const { data: gym, error: gymError } = await supabase
        .from('reservas_gym')
        .select(`
          id,
          horario_gym_id,
          horarios_gym (
            id,
            dia,
            bloque,
            hora_inicio,
            hora_fin
          )
        `)
        .eq('user_id', user.id);

      if (gymError) throw gymError;

      setTallerInscriptions(talleres || []);
      setGymReservations(gym || []);
    } catch (error) {
      console.error('Error fetching user schedule:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar tu horario",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const cancelTallerInscription = async (inscriptionId: string) => {
    setCanceling(inscriptionId);
    try {
      const { error } = await supabase
        .from('inscripciones_talleres')
        .delete()
        .eq('id', inscriptionId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Inscripción cancelada",
        description: "Te has desinscrito del taller exitosamente"
      });
      
      fetchUserSchedule();
    } catch (error) {
      console.error('Error canceling inscription:', error);
      toast({
        title: "Error", 
        description: "No se pudo cancelar la inscripción",
        variant: "destructive"
      });
    } finally {
      setCanceling(null);
    }
  };

  const cancelGymReservation = async (reservationId: string) => {
    setCanceling(reservationId);
    try {
      const { error } = await supabase
        .from('reservas_gym')
        .delete()
        .eq('id', reservationId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Reserva cancelada",
        description: "Has cancelado tu reserva de gimnasio exitosamente"
      });
      
      fetchUserSchedule();
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast({
        title: "Error",
        description: "No se pudo cancelar la reserva",
        variant: "destructive"
      });
    } finally {
      setCanceling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando tu horario...</p>
        </div>
      </div>
    );
  }

  const hasActivities = tallerInscriptions.length > 0 || gymReservations.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Mi Horario Personal
            </h1>
            <p className="text-xl max-w-3xl mx-auto opacity-90">
              Aquí puedes ver todas tus actividades: talleres deportivos inscritos y reservas de gimnasio.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          {!hasActivities ? (
            <div className="text-center py-20">
              <CalendarDays className="w-24 h-24 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-foreground mb-4">
                No tienes actividades programadas
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Comienza inscribiéndote en talleres deportivos o reservando cupos en el gimnasio
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="sport" asChild>
                  <a href="/talleres">Ver Talleres</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/gym">Reservar Gimnasio</a>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Talleres Inscritos */}
              {tallerInscriptions.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <GraduationCap className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Talleres Deportivos ({tallerInscriptions.length})
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tallerInscriptions.map((inscription) => (
                      <Card key={inscription.id} className="card-sport relative overflow-hidden">
                        {/* Color accent */}
                        <div className={`absolute top-0 left-0 w-2 h-full ${inscription.talleres.color}`}></div>
                        
                        <div className="pl-6 pr-4 py-6">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-foreground mb-1">
                                {inscription.talleres.name}
                              </h3>
                              <p className="text-muted-foreground text-sm">
                                {inscription.talleres.instructor}
                              </p>
                            </div>
                            <Badge variant="secondary" className="bg-secondary text-white">
                              Inscrito
                            </Badge>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4 mr-2" />
                              {inscription.talleres.schedule}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2" />
                              {inscription.talleres.location}
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="w-4 h-4 mr-2" />
                              {inscription.talleres.duration}
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <Badge variant="outline">
                              {inscription.talleres.category}
                            </Badge>
                            <Button 
                              variant="destructive"
                              size="sm"
                              disabled={canceling === inscription.id}
                              onClick={() => cancelTallerInscription(inscription.id)}
                            >
                              {canceling === inscription.id ? (
                                "Cancelando..."
                              ) : (
                                <>
                                  <X className="w-4 h-4 mr-1" />
                                  Cancelar
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Reservas de Gimnasio */}
              {gymReservations.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <Dumbbell className="w-6 h-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Reservas de Gimnasio ({gymReservations.length})
                    </h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {gymReservations.map((reservation) => (
                      <Card key={reservation.id} className="p-4 hover-scale">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium text-foreground">
                              {reservation.horarios_gym.dia}
                            </div>
                            <Badge variant="secondary" className="bg-accent text-white">
                              Reservado
                            </Badge>
                          </div>
                          
                          <div className="text-lg font-bold text-foreground">
                            {reservation.horarios_gym.bloque}
                          </div>
                          
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="w-4 h-4 mr-2" />
                            {reservation.horarios_gym.hora_inicio.slice(0, 5)} - {reservation.horarios_gym.hora_fin.slice(0, 5)}
                          </div>
                          
                          <Button 
                            variant="destructive"
                            size="sm"
                            className="w-full"
                            disabled={canceling === reservation.id}
                            onClick={() => cancelGymReservation(reservation.id)}
                          >
                            {canceling === reservation.id ? (
                              "Cancelando..."
                            ) : (
                              <>
                                <X className="w-4 h-4 mr-1" />
                                Cancelar
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Schedule;