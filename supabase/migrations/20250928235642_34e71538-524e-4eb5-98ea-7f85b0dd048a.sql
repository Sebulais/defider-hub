-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table for extended user data
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('estudiante', 'profesor')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create talleres table
CREATE TABLE public.talleres (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  instructor TEXT NOT NULL,
  schedule TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 20,
  enrolled INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL,
  category TEXT NOT NULL,
  rating DECIMAL(2,1) DEFAULT 4.0,
  price TEXT NOT NULL,
  duration TEXT NOT NULL,
  color TEXT DEFAULT 'bg-primary',
  available BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create inscripciones_talleres table
CREATE TABLE public.inscripciones_talleres (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  taller_id UUID NOT NULL REFERENCES public.talleres(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, taller_id)
);

-- Create horarios_gym table
CREATE TABLE public.horarios_gym (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  dia TEXT NOT NULL CHECK (dia IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes')),
  bloque TEXT NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  cupos_totales INTEGER NOT NULL DEFAULT 20,
  cupos_ocupados INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(dia, bloque)
);

-- Create reservas_gym table
CREATE TABLE public.reservas_gym (
  id UUID NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horario_gym_id UUID NOT NULL REFERENCES public.horarios_gym(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, horario_gym_id)
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inscripciones_talleres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.horarios_gym ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservas_gym ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Users can view their own profile" ON public.users
FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON public.users
FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert their own profile" ON public.users
FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies for talleres (public read)
CREATE POLICY "Anyone can view talleres" ON public.talleres
FOR SELECT USING (true);

-- RLS Policies for inscripciones_talleres
CREATE POLICY "Users can view their own inscriptions" ON public.inscripciones_talleres
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own inscriptions" ON public.inscripciones_talleres
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own inscriptions" ON public.inscripciones_talleres
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for horarios_gym (public read)
CREATE POLICY "Anyone can view gym schedules" ON public.horarios_gym
FOR SELECT USING (true);

-- RLS Policies for reservas_gym
CREATE POLICY "Users can view their own gym reservations" ON public.reservas_gym
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own gym reservations" ON public.reservas_gym
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own gym reservations" ON public.reservas_gym
FOR DELETE USING (auth.uid() = user_id);

-- Insert initial talleres data
INSERT INTO public.talleres (name, instructor, schedule, location, capacity, enrolled, level, category, rating, price, duration, color, available, description) VALUES
('Básquetbol Competitivo', 'Prof. Juan Carlos Méndez', 'Lun-Mié-Vie 8:00 AM', 'Cancha Central - Gimnasio Principal', 24, 20, 'Intermedio', 'Deportes de Equipo', 4.8, '$25.000/mes', '90 min', 'bg-accent', true, 'Mejora tu técnica y táctica en básquetbol con entrenamientos intensivos.'),
('Voleibol Femenino', 'Prof. Sandra Ramírez', 'Mar-Jue 6:30 PM', 'Cancha de Voleibol - Gimnasio 2', 18, 16, 'Principiante', 'Deportes de Equipo', 4.9, '$20.000/mes', '75 min', 'bg-secondary', true, 'Aprende los fundamentos del voleibol en un ambiente inclusivo y divertido.'),
('Natación Libre', 'Prof. Ana López', 'Sáb 9:00 AM', 'Piscina Olímpica', 25, 25, 'Todos los niveles', 'Deportes Acuáticos', 4.7, '$30.000/mes', '60 min', 'bg-primary', false, 'Sesiones de natación libre con supervisión profesional y técnicas de mejora.'),
('CrossFit Intensivo', 'Prof. Carlos Ruiz', 'Mar-Jue-Sáb 6:00 PM', 'Área Funcional - Gimnasio 2', 15, 14, 'Avanzado', 'Fitness', 4.9, '$40.000/mes', '60 min', 'bg-accent', true, 'Entrenamiento funcional de alta intensidad para mejorar fuerza y resistencia.'),
('Yoga Integral', 'Prof. María González', 'Lun-Mié-Vie 7:00 AM', 'Salón A - Gimnasio Principal', 20, 18, 'Principiante', 'Bienestar', 4.8, '$25.000/mes', '75 min', 'bg-secondary', true, 'Práctica integral de yoga para mejorar flexibilidad, fuerza y bienestar mental.'),
('Fútbol Recreativo', 'Prof. Diego Morales', 'Dom 4:00 PM', 'Cancha Principal', 22, 19, 'Intermedio', 'Deportes de Equipo', 4.6, '$22.000/mes', '90 min', 'bg-primary', true, 'Partidos recreativos de fútbol con enfoque en técnica y trabajo en equipo.'),
('Tenis de Mesa', 'Prof. Luis Chen', 'Mié-Vie 5:00 PM', 'Salón de Tenis de Mesa', 16, 12, 'Principiante', 'Deportes de Raqueta', 4.5, '$18.000/mes', '60 min', 'bg-secondary', true, 'Desarrolla precisión y reflejos en el deporte de tenis de mesa.'),
('Atletismo y Pista', 'Prof. Carmen Torres', 'Lun-Jue 7:30 AM', 'Pista de Atletismo', 30, 22, 'Todos los niveles', 'Atletismo', 4.7, '$25.000/mes', '90 min', 'bg-accent', true, 'Entrenamiento completo de atletismo: velocidad, resistencia y técnica.'),
('Boxeo Deportivo', 'Prof. Roberto Silva', 'Mar-Jue-Sáb 7:00 PM', 'Sala de Boxeo', 12, 10, 'Intermedio', 'Deportes de Combate', 4.8, '$35.000/mes', '75 min', 'bg-primary', true, 'Técnicas de boxeo deportivo con enfoque en acondicionamiento físico.'),
('Aeróbicos Acuáticos', 'Prof. Patricia Vega', 'Mar-Jue 8:00 AM', 'Piscina Semiolímpica', 20, 17, 'Principiante', 'Deportes Acuáticos', 4.6, '$28.000/mes', '60 min', 'bg-secondary', true, 'Ejercicios aeróbicos en el agua para mejorar la condición física.'),
('Escalada Deportiva', 'Prof. Andrés Rojas', 'Sáb-Dom 10:00 AM', 'Muro de Escalada', 10, 8, 'Intermedio', 'Deportes Extremos', 4.9, '$45.000/mes', '120 min', 'bg-accent', true, 'Aprende técnicas de escalada deportiva en muro artificial con seguridad profesional.'),
('Spinning Avanzado', 'Prof. Mónica Herrera', 'Lun-Mié-Vie 6:00 PM', 'Sala de Spinning', 25, 23, 'Avanzado', 'Fitness', 4.7, '$30.000/mes', '50 min', 'bg-primary', true, 'Clases intensivas de spinning con música motivacional y rutinas desafiantes.');

-- Insert gym schedules for all blocks Monday-Friday
INSERT INTO public.horarios_gym (dia, bloque, hora_inicio, hora_fin) VALUES
('Lunes', 'Bloque 1-2', '08:15:00', '09:25:00'),
('Lunes', 'Bloque 3-4', '09:40:00', '10:50:00'),
('Lunes', 'Bloque 5-6', '11:05:00', '12:15:00'),
('Lunes', 'Bloque 7-8', '12:30:00', '13:40:00'),
('Lunes', 'Bloque 9-10', '14:40:00', '15:50:00'),
('Lunes', 'Bloque 11-12', '16:05:00', '17:15:00'),
('Lunes', 'Bloque 13-14', '17:30:00', '18:40:00'),
('Martes', 'Bloque 1-2', '08:15:00', '09:25:00'),
('Martes', 'Bloque 3-4', '09:40:00', '10:50:00'),
('Martes', 'Bloque 5-6', '11:05:00', '12:15:00'),
('Martes', 'Bloque 7-8', '12:30:00', '13:40:00'),
('Martes', 'Bloque 9-10', '14:40:00', '15:50:00'),
('Martes', 'Bloque 11-12', '16:05:00', '17:15:00'),
('Martes', 'Bloque 13-14', '17:30:00', '18:40:00'),
('Miércoles', 'Bloque 1-2', '08:15:00', '09:25:00'),
('Miércoles', 'Bloque 3-4', '09:40:00', '10:50:00'),
('Miércoles', 'Bloque 5-6', '11:05:00', '12:15:00'),
('Miércoles', 'Bloque 7-8', '12:30:00', '13:40:00'),
('Miércoles', 'Bloque 9-10', '14:40:00', '15:50:00'),
('Miércoles', 'Bloque 11-12', '16:05:00', '17:15:00'),
('Miércoles', 'Bloque 13-14', '17:30:00', '18:40:00'),
('Jueves', 'Bloque 1-2', '08:15:00', '09:25:00'),
('Jueves', 'Bloque 3-4', '09:40:00', '10:50:00'),
('Jueves', 'Bloque 5-6', '11:05:00', '12:15:00'),
('Jueves', 'Bloque 7-8', '12:30:00', '13:40:00'),
('Jueves', 'Bloque 9-10', '14:40:00', '15:50:00'),
('Jueves', 'Bloque 11-12', '16:05:00', '17:15:00'),
('Jueves', 'Bloque 13-14', '17:30:00', '18:40:00'),
('Viernes', 'Bloque 1-2', '08:15:00', '09:25:00'),
('Viernes', 'Bloque 3-4', '09:40:00', '10:50:00'),
('Viernes', 'Bloque 5-6', '11:05:00', '12:15:00'),
('Viernes', 'Bloque 7-8', '12:30:00', '13:40:00'),
('Viernes', 'Bloque 9-10', '14:40:00', '15:50:00'),
('Viernes', 'Bloque 11-12', '16:05:00', '17:15:00'),
('Viernes', 'Bloque 13-14', '17:30:00', '18:40:00');

-- Create trigger to update enrolled count when inscriptions change
CREATE OR REPLACE FUNCTION update_taller_enrolled_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.talleres 
    SET enrolled = enrolled + 1,
        available = CASE WHEN enrolled + 1 >= capacity THEN false ELSE true END
    WHERE id = NEW.taller_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.talleres 
    SET enrolled = enrolled - 1,
        available = true
    WHERE id = OLD.taller_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inscripciones_talleres_update_count
  AFTER INSERT OR DELETE ON public.inscripciones_talleres
  FOR EACH ROW EXECUTE FUNCTION update_taller_enrolled_count();

-- Create trigger to update gym cupos when reservations change
CREATE OR REPLACE FUNCTION update_gym_cupos_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.horarios_gym 
    SET cupos_ocupados = cupos_ocupados + 1
    WHERE id = NEW.horario_gym_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.horarios_gym 
    SET cupos_ocupados = cupos_ocupados - 1
    WHERE id = OLD.horario_gym_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;