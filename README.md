# TerraLab · Địa lí 10

Không gian học và khám phá Địa lí 10 Kết nối tri thức, Bài 2–18. Bản demo dự thi gồm lý thuyết Việt–Anh, hoạt động trực quan 2D/3D, tự luyện, lưu tiến độ và quản trị học liệu.

**Trải nghiệm:** https://terralab.cherrybetta14.chatgpt.site

Website được mở công khai. Khách có thể xem học liệu và tự đăng ký tài khoản để lưu tiến độ. Kho GitHub quản lý mã nguồn; đẩy mã lên GitHub chưa tự triển khai bản mới lên Sites.

Giao diện ưu tiên ảnh chụp địa lí thật: 17 ảnh cho từng bài, ảnh nền Ngân Hà của ESO và địa cầu 3D dùng ảnh bề mặt/mây của NASA. Ảnh được lưu trong dự án, có các kích thước WebP phù hợp màn hình và tải khi cần. Thông tin tác giả, giấy phép và nguồn nằm trong `data/photos.json`, `NOTICE.md` và phần Thiết lập trên website.

## Mở trên máy hiện tại

Nhấp đúp **Mo_TerraLab.cmd**, giữ cửa sổ đó mở và truy cập **http://127.0.0.1:5173**. Nếu máy chủ đã chạy, dùng địa chỉ hiện có. Học sinh tự đăng ký bằng tên đăng nhập và mật khẩu, không cần email.

Tài khoản quản trị và người duyệt nằm trong tệp riêng **outputs/TAI_KHOAN_DEMO.txt**. Vào mục Quản trị sau khi đăng nhập. Lưu bản nháp → gửi duyệt → đăng nhập người duyệt khác người soạn → phát hành. Muốn khôi phục học liệu cũ: mở phiên bản đã lưu trữ, lưu thành bản nháp mới và duyệt lại.

## Cài trên máy khác

Cần Node.js từ 22.13 và npm. Chạy npm ci, sau đó npm run build. Áp dụng migration local rồi chạy npm run dev:

    node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_gorgeous_captain_midlands.sql

Để tạo tài khoản quản trị local lần đầu: chạy node scripts/demo-accounts.mjs --configure-only, khởi động máy chủ và chạy node scripts/demo-accounts.mjs. Mã thiết lập tự sinh trong .dev.vars; chỉ có hiệu lực trước khi tồn tại quản trị viên đầu tiên. Không đưa các tệp môi trường hoặc tài khoản vào Git.

## Kiểm tra

Chạy `npm run check` để kiểm tra TypeScript, mô hình và quy tắc chấm điểm. Có thể bật kiểm tra tự động trước khi đẩy mã bằng `git config core.hooksPath .githooks` (đã bật trên máy phát triển hiện tại).

    npx tsc --noEmit
    node scripts/test-models.mjs
    node scripts/test-api.mjs
    node scripts/test-admin.mjs

Hai kiểm thử API cần máy chủ local đang chạy; kiểm thử quản trị cần tài khoản demo. Kiểm thử quản trị tạo phiên bản rồi phục hồi nội dung ban đầu qua quy trình duyệt. Dữ liệu local được lưu trong .wrangler/state; giữ thư mục này nếu cần giữ tài khoản và lịch sử.

## Phạm vi và dữ liệu

17 bài · 102 mô-đun · 72 cụm lý thuyết · 170 câu cơ sở. Các câu mở chưa có xác nhận của giáo viên giữ trạng thái chờ; điểm tự đánh giá không thay thế điểm xác nhận. Một số câu số liệu được chấm theo quy tắc giá trị/đơn vị.

Học liệu tự biên soạn đang chờ đối chiếu sách. Các bộ số liệu minh họa và mô hình giản lược có nhãn ngay trong hoạt động. Chưa có quản lý lớp học, chấm thủ công của giáo viên hay ngân hàng mở rộng 340 câu. Bản local và trực tuyến lưu dữ liệu riêng.

Ứng dụng dùng React, TypeScript, Vinext/Vite, Three.js và Cloudflare D1/Drizzle. Phông chữ và đường bờ được lưu cùng ứng dụng; xem NOTICE.md. Bản trực tuyến dùng quy trình Sites. Quyền quản trị học liệu được kiểm tra ở máy chủ.
