const aSnake = (texto) => texto.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
const aCamel = (texto) => texto.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());

function aFilaSnake(entidad) {
  return Object.fromEntries(Object.entries(entidad).map(([k, v]) => [aSnake(k), v]));
}

function aObjetoCamel(fila) {
  if (!fila) return fila;
  return Object.fromEntries(Object.entries(fila).map(([k, v]) => [aCamel(k), v]));
}

module.exports = { aSnake, aCamel, aFilaSnake, aObjetoCamel };