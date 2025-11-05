import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';

interface HorarioGym {
  id: string;
  dia: string;
  bloque: string;
  hora_inicio: string;
  hora_fin: string;
  cupos_totales: number;
  cupos_ocupados: number;
}

// Definición de bloques horarios
const BLOQUES_HORARIOS = [
  { bloque: 'Bloque 1-2', hora: '08:15-09:25' },
  { bloque: 'Bloque 3-4', hora: '09:40-10:50' },
  { bloque: 'Bloque 5-6', hora: '11:05-12:15' },
  { bloque: 'Bloque 7-8', hora: '12:30-13:40' },
  { bloque: 'Bloque 9-10', hora: '14:40-15:50' },
  { bloque: 'Bloque 11-12', hora: '16:05-17:15' },
  { bloque: 'Bloque 13-14', hora: '17:30-18:40' },
];

const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const GymBooking = () => {
  const [horarios, setHorarios] = useState<HorarioGym[]>([]);
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState<string | null>(null);
  const [userReservations, setUserReservations] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchHorarios();
    fetchUserReservations();

    // Real-time subscription for gym schedules
    const channel = supabase
      .channel('gym-schedule-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'horarios_gym'
        },
        () => {
          fetchHorarios();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reservas_gym'
        },
        () => {
          fetchHorarios();
          fetchUserReservations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchHorarios = async () => {
    try {
      const { data, error } = await supabase
        .from('horarios_gym')
        .select('*')
        .order('dia', { ascending: true })
        .order('hora_inicio', { ascending: true });

      if (error) throw error;
      setHorarios(data || []);
    } catch (error) {
      console.error('Error fetching gym schedules:', error);
      toast.error('Error al cargar horarios del gimnasio');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReservations = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('reservas_gym')
        .select('horario_gym_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const reservationIds = new Set(data?.map(r => r.horario_gym_id) || []);
      setUserReservations(reservationIds);
    } catch (error) {
      console.error('Error fetching user reservations:', error);
    }
  };

  const handleReservation = async (horarioId: string) => {
    if (!user) {
      toast.error('Debes iniciar sesión para reservar');
      navigate('/auth');
      return;
    }

    setReserving(horarioId);

    try {
      const { error } = await supabase
        .from('reservas_gym')
        .insert({
          user_id: user.id,
          horario_gym_id: horarioId,
        });

      if (error) {
        if (error.code === '23505') {
          toast.error('Ya tienes una reserva para este horario');
        } else {
          throw error;
        }
        return;
      }

      toast.success('¡Reserva realizada exitosamente!');
      await fetchHorarios();
      await fetchUserReservations();
    } catch (error) {
      console.error('Error making reservation:', error);
      toast.error('Error al realizar la reserva');
    } finally {
      setReserving(null);
    }
  };

  const handleCancelReservation = async (horarioId: string) => {
    if (!user) return;

    setReserving(horarioId);

    try {
      const { error } = await supabase
        .from('reservas_gym')
        .delete()
        .eq('user_id', user.id)
        .eq('horario_gym_id', horarioId);

      if (error) throw error;

      toast.success('Reserva cancelada exitosamente');
      await fetchHorarios();
      await fetchUserReservations();
    } catch (error) {
      console.error('Error canceling reservation:', error);
      toast.error('Error al cancelar la reserva');
    } finally {
      setReserving(null);
    }
  };

  const getHorarioForDiaBloque = (dia: string, bloque: string) => {
    return horarios.find(h => h.dia === dia && h.bloque === bloque);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando horarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="gradient-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Reserva de Gimnasio</h1>
          <p className="text-lg opacity-90">Reserva tu espacio en el gimnasio y entrena cuando quieras</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Tabla de Horarios */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted/50">
                  <th className="p-4 text-left font-semibold border-b border-r">Horario</th>
                  {DIAS_SEMANA.map(dia => (
                    <th key={dia} className="p-4 text-center font-semibold border-b border-r min-w-[140px]">
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BLOQUES_HORARIOS.map(({ bloque, hora }) => (
                  <tr key={bloque} className="hover:bg-muted/20">
                    <td className="p-4 font-medium border-b border-r bg-muted/30">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{bloque}</span>
                        <span className="text-xs text-muted-foreground">{hora}</span>
                      </div>
                    </td>
                    {DIAS_SEMANA.map(dia => {
                      const horario = getHorarioForDiaBloque(dia, bloque);
                      
                      if (!horario) {
                        return (
                          <td key={`${dia}-${bloque}`} className="p-2 border-b border-r">
                            <div className="flex flex-col items-center justify-center h-20 text-muted-foreground">
                              <span className="text-xs">No disponible</span>
                            </div>
                          </td>
                        );
                      }

                      const cuposDisponibles = horario.cupos_totales - horario.cupos_ocupados;
                      const isReserved = userReservations.has(horario.id);
                      const isFull = cuposDisponibles <= 0;
                      const isProcessing = reserving === horario.id;

                      return (
                        <td key={`${dia}-${bloque}`} className="p-2 border-b border-r">
                          <div className="flex flex-col items-center justify-center gap-2">
                            {/* Botón de registro/cancelación */}
                            {isReserved ? (
                              <button
                                onClick={() => handleCancelReservation(horario.id)}
                                disabled={isProcessing}
                                className="w-full px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 bg-yellow-500 text-white hover:bg-red-600 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
                              >
                                <span className="group-hover:hidden">Registrado</span>
                                <span className="hidden group-hover:inline">
                                  {isProcessing ? 'Cancelando...' : 'Cancelar'}
                                </span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReservation(horario.id)}
                                disabled={isFull || isProcessing}
                                className={`w-full px-3 py-2 text-xs font-medium rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group ${
                                  isFull 
                                    ? 'bg-gray-400 text-white cursor-not-allowed' 
                                    : 'bg-green-600 text-white hover:bg-green-400 hover:shadow-lg'
                                }`}
                              >
                                <span className="group-hover:hidden">
                                  {isProcessing ? 'Registrando...' : isFull ? 'Sin cupos' : `${cuposDisponibles}/${horario.cupos_totales}`}
                                </span>
                                <span className="hidden group-hover:inline">
                                  {isProcessing ? 'Registrando...' : isFull ? 'Sin cupos' : 'Registrarse'}
                                </span>
                              </button>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Leyenda */}
        <div className="mt-6 flex flex-wrap gap-4 justify-center items-center text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-600"></div>
            <span>Disponible (muestra cupos)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span>Tu reserva</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400"></div>
            <span>Sin cupos</span>
          </div>
        </div>

        {/* Important Information */}
        <Card className="mt-8 border-accent/20 bg-accent/5">
          <div className="p-6">
            <h3 className="flex items-center gap-2 text-accent font-semibold mb-3">
              <AlertCircle className="h-5 w-5" />
              Información Importante
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Las reservas se actualizan en tiempo real</p>
              <p>• Puedes cancelar tu reserva hasta 1 hora antes del horario</p>
              <p>• Máximo 3 reservas activas por persona</p>
              <p>• Recuerda llegar 10 minutos antes de tu horario reservado</p>
              <p>• Pasa el mouse sobre "Registrado" para cancelar tu reserva</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GymBooking;