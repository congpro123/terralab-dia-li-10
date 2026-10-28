import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const file=new URL('components/TerraApp.tsx',root);let s=await readFile(file,'utf8');
s=s.replace("setProgress(prev=>({...prev,[conflict.remote.lessonId]:conflict.remote}));delete pending.current[conflict.remote.lessonId];setConflict(null);setSync('synced');", "setProgress(prev=>{const next={...prev,[conflict.remote.lessonId]:conflict.remote};localStorage.setItem('terra-progress:'+(user?.id??'guest'),JSON.stringify(next));return next;});delete pending.current[conflict.remote.lessonId];if(user)localStorage.setItem('terra-pending:'+user.id,JSON.stringify(pending.current));setConflict(null);setSync('synced');");
s=s.replace("const item={...conflict.local,revision:conflict.remote.revision};setConflict(null);sendProgress(item);", "const item={...conflict.local,revision:conflict.remote.revision};pending.current[item.lessonId]=item;if(user)localStorage.setItem('terra-pending:'+user.id,JSON.stringify(pending.current));setConflict(null);sendProgress(item);");
await writeFile(file,s);
const data=new URL('data/content.ts',root);await writeFile(data,(await readFile(data,'utf8')).replace('https://www.usgs.gov/programs/earthquake-hazards/science/plate-tectonics','https://pubs.usgs.gov/gip/dynamic/understanding.html'));
await mkdir(new URL('outputs/authoring/',root),{recursive:true});
for(const name of ['extract_curriculum.py','fetch-fonts.mjs','prepare-assets.mjs','refine-questions.mjs','refine-state.mjs','refine-ui.mjs','finish-ui.mjs']){try{await rename(new URL('scripts/'+name,root),new URL('outputs/authoring/'+name,root));}catch(e){if(e.code!=='ENOENT')throw e;}}
await writeFile(new URL('PROJECT_STATUS.md',root),`# TerraLab — trạng thái bàn giao

Bản demo Địa lí 10, phạm vi Bài 2–18: 17 bài, 102 mô-đun, 72 cụm lý thuyết Việt–Anh, 17 hoạt động khám phá, 170 câu luyện tập. Có tài khoản tự đăng ký, tiến độ cá nhân, lưu nháp, lịch sử, tự đánh giá tách điểm xác nhận, quản trị và duyệt học liệu độc lập.

Đã kiểm tra TypeScript; 11 nhóm kiểm thử API; kiểm thử phân quyền/biên tập/duyệt/phục hồi; các bất biến mô hình và chấm điểm cả 17 bộ đề. Giao diện desktop/mobile và luồng đọc bài đã được kiểm tra trước đó; công cụ trình duyệt hiện chặn URL cục bộ nên lần tinh chỉnh cuối được kiểm tra bằng mã và API.

Nội dung là bản tự biên soạn chờ đối chiếu sách. Dữ liệu số minh họa được gắn nhãn; chưa thay thế bằng nguồn đo đạc đã duyệt. Ngân hàng cơ sở là 170 câu; chưa mở rộng lên 340. Chưa triển khai lớp học, chấm thủ công bởi giáo viên, bảng điểm lớp hay đo tải đồng thời. Không tuyên bố hoàn tất toàn bộ 154 story sản xuất của backlog.

Máy chủ local dùng D1 trong .wrangler/state. Không ghi đè/xóa dữ liệu người dùng. Tài khoản demo riêng nằm ở outputs/TAI_KHOAN_DEMO.txt; không được đưa lên Git. Bản trực tuyến và bản local có cơ sở dữ liệu riêng.
`);
await writeFile(new URL('README.md',root),`# TerraLab · Địa lí 10

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
`);
