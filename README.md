# Website QLNS - MVC

He thong quan ly nhan su mau gom: dang ky, dang nhap, tong quan, nhan vien, phong ban, cham cong, nghi phep va bang luong.

## Chay du an

Yeu cau Node.js 20 tro len va MongoDB dang chay tren may.

```powershell
npm install
npm start
```

Mo `http://localhost:3000` tren trinh duyet.

Tai khoan mau theo 4 tac nhan trong Hinh 3.1 (mat khau chung `123456`):

- Admin: `admin@andci.vn`
- Nhan su: `hr@andci.vn`
- Truong phong: `manager@andci.vn`
- Nhan vien: `employee@andci.vn`

He thong phan quyen menu va du lieu theo vai tro. Cac use case gom dang nhap/dang xuat, thong tin ca nhan, xin nghi phep, xem cong/luong, duyet nghi phep, quan ly nhan vien, phong ban, chuc vu, cham cong, luong va phan quyen.

Nhan vien moi dang ky se khai ho so ca nhan mot lan. Nhan vien co the tu cham cong vao/ra theo gio may chu va chi xem du lieu cua minh. HR tinh, xem truoc va chot bang luong theo thang; nhan vien chi thay phieu luong da chot.

Truong phong co day du chuc nang tu phuc vu cua nhan vien. Tai muc nghi phep, truong phong chi thay don cua minh va nhan vien cung phong ban; chi duoc duyet hoac tu choi don cua nhan vien cung phong. Don do chinh truong phong tao chi HR hoac Admin moi co quyen xu ly.

Moi chuc vu co mot muc luong co ban va phu cap rieng. Du ngay cong chuan thi nhan du luong co ban; thieu cong tinh theo ty le, moi ngay cong vuot muc duoc cong 150% luong ngay. Nhan vien va truong phong chi xem luong cua chinh minh, va chi thay thuc nhan sau khi HR chot ky luong.

Cong thuc luong mau nam 2026 su dung ngay cong thuc te, phu cap, bao hiem bat buoc phan nguoi lao dong 10,5% va thue TNCN luy tien 5 bac. Cac tham so hop dong va chinh sach noi bo can duoc HR cau hinh lai khi trien khai thuc te.

## Cau truc MVC

- `models/`: lop du lieu.
- `controllers/`: xu ly nghiep vu.
- `routes/`: dieu huong yeu cau.
- `views/`: tao giao dien HTML.
- `public/`: CSS, JavaScript va bieu tuong.
- `data/`: du lieu mau.

Du lieu duoc luu trong MongoDB tai `mongodb://127.0.0.1:27017`, database mac dinh `qlns_andci`. Co the thay doi bang hai bien moi truong `MONGODB_URI` va `MONGODB_DB`. Du lieu mau chi duoc tao khi collection chua co du lieu; tai khoan va nghiep vu moi se duoc giu nguyen sau khi khoi dong lai website.
