# TerraLab · Địa lí 10

Không gian học và khám phá Địa lí 10 Kết nối tri thức, Bài 2–18. Bản demo dự thi gồm lý thuyết Việt–Anh, hoạt động trực quan 2D/3D, tự luyện, lưu tiến độ và quản trị học liệu.

## Mở trên máy hiện tại

Nhấp đúp **Mo_TerraLab.cmd**, giữ cửa sổ đó mở và truy cập **http://127.0.0.1:5173**. Nếu máy chủ đã chạy, dùng địa chỉ hiện có. Học sinh tự đăng ký bằng tên đăng nhập và mật khẩu, không cần email.

Tài khoản quản trị và người duyệt nằm trong tệp riêng **outputs/TAI_KHOAN_DEMO.txt**. Vào mục Quản trị sau khi đăng nhập. Lưu bản nháp → gửi duyệt → đăng nhập người duyệt khác người soạn → phát hành. Muốn khôi phục học liệu cũ: mở phiên bản đã lưu trữ, lưu thành bản nháp mới và duyệt lại.

## Cài trên máy khác

Cần Node.js từ 22.13 và npm. Chạy npm ci, sau đó npm run build. Áp dụng migration local rồi chạy npm run dev:

    node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_gorgeous_captain_midlands.sql

Để tạo tài khoản quản trị local lần đầu: chạy node scripts/demo-accounts.mjs --configure-only, khởi động máy chủ và chạy node scripts/demo-accounts.mjs. Mã thiết lập tự sinh trong .dev.vars; chỉ có hiệu lực trước khi tồn tại quản trị viên đầu tiên. Không đưa các tệp môi trường hoặc tài khoản vào Git.

## Kiểm tra

    npx tsc --noEmit
    node scripts/test-models.mjs
    node scripts/test-api.mjs
    node scripts/test-admin.mjs

Hai kiểm thử API cần máy chủ local đang chạy; kiểm thử quản trị cần tài khoản demo. Kiểm thử quản trị tạo phiên bản rồi phục hồi nội dung ban đầu qua quy trình duyệt. Dữ liệu local được lưu trong .wrangler/state; giữ thư mục này nếu cần giữ tài khoản và lịch sử.

## Phạm vi và dữ liệu

17 bài · 102 mô-đun · 72 cụm lý thuyết · 170 câu cơ sở. Các câu mở chưa có xác nhận của giáo viên giữ trạng thái chờ; điểm tự đánh giá không thay thế điểm xác nhận. Một số câu số liệu được chấm theo quy tắc giá trị/đơn vị.

Học liệu tự biên soạn đang chờ đối chiếu sách. Các bộ số liệu minh họa và mô hình giản lược có nhãn ngay trong hoạt động. Chưa có quản lý lớp học, chấm thủ công của giáo viên hay ngân hàng mở rộng 340 câu. Bản local và trực tuyến lưu dữ liệu riêng.

Ứng dụng dùng React, TypeScript, Vinext/Vite, Three.js và Cloudflare D1/Drizzle. Phông chữ và đường bờ được lưu cùng ứng dụng; xem NOTICE.md. Bản trực tuyến dùng quy trình Sites và giữ quyền truy cập riêng của chủ sở hữu.
