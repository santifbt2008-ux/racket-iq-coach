ALTER TABLE public.rackets
  ADD COLUMN IF NOT EXISTS generation text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'current',
  ADD COLUMN IF NOT EXISTS head_size_cm2 numeric,
  ADD COLUMN IF NOT EXISTS weight_unstrung numeric,
  ADD COLUMN IF NOT EXISTS weight_strung numeric,
  ADD COLUMN IF NOT EXISTS balance_points numeric,
  ADD COLUMN IF NOT EXISTS mains integer,
  ADD COLUMN IF NOT EXISTS crosses integer,
  ADD COLUMN IF NOT EXISTS grip_sizes text,
  ADD COLUMN IF NOT EXISTS recommended_tension text,
  ADD COLUMN IF NOT EXISTS control_level text,
  ADD COLUMN IF NOT EXISTS spin_level text,
  ADD COLUMN IF NOT EXISTS comfort_level text,
  ADD COLUMN IF NOT EXISTS maneuverability text,
  ADD COLUMN IF NOT EXISTS recommended_player_level text,
  ADD COLUMN IF NOT EXISTS recommended_play_style text,
  ADD COLUMN IF NOT EXISTS manufacturer_url text,
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_verified boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS incomplete_data boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

UPDATE public.rackets SET
  weight_unstrung = COALESCE(weight_unstrung, weight),
  head_size_cm2 = COALESCE(head_size_cm2, round((head_size * 6.4516)::numeric, 1)),
  mains = COALESCE(mains, NULLIF(split_part(lower(string_pattern), 'x', 1), '')::int),
  crosses = COALESCE(crosses, NULLIF(split_part(lower(string_pattern), 'x', 2), '')::int),
  manufacturer_url = COALESCE(manufacturer_url, product_url),
  status = CASE WHEN is_current THEN 'current' ELSE 'discontinued' END,
  updated_at = now();

UPDATE public.rackets SET incomplete_data = (
  head_size IS NULL OR weight IS NULL OR balance IS NULL OR swingweight IS NULL
  OR stiffness IS NULL OR beam_width IS NULL OR string_pattern IS NULL
  OR composition IS NULL OR image_url IS NULL OR source_url IS NULL
);

CREATE OR REPLACE FUNCTION public.rackets_touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS rackets_set_updated_at ON public.rackets;
CREATE TRIGGER rackets_set_updated_at BEFORE UPDATE ON public.rackets
FOR EACH ROW EXECUTE FUNCTION public.rackets_touch_updated_at();

CREATE UNIQUE INDEX IF NOT EXISTS rackets_identity_uniq
  ON public.rackets (brand, model, COALESCE(generation, ''), COALESCE(year, -1));