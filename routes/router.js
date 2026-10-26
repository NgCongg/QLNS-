const dashboard = require('../controllers/dashboardController');
const employee = require('../controllers/employeeController');
const moduleController = require('../controllers/moduleController');
const auth = require('../controllers/authController');
const account = require('../controllers/accountController');

function redirect(res, location, headers = {}) {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
}

module.exports = async function route(req, res, render, body) {
  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  if (req.method === 'GET' && path === '/login') return render(res, { title: 'Dang nhap', view: 'login', authPage: true, error: url.searchParams.get('error') });
  if (req.method === 'GET' && path === '/register') return render(res, { title: 'Dang ky', view: 'register', authPage: true, error: url.searchParams.get('error') });
  if (req.method === 'POST' && path === '/login') {
    try {
      const result = auth.login(await body(req));
      return redirect(res, '/', { 'Set-Cookie': `session=${result.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800` });
    } catch (error) { return redirect(res, `/login?error=${encodeURIComponent(error.message)}`); }
  }
  if (req.method === 'POST' && path === '/register') {
    try {
      const result = auth.register(await body(req));
      return redirect(res, '/', { 'Set-Cookie': `session=${result.token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800` });
    } catch (error) { return redirect(res, `/register?error=${encodeURIComponent(error.message)}`); }
  }
  if (req.method === 'POST' && path === '/logout') {
    auth.logout(req);
    return redirect(res, '/login', { 'Set-Cookie': 'session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0' });
  }

  const user = auth.currentUser(req);
  if (!user) return redirect(res, '/login');
  const securedRender = (response, data) => render(response, { ...data, user });
  const isAdmin = user.role === 'Admin';
  const isHR = user.role === 'HR' || isAdmin;
  const isManager = user.role === 'Truong phong';

  if (req.method === 'GET' && path === '/profile') return securedRender(res, { ...account.profile(user), error: url.searchParams.get('error'), success: url.searchParams.get('success') });
  if (req.method === 'POST' && path === '/profile/complete') {
    try { account.completeProfile(user, await body(req)); return redirect(res, '/profile?success=completed'); }
    catch (error) { return redirect(res, `/profile?error=${encodeURIComponent(error.message)}`); }
  }
  if (req.method === 'GET' && path === '/users') return isAdmin ? securedRender(res, account.users()) : redirect(res, '/');
  if (req.method === 'POST' && /^\/users\/\d+\/role$/.test(path)) {
    if (!isAdmin) return redirect(res, '/');
    account.updateRole(path.split('/')[2], (await body(req)).role);
    return redirect(res, '/users?success=updated');
  }

  if (req.method === 'GET' && path === '/') return securedRender(res, isHR ? dashboard.index() : { ...account.profile(user), error: url.searchParams.get('error'), success: url.searchParams.get('success') });
  if (req.method === 'GET' && path === '/employees') return isHR ? securedRender(res, employee.index(url.searchParams.get('q'))) : redirect(res, '/profile');
  if (req.method === 'POST' && path === '/employees' && isHR) { employee.create(await body(req)); return redirect(res, '/employees?success=created'); }
  if (req.method === 'POST' && /^\/employees\/\d+\/edit$/.test(path) && isHR) { employee.update(path.split('/')[2], await body(req)); return redirect(res, '/employees?success=updated'); }
  if (req.method === 'POST' && /^\/employees\/\d+\/delete$/.test(path) && isHR) { employee.remove(path.split('/')[2]); return redirect(res, '/employees?success=deleted'); }
  if (req.method === 'GET' && ['/departments', '/positions', '/attendance', '/leaves', '/payroll'].includes(path)) {
    const resource = path.slice(1);
    if (['departments','positions'].includes(resource) && !isHR) return redirect(res, '/profile');
    const data = moduleController.index(resource);
    if (!isHR && user.employeeId) {
      if (resource === 'attendance') {
        data.attendance = data.attendance.filter(item => item.employeeId === user.employeeId);
        const today = moduleController.today();
        data.today = today;
        data.todayRecord = data.attendance.find(item => item.date === today.date);
      }
      if (resource === 'leaves') {
        if (isManager) {
          const manager = data.employees.find(item => item.id === user.employeeId);
          const sameDepartmentIds = new Set(data.employees.filter(item => manager && item.department === manager.department).map(item => item.id));
          data.leaves = data.leaves.filter(item => item.employeeId === user.employeeId || sameDepartmentIds.has(item.employeeId));
          data.managerDepartment = manager ? manager.department : null;
        } else {
          data.leaves = data.leaves.filter(item => item.employeeId === user.employeeId);
        }
      }
      if (resource === 'payroll') {
        data.employee = data.employees.find(item => item.id === user.employeeId);
        const closedPeriod = data.payrollPeriods.find(item => item.status === 'Da chot');
        data.payrollPeriod = closedPeriod;
        data.payroll = closedPeriod ? data.payroll.filter(item => item.employeeId === user.employeeId && item.month === closedPeriod.month && item.year === closedPeriod.year) : [];
      }
    } else if (resource === 'payroll' && data.payrollPeriod) {
      data.payroll = data.payroll.filter(item => item.month === data.payrollPeriod.month && item.year === data.payrollPeriod.year);
    }
    return securedRender(res, { ...data, error: url.searchParams.get('error'), success: url.searchParams.get('success') });
  }
  if (req.method === 'POST' && path === '/departments' && isHR) {
    try { moduleController.createDepartment(await body(req)); return redirect(res, '/departments?success=created'); }
    catch (error) { return redirect(res, `/departments?error=${encodeURIComponent(error.message)}`); }
  }
  if (req.method === 'POST' && /^\/departments\/\d+\/edit$/.test(path) && isHR) {
    try { moduleController.updateDepartment(path.split('/')[2], await body(req)); return redirect(res, '/departments?success=updated'); }
    catch (error) { return redirect(res, `/departments?error=${encodeURIComponent(error.message)}`); }
  }
  if (req.method === 'POST' && /^\/departments\/\d+\/delete$/.test(path) && isHR) {
    try { moduleController.removeDepartment(path.split('/')[2]); return redirect(res, '/departments?success=deleted'); }
    catch (error) { return redirect(res, `/departments?error=${encodeURIComponent(error.message)}`); }
  }
  if (req.method === 'POST' && path === '/attendance' && isHR) { moduleController.createAttendance(await body(req)); return redirect(res, '/attendance?success=created'); }
  if (req.method === 'POST' && /^\/attendance\/\d+\/edit$/.test(path) && isHR) { moduleController.updateAttendance(path.split('/')[2], await body(req)); return redirect(res, '/attendance?success=updated'); }
  if (req.method === 'POST' && /^\/attendance\/\d+\/delete$/.test(path) && isHR) { moduleController.removeAttendance(path.split('/')[2]); return redirect(res, '/attendance?success=deleted'); }
  if (req.method === 'POST' && path === '/attendance/check-in' && !isHR) { try { moduleController.employeeCheckIn(user); return redirect(res, '/attendance?success=checked-in'); } catch (error) { return redirect(res, `/attendance?error=${encodeURIComponent(error.message)}`); } }
  if (req.method === 'POST' && path === '/attendance/check-out' && !isHR) { try { moduleController.employeeCheckOut(user); return redirect(res, '/attendance?success=checked-out'); } catch (error) { return redirect(res, `/attendance?error=${encodeURIComponent(error.message)}`); } }
  if (req.method === 'POST' && path === '/leaves') {
    try { moduleController.createLeave(await body(req), user); return redirect(res, '/leaves?success=created'); }
    catch (error) { return redirect(res, `/leaves?error=${encodeURIComponent(error.message)}`); }
  }
  if (req.method === 'POST' && /^\/leaves\/\d+\/cancel$/.test(path)) {
    try { moduleController.cancelLeave(path.split('/')[2], user); return redirect(res, '/leaves?success=cancelled'); }
    catch (error) { return redirect(res, `/leaves?error=${encodeURIComponent(error.message)}`); }
  }
  if (req.method === 'POST' && path === '/payroll/status' && isHR) { moduleController.updatePayrollStatus((await body(req)).status); return redirect(res, '/payroll?success=updated'); }
  if (req.method === 'POST' && path === '/payroll/generate' && isHR) { moduleController.generatePayroll(); return redirect(res, '/payroll?success=generated'); }
  if (req.method === 'POST' && path === '/payroll/close' && isHR) { try { moduleController.closePayroll(await body(req)); return redirect(res, '/payroll?success=closed'); } catch (error) { return redirect(res, `/payroll?error=${encodeURIComponent(error.message)}`); } }
  if (req.method === 'POST' && path === '/positions' && isHR) { try { moduleController.createPosition(await body(req)); return redirect(res, '/departments?success=position-created'); } catch (error) { return redirect(res, `/departments?error=${encodeURIComponent(error.message)}`); } }
  if (req.method === 'POST' && /^\/positions\/\d+\/edit$/.test(path) && isHR) { moduleController.updatePosition(path.split('/')[2], await body(req)); return redirect(res, '/departments?success=position-updated'); }
  if (req.method === 'POST' && /^\/positions\/\d+\/delete$/.test(path) && isHR) { try { moduleController.removePosition(path.split('/')[2]); return redirect(res, '/departments?success=position-deleted'); } catch (error) { return redirect(res, `/departments?error=${encodeURIComponent(error.message)}`); } }
  if (req.method === 'POST' && /^\/leaves\/\d+\/(approve|reject)$/.test(path) && (isHR || isManager)) {
    const [, , id, action] = path.split('/');
    try { moduleController.processLeave(id, action, user); return redirect(res, '/leaves?success=processed'); }
    catch (error) { return redirect(res, `/leaves?error=${encodeURIComponent(error.message)}`); }
  }
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>404</h1><p>Trang khong ton tai.</p>');
};
