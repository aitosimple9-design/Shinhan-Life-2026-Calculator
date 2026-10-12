# Schema hiện tại — `public.profiles`

Nguồn: `supabase/migrations/0001_init_profiles.sql` (migration duy nhất, đã áp dụng). Cập nhật file này mỗi khi thêm migration.

## Cột

| Cột | Kiểu | Null | Mặc định | Ghi chú |
| :--- | :--- | :---: | :--- | :--- |
| `id` | uuid | NO | — | PK, FK → `auth.users(id)` `ON DELETE CASCADE` |
| `employee_code` | text | NO | — | UNIQUE. Mã số đại lý (vd `60004226`) |
| `role` | text | NO | — | Một trong `FC, StarFC, GSL, SSL, ESL, SM, EM, ERM, IRM` |
| `display_name` | text | YES | — | |
| `birth_date` | text | YES | — | Định dạng `dd/mm/yyyy` (CHECK regex). Không phải kiểu `date` |
| `national_id` | text | YES | — | CCCD đầy đủ, đúng 12 chữ số (CHECK `^[0-9]{12}$`). Dữ liệu nhạy cảm |
| `must_change_password` | boolean | NO | `true` | Bật = app ép đổi mật khẩu lần đầu |
| `created_at` | timestamptz | NO | `now()` | |

## Ràng buộc
- PRIMARY KEY (`id`), UNIQUE (`employee_code`), FOREIGN KEY (`id`) → `auth.users(id)` ON DELETE CASCADE
- CHECK `role IN (...)`, CHECK `birth_date ~ dd/mm/yyyy`, CHECK `national_id ~ 12 chữ số`

## RLS
- RLS **bật**.
- Policy duy nhất: `profiles_select_own` — `SELECT` cho `authenticated`, điều kiện `auth.uid() = id`.
- **Không có** policy INSERT/UPDATE/DELETE → chỉ `service_role` (bypass RLS) tạo/sửa được (kể cả `role`).

## Quyền (grants)
- `anon`: không có quyền nào.
- `authenticated`: chỉ `SELECT` trên 5 cột `id, employee_code, role, display_name, must_change_password`. `birth_date` và `national_id` **không đọc được** qua Data API. App phải select đúng các cột này, không dùng `select('*')`.
- `service_role`: toàn quyền.

## Trigger / hàm
- `on_password_changed` — trên `auth.users`, `AFTER UPDATE OF encrypted_password`, gọi `public.clear_must_change_password()`.
- `public.clear_must_change_password()` — `SECURITY DEFINER`, `search_path = ''`. Khi mật khẩu thật sự đổi thì đặt `profiles.must_change_password = false`. `EXECUTE` đã bị thu hồi khỏi `public, anon, authenticated`.
- `public.rls_auto_enable()` — hàm có sẵn của Supabase (không thuộc dự án); `EXECUTE` đã bị thu hồi khỏi `public, anon, authenticated`.
- Lưu ý: mọi lệnh cập nhật `auth.users.encrypted_password` (kể cả băm lại bằng SQL) đều kích hoạt trigger và tắt cờ → phải `update public.profiles set must_change_password = true` sau đó nếu muốn giữ ép đổi.

## Mật khẩu nằm ở đâu
- **Duy nhất** ở `auth.users.encrypted_password` dạng băm **bcrypt cost 10** (`$2a$10$…`, 60 ký tự) — không đảo ngược được. Schema `auth` không expose qua Data API.
- **Không** có mật khẩu dạng rõ trong `profiles`, `user_metadata`, mã nguồn app (`src/`), hay biến môi trường.
- Mật khẩu mặc định (chưa đổi) = `ddmmyy` của `birth_date` + 4 số cuối `national_id` → có thể suy ra từ dữ liệu ở `profiles`, vì vậy `birth_date`/`national_id` chỉ `service_role` đọc được và mật khẩu phải đổi ở lần đăng nhập đầu.
- Script seed `scripts/gen-seed-accounts.local.mjs` (gitignored) chứa ngày sinh + CCCD thô của tài khoản test → xóa sau khi dùng.

## Đăng nhập
- Email nội bộ: `emp<employee_code>@shinhanlife.internal` (xem `src/logic/auth-mapping.js`).
- Mật khẩu mới tối thiểu 8 ký tự (kiểm tra ở `ChangePasswordPage.jsx`).

## Cần bật thủ công trên Dashboard (MCP không cấu hình được)
- Auth → Leaked Password Protection, độ dài mật khẩu tối thiểu ≥ 8.
- Auth → Attack Protection → CAPTCHA.
- Cân nhắc mã hóa cột `national_id` (Vault/pgsodium) trước khi có người dùng thật.
