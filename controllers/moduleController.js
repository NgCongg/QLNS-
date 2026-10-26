const store = require('../models/store');

const pages = {
  departments: ['Phong ban', 'departments'],
  positions: ['Chuc vu', 'positions'],
  attendance: ['Cham cong', 'attendance'],
  leaves: ['Nghi phep', 'leaves'],
  payroll: ['Bang luong', 'payroll']
};

exports.index = resource => {
  const periods = [...store.all('payrollPeriods')].sort((a, b) => b.year - a.year || b.month - a.month);
  return {
    title: pages[resource][0], view: pages[resource][1], active: resource,
    [resource]: store.all(resource), employees: store.all('employees'), positions: store.all('positions'),
    payrollPeriods: periods, payrollPeriod: periods[0]
  };
};
exports.processLeave = (id, action, user) => {
  const leave = store.find('leaves', id);
  if (!leave || leave.status !== 'Cho duyet') throw new Error('Don nghi khong con o trang thai cho duyet.');
  if (user.role === 'Truong phong') {
    const manager = store.find('employees', user.employeeId);
    const requester = store.find('employees', leave.employeeId);
    if (!manager || !requester || requester.department !== manager.department || requester.id === manager.id) {
      throw new Error('Truong phong chi duoc xu ly don cua nhan vien cung phong ban.');
    }
  } else if (!['HR', 'Admin'].includes(user.role)) {
    throw new Error('Ban khong co quyen xu ly don nghi phep.');
  }
  return store.update('leaves', id, { status: action === 'approve' ? 'Da duyet' : 'Tu choi', approverId: user.id });
};

exports.createLeave = (body, user) => {
  const employee = user.employeeId ? store.find('employees', user.employeeId) : store.find('employees', body.employeeId);
  if (!employee) throw new Error('Tai khoan chua lien ket voi ho so nhan vien.');
  const start = new Date(body.from);
  const end = new Date(body.to);
  if (end < start) throw new Error('Ngay ket thuc phai sau ngay bat dau.');
  const days = Math.floor((end - start) / 86400000) + 1;
  if (days > 12) throw new Error('So ngay phep khong du.');
  return store.create('leaves', { employeeId: employee.id, employee: employee.name, type: body.type, from: body.from, to: body.to, days, reason: body.reason, status: 'Cho duyet' });
};
exports.cancelLeave = (id, user) => {
  const leave = store.find('leaves', id);
  if (!leave || (user.role !== 'Admin' && user.role !== 'HR' && leave.employeeId !== user.employeeId)) throw new Error('Khong co quyen huy don nay.');
  if (leave.status !== 'Cho duyet') throw new Error('Chi co the huy don dang cho duyet.');
  return store.update('leaves', id, { status: 'Da huy' });
};

function attendanceValues(body) {
  const employee = store.find('employees', body.employeeId);
  const start = body.checkIn ? body.checkIn.split(':').map(Number) : null;
  const end = body.checkOut ? body.checkOut.split(':').map(Number) : null;
  let hours = '--';
  if (start && end) {
    const minutes = Math.max(0, end[0] * 60 + end[1] - start[0] * 60 - start[1] - 60);
    hours = `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}p`;
  }
  return {
    employeeId: Number(body.employeeId), employee: employee ? employee.name : 'Khong xac dinh',
    date: body.date, checkIn: body.checkIn || '', checkOut: body.checkOut || '', hours,
    status: body.status, note: body.note || ''
  };
}

exports.createAttendance = body => store.create('attendance', attendanceValues(body));
exports.updateAttendance = (id, body) => store.update('attendance', id, attendanceValues(body));
exports.removeAttendance = id => store.remove('attendance', id);

function vietnamNow() {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  }).formatToParts(new Date()).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
  return { date: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}` };
}

exports.today = vietnamNow;
exports.employeeCheckIn = user => {
  if (!user.employeeId) throw new Error('Can hoan tat thong tin ca nhan truoc khi cham cong.');
  const now = vietnamNow();
  if (store.all('attendance').some(item => item.employeeId === user.employeeId && item.date === now.date)) throw new Error('Ban da cham cong vao hom nay.');
  const employee = store.find('employees', user.employeeId);
  return store.create('attendance', {
    employeeId: employee.id, employee: employee.name, date: now.date, checkIn: now.time,
    checkOut: '', hours: '--', status: now.time > '08:15' ? 'Di muon' : 'Dang lam viec', note: 'Nhan vien tu cham cong'
  });
};
exports.employeeCheckOut = user => {
  const now = vietnamNow();
  const item = store.all('attendance').find(record => record.employeeId === user.employeeId && record.date === now.date);
  if (!item) throw new Error('Chua co gio vao trong ngay hom nay.');
  if (item.checkOut) throw new Error('Ban da cham cong ra hom nay.');
  const [startHour, startMinute] = item.checkIn.split(':').map(Number);
  const [endHour, endMinute] = now.time.split(':').map(Number);
  const minutes = Math.max(0, endHour * 60 + endMinute - startHour * 60 - startMinute);
  return store.update('attendance', item.id, {
    checkOut: now.time, hours: `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}p`,
    status: item.status === 'Di muon' ? 'Di muon' : 'Dung gio'
  });
};

function departmentValues(body) {
  return {
    code: body.code.trim().toUpperCase(), name: body.name.trim(), manager: body.manager.trim(),
    positions: Math.max(1, Number(body.positions) || 1), location: body.location.trim(),
    phone: body.phone.trim(), description: body.description.trim(), status: body.status
  };
}

exports.createDepartment = body => {
  const departments = store.all('departments');
  if (departments.some(item => item.code === body.code.trim().toUpperCase())) throw new Error('Ma phong ban da ton tai.');
  if (departments.some(item => item.name.toLowerCase() === body.name.trim().toLowerCase())) throw new Error('Ten phong ban da ton tai.');
  return store.create('departments', departmentValues(body));
};

exports.updateDepartment = (id, body) => {
  const duplicate = store.all('departments').find(item => item.id !== Number(id) && (item.code === body.code.trim().toUpperCase() || item.name.toLowerCase() === body.name.trim().toLowerCase()));
  if (duplicate) throw new Error('Ma hoac ten phong ban da duoc su dung.');
  const current = store.find('departments', id);
  const oldName = current && current.name;
  const updated = store.update('departments', id, departmentValues(body));
  if (oldName && oldName !== updated.name) {
    store.all('employees').filter(employee => employee.department === oldName).forEach(employee => employee.department = updated.name);
  }
  return updated;
};

exports.removeDepartment = id => {
  const department = store.find('departments', id);
  if (!department) throw new Error('Khong tim thay phong ban.');
  if (store.all('employees').some(employee => employee.department === department.name)) {
    throw new Error('Khong the xoa phong ban dang co nhan vien.');
  }
  return store.remove('departments', id);
};

exports.createPosition = body => {
  if (store.all('positions').some(item => item.code === body.code.trim().toUpperCase())) throw new Error('Ma chuc vu da ton tai.');
  return store.create('positions', { code: body.code.trim().toUpperCase(), name: body.name.trim(), level: body.level, baseSalary: Number(body.baseSalary) || 0, allowance: Number(body.allowance) || 0, status: body.status });
};
exports.updatePosition = (id, body) => {
  const current = store.find('positions', id);
  const values = { code: body.code.trim().toUpperCase(), name: body.name.trim(), level: body.level, baseSalary: Number(body.baseSalary) || 0, allowance: Number(body.allowance) || 0, status: body.status };
  const updated = store.update('positions', id, values);
  store.all('employees').filter(employee => current && employee.position === current.name).forEach(employee => store.update('employees', employee.id, { position: values.name, baseSalary: values.baseSalary, allowance: values.allowance, insuranceSalary: values.baseSalary }));
  return updated;
};
exports.removePosition = id => {
  const position = store.find('positions', id);
  if (position && store.all('employees').some(employee => employee.position === position.name)) throw new Error('Khong the xoa chuc vu dang duoc su dung.');
  return store.remove('positions', id);
};

exports.updatePayrollStatus = status => store.update('payrollPeriods', 1, { status });

function progressiveTax(taxable) {
  const brackets = [[10000000, .05], [20000000, .10], [30000000, .20], [40000000, .30], [Infinity, .35]];
  let remaining = Math.max(0, taxable);
  let tax = 0;
  for (const [width, rate] of brackets) {
    const amount = Math.min(remaining, width);
    tax += amount * rate;
    remaining -= amount;
    if (remaining <= 0) break;
  }
  return Math.round(tax);
}

function weekdaysInMonth(year, month) {
  let count = 0;
  const days = new Date(year, month, 0).getDate();
  for (let day = 1; day <= days; day++) {
    const weekday = new Date(year, month - 1, day).getDay();
    if (weekday !== 0 && weekday !== 6) count++;
  }
  return count;
}

exports.generatePayroll = () => {
  const now = vietnamNow();
  const [year, month] = now.date.split('-').map(Number);
  let period = store.all('payrollPeriods').find(item => item.month === month && item.year === year);
  if (!period) period = store.create('payrollPeriods', { month, year, status: 'Ban nhap' });
  const standardDays = weekdaysInMonth(year, month);
  store.all('employees').filter(employee => employee.status !== 'Da nghi viec').forEach(employee => {
    const actualDays = store.all('attendance').filter(item => item.employeeId === employee.id && item.date.startsWith(`${year}-${String(month).padStart(2, '0')}`) && item.checkIn).length;
    const regularDays = Math.min(actualDays, standardDays);
    const excessDays = Math.max(0, actualDays - standardDays);
    const salaryByWorkday = Math.round((employee.baseSalary || 0) / standardDays * regularDays);
    const allowance = Math.round((employee.allowance || 0) / standardDays * regularDays);
    const overtime = Math.round((employee.baseSalary || 0) / standardDays * excessDays * 1.5);
    const gross = salaryByWorkday + allowance + overtime;
    const insurance = Math.round((employee.insuranceSalary || 0) * .105);
    const taxable = Math.max(0, gross - insurance - 15500000 - (employee.dependents || 0) * 6200000);
    const tax = progressiveTax(taxable);
    const deductions = insurance + tax;
    const values = { employeeId: employee.id, employee: employee.name, month, year, base: salaryByWorkday, contractBase: employee.baseSalary || 0, standardDays, actualDays, allowance, overtime, insurance, tax, deductions, net: Math.max(0, gross - deductions) };
    const existing = store.all('payroll').find(item => item.employeeId === employee.id && item.month === month && item.year === year);
    existing ? store.update('payroll', existing.id, values) : store.create('payroll', values);
  });
  return period;
};

exports.closePayroll = body => {
  const period = store.all('payrollPeriods').find(item => item.month === Number(body.month) && item.year === Number(body.year));
  if (!period) throw new Error('Can tao bang luong truoc khi chot.');
  return store.update('payrollPeriods', period.id, { status: 'Da chot' });
};
