# 🦆 Duck Can Fly - Trò Chơi Điều Khiển Bằng Giọng Nói

Trò chơi Flappy Bird phiên bản điều khiển bằng giọng nói. **Hãy nói liên tục để giữ con vịt bay!**

## 🎮 Cách Chơi

1. Mở trình duyệt và truy cập `http://localhost:8000/index.html`
2. Nhấn nút **"Start Game"** và cho phép truy cập microphone
3. **Nói liên tục** để giữ con vịt bay lên
4. **Im lặng** và con vịt sẽ rơi xuống
5. Tránh các ống và cố gắng đạt điểm cao nhất!

### 💡 Mẹo Chơi
- Nói với âm lượng vừa phải (không cần hét)
- Duy trì giọng nói liên tục (đếm số, hát, đọc văn bản)
- Âm lượng lớn hơn = lực nâng mạnh hơn
- Điều chỉnh cài đặt nếu thấy quá khó/dễ

## ⚙️ Hướng Dẫn Chi Tiết Các Thông Số

### 🎤 **Cài Đặt Âm Thanh (Audio Settings)**

#### **Silence Threshold** (Ngưỡng Im Lặng)
- **Giá trị**: -80 đến -20 dB
- **Mặc định**: -50 dB
- **Công dụng**: Xác định mức âm thanh nào được coi là "im lặng"
- **Giải thích**:
  - Khi âm lượng **thấp hơn** ngưỡng này → Con vịt rơi nhanh
  - Khi âm lượng **cao hơn** ngưỡng này → Con vịt được nâng lên
- **Tại sao cần**: Để phân biệt khi bạn đang nói hay đang im lặng
- **Khi nào điều chỉnh**:
  - Nếu con vịt rơi ngay cả khi bạn đang nói → **Giảm giá trị** (ví dụ: -55 dB)
  - Nếu con vịt bay ngay cả khi bạn im lặng → **Tăng giá trị** (ví dụ: -45 dB)
  - Môi trường ồn → Tăng giá trị để tránh nhiễu
  - Môi trường yên tĩnh → Giảm giá trị để nhạy hơn

#### **Min Volume for Lift** (Âm Lượng Tối Thiểu Để Nâng)
- **Giá trị**: -80 đến -20 dB
- **Mặc định**: -45 dB
- **Công dụng**: Mức âm lượng tối thiểu cần thiết để tạo lực nâng
- **Giải thích**:
  - Khi âm lượng **thấp hơn** giá trị này → Không có lực nâng (con vịt rơi)
  - Khi âm lượng **cao hơn** giá trị này → Bắt đầu có lực nâng
  - Càng lớn tiếng → Lực nâng càng mạnh (lên đến maxLift)
- **Tại sao cần**: Để tránh tiếng ồn nhỏ cũng làm vịt bay
- **Khi nào điều chỉnh**:
  - Giọng nói nhỏ → **Giảm giá trị** (ví dụ: -50 dB)
  - Muốn phải nói to hơn → **Tăng giá trị** (ví dụ: -40 dB)

#### **Smoothing Factor** (Hệ Số Làm Mượt)
- **Giá trị**: 0 đến 0.99
- **Mặc định**: 0.8
- **Công dụng**: Làm mượt tín hiệu âm thanh
- **Giải thích**:
  - **Giá trị cao (0.8-0.9)**: Phản ứng chậm nhưng ổn định, mượt mà
  - **Giá trị thấp (0.1-0.5)**: Phản ứng nhanh nhưng giật, nhạy cảm
- **Tại sao cần**: Để tránh con vịt giật cục do âm thanh biến động
- **Khi nào điều chỉnh**:
  - Con vịt bay giật cục → **Tăng giá trị** (0.85-0.95)
  - Muốn phản ứng nhanh hơn → **Giảm giá trị** (0.6-0.7)

---

### 🪶 **Cài Đặt Vật Lý (Physics Settings)**

#### **Gravity** (Trọng Lực)
- **Giá trị**: 0.1 đến 2
- **Mặc định**: 0.5
- **Đơn vị**: Pixel/frame²
- **Công dụng**: Lực kéo con vịt xuống liên tục
- **Giải thích**:
  - **Cao**: Con vịt rơi nhanh, khó chơi
  - **Thấp**: Con vịt rơi chậm, dễ chơi hơn
- **Tại sao cần**: Tạo độ khó và cảm giác chân thực
- **Khi nào điều chỉnh**:
  - Quá khó → **Giảm xuống 0.3-0.4**
  - Quá dễ → **Tăng lên 0.6-0.8**

#### **Base Lift Force** (Lực Nâng Cơ Bản)
- **Giá trị**: 0.5 đến 5
- **Mặc định**: 2
- **Công dụng**: Lực nâng tối thiểu khi bắt đầu nói
- **Giải thích**:
  - Khi bạn nói với âm lượng thấp → Lực nâng = Base Lift
  - Khi bạn nói to hơn → Lực nâng tăng dần đến Max Lift
- **Tại sao cần**: Đảm bảo ngay cả khi nói nhỏ, vịt vẫn bay được
- **Khi nào điều chỉnh**:
  - Nói nhỏ mà vịt rơi → **Tăng lên 2.5-3**
  - Vịt bay quá cao ngay cả khi nói nhỏ → **Giảm xuống 1.5**

#### **Max Lift Force** (Lực Nâng Tối Đa)
- **Giá trị**: 2 đến 10
- **Mặc định**: 4.5
- **Công dụng**: Lực nâng tối đa khi nói to nhất
- **Giải thích**:
  - Giới hạn lực nâng để tránh vịt bay quá cao
  - Tạo skill cap: phải điều chỉnh âm lượng chứ không chỉ hét
- **Tại sao cần**: Cân bằng gameplay
- **Khi nào điều chỉnh**:
  - Muốn vịt bay cao nhanh → **Tăng lên 5-7**
  - Muốn kiểm soát tốt hơn → **Giảm xuống 3.5-4**

#### **Fall Multiplier (Silence)** (Hệ Số Rơi Khi Im Lặng)
- **Giá trị**: 1 đến 5
- **Mặc định**: 2
- **Công dụng**: Nhân trọng lực khi im lặng
- **Giải thích**:
  - Khi im lặng → Gravity × Fall Multiplier
  - **Ví dụ**: Gravity = 0.5, Fall Multiplier = 2 → Rơi với lực 1.0 khi im lặng
  - Giá trị = 1 → Rơi bình thường
  - Giá trị = 3 → Rơi gấp 3 lần khi im lặng
- **Tại sao cần**: Tạo hình phạt khi không nói, tăng độ khó
- **Khi nào điều chỉnh**:
  - Muốn tha thứ khi dừng nói → **Giảm xuống 1.5**
  - Muốn ép phải nói liên tục → **Tăng lên 2.5-3**

#### **Max Velocity Up** (Vận Tốc Tối Đa Lên)
- **Giá trị**: 2 đến 15
- **Mặc định**: 8
- **Đơn vị**: Pixel/frame
- **Công dụng**: Giới hạn tốc độ bay lên tối đa
- **Giải thích**:
  - Ngăn vịt bay lên quá nhanh
  - Tạo cảm giác chuyển động mượt mà, chân thực
- **Tại sao cần**: Tránh gameplay bị vỡ
- **Khi nào điều chỉnh**:
  - Vịt bay lên quá chậm → **Tăng lên 10-12**
  - Muốn chuyển động mượt hơn → **Giảm xuống 6-7**

#### **Max Velocity Down** (Vận Tốc Tối Đa Xuống)
- **Giá trị**: 2 đến 15
- **Mặc định**: 10
- **Công dụng**: Giới hạn tốc độ rơi tối đa
- **Giải thích**:
  - Ngăn vịt rơi quá nhanh → Dễ phản ứng hơn
- **Tại sao cần**: Tránh game over quá đột ngột
- **Khi nào điều chỉnh**:
  - Vịt rơi quá nhanh → **Giảm xuống 7-8**
  - Muốn thách thức hơn → **Tăng lên 12-13**

#### **Velocity Dampening** (Giảm Chấn Vận Tốc)
- **Giá trị**: 0.8 đến 0.99
- **Mặc định**: 0.92
- **Công dụng**: Làm chậm vận tốc dần theo thời gian
- **Giải thích**:
  - Mỗi frame, vận tốc được nhân với giá trị này
  - **0.90**: Vận tốc giảm nhanh → Chuyển động rất mượt nhưng cần input liên tục
  - **0.99**: Vận tốc giảm chậm → Vịt "trôi" nhiều hơn
  - Càng gần 1 → Vịt càng giữ quán tính
- **Tại sao cần**: Tạo cảm giác bay tự nhiên, không giật cục
- **Khi nào điều chỉnh**:
  - Vịt bay quá trơn tru, khó kiểm soát → **Giảm xuống 0.88-0.90**
  - Muốn cảm giác "trôi" nhiều hơn → **Tăng lên 0.94-0.96**

---

### 🎮 **Cài Đặt Trò Chơi (Game Settings)**

#### **Pipe Gap** (Khoảng Hở Ống)
- **Giá trị**: 100 đến 300 pixels
- **Mặc định**: 180 pixels
- **Công dụng**: Khoảng cách giữa ống trên và ống dưới
- **Giải thích**:
  - **Nhỏ (120-150)**: Rất khó, phải điều khiển chính xác
  - **Vừa (170-200)**: Độ khó cân bằng
  - **Lớn (220-280)**: Dễ chơi, phù hợp người mới
- **Tại sao cần**: Điều chỉnh độ khó
- **Khi nào điều chỉnh**:
  - Quá khó vượt ống → **Tăng lên 200-220**
  - Quá dễ → **Giảm xuống 150-160**

#### **Pipe Speed** (Tốc Độ Ống)
- **Giá trị**: 1 đến 8
- **Mặc định**: 3
- **Đơn vị**: Pixel/frame
- **Công dụng**: Tốc độ di chuyển của ống sang trái
- **Giải thích**:
  - **Chậm (1-2)**: Nhiều thời gian phản ứng
  - **Vừa (3-4)**: Cân bằng
  - **Nhanh (5-7)**: Rất khó, cần phản xạ tốt
- **Tại sao cần**: Điều chỉnh nhịp độ game
- **Khi nào điều chỉnh**:
  - Quá chậm, nhàm chán → **Tăng lên 4-5**
  - Quá nhanh, không kịp xử lý → **Giảm xuống 2-2.5**

#### **Pipe Spacing** (Khoảng Cách Giữa Các Ống)
- **Giá trị**: 150 đến 400 pixels
- **Mặc định**: 250 pixels
- **Công dụng**: Khoảng cách ngang giữa các cặp ống
- **Giải thích**:
  - **Gần nhau (150-200)**: Liên tục phải vượt ống, căng thẳng
  - **Xa nhau (300-400)**: Nhiều thời gian nghỉ giữa các ống
- **Tại sao cần**: Điều chỉnh mật độ chướng ngại vật
- **Khi nào điều chỉnh**:
  - Ống xuất hiện quá dày → **Tăng lên 300-350**
  - Quá ít ống, nhàm chán → **Giảm xuống 200-220**

#### **Duck Size** (Kích Thước Vịt)
- **Giá trị**: 15 đến 40 pixels
- **Mặc định**: 25 pixels
- **Công dụng**: Bán kính va chạm của con vịt
- **Giải thích**:
  - **Nhỏ (15-20)**: Dễ xuyên qua khe hẹp, khó nhìn
  - **Vừa (23-28)**: Cân bằng tốt
  - **Lớn (30-40)**: Dễ nhìn nhưng dễ va chạm
- **Tại sao cần**: Điều chỉnh độ khó va chạm
- **Khi nào điều chỉnh**:
  - Vịt quá to, dễ chạm ống → **Giảm xuống 20-22**
  - Vịt quá nhỏ, khó nhìn → **Tăng lên 28-30**

---

## 🎯 Các Tổ Hợp Cài Đặt Gợi Ý

### **Chế Độ Dễ (Easy Mode)**
Phù hợp cho người mới bắt đầu:
```
Audio:
- Silence Threshold: -55 dB (nhạy hơn)
- Min Volume: -50 dB (dễ kích hoạt)
- Smoothing: 0.85 (mượt mà)

Physics:
- Gravity: 0.3 (rơi chậm)
- Base Lift: 2.5 (nâng dễ)
- Max Lift: 5 (bay cao nhanh)
- Fall Multiplier: 1.5 (ít hình phạt)
- Max Velocity Down: 7 (rơi chậm)
- Dampening: 0.93 (trôi nhiều)

Game:
- Pipe Gap: 220 (khe rộng)
- Pipe Speed: 2.5 (chậm)
- Pipe Spacing: 300 (thưa)
- Duck Size: 22 (nhỏ hơn)
```

### **Chế Độ Chuẩn (Normal Mode)**
Cài đặt mặc định - cân bằng:
```
Audio:
- Silence Threshold: -50 dB
- Min Volume: -45 dB
- Smoothing: 0.8

Physics:
- Gravity: 0.5
- Base Lift: 2
- Max Lift: 4.5
- Fall Multiplier: 2
- Max Velocity Up: 8
- Max Velocity Down: 10
- Dampening: 0.92

Game:
- Pipe Gap: 180
- Pipe Speed: 3
- Pipe Spacing: 250
- Duck Size: 25
```

### **Chế Độ Khó (Hard Mode)**
Thử thách cao:
```
Audio:
- Silence Threshold: -45 dB (khó kích hoạt)
- Min Volume: -40 dB (phải nói to)
- Smoothing: 0.75 (phản ứng nhanh)

Physics:
- Gravity: 0.7 (rơi nhanh)
- Base Lift: 1.5 (khó nâng)
- Max Lift: 3.5 (bay chậm)
- Fall Multiplier: 2.5 (phạt nặng)
- Max Velocity Down: 12 (rơi rất nhanh)
- Dampening: 0.90 (ít quán tính)

Game:
- Pipe Gap: 150 (khe hẹp)
- Pipe Speed: 4.5 (nhanh)
- Pipe Spacing: 200 (dày)
- Duck Size: 28 (to, dễ chạm)
```

---

## 🚀 Hướng Dẫn Cài Đặt và Chạy

### **Yêu Cầu**
- Python 3.7+ đã cài đặt
- Trình duyệt hiện đại (Chrome, Firefox, Edge, Safari)
- Microphone hoạt động tốt

### **Cách 1: Chạy Trực Tiếp (Khuyến Nghị)**
```bash
# Mở terminal/command prompt tại thư mục dự án
cd /path/to/Chunks-duck-can-fly-1025-v0

# Chạy server
python -m http.server 8000

# Mở trình duyệt và truy cập:
# http://localhost:8000/index.html
```

### **Cách 2: Sử Dụng Live Server (VS Code)**
1. Cài extension "Live Server" trong VS Code
2. Chuột phải vào `index.html`
3. Chọn "Open with Live Server"

---

## 🎨 Chức Năng Fullscreen

### **Cách Sử Dụng**
- Nhấn nút **⛶** (góc dưới bên phải) để vào chế độ toàn màn hình
- Nhấn nút **⤷** hoặc phím **ESC** để thoát
- Canvas sẽ tự động điều chỉnh kích thước và tỉ lệ

### **Lợi Ích**
- Trải nghiệm chơi game tập trung hơn
- Canvas lớn hơn → Dễ nhìn, dễ chơi
- Tự động ẩn bảng cài đặt khi fullscreen

### **Lưu Ý**
- Vị trí vịt và ống được điều chỉnh tỉ lệ tự động
- Có thể bật fullscreen ngay từ màn hình bắt đầu
- Hỗ trợ tất cả trình duyệt hiện đại

---

## 🔧 Xử Lý Sự Cố

### **Microphone không hoạt động**
- Kiểm tra quyền truy cập microphone trong trình duyệt
- Thử trình duyệt khác (Chrome thường hoạt động tốt nhất)
- Đảm bảo microphone được cắm và hoạt động

### **Con vịt không phản ứng với giọng nói**
- Kiểm tra chỉ báo "Voice Level" (góc trên bên trái)
- Điều chỉnh "Silence Threshold" thấp hơn
- Thử nói to hơn hoặc gần micro hơn
- Giảm "Min Volume for Lift"

### **Con vịt bay giật cục**
- Tăng "Smoothing Factor" lên 0.85-0.9
- Tăng "Velocity Dampening" lên 0.93-0.95
- Kiểm tra CPU có bị quá tải không

### **Quá khó/dễ**
- Xem phần "Các Tổ Hợp Cài Đặt Gợi Ý" ở trên
- Điều chỉnh từng thông số một để tìm độ khó phù hợp
- Nhấn "Reset to Defaults" để về cài đặt gốc

### **Fullscreen không hoạt động**
- Thử phím F11 (fullscreen toàn trình duyệt)
- Một số trình duyệt yêu cầu tương tác người dùng trước
- Kiểm tra trình duyệt có hỗ trợ Fullscreen API không

---

## 📝 Ghi Chú Kỹ Thuật

### **Công Nghệ Sử Dụng**
- **HTML5 Canvas**: Render đồ họa 2D
- **Web Audio API**: Phân tích âm thanh real-time
- **AnalyserNode**: Tính dB từ tín hiệu micro
- **RequestAnimationFrame**: Game loop 60 FPS
- **Fullscreen API**: Chế độ toàn màn hình

### **Công Thức Vật Lý**
```javascript
// Mỗi frame:
if (isSpeaking) {
    // Tính lực nâng dựa trên volume
    volumeNormalized = (currentVolume - minVolume) / (maxVolume - minVolume)
    liftForce = baseLift + (maxLift - baseLift) × volumeNormalized
    velocity -= liftForce
} else {
    // Áp dụng trọng lực tăng cường khi im lặng
    velocity += gravity × fallMultiplier
}

// Luôn áp dụng trọng lực cơ bản
velocity += gravity

// Làm chậm vận tốc
velocity × = dampening

// Giới hạn vận tốc
velocity = clamp(velocity, -maxVelocityUp, maxVelocityDown)

// Cập nhật vị trí
duck.y += velocity
```

### **Tính dB từ Microphone**
```javascript
analyser.getByteFrequencyData(dataArray)
rms = sqrt(sum(dataArray²) / length)
dB = 20 × log10(rms / 255)
```

---

## 🎓 Học Tập và Phát Triển

### **Ý Tưởng Mở Rộng**
1. **Nhiều chế độ chơi**: Endless, Time Attack, Challenge
2. **Bảng xếp hạng**: Lưu điểm cao nhất
3. **Power-ups**: Shield, Score Multiplier, Slow Motion
4. **Skin customization**: Đổi hình dạng, màu sắc vịt
5. **Multiplayer**: Thi đấu với bạn bè
6. **Thống kê**: Phân tích thời gian nói, độ ổn định giọng

### **Tùy Chỉnh Code**
- File `config.js`: Thay đổi cấu hình mặc định
- File `game.js`: Logic game chính
- File `styles.css`: Giao diện và màu sắc
- File `index.html`: Cấu trúc HTML

---

## 📜 Giấy Phép

Dự án mã nguồn mở - thoải mái sử dụng và chỉnh sửa!

---

## 🙏 Đóng Góp

Nếu tìm thấy lỗi hoặc có ý tưởng cải thiện, hãy tạo Issue hoặc Pull Request!

---

**Chúc bạn chơi game vui vẻ! 🦆✨**

*Hãy nhớ: Điều quan trọng không phải là bạn nói gì, mà là bạn nói liên tục!*
