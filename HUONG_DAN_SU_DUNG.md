# HƯỚNG DẪN SỬ DỤNG - DUCK CAN FLY GAME

## 📋 Tổng quan
Game này giúp luyện tập kỹ năng nói tiếng Anh bằng cách theo dõi độ trôi chảy khi đọc câu.

---

## 🎯 Cách sử dụng Game

### 1. Khởi động Game
- Mở file `frontend.html` trong trình duyệt
- Cho phép quyền truy cập microphone khi được yêu cầu
- Game sẽ tự động load câu đầu tiên từ file `backend/sample_sentences.csv`

### 2. Chơi Game
- **Bắt đầu:** Nhấn nút **"Start Game"** hoặc nhấn phím **SPACEBAR**
- **Nói:** Đọc to câu được hiển thị
- **Kết thúc:** Nhấn nút **"Stop Game"** hoặc nhấn phím **SPACEBAR** lần nữa
- **Xem kết quả:** Popup sẽ hiển thị điểm số và phân tích chi tiết

### 3. Các phím tắt
- **SPACEBAR:** Bắt đầu/Dừng game
- **ESC:** Ẩn/Hiện bảng điều khiển
- **F:** Bật/Tắt chế độ toàn màn hình

### 4. Cài đặt
- **Volume Threshold:** Điều chỉnh độ nhạy microphone (mặc định: 60 dB)
  - 50-60 dB: Giọng nhỏ
  - 60-70 dB: Giọng bình thường (khuyến nghị)
  - 70+ dB: Giọng to

- **Pause Threshold:** Thời gian im lặng trước khi tính là dừng (mặc định: 0.5s)
  - 0.5s: Phản ứng nhanh (khuyến nghị)
  - 1.0s: Tốc độ nói bình thường
  - 1.5s+: Tốc độ nói chậm

---

## 📊 Chỉ số đánh giá

### Fluency Score (Điểm trôi chảy)
- **90-100:** Xuất sắc - Nói rất trôi chảy
- **75-89:** Tốt - Nói khá tốt
- **60-74:** Trung bình - Cần cải thiện
- **< 60:** Cần luyện tập thêm

### Các chỉ số khác
- **Total Duration:** Tổng thời gian nói
- **Time to First Pause:** Thời gian từ khi bắt đầu đến lần dừng đầu tiên
- **Volume Consistency:** Độ ổn định âm lượng
- **Speech Rate (WPS):** Tốc độ nói (từ/giây)
- **Pause Count:** Số lần dừng
- **Average Pause Time:** Thời gian dừng trung bình

---

## 🔧 CẤU HÌNH NÂNG CAO (Dành cho Admin)

### Hiện/Ẩn các thành phần đã ẩn

Hiện tại, các thành phần sau đã được ẩn đi:
1. **Progress Bar** (Thanh tiến độ)
2. **File Upload** (Tải file CSV)
3. **WPM Info Button** (Nút thông tin WPM)

Selector câu đã bị **KHÓA** (không thể chọn câu khác, chỉ hiển thị câu đầu tiên)

---

### Cách BỎ ẨN các thành phần

Mở file `frontend.html` và tìm các dòng sau để chỉnh sửa:

#### 1. BỎ ẨN PROGRESS BAR (Thanh tiến độ)

**Tìm dòng ~575:**
```html
<div class="progress-container" style="display: none;">
```

**Thay đổi thành:**
```html
<div class="progress-container">
```

---

#### 2. BỎ ẨN FILE UPLOAD (Tải file CSV)

**Tìm dòng ~595:**
```html
<div class="file-upload" style="display: none;">
```

**Thay đổi thành:**
```html
<div class="file-upload">
```

---

#### 3. BỎ ẨN WPM INFO BUTTON (Nút thông tin WPM)

**Tìm dòng ~646:**
```html
<div class="button-group" style="display: none;">
```

**Thay đổi thành:**
```html
<div class="button-group">
```

---

#### 4. MỞ KHÓA SENTENCE SELECTOR (Cho phép chọn câu)

**Tìm dòng ~605:**
```html
<select id="sentenceSelect" disabled style="pointer-events: none; opacity: 0.6;">
```

**Thay đổi thành:**
```html
<select id="sentenceSelect">
```

**Và tìm dòng ~968 và ~1009:**
```javascript
select.disabled = true; // ✅ BLOCKED: Cannot change sentence
```

**Thay đổi thành:**
```javascript
select.disabled = false; // ✅ ENABLED: Can change sentence
```

---

### Cách CẬP NHẬT DANH SÁCH CÂU

Để thay đổi danh sách câu:

1. Mở file **`backend/sample_sentences.csv`**
2. Chỉnh sửa theo định dạng:
   ```csv
   id,sentence
   1,"Câu tiếng Anh thứ nhất"
   2,"Câu tiếng Anh thứ hai"
   3,"Câu tiếng Anh thứ ba"
   ```
3. Lưu file
4. Refresh trang web

**Lưu ý:**
- Cột `id` phải là số nguyên duy nhất
- Cột `sentence` chứa câu tiếng Anh (có thể có dấu ngoặc kép)
- File phải có header: `id,sentence`

---

## 🔊 Âm thanh kết quả

- **Điểm ≥ 80:** Phát nhạc chiến thắng (`winner.mp3`)
- **Điểm < 80:** Phát nhạc game over (`gameover.mp3`)

Các file âm thanh phải được đặt cùng thư mục với `frontend.html`:
- `winner.mp3`
- `gameover.mp3`

---

## 📁 Cấu trúc thư mục

```
DCF/
├── frontend.html          # File game chính
├── winner.mp3            # Âm thanh chiến thắng
├── gameover.mp3          # Âm thanh thua cuộc
├── backend/
│   └── sample_sentences.csv  # Danh sách câu
└── HUONG_DAN_SU_DUNG.md  # File này
```

---

## ❓ Xử lý sự cố

### Microphone không hoạt động
- Kiểm tra quyền truy cập microphone trong trình duyệt
- Refresh trang và cho phép lại quyền truy cập

### Không load được câu
- Kiểm tra file `backend/sample_sentences.csv` có tồn tại không
- Kiểm tra định dạng file CSV có đúng không

### Âm thanh không phát
- Kiểm tra file `winner.mp3` và `gameover.mp3` có tồn tại không
- Nhấn nút "Start Game" trước để mở khóa audio (browser policy)

### File audio không lưu
- Kiểm tra backend server có đang chạy không
- Kiểm tra folder `/record` có tồn tại không (backend sẽ tự tạo)
- Xem console log để kiểm tra lỗi
- **Kiểm tra Console:**
  - Mở Developer Tools (F12)
  - Tab Console: Xem log frontend
  - Tab Network: Xem request/response từ backend
- **Kiểm tra Backend Log:**
  - File audio sẽ được download tự động về máy (để kiểm tra)
  - Backend sẽ in log chi tiết về việc lưu file
  - File sẽ được lưu vào `DCF/record/rec_YYYYMMDD_HHMMSS.webm`

---

## 📞 Hỗ trợ

Nếu có vấn đề khác, vui lòng kiểm tra:
1. Console log trong trình duyệt (F12 > Console)
2. Network tab để xem lỗi kết nối (F12 > Network)

---

**Phiên bản:** 2.0
**Ngày cập nhật:** 2025-01-11
