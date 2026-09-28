const IRepositorio = require("../interfaces/IRepositorio");

class RepositorioMySQL extends IRepositorio {
  constructor(pool, tabla) {
    super();
    this.pool = pool;
    this.tabla = tabla;
  }

  async guardar(entidad) {
    const [resultado] = await this.pool.query(
      `INSERT INTO ${this.tabla} SET ?`,
      [entidad]
    );
    return resultado.insertId;
  }

  async buscarPorId(id) {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.tabla} WHERE id = ?`,
      [id]
    );
    return rows[0];
  }

  async listar() {
    const [rows] = await this.pool.query(
      `SELECT * FROM ${this.tabla}`
    );
    return rows;
  }

  async actualizar(id, entidad) {
    await this.pool.query(
      `UPDATE ${this.tabla} SET ? WHERE id = ?`,
      [entidad, id]
    );
    return true;
  }

  async eliminar(id) {
    await this.pool.query(
      `DELETE FROM ${this.tabla} WHERE id = ?`,
      [id]
    );
    return true;
  }
}

module.exports = RepositorioMySQL;