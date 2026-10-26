const crypto = require('crypto');
const store = require('./store');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, saved) {
  const [salt, storedHash] = saved.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, 'hex');
  return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored);
}

class UserModel {
  constructor() {
    this.sessions = new Map();
    this.create({ name: 'Quan tri And Ci', email: 'admin@andci.vn', password: '123456', role: 'Admin' });
    this.create({ name: 'Nguyen Minh Anh', email: 'hr@andci.vn', password: '123456', role: 'HR', employeeId: 1 });
    this.create({ name: 'Tran Quang Huy', email: 'manager@andci.vn', password: '123456', role: 'Truong phong', employeeId: 2 });
    this.create({ name: 'Pham Gia Bao', email: 'employee@andci.vn', password: '123456', role: 'Nhan vien', employeeId: 4 });
  }

  findByEmail(email) {
    return store.all('users').find(user => user.email === email.trim().toLowerCase());
  }

  create({ name, email, password, role = 'Nhan vien', employeeId = null }) {
    if (this.findByEmail(email)) throw new Error('Email da duoc su dung.');
    return store.create('users', {
      name: name.trim(), email: email.trim().toLowerCase(), passwordHash: hashPassword(password), role, employeeId
    });
  }

  login(email, password) {
    const user = this.findByEmail(email);
    if (!user || !verifyPassword(password, user.passwordHash)) return null;
    const token = crypto.randomBytes(32).toString('hex');
    this.sessions.set(token, user.id);
    return { token, user: this.publicUser(user) };
  }

  userFromToken(token) {
    const id = this.sessions.get(token);
    const user = id ? store.find('users', id) : null;
    return user ? this.publicUser(user) : null;
  }

  logout(token) { this.sessions.delete(token); }
  updateRole(id, role) { return store.update('users', id, { role }); }
  linkEmployee(id, employeeId) { return store.update('users', id, { employeeId: Number(employeeId) }); }
  all() { return store.all('users').map(user => this.publicUser(user)); }
  publicUser(user) { return { id: user.id, name: user.name, email: user.email, role: user.role, employeeId: user.employeeId }; }
}

module.exports = new UserModel();
