const store = require('../models/store');
const userModel = require('../models/userModel');

exports.profile = user => {
  const employee = user.employeeId ? store.find('employees', user.employeeId) : null;
  const closedPeriods = [...store.all('payrollPeriods')].filter(item => item.status === 'Da chot').sort((a, b) => b.year - a.year || b.month - a.month);
  const latestClosed = closedPeriods[0];
  return {
    title: 'Thong tin ca nhan', view: 'profile', active: 'profile', employee,
    attendances: employee ? store.all('attendance').filter(item => item.employeeId === employee.id) : [],
    payroll: employee && latestClosed ? store.all('payroll').find(item => item.employeeId === employee.id && item.month === latestClosed.month && item.year === latestClosed.year) : null,
    departments: store.all('departments'), positions: store.all('positions')
  };
};

exports.completeProfile = (user, body) => {
  if (user.employeeId) throw new Error('Ho so ca nhan chi duoc khoi tao mot lan.');
  if (store.all('employees').some(item => item.identityNumber === body.identityNumber.trim())) throw new Error('So CCCD da ton tai trong he thong.');
  const position = store.all('positions').find(item => item.name === body.position);
  const employee = store.create('employees', {
    code: `NV${String(store.all('employees').length + 1).padStart(3, '0')}`,
    name: body.name.trim(), email: user.email, phone: body.phone.trim(), birthDate: body.birthDate,
    gender: body.gender, identityNumber: body.identityNumber.trim(), address: body.address.trim(),
    department: body.department, position: body.position, status: 'Dang lam viec', joined: body.joined,
    avatar: body.name.trim().split(' ').slice(-2).map(word => word[0]).join('').toUpperCase(),
    baseSalary: position?.baseSalary || 0, allowance: position?.allowance || 0,
    insuranceSalary: position?.baseSalary || 0, dependents: 0
  });
  userModel.linkEmployee(user.id, employee.id);
  return employee;
};

exports.users = () => ({ title: 'Phan quyen', view: 'users', active: 'users', users: userModel.all() });
exports.updateRole = (id, role) => userModel.updateRole(id, role);
