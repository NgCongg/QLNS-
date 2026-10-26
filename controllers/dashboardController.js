const store = require('../models/store');

exports.index = () => {
  const employees = store.all('employees');
  const leaves = store.all('leaves');
  const payroll = store.all('payroll');
  return {
    title: 'Tong quan', view: 'dashboard', active: 'dashboard',
    stats: {
      employees: employees.length,
      active: employees.filter(item => item.status === 'Dang lam viec').length,
      pendingLeave: leaves.filter(item => item.status === 'Cho duyet').length,
      payroll: payroll.reduce((sum, item) => sum + item.net, 0)
    },
    employees: employees.slice(0, 5), leaves: leaves.slice(0, 3)
  };
};
