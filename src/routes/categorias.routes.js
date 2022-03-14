const express = require('express');
const categoriasController = require('../controllers/categorias.controller');
const md_autenticacion =  require('../middlewares/autenticacion');

var api = express.Router();

api.get('/categorias', categoriasController.obtenerCategorias);// YA ESTA HECHO
api.get('/categorias/id/:idCategoria', categoriasController.obtenerCategoriaId);
api.get('/categorias/nombre/:nombreCategoria', categoriasController.obtenerCategoriaNombre);
api.post('/categorias/agregarCategoria', md_autenticacion.Auth, categoriasController.agregarCategoria);//pendiente
api.put('/categorias/editar/:idCategoria',md_autenticacion.Auth, categoriasController.editarCategoria);// YA ESTA HECHO
api.delete('/categorias/eliminar/:idCategoria', md_autenticacion.Auth,categoriasController.eliminarCategoria);//YA ESTA HECHO

module.exports = api;