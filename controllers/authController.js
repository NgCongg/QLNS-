const userModel = require('../models/userModel');

function cookies(req) {
  return Object.fromEntries((req.headers.cookie || '').split(';').filter(Boolean).map(item => {
    const [key, ...value] = item.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }));
}

exports.currentUser = req => userModel.userFromToken(cookies(req).session);

exports.login = body => {
  if (!body.email || !body.password) throw new Error('Vui long nhap email va mat khau.');
  const result = userModel.login(body.email, body.password);
  if (!result) throw new Error('Email hoac mat khau khong chinh xac.');
  return result;
};

exports.register = body => {
  if (!body.name || !body.email || !body.password) throw new Error('Vui long nhap day du thong tin.');
  if (body.password.length < 6) throw new Error('Mat khau phai co it nhat 6 ky tu.');
  if (body.password !== body.confirmPassword) throw new Error('Mat khau xac nhan khong khop.');
  userModel.create(body);
  return userModel.login(body.email, body.password);
};

exports.logout = req => userModel.logout(cookies(req).session);
