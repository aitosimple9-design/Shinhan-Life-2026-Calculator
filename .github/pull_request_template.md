## Thay đổi gì và vì sao

## Checklist
- [ ] `npm run lint`, `npm test`, `npm run build` đều đạt (CI cũng kiểm tra)
- [ ] Không commit bí mật (`.env.local`, service_role key, dữ liệu nhân viên)
- [ ] Nếu đổi DB: có file trong `supabase/migrations/` và đã cập nhật `supabase/schema_current.md`
- [ ] Đã thử lại luồng FC → SL+ → SM+ nếu đụng tới logic tính toán
