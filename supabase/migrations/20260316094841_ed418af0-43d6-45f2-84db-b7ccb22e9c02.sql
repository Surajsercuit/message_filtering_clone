
-- Fix search_path for generate_unique_code
CREATE OR REPLACE FUNCTION public.generate_unique_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := LPAD(FLOOR(RANDOM() * 10000000000)::BIGINT::TEXT, 10, '0');
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE unique_code = new_code) INTO code_exists;
    IF NOT code_exists THEN
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$;
