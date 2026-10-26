const store = require('../models/store');

exports.index = query => ({
  title: 'Nhan vien', view: 'employees', active: 'employees',
  employees: store.all('employees').filter(item => !query || `${item.name} ${item.code} ${item.department}`.toLowerCase().includes(query.toLowerCase())),
  departments: store.all('departments'),
  positions: store.all('positions').filter(item => item.status === 'Hoat dong'),
  query: query || ''
});

function salaryFor(positionName) {
  const position = store.all('positions').find(item => item.name === positionName);
  return { baseSalary: position?.baseSalary || 0, allowance: position?.allowance || 0, insuranceSalary: position?.baseSalary || 0 };
}

exports.create = body => store.create('employees', {
  code: body.code, name: body.name, email: body.email, phone: body.phone,
  department: body.department, position: body.position, status: body.status || 'Dang lam viec',
  joined: body.joined, avatar: body.name.split(' ').slice(-2).map(word => word[0]).join('').toUpperCase(),
  ...salaryFor(body.position), dependents: 0
});

exports.remove = id => store.remove('employees', id);

exports.update = (id, body) => store.update('employees', id, {
  name: body.name, email: body.email, phone: body.phone, department: body.department,
  position: body.position, status: body.status, joined: body.joined,
  avatar: body.name.split(' ').slice(-2).map(word => word[0]).join('').toUpperCase(),
  ...salaryFor(body.position)
});
