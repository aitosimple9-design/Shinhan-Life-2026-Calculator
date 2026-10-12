# Shinhan Life 2026 Calculator

Công cụ ước tính thu nhập & phí dịch vụ cho Đại lý (FC) và Quản lý kinh doanh (SL+/SM+) Shinhan Life 2026.
Stack: React + Vite + Tailwind CSS + Chart.js, đăng nhập và phân quyền bằng Supabase (Auth + bảng `profiles` với RLS).

## Chạy cục bộ

```bash
npm ci
cp .env.example .env.local   # điền VITE_SUPABASE_URL và VITE_SUPABASE_ANON_KEY (publishable key)
npm run dev
```

| Lệnh | Việc |
| :--- | :--- |
| `npm run dev` | Dev server |
| `npm run lint` | oxlint |
| `npm test` | vitest (logic tính toán) |
| `npm run build` | Build production vào `dist/` |

## Cơ sở dữ liệu

Cấu trúc hiện tại: [`supabase/schema_current.md`](supabase/schema_current.md). Migration: `supabase/migrations/`.
Đổi schema → thêm migration mới và cập nhật `schema_current.md`.

## Bảo mật

- Frontend chỉ dùng publishable/anon key. **Không** đưa `service_role` key vào repo hay biến `VITE_*`.
- `.env.local` và mọi file `*.local.*` bị gitignore (chứa dữ liệu nhân viên khi seed tài khoản).
- Người dùng mới dùng mật khẩu mặc định và bị ép đổi ở lần đăng nhập đầu.

## Quy trình đóng góp

Làm trên nhánh riêng → mở Pull Request vào `main` → CI tự chạy → được duyệt → merge. Không push thẳng vào `main`.

CI (`.github/workflows/ci.yml`) gồm 4 job song song: **Lint**, **Test** (vitest: luật FC/SL/SM, bộ điều phối, phân quyền, định dạng tiền), **Build**, **Security** (`npm audit`, chặn commit `.env`/`service_role`). Job **CI passed** gom kết quả. Dependabot (`.github/dependabot.yml`) tự mở PR cập nhật gói hằng tuần. Chạy cục bộ trước khi push: `npm run lint && npm test && npm run build`.

### Cài khóa nhánh `main` (làm 1 lần trên GitHub, quyền admin)

`Settings → Rules → Rulesets → New branch ruleset`, target `main`, bật:

- **Restrict deletions** và **Block force pushes**
- **Require a pull request before merging** (1 approval, *Require review from Code Owners*, *Dismiss stale approvals*)
- **Require status checks to pass** → thêm check **`CI passed`**, bật *Require branches to be up to date*
- **Require conversation resolution before merging**
- Bỏ trống mục *Bypass list* để cả admin cũng phải qua PR
