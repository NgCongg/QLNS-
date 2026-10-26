module.exports = {
  users: [],
  positions: [
    { id: 1, code: 'TP', name: 'Truong phong', level: 'Quan ly', baseSalary: 28000000, allowance: 3000000, status: 'Hoat dong' },
    { id: 2, code: 'CV', name: 'Chuyen vien', level: 'Chuyen mon', baseSalary: 15000000, allowance: 1500000, status: 'Hoat dong' },
    { id: 3, code: 'NV', name: 'Nhan vien', level: 'Nhan vien', baseSalary: 12000000, allowance: 1200000, status: 'Hoat dong' },
    { id: 4, code: 'DEV', name: 'Lap trinh vien', level: 'Chuyen mon', baseSalary: 18000000, allowance: 1800000, status: 'Hoat dong' },
    { id: 5, code: 'KT', name: 'Ke toan vien', level: 'Chuyen mon', baseSalary: 9000000, allowance: 800000, status: 'Hoat dong' }
  ],
  payrollPeriods: [{ id: 1, month: 9, year: 2026, status: 'Da chot' }],
  employees: [
    { id: 1, code: 'NV001', name: 'Nguyen Minh Anh', email: 'minhanh@andci.vn', phone: '0901234567', birthDate: '1995-04-18', gender: 'Nu', identityNumber: '001095000001', address: 'Ha Noi', department: 'Nhan su', position: 'Chuyen vien', status: 'Dang lam viec', joined: '2024-03-12', avatar: 'MA', baseSalary: 15000000, allowance: 1500000, insuranceSalary: 15000000, dependents: 0 },
    { id: 2, code: 'NV002', name: 'Tran Quang Huy', email: 'quanghuy@andci.vn', phone: '0912345678', birthDate: '1990-08-10', gender: 'Nam', identityNumber: '001090000002', address: 'Ha Noi', department: 'Cong nghe', position: 'Truong phong', status: 'Dang lam viec', joined: '2022-08-01', avatar: 'QH', baseSalary: 28000000, allowance: 3000000, insuranceSalary: 28000000, dependents: 1 },
    { id: 3, code: 'NV003', name: 'Le Thao Nguyen', email: 'thaonguyen@andci.vn', phone: '0987654321', birthDate: '2000-02-20', gender: 'Nu', identityNumber: '001200000003', address: 'Ha Noi', department: 'Tai chinh', position: 'Ke toan vien', status: 'Thu viec', joined: '2026-09-01', avatar: 'TN', baseSalary: 9000000, allowance: 800000, insuranceSalary: 9000000, dependents: 0 },
    { id: 4, code: 'NV004', name: 'Pham Gia Bao', email: 'giabao@andci.vn', phone: '0934567890', birthDate: '1998-11-25', gender: 'Nam', identityNumber: '001198000004', address: 'Ha Noi', department: 'Kinh doanh', position: 'Nhan vien', status: 'Dang lam viec', joined: '2023-01-17', avatar: 'GB', baseSalary: 12000000, allowance: 1200000, insuranceSalary: 12000000, dependents: 0 },
    { id: 5, code: 'NV005', name: 'Vo Thanh Lam', email: 'thanhlam@andci.vn', phone: '0967890123', birthDate: '1997-06-12', gender: 'Nam', identityNumber: '001197000005', address: 'Ha Noi', department: 'Cong nghe', position: 'Lap trinh vien', status: 'Dang lam viec', joined: '2024-11-20', avatar: 'TL', baseSalary: 18000000, allowance: 1800000, insuranceSalary: 18000000, dependents: 0 }
  ],
  departments: [
    { id: 1, code: 'HR', name: 'Nhan su', manager: 'Nguyen Minh Anh', positions: 3, location: 'Tang 3 - Khu A', phone: 'May le 301', description: 'Tuyen dung, dao tao, quan ly ho so va chinh sach nhan su.', status: 'Hoat dong' },
    { id: 2, code: 'IT', name: 'Cong nghe', manager: 'Tran Quang Huy', positions: 4, location: 'Tang 5 - Khu B', phone: 'May le 501', description: 'Phat trien san pham, van hanh he thong va bao mat du lieu.', status: 'Hoat dong' },
    { id: 3, code: 'FIN', name: 'Tai chinh', manager: 'Do Thu Ha', positions: 2, location: 'Tang 4 - Khu A', phone: 'May le 402', description: 'Ke toan, ngan sach, kiem soat chi phi va bao cao tai chinh.', status: 'Hoat dong' },
    { id: 4, code: 'SALE', name: 'Kinh doanh', manager: 'Nguyen Van Nam', positions: 3, location: 'Tang 2 - Khu B', phone: 'May le 205', description: 'Phat trien thi truong, cham soc khach hang va quan ly doanh thu.', status: 'Hoat dong' }
  ],
  attendance: [
    { id: 1, employeeId: 1, employee: 'Nguyen Minh Anh', date: '2026-09-30', checkIn: '08:02', checkOut: '17:35', hours: '8h 33p', status: 'Dung gio', note: '' },
    { id: 2, employeeId: 2, employee: 'Tran Quang Huy', date: '2026-09-30', checkIn: '07:54', checkOut: '17:42', hours: '8h 48p', status: 'Dung gio', note: '' },
    { id: 3, employeeId: 3, employee: 'Le Thao Nguyen', date: '2026-09-30', checkIn: '08:21', checkOut: '17:30', hours: '8h 09p', status: 'Di muon', note: 'Den muon 21 phut' },
    { id: 4, employeeId: 4, employee: 'Pham Gia Bao', date: '2026-09-30', checkIn: '08:05', checkOut: '', hours: '--', status: 'Dang lam viec', note: '' }
  ],
  leaves: [
    { id: 1, employeeId: 4, employee: 'Pham Gia Bao', type: 'Nghi phep nam', from: '2026-10-02', to: '2026-10-03', days: 2, reason: 'Viec gia dinh', status: 'Cho duyet' },
    { id: 2, employeeId: 3, employee: 'Le Thao Nguyen', type: 'Nghi om', from: '2026-09-25', to: '2026-09-25', days: 1, reason: 'Kham benh', status: 'Da duyet' },
    { id: 3, employeeId: 5, employee: 'Vo Thanh Lam', type: 'Nghi phep nam', from: '2026-10-10', to: '2026-10-10', days: 1, reason: 'Viec ca nhan', status: 'Cho duyet' }
  ],
  payroll: [
    { id: 1, employeeId: 1, employee: 'Nguyen Minh Anh', month: 9, year: 2026, contractBase: 15000000, standardDays: 22, actualDays: 23, base: 15000000, allowance: 1500000, overtime: 1022727, insurance: 1575000, tax: 0, deductions: 1575000, net: 15947727 },
    { id: 2, employeeId: 2, employee: 'Tran Quang Huy', month: 9, year: 2026, contractBase: 28000000, standardDays: 22, actualDays: 22, base: 28000000, allowance: 3000000, overtime: 0, insurance: 2940000, tax: 0, deductions: 2940000, net: 28060000 },
    { id: 3, employeeId: 3, employee: 'Le Thao Nguyen', month: 9, year: 2026, contractBase: 9000000, standardDays: 22, actualDays: 21, base: 8590909, allowance: 763636, overtime: 0, insurance: 945000, tax: 0, deductions: 945000, net: 8409545 },
    { id: 4, employeeId: 4, employee: 'Pham Gia Bao', month: 9, year: 2026, contractBase: 12000000, standardDays: 22, actualDays: 24, base: 12000000, allowance: 1200000, overtime: 1636364, insurance: 1260000, tax: 0, deductions: 1260000, net: 13576364 }
  ]
};
