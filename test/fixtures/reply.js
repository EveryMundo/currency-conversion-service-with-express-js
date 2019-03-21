class Reply {
  constructor() {
    // default behavior
    this.statusCode = 200;
    this.body = {};
    this.headersSent = false;
  }

  code(c) {
    this.statusCode = c;
    return this;
  }

  status(s) {
    this.statusCode = s;
    this.headersSent = true;
    return this;
  }

  send(m) {
    this.headersSent = true;
    this.body = m;
    return this;
  }

  json(m) {
    this.body = m;
    return this;
  }

  get body() {
    return this._body;
  }

  set body(b) {
    this._body = b;
  }

  set statusCode(s) {
    this._status = s;
  }

  get statusCode() {
    return this._status;
  }
}

module.exports = {Reply};
