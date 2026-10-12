# Workflow & Regression Guard V2

Dựa trên nguyên lý của **Martin Fowler** và **Kent C. Dodds**.

## 1. Nguyên Tắc Bảo Toàn Hồi Quy 4 Bước (Martin Fowler)

**Trước khi sửa bất kỳ file nào**, AI PHẢI thực hiện đủ 4 bước sau:

| Bước | Hành động | Mục tiêu |
| :---: | :--- | :--- |
| **1. Phân tích** | Đọc toàn bộ file liên quan trước khi code. Trace dependency: HTML → CSS → JS. | Không sửa "mù". |
| **2. Kiểm tra phủ** | Xác định các ID/class/function hiện tại sẽ bị ảnh hưởng bởi thay đổi mới. | Không vô tình break logic khác. |
| **3. Thực thi phân lập** | Chỉ sửa 1 cụm chức năng mỗi lần. Không refactor toàn bộ file trong 1 thao tác. | Dễ rollback nếu lỗi. |
| **4. Kiểm chứng hồi quy** | Sau khi sửa, mô phỏng lại các user flow cũ (chuyển tab FC→SL→SM, bật/tắt checkbox, nhập số lớn). | Không có tính năng cũ nào bị vỡ. |

## 2. Kiểm Thử Giao Diện & Logic (Kent C. Dodds)

> *"Viết test. Không quá nhiều. Tập trung vào integration."*

### Luồng người dùng cần kiểm tra bắt buộc:
1. Chuyển tab giữa 3 nhóm: **FC → SL+ → SM+**.
2. Bật/Tắt toggle **"Có phát sinh cá nhân"** với cấp SL/SM.
3. Thay đổi K2 từ `50% → 80% → 120%` — xem thưởng thay đổi đúng không.
4. Thay đổi tháng hoạt động giữa các mốc quan trọng (M1 → M9 → M12+ cho GSL).
5. Nhập số tiền rất lớn (10.000.000.000 VNĐ) — kiểm tra format không bị lỗi.

### Các loại lỗi được coi là BLOCKERS (phải fix trước khi tiếp tục):
- Layout bị vỡ / div tràn ra ngoài.
- Grid/Flex bị mất cấu trúc do thiếu thẻ đóng `</div>`.
- Số kết quả tính toán hiển thị `NaN`, `undefined`, hoặc `0` sai.
- Nút chọn cấp bậc không highlight đúng khi active.

## 3. Nguyên Tắc Fail-Fast (BỔ SUNG V2)
- **Input số âm hoặc không hợp lệ**: Clamp về 0, không throw Error.
- **Tháng không hợp lệ**: Fallback về tháng đầu tiên của nhóm đang hiển thị.
- **State thiếu key**: Mọi key trong `state` phải có giá trị mặc định khi khởi tạo.
- **DOM element không tìm thấy**: Dùng `if (el)` guard trước mọi thao tác DOM.

## 4. Báo Cáo Sau Mỗi Lần Sửa (BỔ SUNG V2)

**Sau khi hoàn tất bất kỳ thay đổi nào**, AI PHẢI trình bày một bảng báo cáo cho người dùng gồm các cột:

| File đã sửa | Chỗ sửa là gì | Việc cần làm để hệ thống cập nhật |
| :--- | :--- | :--- |

- Cột "Chỗ sửa là gì": mô tả ngắn gọn thay đổi (không dán lại toàn bộ diff).
- Cột "Việc cần làm để hệ thống cập nhật": nêu rõ hành động cần thiết để thấy thay đổi, ví dụ:
  - Dev server (`npm run dev`) đang chạy → tự động Hot Module Reload (HMR), chỉ cần lưu file / reload trình duyệt nếu không tự cập nhật.
  - Chưa chạy dev server → cần chạy `npm run dev` để xem trên `localhost`.
  - Có sửa `package.json` / thêm dependency → cần chạy `npm install` trước khi `npm run dev`.
  - Chuẩn bị deploy → cần chạy `npm run build`.
- Báo cáo này áp dụng cho **mọi lần sửa file** trong dự án, không riêng gì 1 tác vụ cụ thể.
