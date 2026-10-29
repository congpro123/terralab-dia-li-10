# TerraLab — trạng thái bàn giao

Bản demo Địa lí 10, phạm vi Bài 2–18: 17 bài, 102 mô-đun, 72 cụm lý thuyết Việt–Anh, 17 hoạt động khám phá, 170 câu luyện tập. Có tài khoản tự đăng ký, tiến độ cá nhân, lưu nháp, lịch sử, tự đánh giá tách điểm xác nhận, quản trị và duyệt học liệu độc lập.

Đã kiểm tra TypeScript; 11 nhóm kiểm thử API; kiểm thử phân quyền/biên tập/duyệt/phục hồi; các bất biến mô hình và chấm điểm cả 17 bộ đề. Đợt thiết kế lại được kiểm tra trực tiếp trên URL công khai ở màn hình máy tính và kích thước 390 × 844: mở bài, đọc từng phần, mở/đóng lộ trình, chuyển câu luyện, điều hướng và tìm bài học. Không có tràn ngang trên các màn hình đã kiểm tra; nhật ký trình duyệt không ghi lỗi/cảnh báo. Các kiểm thử API thuộc đợt trước; đợt này không đổi API.

Nội dung là bản tự biên soạn chờ đối chiếu sách. Dữ liệu số minh họa được gắn nhãn; chưa thay thế bằng nguồn đo đạc đã duyệt. Ngân hàng cơ sở là 170 câu; chưa mở rộng lên 340. Chưa triển khai lớp học, chấm thủ công bởi giáo viên, bảng điểm lớp hay đo tải đồng thời. Không tuyên bố hoàn tất toàn bộ 154 story sản xuất của backlog.

Máy chủ local dùng D1 trong .wrangler/state. Không ghi đè/xóa dữ liệu người dùng. Tài khoản demo riêng nằm ở outputs/TAI_KHOAN_DEMO.txt; không được đưa lên Git. Bản trực tuyến và bản local có cơ sở dữ liệu riêng.

Đã đổi nhãn URL thành terralab. Bản trực tuyến công khai. GitHub công khai: https://github.com/congpro123/terralab-dia-li-10. Giao diện chuyển sang ảnh chụp thật, có ghi nguồn; bề mặt và lớp mây địa cầu dùng ảnh NASA, nền Ngân Hà dùng ảnh ESO.

Đợt cải tiến bố cục theo phản hồi: điều hướng ngang, trang bắt đầu một hành động chính, lộ trình 6 bước, mỗi màn hình một phần đọc và mỗi màn hình một câu luyện. Giữ ảnh thật và địa cầu NASA; chuyển nội dung phụ sang phần mở rộng. Đã thêm kiểm thử dẫn đường đọc/tiếp tục/hoàn thành cho cả 17 bài.

Tham khảo bố cục và mã nguồn công khai congpro123/ScamCheck: điều hướng gọn, phân cấp rõ, thao tác chính nổi bật và luyện từng câu. Đã thu gọn tiêu đề bài, đưa nút bắt đầu lên trước ảnh và thêm nhãn truy cập cho nút đăng nhập dạng biểu tượng. Chưa có kiểm thử sử dụng với nhóm học sinh thực tế.

Đợt khám phá cảnh quan: khôi phục bảng màu kem – xanh lá – sage, giữ bố cục học 6 bước. Địa cầu có 6 điểm gắn tọa độ, ẩn điểm ở bán cầu khuất, tránh chồng thẻ và bật ảnh khi phóng gần. Có nút bay đến cảnh quan, thẻ ảnh, nguồn kiến thức/giấy phép và liên kết bài học. Tọa độ đại diện cảnh quan, không xác định chính xác vị trí chụp ảnh. Ảnh vệ tinh là ảnh tổng hợp lịch sử, không phải ảnh trực tiếp.

Bài 12: sóng và thủy triều có cảnh bờ biển WebGL 3D, mặt nước shader, bãi cát, đá, phao và cọc cố định. Đổi pha trăng/giờ, phát–dừng và so sánh đồ thị bán nhật triều lí tưởng. Công thức gồm hai thành phần điều hòa, chu kì ngày âm lịch 24 giờ 50 phút; biên độ tương đối, không hiệu chỉnh theo trạm thực. Cảnh bờ biển tự dựng, không tái hiện Hạ Long hay địa điểm quan trắc cụ thể. Dòng biển vẫn là sơ đồ giảng dạy 2D. Cơ sở kiến thức NOAA; các thẻ cảnh quan dẫn nguồn UNESCO, NASA hoặc NPS.

Đã kiểm thử tọa độ cầu đơn vị, địa điểm/bài học hợp lệ, tính tuần hoàn mực triều và biên độ triều cường lớn hơn triều kém. Kiểm tra trực tiếp trên trang công khai: phóng gần hiện ảnh, chọn Hạ Long chuyển Bài 12, chọn Grand Canyon trên điện thoại, đổi pha trăng và phát–dừng mô hình biển. Màn hình 390 × 844 không tràn ngang; không ghi nhận lỗi/cảnh báo trình duyệt ở các màn hình kiểm tra. Chưa đo hiệu năng trên điện thoại vật lí; WebGL có dự phòng văn bản/biểu đồ khi không khả dụng.
