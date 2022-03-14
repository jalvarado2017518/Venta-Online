const express = require('express');
const usuariosController = require('../controllers/usuarios.controller');
const md_autenticacion = require('../middlewares/autenticacion');


var api = express.Router();

//rutas para Usuarios
api.get('/usuarios', usuariosController.obtenerUsuarios);//pendiente
api.post('/usuarios/agregarAdministradores',md_autenticacion.Auth, usuariosController.registrarAdministradores);//hecho
api.post('/register', usuariosController.registrarClientes);//hecho SI DEBERIA ESTAR
api.put('/usuarios/editar/:idUsuario?', md_autenticacion.Auth, usuariosController.editarUsuarios);//hecho1 SI DEBERIA ESTAR
api.delete('/usuarios/eliminar/:idUsuario?', md_autenticacion.Auth, usuariosController.eliminarUsuarios);//hecho SI DEBERIA ESTAR
api.get('/usuarios/buscarNombre/:dBusqueda', usuariosController.buscarUsuarios);//hecho
api.get('/usuarios/buscarRol/:dBusqueda', usuariosController.buscarUsuariosRol);//hecho
api.get('/usuarios/buscarId/:idUsuario', usuariosController.buscarUsuariosId);//hecho
api.post('/login', usuariosController.Login);//hecho-SI DEBERIA ESTAR
api.put('/usuarios/carrito/agregar', md_autenticacion.Auth, usuariosController.agregarProductoCarrito);//SI DEBERIA ESTAR
api.post('/carrito/confirmar', md_autenticacion.Auth, usuariosController.carroAfactura);//SI DEBERIA ESTAR
api.put('/carrito/eliminar', md_autenticacion.Auth, usuariosController.eliminarProductoCarrito);// SI DEBERIA ESTAR
module.exports = api;