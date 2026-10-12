const IRepositorio = require("../interfaces/IRepositorio");
const { aSnake, aFilaSnake, aObjetoCamel } = require("./mapeoCampos");

class RepositorioMySQL extends IRepositorio {
  constructor(pool, tabla) {
    super();
    this.pool = pool;
    this.tabla = tabla;
  }
 
  async guardar(entidad) {
    const [resultado] = await this.pool.query("INSERT INTO ?? SET ?", [this.tabla, aFilaSnake(entidad)]);
    return resultado.insertId;
  }
 
  async buscarPorId(id) {
    const [rows] = await this.pool.query("SELECT * FROM ?? WHERE id = ?", [this.tabla, id]);
    return aObjetoCamel(rows[0]);
  }
 
  async buscarPor(columna, valor) {
    const [rows] = await this.pool.query("SELECT * FROM ?? WHERE ?? = ?", [this.tabla, aSnake(columna), valor]);
    return rows.map((fila) => aObjetoCamel(fila));
  }
 
  async listar() {
    const [rows] = await this.pool.query("SELECT * FROM ??", [this.tabla]);
    return rows.map((fila) => aObjetoCamel(fila));
  }
 
  async actualizar(id, entidad) {
    await this.pool.query("UPDATE ?? SET ? WHERE id = ?", [this.tabla, aFilaSnake(entidad), id]);
    return true;
  }
 
  async eliminar(id) {
    await this.pool.query("DELETE FROM ?? WHERE id = ?", [this.tabla, id]);
    return true;
  }
}
 
module.exports = RepositorioMySQL;