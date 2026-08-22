create table public.rackets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  brand text not null,
  model text not null,
  year integer,
  racket_type text,
  head_size numeric,
  length numeric,
  weight numeric,
  balance numeric,
  swingweight numeric,
  stiffness numeric,
  beam_width text,
  string_pattern text,
  composition text,
  power_level text,
  swing_speed text,
  stroke_style text,
  price numeric,
  image_url text,
  description text,
  product_url text,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create index rackets_brand_idx on public.rackets (brand);
create index rackets_type_idx on public.rackets (racket_type);
create index rackets_search_idx on public.rackets (lower(brand), lower(model));

grant select on public.rackets to anon;
grant select, insert, update, delete on public.rackets to authenticated;
grant all on public.rackets to service_role;

alter table public.rackets enable row level security;

create type public.app_role as enum ('admin', 'moderator', 'user');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;

alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

create policy "Anyone can read rackets" on public.rackets for select using (true);
create policy "Admins can insert rackets" on public.rackets for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can update rackets" on public.rackets for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "Admins can delete rackets" on public.rackets for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create policy "Users can read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

insert into public.rackets (slug, brand, model, year, racket_type, head_size, length, weight, balance, swingweight, stiffness, beam_width, string_pattern, composition, power_level, swing_speed, stroke_style, price, image_url, description, product_url, is_current) values
('yonex-vcore-98', 'Yonex', 'VCORE 98', 2023, 'Players', 98, 27, 305, 31.5, 320, 65, '23/22/21', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'aggressive-baseliner, all-court', 259, NULL, 'Spin-oriented control frame for players who swing fast and want heavy, dipping shots without giving up plow-through.', 'https://www.yonex.com/tennis/racquets', true),
('yonex-vcore-100', 'Yonex', 'VCORE 100', 2023, 'Tweener', 100, 27, 300, 32, 312, 67, '24/23/22', '16x19', 'Graphite composite', 'High', 'Slow', 'aggressive-baseliner, all-court', 259, NULL, 'Free-swinging spin frame with an accessible weight and a livelier response than the 98.', 'https://www.yonex.com/tennis/racquets', true),
('yonex-ezone-98', 'Yonex', 'EZONE 98', 2025, 'Players', 98, 27, 305, 31.5, 318, 64, '23.5/24/19', '16x19', 'Graphite composite', 'High', 'Slow', 'all-court, aggressive-baseliner', 279, NULL, 'Comfortable all-court frame with a large sweet spot and easy depth for its head size.', 'https://www.yonex.com/tennis/racquets', true),
('yonex-ezone-100', 'Yonex', 'EZONE 100', 2025, 'Tweener', 100, 27, 300, 32, 310, 66, '23.5/26/22', '16x19', 'Graphite composite', 'High', 'Slow', 'all-court, aggressive-baseliner, defensive', 279, NULL, 'Forgiving, comfortable power frame that suits improving players and shorter swings.', 'https://www.yonex.com/tennis/racquets', true),
('yonex-percept-97', 'Yonex', 'PERCEPT 97', 2023, 'Players', 97, 27, 310, 31.5, 322, 62, '21/22/21', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'all-court, serve-volley', 269, NULL, 'Flexible, feel-oriented control frame that rewards long, committed swings and touch at net.', 'https://www.yonex.com/tennis/racquets', true),
('babolat-pure-aero-98', 'Babolat', 'Pure Aero 98', 2023, 'Players', 98, 27, 305, 31.5, 319, 68, '22/23/22', '16x20', 'Graphite composite', 'Medium', 'Moderate', 'aggressive-baseliner', 269, NULL, 'Tighter-patterned Aero built for heavy, controlled spin from aggressive baseliners.', 'https://www.babolat.com/us/tennis/rackets', true),
('babolat-pure-aero-100', 'Babolat', 'Pure Aero', 2023, 'Tweener', 100, 27, 300, 32.5, 316, 70, '23/26/23', '16x19', 'Graphite composite', 'High', 'Slow', 'aggressive-baseliner, all-court', 279, NULL, 'The benchmark spin-and-power frame — huge racket-head speed and a very lively response.', 'https://www.babolat.com/us/tennis/rackets', true),
('babolat-pure-drive', 'Babolat', 'Pure Drive', 2024, 'Tweener', 100, 27, 300, 32, 313, 71, '23/26/23', '16x19', 'Graphite composite', 'High', 'Slow', 'aggressive-baseliner, all-court', 279, NULL, 'Explosive power and easy free depth, especially on serve.', 'https://www.babolat.com/us/tennis/rackets', true),
('babolat-pure-strike-98-16x19', 'Babolat', 'Pure Strike 98 16x19', 2024, 'Players', 98, 27, 305, 31.5, 320, 66, '21/23/21', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'aggressive-baseliner, all-court', 269, NULL, 'Crisp, precise frame with a clean feel and strong directional control.', 'https://www.babolat.com/us/tennis/rackets', true),
('babolat-pure-strike-98-18x20', 'Babolat', 'Pure Strike 98 18x20', 2024, 'Players', 98, 27, 305, 31, 322, 67, '21/23/21', '18x20', 'Graphite composite', 'Medium', 'Moderate', 'all-court, serve-volley', 269, NULL, 'Flat-hitter''s control stick with a tight pattern and very predictable launch.', 'https://www.babolat.com/us/tennis/rackets', true),
('wilson-blade-98-16x19', 'Wilson', 'Blade 98 16x19 v9', 2023, 'Players', 98, 27, 305, 32, 322, 62, '21/21/21', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'all-court, aggressive-baseliner, counterpuncher', 269, NULL, 'Flexible box-beam control frame with plush feel and reliable spin.', 'https://www.wilson.com/en-us/tennis/rackets', true),
('wilson-blade-98-18x20', 'Wilson', 'Blade 98 18x20 v9', 2023, 'Players', 98, 27, 305, 32, 324, 62, '21/21/21', '18x20', 'Graphite composite', 'Low', 'Fast', 'all-court, serve-volley', 269, NULL, 'Dense-pattern Blade for precision hitters who supply their own power.', 'https://www.wilson.com/en-us/tennis/rackets', true),
('wilson-blade-100', 'Wilson', 'Blade 100 v9', 2023, 'Tweener', 100, 27, 300, 32, 312, 64, '22/22/22', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'all-court, counterpuncher', 259, NULL, 'Slightly more forgiving Blade with an easier launch angle and quick handling.', 'https://www.wilson.com/en-us/tennis/rackets', true),
('wilson-pro-staff-97', 'Wilson', 'Pro Staff 97 v14', 2023, 'Players', 97, 27, 315, 31.5, 328, 65, '21.5/21.5/21.5', '16x19', 'Graphite composite', 'Low', 'Fast', 'all-court, serve-volley', 279, NULL, 'Heavy, stable, low-powered precision frame for strong, compact swings.', 'https://www.wilson.com/en-us/tennis/rackets', true),
('wilson-clash-100', 'Wilson', 'Clash 100 v3', 2023, 'Tweener', 100, 27, 295, 32.5, 312, 55, '24.5/24.5/24.5', '16x19', 'Graphite composite', 'High', 'Slow', 'all-court, counterpuncher, defensive', 259, NULL, 'Exceptionally flexible and arm-friendly frame with a soft, forgiving response.', 'https://www.wilson.com/en-us/tennis/rackets', true),
('wilson-ultra-100', 'Wilson', 'Ultra 100 v4', 2023, 'Tweener', 100, 27, 300, 32, 314, 70, '24/26.5/24', '16x19', 'Graphite composite', 'High', 'Slow', 'all-court, serve-volley', 249, NULL, 'Powerful, easy-depth frame that rewards shorter swings and net play.', 'https://www.wilson.com/en-us/tennis/rackets', true),
('head-speed-mp', 'HEAD', 'Speed MP', 2024, 'Tweener', 100, 27, 300, 32, 315, 64, '23/23/23', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'all-court, aggressive-baseliner, counterpuncher', 269, NULL, 'Fast-handling all-court frame that balances control, spin and easy swing speed.', NULL, true),
('head-speed-pro', 'HEAD', 'Speed Pro', 2024, 'Tweener', 100, 27, 310, 31.5, 328, 63, '23/23/23', '18x20', 'Graphite composite', 'Medium', 'Moderate', 'all-court, aggressive-baseliner', 279, NULL, 'Dense-pattern player''s frame combining a 100 head with tight, flat control.', NULL, true),
('head-radical-mp', 'HEAD', 'Radical MP', 2023, 'Tweener', 98, 27, 300, 32, 315, 64, '20/23/21', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'all-court, counterpuncher', 249, NULL, 'Balanced, versatile frame that does most things well without extremes.', NULL, true),
('head-prestige-mp', 'HEAD', 'Prestige MP', 2023, 'Players', 98, 27, 320, 31, 330, 61, '21.5/21.5/21.5', '16x19', 'Graphite composite', 'Low', 'Fast', 'all-court, serve-volley', 269, NULL, 'Traditional heavy control frame with deep feel and huge stability.', NULL, true),
('head-extreme-mp', 'HEAD', 'Extreme MP', 2024, 'Tweener', 100, 27, 300, 32, 316, 66, '23/26/21', '16x19', 'Graphite composite', 'High', 'Slow', 'aggressive-baseliner, all-court', 249, NULL, 'Spin-friendly frame with a high launch angle and modern baseline feel.', NULL, true),
('head-boom-mp', 'HEAD', 'Boom MP', 2024, 'Tweener', 100, 27, 295, 32.5, 310, 63, '23/26/23', '16x19', 'Graphite composite', 'High', 'Slow', 'all-court, counterpuncher, defensive', 239, NULL, 'Light, comfortable and quick — easy power with a soft response.', NULL, true),
('tecnifibre-tf40-305', 'Tecnifibre', 'TF40 305 18x20', 2022, 'Players', 98, 27, 305, 31.5, 322, 64, '21.7/21.7/21.7', '18x20', 'Graphite composite', 'Medium', 'Moderate', 'all-court, serve-volley', 249, NULL, 'Precision-first frame with a comfortable, connected feel on flat drives.', 'https://www.tecnifibre.com/en_us/tennis/racket', false),
('tecnifibre-tfight-300-isoflex', 'Tecnifibre', 'TFight 300 ISOFLEX', 2023, 'Tweener', 98, 27, 300, 32, 315, 65, '22/22/22', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'aggressive-baseliner, all-court', 239, NULL, 'Modern player''s frame with a flexible throat and lively but controlled response.', 'https://www.tecnifibre.com/en_us/tennis/racket', true),
('prince-phantom-100x-18x20', 'Prince', 'Phantom 100X 18x20', 2023, 'Tweener', 100, 27, 305, 31.5, 320, 58, '20/20/20', '18x20', 'Graphite composite', 'Low', 'Fast', 'all-court, serve-volley', 229, NULL, 'Very flexible thin-beam frame with exceptional comfort and touch.', 'https://www.princetennis.com/collections/racquets', true),
('dunlop-cx-200', 'Dunlop', 'CX 200', 2024, 'Players', 98, 27, 305, 31.5, 321, 64, '21.5/21.5/20.5', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'all-court, serve-volley, aggressive-baseliner', 229, NULL, 'Control-oriented frame with a clean, muted feel and dependable placement.', 'https://www.dunlopsports.com/collections/tennis-racquets', true),
('dunlop-fx-500', 'Dunlop', 'FX 500', 2023, 'Tweener', 100, 27, 300, 32, 314, 69, '23/26/23', '16x19', 'Graphite composite', 'High', 'Slow', 'aggressive-baseliner, all-court', 219, NULL, 'Fast, powerful frame with easy depth and a big sweet spot.', 'https://www.dunlopsports.com/collections/tennis-racquets', true),
('yonex-ezone-102', 'Yonex', 'EZONE 102', 2025, 'Game Improvement', 102, 27, 290, 32.5, 308, 66, '24/26/22', '16x19', 'Graphite composite', 'High', 'Slow', 'defensive, counterpuncher, all-court', 269, NULL, 'Oversize, light and forgiving — maximum sweet spot and easy swing speed.', 'https://www.yonex.com/tennis/racquets', true),
('babolat-pure-aero-plus', 'Babolat', 'Pure Aero+', 2023, 'Tweener', 100, 27.5, 300, 33, 330, 70, '23/26/23', '16x19', 'Graphite composite', 'High', 'Slow', 'aggressive-baseliner', 289, NULL, 'Extended-length spin monster for big, looping swings and heavy serves.', 'https://www.babolat.com/us/tennis/rackets', true),
('wilson-shift-99', 'Wilson', 'Shift 99 Pro', 2023, 'Tweener', 99, 27, 315, 31, 322, 60, '22/22/22', '16x20', 'Graphite composite', 'Medium', 'Moderate', 'aggressive-baseliner, counterpuncher', 269, NULL, 'Whippy, flexible frame designed for extreme grips and heavy topspin.', 'https://www.wilson.com/en-us/tennis/rackets', true),
('head-gravity-mp', 'HEAD', 'Gravity MP', 2023, 'Tweener', 100, 27, 305, 31.5, 318, 61, '21/23/21', '16x20', 'Graphite composite', 'Medium', 'Moderate', 'all-court, counterpuncher, defensive', 259, NULL, 'Comfort-oriented control frame with a large, soft sweet spot.', NULL, true),
('yonex-vcore-95', 'Yonex', 'VCORE 95', 2023, 'Players', 95, 27, 310, 31, 322, 63, '22/21/21', '16x20', 'Graphite composite', 'Low', 'Fast', 'aggressive-baseliner, all-court', 259, NULL, 'Small-headed spin-control frame for advanced players with full swings.', 'https://www.yonex.com/tennis/racquets', true),
('wilson-pro-staff-x-100', 'Wilson', 'Pro Staff X 100 v14', 2023, 'Tweener', 100, 27, 315, 31, 325, 66, '21.5/21.5/21.5', '16x19', 'Graphite composite', 'Medium', 'Moderate', 'all-court, serve-volley', 279, NULL, 'Heavier 100 sq in control frame — stability of a player''s stick, bigger sweet spot.', 'https://www.wilson.com/en-us/tennis/rackets', true);