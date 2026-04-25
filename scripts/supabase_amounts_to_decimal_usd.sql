begin;

alter table public.expenses
  alter column amount type numeric(12,6) using (amount::numeric / 100.0);

alter table public.budgets
  alter column amount type numeric(12,6) using (amount::numeric / 100.0);

commit;
