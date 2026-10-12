-- 0001_init_profiles: bảng hồ sơ + phân quyền cho đăng nhập Shinhan Life Calculator.
-- Bản gộp cuối cùng. Mô tả nhanh cấu trúc: supabase/schema_current.md.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  employee_code text not null unique,
  role text not null check (role in ('FC','StarFC','GSL','SSL','ESL','SM','EM','ERM','IRM')),
  display_name text,
  birth_date text check (birth_date ~ '^(0[1-9]|[12][0-9]|3[01])/(0[1-9]|1[0-2])/[0-9]{4}$'),  -- dd/mm/yyyy
  national_id text check (national_id ~ '^[0-9]{12}$'),  -- CCCD đầy đủ (nhạy cảm: chỉ service_role đọc được)
  must_change_password boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Chỉ SELECT dòng của chính mình. KHÔNG có policy INSERT/UPDATE/DELETE:
-- chỉ service_role (bypass RLS) mới được tạo/sửa role.
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- Data API: bảng không tự expose. Chỉ cấp SELECT theo cột cho app;
-- birth_date và national_id chỉ service_role đọc được.
-- App phải select đúng các cột này, KHÔNG dùng select('*').
revoke all on public.profiles from anon, authenticated;
grant select (id, employee_code, role, display_name, must_change_password) on public.profiles to authenticated;
grant all on public.profiles to service_role;

-- Cờ must_change_password chỉ tắt khi mật khẩu thật sự bị đổi (client không tự tắt được).
create function public.clear_must_change_password()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.encrypted_password is distinct from old.encrypted_password then
    update public.profiles set must_change_password = false where id = new.id;
  end if;
  return new;
end $$;

revoke execute on function public.clear_must_change_password() from public, anon, authenticated;

create trigger on_password_changed
  after update of encrypted_password on auth.users
  for each row execute function public.clear_must_change_password();

-- Hàm SECURITY DEFINER có sẵn của Supabase (advisor cảnh báo): không cho anon/authenticated gọi qua RPC.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
