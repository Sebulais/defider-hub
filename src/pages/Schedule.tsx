import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Plus, Edit2, Save, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TallerInscription {
  id: string;
  taller_id: string;
  talleres: {
    name: string;
    schedule: string;
    location: string;
    color: string;
  };
}

interface GymReservation {
  id: string;
  horario_gym_id: string;
  horarios_gym: {
    dia: string;
    bloque: string;
  };
}

interface RamoPersonal {
  id: string;
  nombre_ramo: string;
  sala: string;
  dia: string;
  bloque_inicio: number;
  bloque_fin: number;
  color: string;
}

interface ScheduleEvent {
  type: 'taller' | 'gym' | 'ramo';
  id: string;
  name: string;
  sala?: string;
  color: string;
  canDelete: boolean;
}

const BLOQUES = [
  { num: '1-2', hora: '08:15-09:25' },
  { num: '3-4', hora: '09:40-10:50' },
  { num: '5-6', hora: '11:05-12:15' },
  { num: '7-8', hora: '12:30-13:40' },
  { num: '9-10', hora: '14:40-15:50' },
  { num: '11-12', hora: '16:05-17:15' },
  { num: '13-14', hora: '17:30-18:40' },
];

const DIAS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

const COLORES_RAMOS = [
  { value: 'bg-purple-500', label: 'Morado' },
  { value: 'bg-pink-500', label: 'Rosado' },
  { value: 'bg-indigo-500', label: 'Índigo' },
  { value: 'bg-cyan-500', label: 'Cyan' },
  { value: 'bg-teal-500', label: 'Verde Azulado' },
  { value: 'bg-orange-500', label: 'Naranja' },
];

const Schedule = () => {
  const [talleres, setTalleres] = useState<TallerInscription[]>([]);
  const [gymReservations, setGymReservations] = useState<GymReservation[]>([]);
  const [ramos, setRamos] = useState<RamoPersonal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dia: string; bloque: string } | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    nombre_ramo: '',
    sala: '',
    dia: '',
    bloque_inicio: '',
    bloque_fin: '',
    color: 'bg-purple-500',
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchScheduleData();

    // Real-time subscriptions
    const channel = supabase
      .channel('schedule-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inscripciones_talleres' }, () => fetchScheduleData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservas_gym' }, () => fetchScheduleData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ramos_personales' }, () => fetchScheduleData())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchScheduleData = async () => {
    if (!user) return;

    try {
      const [talleresRes, gymRes, ramosRes] = await Promise.all([
        supabase
          .from('inscripciones_talleres')
          .select('id, taller_id, talleres(name, schedule, location, color)')
          .eq('user_id', user.id),
        supabase
          .from('reservas_gym')
          .select('id, horario_gym_id, horarios_gym(dia, bloque)')
          .eq('user_id', user.id),
        supabase
          .from('ramos_personales')
          .select('*')
          .eq('user_id', user.id),
      ]);

      if (talleresRes.error) throw talleresRes.error;
      if (gymRes.error) throw gymRes.error;
      if (ramosRes.error) throw ramosRes.error;

      setTalleres(talleresRes.data || []);
      setGymReservations(gymRes.data || []);
      setRamos(ramosRes.data || []);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast.error('Error al cargar horario');
    } finally {
      setLoading(false);
    }
  };

  const parseScheduleToSlots = (schedule: string): { dia: string; bloques: string[] }[] => {
    const diasMatch = schedule.match(/([A-Za-zé]+)(?:-([A-Za-zé]+))?(?:-([A-Za-zé]+))?/);
    const bloquesMatch = schedule.match(/Bloque (\d+)-(\d+)/);

    if (!diasMatch || !bloquesMatch) return [];

    const diasMap: { [key: string]: string } = {
      'Lun': 'Lunes', 'Mar': 'Martes', 'Mié': 'Miércoles', 'Jue': 'Jueves', 'Vie': 'Viernes'
    };

    const dias = [diasMatch[1], diasMatch[2], diasMatch[3]]
      .filter(Boolean)
      .map(d => diasMap[d] || d);
    
    const bloqueInicio = bloquesMatch[1];
    const bloqueFin = bloquesMatch[2];
    const bloquePar = `${bloqueInicio}-${bloqueFin}`;

    return dias.map(dia => ({ dia, bloques: [bloquePar] }));
  };

  const getEventForSlot = (dia: string, bloquePar: string): ScheduleEvent | null => {
    // Check talleres
    for (const taller of talleres) {
      const slots = parseScheduleToSlots(taller.talleres.schedule);
      for (const slot of slots) {
        if (slot.dia === dia && slot.bloques.includes(bloquePar)) {
          return {
            type: 'taller',
            id: taller.id,
            name: taller.talleres.name,
            sala: taller.talleres.location,
            color: taller.talleres.color,
            canDelete: false,
          };
        }
      }
    }

    // Check gym
    for (const gym of gymReservations) {
      if (gym.horarios_gym.dia === dia && gym.horarios_gym.bloque === `Bloque ${bloquePar}`) {
        return {
          type: 'gym',
          id: gym.id,
          name: 'Gimnasio',
          sala: gym.horarios_gym.bloque,
          color: 'bg-primary',
          canDelete: false,
        };
      }
    }
  
    // Check ramos (convertir bloque_inicio-bloque_fin a formato par)
    for (const ramo of ramos) {
      const ramoPar = `${ramo.bloque_inicio}-${ramo.bloque_fin}`;
      if (ramo.dia === dia && ramoPar === bloquePar) {
        return {
          type: 'ramo',
          id: ramo.id,
          name: ramo.nombre_ramo,
          sala: ramo.sala,
          color: ramo.color,
          canDelete: true,
        };
      }
    }
  
    return null;
  };

    // Check gym
    for (const gym of gymReservations) {
      if (gym.horarios_gym.dia === dia) {
        const bloqueMatch = gym.horarios_gym.bloque.match(/Bloque (\d+)/);
        if (bloqueMatch && parseInt(bloqueMatch[1]) === bloque) {
          return {
            type: 'gym',
            id: gym.id,
            name: 'Gimnasio',
            sala: gym.horarios_gym.bloque,
            color: 'bg-primary',
            canDelete: false,
          };
        }
      }
    }

    // Check ramos
    for (const ramo of ramos) {
      if (ramo.dia === dia && bloque >= ramo.bloque_inicio && bloque <= ramo.bloque_fin) {
        return {
          type: 'ramo',
          id: ramo.id,
          name: ramo.nombre_ramo,
          sala: ramo.sala,
          color: ramo.color,
          canDelete: true,
        };
      }
    }

    return null;
  };

  const handleAddRamo = async () => {
    if (!user || !formData.nombre_ramo || !formData.dia || !formData.bloque_inicio) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    const bloqueInicio = parseInt(formData.bloque_inicio);
    const bloqueFin = parseInt(formData.bloque_fin);
    const bloquePar = `${bloqueInicio}-${bloqueFin}`;

    // Check conflicts
    const existing = getEventForSlot(formData.dia, bloquePar);
    if (existing) {
      toast.error(`Conflicto detectado en ${formData.dia} bloque ${bloquePar}`);
      return;
    }

    try {
      const { error } = await supabase.from('ramos_personales').insert({
        user_id: user.id,
        nombre_ramo: formData.nombre_ramo,
        sala: formData.sala || '',
        dia: formData.dia,
        bloque_inicio: bloqueInicio,
        bloque_fin: bloqueFin,
        color: formData.color,
      });

      if (error) throw error;

      toast.success('Ramo agregado exitosamente');
      setShowAddDialog(false);
      setFormData({
        nombre_ramo: '',
        sala: '',
        dia: '',
        bloque_inicio: '',
        bloque_fin: '',
        color: 'bg-purple-500',
      });
      fetchScheduleData();
    } catch (error) {
      console.error('Error adding ramo:', error);
      toast.error('Error al agregar ramo');
    }
  };

  const handleDeleteRamo = async (ramoId: string) => {
    try {
      const { error } = await supabase.from('ramos_personales').delete().eq('id', ramoId);
      if (error) throw error;
      toast.success('Ramo eliminado');
      fetchScheduleData();
    } catch (error) {
      console.error('Error deleting ramo:', error);
      toast.error('Error al eliminar ramo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando horario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="gradient-primary text-primary-foreground py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
                <Calendar className="h-8 w-8" />
                Mi Horario Personal
              </h1>
              <p className="text-lg opacity-90">Visualiza y gestiona tu horario completo</p>
            </div>
            <Button
              onClick={() => setEditMode(!editMode)}
              variant={editMode ? "secondary" : "outline"}
              className="gap-2"
            >
              {editMode ? (
                <>
                  <Save className="h-4 w-4" />
                  Guardar Cambios
                </>
              ) : (
                <>
                  <Edit2 className="h-4 w-4" />
                  Editar Horario
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Card className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="p-3 text-left font-semibold bg-muted/50">Bloque</th>
                {DIAS.map(dia => (
                  <th key={dia} className="p-3 text-center font-semibold bg-muted/50 min-w-[150px]">{dia}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BLOQUES.map(({ num, hora }) => (
                <tr key={num} className="border-b hover:bg-muted/20">
                  <td className="p-3 font-medium text-sm">
                    <div className="flex flex-col">
                      <span className="font-bold">Bloque {num}</span>
                      <span className="text-xs text-muted-foreground">{hora}</span>
                    </div>
                  </td>
                  {DIAS.map(dia => {
                    const event = getEventForSlot(dia, num);
                    
                    return (
                      <td key={`${dia}-${num}`} className="p-1 text-center align-top">
                        {event ? (
                          <div className={`${event.color} text-white rounded p-2 text-xs relative group`}>
                            <div className="font-semibold">{event.name}</div>
                            {event.sala && <div className="text-xs opacity-90">{event.sala}</div>}
                            {editMode && event.canDelete && (
                              <button
                                onClick={() => handleDeleteRamo(event.id)}
                                className="absolute top-1 right-1 bg-destructive rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        ) : editMode ? (
                          <button
                            onClick={() => {
                              setSelectedSlot({ dia, bloque: num }); // num ya es '1-2', '3-4', etc.
                              const [inicio, fin] = num.split('-');
                              setFormData({ 
                                ...formData, 
                                dia, 
                                bloque_inicio: inicio, 
                                bloque_fin: fin 
                              });
                              setShowAddDialog(true);
                            }}
                            className="w-full h-full min-h-[60px] border-2 border-dashed border-muted-foreground/30 rounded hover:border-primary hover:bg-primary/5 transition-colors flex items-center justify-center"
                          >
                            <Plus className="h-5 w-5 text-muted-foreground" />
                          </button>
                        ) : (
                          <div className="min-h-[60px]" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* Legend */}
        <div className="mt-6 flex gap-6 justify-center flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-secondary rounded" />
            <span className="text-sm">Talleres DEFIDER</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded" />
            <span className="text-sm">Gimnasio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded" />
            <span className="text-sm">Ramos Académicos</span>
          </div>
        </div>
      </div>

      {/* Add Ramo Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Ramo Académico</DialogTitle>
            <DialogDescription>Completa la información del ramo</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombre_ramo">Nombre del Ramo *</Label>
              <Input
                id="nombre_ramo"
                value={formData.nombre_ramo}
                onChange={(e) => setFormData({ ...formData, nombre_ramo: e.target.value })}
                placeholder="Ej: Cálculo I"
              />
            </div>
            <div>
              <Label htmlFor="sala">Sala</Label>
              <Input
                id="sala"
                value={formData.sala}
                onChange={(e) => setFormData({ ...formData, sala: e.target.value })}
                placeholder="Ej: E201"
              />
            </div>
            <div>
              <Label htmlFor="dia">Día *</Label>
              <Select value={formData.dia} onValueChange={(v) => setFormData({ ...formData, dia: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona día" />
                </SelectTrigger>
                <SelectContent>
                  {DIAS.map(dia => <SelectItem key={dia} value={dia}>{dia}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bloque_inicio">Bloque Inicio *</Label>
                <Select value={formData.bloque_inicio} onValueChange={(v) => setFormData({ ...formData, bloque_inicio: v, bloque_fin: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Inicio" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Bloque 1-2</SelectItem>
                    <SelectItem value="3">Bloque 3-4</SelectItem>
                    <SelectItem value="5">Bloque 5-6</SelectItem>
                    <SelectItem value="7">Bloque 7-8</SelectItem>
                    <SelectItem value="9">Bloque 9-10</SelectItem>
                    <SelectItem value="11">Bloque 11-12</SelectItem>
                    <SelectItem value="13">Bloque 13-14</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bloque_fin">Bloque Fin *</Label>
                <Input 
                  value={formData.bloque_fin} 
                  disabled 
                  className="bg-muted"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Select value={formData.color} onValueChange={(v) => setFormData({ ...formData, color: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLORES_RAMOS.map(c => (
                    <SelectItem key={c.value} value={c.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 ${c.value} rounded`} />
                        {c.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddRamo}>
                Agregar Ramo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
