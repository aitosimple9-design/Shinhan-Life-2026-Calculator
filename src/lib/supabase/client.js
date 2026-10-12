import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] Thiếu VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY. ' +
    'Tạo file .env.local (xem .env.example) rồi khởi động lại `npm run dev`. ' +
    'Đăng nhập sẽ không hoạt động cho đến khi cấu hình xong.'
  );
}

// createClient() throw ngay nếu url/key rỗng — dùng placeholder để module vẫn
// import được (vd: dev preview qua ?debugTitle= không cần Supabase thật),
// các lệnh gọi auth thực tế sẽ tự thất bại một cách an toàn (bắt bằng try/catch
// ở nơi gọi) nếu chưa cấu hình .env.local.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
