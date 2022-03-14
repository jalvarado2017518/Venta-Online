const express = require('express');
const productosController = require('../controllers/productos.controller');
const md_autenticacion =  require('../middlewares/autenticacion');

var api = express.Router();

api.get('/productos', productosController.obtenerProductos);//hecho YA ESTA HECHO
api.get('/productos/categoria', productosController.obtenerProductosPorCategoria);// PENDINTE
api.get('/productos/id/:idProductos', productosController.obtenerProductoId);//hecho YA ESTA HECHO
api.get('/productos/nombre/:nombre', productosController.obtenerProductoNombre);//hecho YA ESTA HECHO
api.post('/productos/agregar', md_autenticacion.Auth,productosController.agregarProducto);//hecho YA ESTA HECHO
api.put('/productos/editar/:idProducto',md_autenticacion.Auth, productosController.editarProducto);//hecho YA ESTA HECHO
api.delete('/productos/eliminar/:idProducto', md_autenticacion.Auth,productosController.eliminarProducto);//hecho
api.put('/productos/stock/:idProducto', md_autenticacion.Auth,productosController.stockProducto);


module.exports = api;