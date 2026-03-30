
-- Savings goals table
CREATE TABLE public.savings_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  target_amount numeric NOT NULL DEFAULT 0,
  current_amount numeric NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT '🎯',
  color text NOT NULL DEFAULT 'hsl(217, 91%, 60%)',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.savings_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own savings" ON public.savings_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own savings" ON public.savings_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own savings" ON public.savings_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own savings" ON public.savings_goals FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_savings_goals_updated_at BEFORE UPDATE ON public.savings_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Investments table
CREATE TABLE public.investments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'stocks',
  balance numeric NOT NULL DEFAULT 0,
  returns numeric NOT NULL DEFAULT 0,
  growth numeric NOT NULL DEFAULT 0,
  icon text NOT NULL DEFAULT '📈',
  color text NOT NULL DEFAULT 'hsl(142, 71%, 45%)',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investments" ON public.investments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investments" ON public.investments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investments" ON public.investments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investments" ON public.investments FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON public.investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Car expenses table
CREATE TABLE public.car_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL DEFAULT 'fuel',
  amount numeric NOT NULL DEFAULT 0,
  date timestamptz NOT NULL DEFAULT now(),
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.car_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own car expenses" ON public.car_expenses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own car expenses" ON public.car_expenses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own car expenses" ON public.car_expenses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own car expenses" ON public.car_expenses FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_car_expenses_updated_at BEFORE UPDATE ON public.car_expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
