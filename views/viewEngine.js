const money = value => new Intl.NumberFormat('vi-VN').format(value) + ' d';
const badge = value => `<span class="badge ${value === 'Da duyet' || value === 'Dang lam viec' || value === 'Dung gio' || value === 'Hoat dong' ? 'good' : value === 'Tu choi' ? 'bad' : 'warn'}">${value}</span>`;
const icon = name => `<svg aria-hidden="true"><use href="/public/icons.svg#${name}"></use></svg>`;
const escapeHtml = value => String(value || '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));

const nav = [
  ['dashboard', '/', 'grid', 'Tong quan'], ['employees', '/employees', 'users', 'Nhan vien'],
  ['departments', '/departments', 'building', 'Phong ban'], ['positions', '/positions', 'briefcase', 'Chuc vu'], ['attendance', '/attendance', 'clock', 'Cham cong'],
  ['leaves', '/leaves', 'calendar', 'Nghi phep'], ['payroll', '/payroll', 'wallet', 'Bang luong'],
  ['profile', '/profile', 'user', 'Thong tin ca nhan'], ['users', '/users', 'shield', 'Phan quyen']
];

function header(title, user) {
  const initials = user.name.split(' ').slice(-2).map(word => word[0]).join('').toUpperCase();
  return `<header class="topbar"><button class="icon-btn menu-btn" id="menuBtn" aria-label="Mo menu">${icon('menu')}</button><div><p class="eyebrow">AND CI HRM</p><h1>${title}</h1></div><div class="top-actions"><button class="icon-btn" aria-label="Thong bao">${icon('bell')}<span class="dot"></span></button><div class="profile"><span class="avatar">${escapeHtml(initials)}</span><span><strong>${escapeHtml(user.name)}</strong><small>${escapeHtml(user.role)}</small></span></div></div></header>`;
}

function sidebar(active, user) {
  const allowed = user.role === 'Admin' ? nav : user.role === 'HR' ? nav.filter(item => item[0] !== 'users') : nav.filter(item => ['profile','attendance','leaves','payroll'].includes(item[0]));
  return `<aside class="sidebar" id="sidebar"><a class="brand" href="/"><span class="brand-mark">A</span><span>And Ci<small>Human Resources</small></span></a><nav>${allowed.map(([key, href, ico, text]) => `<a class="${active === key ? 'active' : ''}" href="${href}">${icon(ico)}<span>${text}</span></a>`).join('')}</nav><div class="sidebar-foot"><div class="support">${icon('help')}<div><strong>Can ho tro?</strong><small>hr@andci.vn</small></div></div><form method="post" action="/logout"><button class="logout-btn">${icon('logout')}<span>Dang xuat</span></button></form></div></aside>`;
}

function table(headers, rows) {
  return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
}

function dashboard(data) {
  const cards = [
    ['users', 'Tong nhan vien', data.stats.employees, '+2 trong thang'],
    ['user-check', 'Dang lam viec', data.stats.active, 'Nhan su hien tai'],
    ['calendar', 'Don cho duyet', data.stats.pendingLeave, 'Can xu ly'],
    ['wallet', 'Quy luong thang', money(data.stats.payroll), 'Thang 09/2026']
  ];
  return `<section class="stats">${cards.map(([ico, label, value, note]) => `<article><span class="stat-icon">${icon(ico)}</span><div><p>${label}</p><strong>${value}</strong><small>${note}</small></div></article>`).join('')}</section>
  <section class="grid-main"><div class="panel"><div class="panel-head"><div><h2>Nhan su moi</h2><p>Danh sach nhan vien gan day</p></div><a href="/employees">Xem tat ca</a></div>${employeeTable(data.employees, false)}</div>
  <div class="panel"><div class="panel-head"><div><h2>Don nghi phep</h2><p>Yeu cau gan day</p></div><a href="/leaves">Quan ly</a></div><div class="leave-list">${data.leaves.map(item => `<div><span class="avatar soft">${item.employee.split(' ').slice(-2).map(x => x[0]).join('')}</span><p><strong>${item.employee}</strong><small>${item.type} · ${item.days} ngay</small></p>${badge(item.status)}</div>`).join('')}</div></div></section>`;
}

function employeeTable(items, actions = true) {
  return table(['Nhan vien', 'Phong ban', 'Chuc vu', 'Trang thai', actions ? 'Thao tac' : 'Ngay vao'], items.map(item => `<tr><td><div class="person"><span class="avatar">${item.avatar}</span><span><strong>${item.name}</strong><small>${item.code} · ${item.email}</small></span></div></td><td>${item.department}</td><td>${item.position}</td><td>${badge(item.status)}</td><td>${actions ? `<div class="actions"><button type="button" class="icon-btn edit" title="Chinh sua" data-modal-open="editEmployee${item.id}">${icon('edit')}</button><form method="post" action="/employees/${item.id}/delete" onsubmit="return confirm('Xoa nhan vien nay?')"><button class="icon-btn danger" title="Xoa">${icon('trash')}</button></form></div>` : item.joined}</td></tr>`));
}

function employees(data) {
  return `<div class="page-tools"><form class="search" method="get">${icon('search')}<input name="q" value="${data.query}" placeholder="Tim theo ten, ma hoac phong ban"><button>Tim</button></form><button class="primary" data-modal-open="employeeModal">${icon('plus')} Them nhan vien</button></div><section class="panel"><div class="panel-head"><div><h2>Danh sach nhan vien</h2><p>${data.employees.length} ho so duoc tim thay</p></div></div>${employeeTable(data.employees)}</section>${employeeModal(data.departments, data.positions)}${data.employees.map(item => editEmployeeModal(item, data.departments, data.positions)).join('')}`;
}

function departmentOptions(departments, selected) {
  return departments.map(item => `<option ${item.name === selected ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}

function positionOptions(positions, selected) {
  return positions.map(item => `<option ${item.name === selected ? 'selected' : ''}>${escapeHtml(item.name)}</option>`).join('');
}

function editEmployeeModal(item, departments, positions) {
  return `<dialog id="editEmployee${item.id}"><form method="post" action="/employees/${item.id}/edit"><div class="modal-head"><div><h2>Chinh sua nhan vien</h2><p>${item.code} · Cap nhat thong tin cong viec</p></div><button type="button" class="icon-btn" data-modal-close>${icon('x')}</button></div><div class="form-grid"><label>Ho va ten<input required name="name" value="${escapeHtml(item.name)}"></label><label>Email<input required type="email" name="email" value="${escapeHtml(item.email)}"></label><label>So dien thoai<input required name="phone" value="${escapeHtml(item.phone)}"></label><label>Ngay vao lam<input required type="date" name="joined" value="${item.joined}"></label><label>Phong ban<select name="department">${departmentOptions(departments, item.department)}</select></label><label>Chuc vu<select name="position">${positionOptions(positions, item.position)}</select></label><label>Trang thai<select name="status">${['Dang lam viec','Thu viec','Tam nghi','Da nghi viec'].map(value => `<option ${value === item.status ? 'selected' : ''}>${value}</option>`).join('')}</select></label></div><div class="modal-actions"><button type="button" class="secondary" data-modal-close>Huy</button><button class="primary">Luu thay doi</button></div></form></dialog>`;
}

function employeeModal(departments, positions) {
  return `<dialog id="employeeModal"><form method="post" action="/employees"><div class="modal-head"><div><h2>Them nhan vien</h2><p>Tao ho so nhan su moi</p></div><button type="button" class="icon-btn" data-modal-close>${icon('x')}</button></div><div class="form-grid"><label>Ma nhan vien<input required name="code" placeholder="NV006"></label><label>Ho va ten<input required name="name" placeholder="Nguyen Van A"></label><label>Email<input required type="email" name="email" placeholder="email@andci.vn"></label><label>So dien thoai<input required name="phone" placeholder="09xxxxxxxx"></label><label>Phong ban<select name="department">${departmentOptions(departments)}</select></label><label>Chuc vu<select name="position">${positionOptions(positions)}</select></label><label>Ngay vao lam<input required type="date" name="joined"></label><label>Trang thai<select name="status"><option>Dang lam viec</option><option>Thu viec</option></select></label></div><div class="modal-actions"><button type="button" class="secondary" data-modal-close>Huy</button><button class="primary">Luu nhan vien</button></div></form></dialog>`;
}

function departments(data) {
  const departmentsWithCounts = data.departments.map(item => ({
    ...item,
    members: data.employees.filter(employee => employee.department === item.name).length
  }));
  const total = data.employees.length;
  const vacancies = departmentsWithCounts.reduce((sum, item) => sum + Math.max(0, item.positions - item.members), 0);
  const notice = data.error ? `<div class="notice error">${escapeHtml(data.error)}</div>` : data.success ? `<div class="notice success">Da cap nhat phong ban thanh cong.</div>` : '';
  return `${notice}<div class="page-tools"><p class="page-note">Co cau to chuc va quy mo nhan su hien tai</p><button class="primary" data-modal-open="departmentModal">${icon('plus')} Them phong ban</button></div><section class="dept-summary"><div><span>${icon('building')}</span><p><strong>${data.departments.length}</strong><small>Phong ban</small></p></div><div><span>${icon('users')}</span><p><strong>${total}</strong><small>Tong nhan su</small></p></div><div><span>${icon('user-check')}</span><p><strong>${vacancies}</strong><small>Vi tri con trong</small></p></div></section><section class="dept-list">${departmentsWithCounts.map(item => `<article class="dept-detail"><div class="dept-heading"><span class="dept-code">${item.code}</span><div><h2>${item.name}</h2><p>${item.description}</p></div>${badge(item.status)}</div><div class="dept-metrics"><div><small>Truong phong</small><strong>${item.manager}</strong></div><div><small>Quy mo</small><strong>${item.members} / ${item.positions} nguoi</strong><div class="progress"><i style="width:${Math.min(100, Math.round(item.members / item.positions * 100))}%"></i></div></div><div><small>Vi tri lam viec</small><strong>${item.location}</strong></div><div><small>Lien he noi bo</small><strong>${item.phone}</strong></div></div><div class="dept-foot"><span>${Math.max(0, item.positions - item.members)} vi tri dang tuyen</span><div class="dept-actions"><a href="/employees?q=${encodeURIComponent(item.name)}">Xem nhan su</a><button type="button" class="icon-btn edit" title="Chinh sua" data-modal-open="editDepartment${item.id}">${icon('edit')}</button><form method="post" action="/departments/${item.id}/delete" onsubmit="return confirm('${item.members ? 'Phong ban dang co nhan vien va khong the xoa.' : 'Xoa phong ban nay?'}')"><button class="icon-btn danger" title="Xoa" ${item.members ? 'disabled' : ''}>${icon('trash')}</button></form></div></div></article>`).join('')}</section>${departmentModal()}${departmentsWithCounts.map(item => departmentModal(item)).join('')}`;
}

function departmentModal(item = null) {
  const editing = Boolean(item);
  return `<dialog id="${editing ? `editDepartment${item.id}` : 'departmentModal'}"><form method="post" action="${editing ? `/departments/${item.id}/edit` : '/departments'}"><div class="modal-head"><div><h2>${editing ? 'Chinh sua phong ban' : 'Them phong ban'}</h2><p>Cap nhat co cau to chuc And Ci</p></div><button type="button" class="icon-btn" data-modal-close>${icon('x')}</button></div><div class="form-grid"><label>Ma phong ban<input required maxlength="10" name="code" value="${editing ? escapeHtml(item.code) : ''}" placeholder="VD: MKT"></label><label>Ten phong ban<input required name="name" value="${editing ? escapeHtml(item.name) : ''}" placeholder="VD: Marketing"></label><label>Truong phong<input required name="manager" value="${editing ? escapeHtml(item.manager) : ''}" placeholder="Ho va ten"></label><label>Quy mo du kien<input required min="1" type="number" name="positions" value="${editing ? item.positions : 1}"></label><label>Vi tri lam viec<input required name="location" value="${editing ? escapeHtml(item.location) : ''}" placeholder="Tang / khu vuc"></label><label>Lien he noi bo<input required name="phone" value="${editing ? escapeHtml(item.phone) : ''}" placeholder="May le 101"></label><label class="full-field">Mo ta chuc nang<textarea required name="description" rows="3" placeholder="Nhiem vu chinh cua phong ban">${editing ? escapeHtml(item.description) : ''}</textarea></label><label>Trang thai<select name="status"><option ${editing && item.status === 'Hoat dong' ? 'selected' : ''}>Hoat dong</option><option ${editing && item.status === 'Tam dung' ? 'selected' : ''}>Tam dung</option></select></label></div><div class="modal-actions"><button type="button" class="secondary" data-modal-close>Huy</button><button class="primary">${editing ? 'Luu thay doi' : 'Them phong ban'}</button></div></form></dialog>`;
}

function positions(data) {
  const notice = data.error ? `<div class="notice error">${escapeHtml(data.error)}</div>` : data.success ? `<div class="notice success">Da cap nhat chuc vu thanh cong.</div>` : '';
  return `${notice}<div class="page-tools"><p class="page-note">Danh muc chuc danh, luong co ban va phu cap cua cong ty</p><button class="primary" data-modal-open="positionModal">${icon('plus')} Them chuc vu</button></div><section class="panel"><div class="panel-head"><div><h2>Danh sach chuc vu</h2><p>${data.positions.length} chuc danh dang duoc quan ly</p></div></div>${table(['Ma','Ten chuc vu','Cap bac','Luong co ban','Phu cap','Trang thai','Thao tac'], data.positions.map(item => `<tr><td><strong>${item.code}</strong></td><td>${item.name}</td><td>${item.level}</td><td><strong>${money(item.baseSalary || 0)}</strong></td><td>${money(item.allowance || 0)}</td><td>${badge(item.status)}</td><td><div class="actions"><button class="icon-btn edit" type="button" data-modal-open="editPosition${item.id}">${icon('edit')}</button><form method="post" action="/positions/${item.id}/delete"><button class="icon-btn danger">${icon('trash')}</button></form></div></td></tr>`))}</section>${positionModal()}${data.positions.map(positionModal).join('')}`;
}

function positionModal(item = null) {
  const editing = Boolean(item);
  return `<dialog id="${editing ? `editPosition${item.id}` : 'positionModal'}"><form method="post" action="${editing ? `/positions/${item.id}/edit` : '/positions'}"><div class="modal-head"><div><h2>${editing ? 'Chinh sua chuc vu' : 'Them chuc vu'}</h2><p>Luong co ban duoc ap dung cho tat ca nhan vien cung chuc vu</p></div><button type="button" class="icon-btn" data-modal-close>${icon('x')}</button></div><div class="form-grid"><label>Ma chuc vu<input required name="code" value="${editing ? escapeHtml(item.code) : ''}" placeholder="VD: MKT"></label><label>Ten chuc vu<input required name="name" value="${editing ? escapeHtml(item.name) : ''}" placeholder="Chuyen vien Marketing"></label><label>Cap bac<select name="level">${['Nhan vien','Chuyen mon','Quan ly','Lanh dao'].map(level => `<option ${editing && item.level === level ? 'selected' : ''}>${level}</option>`).join('')}</select></label><label>Luong co ban<input required min="0" step="100000" type="number" name="baseSalary" value="${editing ? item.baseSalary || 0 : 0}"></label><label>Phu cap thang<input required min="0" step="100000" type="number" name="allowance" value="${editing ? item.allowance || 0 : 0}"></label><label>Trang thai<select name="status"><option ${editing && item.status === 'Hoat dong' ? 'selected' : ''}>Hoat dong</option><option ${editing && item.status === 'Tam dung' ? 'selected' : ''}>Tam dung</option></select></label></div><div class="modal-actions"><button type="button" class="secondary" data-modal-close>Huy</button><button class="primary">Luu chuc vu</button></div></form></dialog>`;
}

function attendance(data) {
  const canManage = ['Admin','HR'].includes(data.user.role);
  const notice = data.error ? `<div class="notice error">${escapeHtml(data.error)}</div>` : data.success ? `<div class="notice success">Cham cong da duoc ghi nhan.</div>` : '';
  let selfAction = '';
  if (!canManage) {
    if (!data.todayRecord) selfAction = `<form method="post" action="/attendance/check-in"><button class="primary">${icon('clock')} Cham cong vao</button></form>`;
    else if (!data.todayRecord.checkOut) selfAction = `<form method="post" action="/attendance/check-out"><button class="primary">${icon('logout')} Cham cong ra</button></form>`;
    else selfAction = `<button class="secondary" disabled>Da hoan tat cham cong hom nay</button>`;
  }
  return `${notice}${!canManage ? `<section class="today-attendance"><div><p class="eyebrow">HOM NAY · ${data.today ? formatDate(data.today.date) : ''}</p><h2>${data.todayRecord ? `${data.todayRecord.checkIn} - ${data.todayRecord.checkOut || 'Dang lam viec'}` : 'Chua cham cong'}</h2><span>Thoi gian duoc ghi nhan theo mui gio Viet Nam (Asia/Ho_Chi_Minh).</span></div>${selfAction}</section>` : ''}<div class="page-tools"><div class="date-chip">${icon('calendar')} Bang cham cong</div>${canManage ? `<button class="primary" data-modal-open="attendanceModal">${icon('plus')} Them cham cong</button>` : ''}</div><section class="panel"><div class="panel-head"><div><h2>${canManage ? 'Du lieu cham cong' : 'Lich su cham cong cua toi'}</h2><p>Theo doi gio vao, gio ra va tong thoi gian lam viec</p></div></div>${table(['Nhan vien','Ngay','Gio vao','Gio ra','Tong gio','Trang thai',...(canManage ? ['Thao tac'] : [])], data.attendance.map(item => `<tr><td><strong>${item.employee}</strong><small class="cell-sub">${item.note || 'Khong co ghi chu'}</small></td><td>${formatDate(item.date)}</td><td>${item.checkIn || '--'}</td><td>${item.checkOut || '--'}</td><td>${item.hours}</td><td>${badge(item.status)}</td>${canManage ? `<td><div class="actions"><button type="button" class="icon-btn edit" title="Chinh sua" data-modal-open="editAttendance${item.id}">${icon('edit')}</button><form method="post" action="/attendance/${item.id}/delete" onsubmit="return confirm('Xoa ban cham cong nay?')"><button class="icon-btn danger" title="Xoa">${icon('trash')}</button></form></div></td>` : ''}</tr>`))}</section>${canManage ? `${attendanceModal(data.employees)}${data.attendance.map(item => attendanceModal(data.employees, item)).join('')}` : ''}`;
}

function formatDate(value) {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

function attendanceModal(employees, item = null) {
  const editing = Boolean(item);
  return `<dialog id="${editing ? `editAttendance${item.id}` : 'attendanceModal'}"><form method="post" action="${editing ? `/attendance/${item.id}/edit` : '/attendance'}"><div class="modal-head"><div><h2>${editing ? 'Chinh sua cham cong' : 'Them cham cong'}</h2><p>Ghi nhan thoi gian lam viec trong ngay</p></div><button type="button" class="icon-btn" data-modal-close>${icon('x')}</button></div><div class="form-grid"><label>Nhan vien<select name="employeeId">${employees.map(employee => `<option value="${employee.id}" ${editing && employee.id === item.employeeId ? 'selected' : ''}>${employee.code} · ${employee.name}</option>`).join('')}</select></label><label>Ngay lam viec<input required type="date" name="date" value="${editing ? item.date : '2026-09-30'}"></label><label>Gio vao<input type="time" name="checkIn" value="${editing ? item.checkIn : '08:00'}"></label><label>Gio ra<input type="time" name="checkOut" value="${editing ? item.checkOut : '17:30'}"></label><label>Trang thai<select name="status">${['Dung gio','Di muon','Ve som','Dang lam viec','Vang mat','Nghi phep'].map(value => `<option ${editing && value === item.status ? 'selected' : ''}>${value}</option>`).join('')}</select></label><label>Ghi chu<input name="note" value="${editing ? escapeHtml(item.note) : ''}" placeholder="Thong tin bo sung"></label></div><div class="modal-actions"><button type="button" class="secondary" data-modal-close>Huy</button><button class="primary">${editing ? 'Luu thay doi' : 'Them cham cong'}</button></div></form></dialog>`;
}

function leaves(data) {
  const isHR = ['Admin','HR'].includes(data.user.role);
  const isManager = data.user.role === 'Truong phong';
  const notice = data.error ? `<div class="notice error">${escapeHtml(data.error)}</div>` : data.success ? `<div class="notice success">Thao tac nghi phep da duoc cap nhat.</div>` : '';
  const rows = data.leaves.map(item => {
    const requester = data.employees.find(employee => employee.id === item.employeeId);
    const managerCanApprove = isManager && item.employeeId !== data.user.employeeId && requester && requester.department === data.managerDepartment;
    const canApproveItem = isHR || managerCanApprove;
    let action = '—';
    if (item.status === 'Cho duyet') {
      if (canApproveItem) action = `<div class="actions"><form method="post" action="/leaves/${item.id}/approve"><button class="icon-btn approve" title="Duyet">${icon('check')}</button></form><form method="post" action="/leaves/${item.id}/reject"><button class="icon-btn danger" title="Tu choi">${icon('x')}</button></form></div>`;
      else if (!isManager && item.employeeId === data.user.employeeId) action = `<form method="post" action="/leaves/${item.id}/cancel"><button class="secondary compact">Huy don</button></form>`;
      else action = `<span class="pending-note">Cho HR xu ly</span>`;
    }
    return `<tr><td><strong>${item.employee}</strong><small class="cell-sub">${requester ? requester.department : ''}</small></td><td>${item.type}</td><td>${formatDate(item.from)}<small class="cell-sub">den ${formatDate(item.to)}</small></td><td>${item.days}</td><td>${item.reason}</td><td>${badge(item.status)}</td><td>${action}</td></tr>`;
  });
  return `${notice}<div class="page-tools"><div class="tabs"><button class="active">Tat ca</button><button>Cho duyet</button><button>Da xu ly</button></div><button class="primary" data-modal-open="leaveModal">${icon('plus')} Tao don nghi</button></div><section class="panel"><div class="panel-head"><div><h2>${isHR ? 'Quan ly nghi phep toan cong ty' : isManager ? `Nghi phep phong ${data.managerDepartment || ''}` : 'Don nghi cua toi'}</h2><p>${isManager ? 'Chi hien thi don cua ban va nhan vien cung phong ban' : 'Xet duyet va theo doi ngay nghi'}</p></div></div>${table(['Nhan vien','Loai nghi','Thoi gian','So ngay','Ly do','Trang thai','Xu ly'], rows)}</section>${leaveModal(isManager)}`;
}

function leaveModal(isManager) {
  return `<dialog id="leaveModal"><form method="post" action="/leaves"><div class="modal-head"><div><h2>Tao don nghi phep</h2><p>${isManager ? 'Don cua Truong phong se do HR xu ly' : 'Don se duoc gui den nguoi quan ly de xet duyet'}</p></div><button type="button" class="icon-btn" data-modal-close>${icon('x')}</button></div><div class="form-grid"><label>Loai nghi<select name="type"><option>Nghi phep nam</option><option>Nghi om</option><option>Nghi khong luong</option></select></label><label>Ngay bat dau<input required type="date" name="from"></label><label>Ngay ket thuc<input required type="date" name="to"></label><label class="full-field">Ly do<textarea required name="reason" rows="3" placeholder="Nhap ly do xin nghi"></textarea></label></div><div class="modal-actions"><button type="button" class="secondary" data-modal-close>Huy</button><button class="primary">Gui don</button></div></form></dialog>`;
}

function payroll(data) {
  const total = data.payroll.reduce((sum, x) => sum + x.net, 0);
  const canManage = ['Admin','HR'].includes(data.user.role);
  const period = data.payrollPeriod;
  const periodLabel = period ? `${String(period.month).padStart(2, '0')}/${period.year}` : 'Chua tao';
  const notice = data.error ? `<div class="notice error">${escapeHtml(data.error)}</div>` : data.success ? `<div class="notice success">Bang luong da duoc cap nhat.</div>` : '';
  const selfSalary = !canManage && data.employee ? `<section class="salary-contract"><div><small>Chuc vu</small><strong>${escapeHtml(data.employee.position)}</strong></div><div><small>Luong co ban cua toi</small><strong>${money(data.employee.baseSalary || 0)}</strong></div><div><small>Phu cap toi da</small><strong>${money(data.employee.allowance || 0)}</strong></div></section>` : '';
  const summaryLabel = canManage ? 'Tong thuc chi' : data.payroll.length ? 'Luong thuc nhan da chot' : 'Luong thang nay';
  const summaryValue = canManage || data.payroll.length ? money(total) : 'Cho HR chot';
  const rows = data.payroll.map(item => `<tr><td><strong>${item.employee}</strong><small class="cell-sub">Luong vi tri: ${money(item.contractBase || item.base)}</small></td><td>${item.actualDays == null ? '--' : `${item.actualDays}/${item.standardDays}`}</td><td>${money(item.base)}</td><td>${money(item.allowance)}</td><td>${money(item.overtime || 0)}</td><td class="negative">-${money(item.insurance || 0)}</td><td class="negative">-${money(item.tax || 0)}</td><td><strong>${money(item.net)}</strong></td></tr>`);
  const payslip = data.payroll.length ? table(['Nhan vien','Ngay cong','Luong theo cong','Phu cap','Cong vuot muc','Bao hiem','Thue TNCN','Thuc nhan'], rows) : `<div class="empty-state"><h2>Chua co phieu luong da chot</h2><p>So tien thuc nhan se hien thi sau khi HR chot bang luong cuoi thang.</p></div>`;
  return `${notice}<div class="page-tools"><div class="date-chip">${icon('calendar')} Ky luong ${periodLabel}</div>${canManage ? `<div class="actions"><form method="post" action="/payroll/generate"><button class="secondary">${icon('wallet')} Tinh lai bang luong</button></form>${period && period.status !== 'Da chot' ? `<form method="post" action="/payroll/close"><input type="hidden" name="month" value="${period.month}"><input type="hidden" name="year" value="${period.year}"><button class="primary">${icon('check')} Chot va phat phieu</button></form>` : ''}</div>` : ''}</div>${selfSalary}<section class="pay-summary"><div><p>${summaryLabel}</p><strong>${summaryValue}</strong><small>${canManage ? `${data.payroll.length} nhan vien` : 'Chi hien thi du lieu cua ban'} · ${period ? period.status : 'Chua chot'}</small></div><span>${icon('wallet')}</span></section><section class="pay-rules"><strong>Cong thuc ap dung</strong><span>Luong co ban / ngay cong chuan x ngay cong + phu cap + cong vuot muc - bao hiem - thue</span><small>Du ngay cong nhan du luong co ban. Moi ngay vuot muc duoc tinh 150% luong ngay. Phu cap duoc tinh theo ti le ngay cong.</small></section><section class="panel"><div class="panel-head"><div><h2>${canManage ? 'Chi tiet bang luong' : 'Phieu luong cua toi'}</h2><p>${canManage ? 'Luong duoc tinh theo muc cua tung chuc vu' : 'Chi hien thi sau khi HR da chot'}</p></div>${badge(period ? period.status : 'Chua chot')}</div>${payslip}</section>`;
}

function profile(data) {
  if (!data.employee) return `<section class="onboarding"><div class="onboarding-head"><p class="eyebrow">KHOI TAO HO SO</p><h2>Hoan tat thong tin ca nhan</h2><p>Thong tin nay chi duoc khai mot lan va se duoc tich hop vao ho so nhan su.</p></div>${data.error ? `<div class="notice error">${escapeHtml(data.error)}</div>` : ''}<form method="post" action="/profile/complete" class="onboarding-form"><label>Ho va ten<input required name="name" placeholder="Nguyen Van A"></label><label>Ngay sinh<input required type="date" name="birthDate"></label><label>Gioi tinh<select name="gender"><option>Nam</option><option>Nu</option><option>Khac</option></select></label><label>So CCCD<input required minlength="9" name="identityNumber" placeholder="Nhap so can cuoc"></label><label>So dien thoai<input required name="phone" placeholder="09xxxxxxxx"></label><label>Dia chi<input required name="address" placeholder="Tinh/Thanh pho"></label><label>Phong ban<select name="department">${data.departments.map(item => `<option>${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Chuc vu<select name="position">${data.positions.map(item => `<option>${escapeHtml(item.name)}</option>`).join('')}</select></label><label>Ngay vao lam<input required type="date" name="joined"></label><div class="onboarding-confirm"><span>${icon('shield')}</span><p><strong>Xac nhan thong tin</strong><small>Sau khi gui, nhan vien khong the tu sua ho so. HR se tiep nhan cac yeu cau dieu chinh.</small></p></div><button class="primary">Hoan tat ho so</button></form></section>`;
  const item = data.employee;
  return `${data.error ? `<div class="notice error">${escapeHtml(data.error)}</div>` : data.success ? `<div class="notice success">Ho so da duoc tich hop vao he thong.</div>` : ''}<section class="profile-hero"><span class="avatar profile-avatar">${item.avatar}</span><div><p class="eyebrow">${item.code}</p><h2>${item.name}</h2><p>${item.position} · ${item.department}</p></div>${badge(item.status)}</section><section class="profile-grid"><article class="panel profile-card"><h3>Thong tin ca nhan</h3><dl><div><dt>Email</dt><dd>${item.email}</dd></div><div><dt>So dien thoai</dt><dd>${item.phone}</dd></div><div><dt>Ngay sinh</dt><dd>${formatDate(item.birthDate)}</dd></div><div><dt>Gioi tinh</dt><dd>${item.gender}</dd></div><div><dt>CCCD</dt><dd>${item.identityNumber}</dd></div><div><dt>Dia chi</dt><dd>${item.address}</dd></div><div><dt>Ngay vao lam</dt><dd>${formatDate(item.joined)}</dd></div><div><dt>Chuc vu</dt><dd>${item.position}</dd></div></dl></article><article class="panel profile-card"><h3>Tong quan cua toi</h3><dl><div><dt>Ban cham cong</dt><dd>${data.attendances.length}</dd></div><div><dt>Luong co ban</dt><dd>${money(item.baseSalary || 0)}</dd></div><div><dt>Luong thuc nhan gan nhat</dt><dd>${data.payroll ? money(data.payroll.net) : 'Cho HR chot'}</dd></div><div><dt>Vai tro he thong</dt><dd>${data.user.role}</dd></div></dl></article></section>`;
}

function users(data) {
  return `<section class="panel"><div class="panel-head"><div><h2>Phan quyen nguoi dung</h2><p>Cap vai tro truy cap theo Hinh 3.1</p></div></div>${table(['Nguoi dung','Email','Vai tro','Cap nhat'], data.users.map(item => `<tr><td><strong>${item.name}</strong></td><td>${item.email}</td><td>${badge(item.role)}</td><td><form class="role-form" method="post" action="/users/${item.id}/role"><select name="role">${['Nhan vien','Truong phong','HR','Admin'].map(role => `<option ${role === item.role ? 'selected' : ''}>${role}</option>`).join('')}</select><button class="secondary">Cap nhat</button></form></td></tr>`))}</section>`;
}

const views = { dashboard, employees, departments, positions, attendance, leaves, payroll, profile, users };

function authLayout(data) {
  const isLogin = data.view === 'login';
  return `<div class="auth-page"><section class="auth-brand"><a class="auth-logo" href="/login"><span class="brand-mark">A</span><span>And Ci<small>Human Resources</small></span></a><div><p class="eyebrow">HE THONG QUAN LY NHAN SU</p><h1>Con nguoi tao nen suc manh cua doanh nghiep.</h1><p>Quan ly ho so, cham cong, nghi phep va bang luong tren mot he thong thong nhat.</p></div><footer>And Ci HRM · 2026</footer></section><section class="auth-content"><div class="auth-box"><div class="auth-mobile-logo"><span class="brand-mark">A</span><strong>And Ci</strong></div><p class="eyebrow">${isLogin ? 'CHAO MUNG TRO LAI' : 'TAO TAI KHOAN'}</p><h2>${isLogin ? 'Dang nhap' : 'Dang ky'}</h2><p class="auth-intro">${isLogin ? 'Nhap thong tin de truy cap he thong quan tri.' : 'Khoi tao tai khoan nhan vien cua ban.'}</p>${data.error ? `<div class="auth-error">${escapeHtml(data.error)}</div>` : ''}${isLogin ? loginForm() : registerForm()}<p class="auth-switch">${isLogin ? 'Chua co tai khoan?' : 'Da co tai khoan?'} <a href="/${isLogin ? 'register' : 'login'}">${isLogin ? 'Dang ky ngay' : 'Dang nhap'}</a></p>${isLogin ? '<div class="demo-account"><strong>Tai khoan mau</strong><span>admin@andci.vn · 123456</span></div>' : ''}</div></section></div>`;
}

function loginForm() {
  return `<form class="auth-form" method="post" action="/login"><label>Email<input required type="email" name="email" autocomplete="email" placeholder="ten@andci.vn"></label><label>Mat khau<input required type="password" name="password" autocomplete="current-password" placeholder="Nhap mat khau"></label><button class="primary auth-submit">Dang nhap</button></form>`;
}

function registerForm() {
  return `<form class="auth-form" method="post" action="/register"><label>Ho va ten<input required name="name" autocomplete="name" placeholder="Nguyen Van A"></label><label>Email<input required type="email" name="email" autocomplete="email" placeholder="ten@andci.vn"></label><label>Mat khau<input required minlength="6" type="password" name="password" autocomplete="new-password" placeholder="Toi thieu 6 ky tu"></label><label>Xac nhan mat khau<input required minlength="6" type="password" name="confirmPassword" autocomplete="new-password" placeholder="Nhap lai mat khau"></label><button class="primary auth-submit">Tao tai khoan</button></form>`;
}

exports.renderPage = data => `<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${data.title} | And Ci HRM</title><meta name="description" content="He thong quan ly nhan su And Ci"><link rel="icon" href="/public/favicon.svg"><link rel="stylesheet" href="/public/css/style.css"></head><body>${data.authPage ? authLayout(data) : `${sidebar(data.active, data.user)}<div class="shell">${header(data.title, data.user)}<main>${views[data.view](data)}</main></div><div class="overlay" id="overlay"></div>`}<script src="/public/js/app.js"></script></body></html>`;
