const Factura = require('../models/Factura.model');
const Usuarios = require('../models/usuarios.model');
const Producto = require('../models/productos.model');



function mostrarListaFacturas(req, res) {
    var parametros = req.body;
    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No puedes ver esta informacion'});
    }else{
        if(parametros.idUsuario){
            Factura.find({idUsuario : parametros.idUsuario}, (err, facturaEncontrada)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!facturaEncontrada) return res.status(500).send({mensaje: 'Este usuario no tiene facturas'});

                return res.status(200).send({factura: facturaEncontrada});
            });
        }else{
            Factura.find((err, facturasEncontradas)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!facturasEncontradas) return res.status(500).send({mensaje: 'Este usuario no tiene facturas'});

                return res.status(200).send({'Facturas registradas': facturasEncontradas});
            });
        }
    }
}

function mostrarProductosFacturas(req, res) {
    var parametros = req.body;
    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No puedes ver esta infomacion'});
    }else{
        if(parametros.id){
            Factura.findOne({_id : parametros.id}, (err, facturaEncontrada)=>{
                if(err) return res.status(500)
                .send({mensaje: 'Error en la peticion'});
                if(!facturaEncontrada) return res.status(404).send({mensaje: 'Este usuario no tiene facturas'});

                return res.status(200).send({facturas: facturaEncontrada.listaProductos});
            });
        }else{
            return res.status(500).send({mensaje: 'Debe asignar ID de la factura para mostrar los productos'})
        }
    }
}



function obtenerProductosMasVendidos (req, res) {
    Producto.find((err, productosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err }); 
        return res.send({ 'Productos mas vendidos': productosObtenidos})
        
    }).sort({
        vendido : -1,
    }).limit(5)
}

module.exports = {
    mostrarListaFacturas,
    mostrarProductosFacturas,
    obtenerProductosMasVendidos
}