-- Fix security warnings by adding search_path to trigger functions
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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

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
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;