const express = require('express');
const md_autenticacion =  require('../middlewares/autenticacion');
const facturasController = require('../Controllers/factura.controller');

var api = express.Router();

api.get('/facturas', md_autenticacion.Auth,facturasController.mostrarListaFacturas);
api.get('/facturas/productos', md_autenticacion.Auth,facturasController.mostrarProductosFacturas);
api.get('/productos/mas-vendidos',facturasController.obtenerProductosMasVendidos);

module.exports = api;