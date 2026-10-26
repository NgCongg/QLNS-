const { MongoClient } = require('mongodb');
const seed = require('../data/seed');

class Store {
  constructor() {
    this.data = structuredClone(seed);
    this.client = null;
    this.database = null;
    this.pendingWrites = Promise.resolve();
  }

  async connect(
    uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017',
    databaseName = process.env.MONGODB_DB || 'qlns_andci'
  ) {
    this.client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await this.client.connect();
    this.database = this.client.db(databaseName);

    for (const resource of Object.keys(this.data)) {
      const collection = this.database.collection(resource);
      const savedRows = await collection.find({}, { projection: { _id: 0 } }).toArray();
      if (savedRows.length) {
        this.data[resource] = savedRows;
      } else if (this.data[resource].length) {
        await collection.insertMany(structuredClone(this.data[resource]));
      }
    }

    await this.createIndexes();
    console.log(`Da ket noi MongoDB: ${databaseName}`);
  }

  async createIndexes() {
    const indexes = {
      users: [[{ email: 1 }, { unique: true }]],
      employees: [
        [{ code: 1 }, { unique: true }],
        [{ email: 1 }, { unique: true }],
        [{ identityNumber: 1 }, { unique: true, sparse: true }]
      ],
      departments: [[{ code: 1 }, { unique: true }], [{ name: 1 }, { unique: true }]],
      positions: [[{ code: 1 }, { unique: true }], [{ name: 1 }, { unique: true }]],
      attendance: [[{ employeeId: 1, date: 1 }, { unique: true }]],
      payrollPeriods: [[{ month: 1, year: 1 }, { unique: true }]],
      payroll: [[{ employeeId: 1, month: 1, year: 1 }, { unique: true }]]
    };

    for (const [resource, definitions] of Object.entries(indexes)) {
      for (const [keys, options] of definitions) {
        await this.database.collection(resource).createIndex(keys, options);
      }
    }
  }

  queueWrite(operation) {
    if (!this.database) return;
    this.pendingWrites = this.pendingWrites
      .then(operation)
      .catch(error => console.error('Khong the dong bo MongoDB:', error.message));
  }

  all(resource) { return this.data[resource] || []; }

  find(resource, id) {
    return this.all(resource).find(item => item.id === Number(id));
  }

  create(resource, values) {
    const rows = this.all(resource);
    const item = { id: Math.max(0, ...rows.map(row => row.id)) + 1, ...values };
    rows.unshift(item);
    this.queueWrite(() => this.database.collection(resource).insertOne(structuredClone(item)));
    return item;
  }

  update(resource, id, values) {
    const item = this.find(resource, id);
    if (!item) return null;
    Object.assign(item, values);
    this.queueWrite(() => this.database.collection(resource).updateOne(
      { id: Number(id) },
      { $set: structuredClone(values) }
    ));
    return item;
  }

  remove(resource, id) {
    const rows = this.all(resource);
    const index = rows.findIndex(item => item.id === Number(id));
    if (index < 0) return false;
    rows.splice(index, 1);
    this.queueWrite(() => this.database.collection(resource).deleteOne({ id: Number(id) }));
    return true;
  }

  async close() {
    await this.pendingWrites;
    if (this.client) await this.client.close();
  }
}

module.exports = new Store();
