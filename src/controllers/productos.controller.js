// IMPORTACIONES
const Productos = require('../models/productos.model');
const Categorias = require('../models/categorias.model');

// Obtener datos Productos de Mongo
function obtenerProductos (req, res) {
    Productos.find((err, productosObtenidos) => {
        if (err) return res.send({ mensaje: "Error: " + err });

        Productos.find((err, productosObtenidosAll) => {
            if (err) return res.send({ mensaje: "Error: " + err });
    
            return res.send({ 'Mas vendidos': productosObtenidos,
        'Lista de productos': productosObtenidosAll})
        })
    }).sort({
        vendido : -1,
    }).limit(5)
}

// OBTENER PRODUCTO POR ID
function obtenerProductoId(req, res) {
    var idProd = req.params.idProductos;

    Productos.findById(idProd, (err, productoEncontrado) => {
        if (err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if (!productoEncontrado) return res.status(404).send( { mensaje: 'Error a la hora obtener los datos' });

        return res.status(200).send({ producto: productoEncontrado });
    })
}

function obtenerProductoNombre(req, res) {
    var nomb = req.params.nombreProducto;

    Productos.find( { nombreProducto : { $regex: nomb, $options: 'i' } }, (err, productoEncontrado) => {
        if(err) return res.status(404).send({ mensaje: "Error en la peticion" });
        if(!productoEncontrado) return res.status(500).send({ mensaje: "Error no han encontrado las categorias" });

        return res.status(200).send({ producto: productoEncontrado });
    })
}

function obtenerProductosPorCategoria(req, res) {
    var parametros = req.body;

    Categorias.findOne({nombreCategoria: parametros.nombre}, (err, categoriaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
        if(!categoriaEncontrada) return res.status(500).send({ mensaje: 'Categoria no existente, intente de nuevo'});

        Productos.find({idCategoria: categoriaEncontrada._id}, (err, productoEcontrado) => {
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion' });
            if(!productoEcontrado) return res.status(500).send({ mensaje: 'Este producto no se encuentra'});

            return res.status(200).send({ producto: productoEcontrado});
        })
    })
}

// AGREGAR PRODUCTOS
function agregarProducto (req, res){
    var parametros = req.body;
    var productoModelo = new Productos();

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes permiso para realizar esta accion'});
    }else{
        if( parametros.nombre && parametros.cantidad && parametros.precio ) {
            
            Productos.find({nombre : parametros.nombre}, (err, productoEncontrado)=>{
                for(let i = 0; i < productoEncontrado.length; i++){
                    if(productoEncontrado[i].nombre === parametros.nombre) return res.status(400).send({ mensaje: "El producto ya existe" });
                    
                }
                Categorias.findOne({_id: parametros.idCategoria}, (err, categoriaEncontrada)=>{
                    if(err) return res.status(500).send({ mensaje: 'No existe esta categoria '});
                    if(!categoriaEncontrada) return res.status(500).send({ mensaje: 'no existe esta categoria'})

                    productoModelo.nombre = parametros.nombre;
                    productoModelo.cantidad = parametros.cantidad;
                    productoModelo.precio = parametros.precio;
                    productoModelo.vendido = 0;
                    productoModelo.idCategoria = parametros.idCategoria;
    
                    productoModelo.save((err, productoGuardado) => {
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                        if(!productoGuardado) return res.status(404).send( { mensaje: "Error, no se han podido agregar el producto"});
    
                        return res.status(200).send({ producto: productoGuardado });
                    })
                })
                
            })
            
        }
    }
}

// EDITAR PRODUCTO
function editarProducto (req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes permiso para realizar esta accion'});
    }else{
        Productos.findByIdAndUpdate(idProd, parametros, { new: true } ,(err, productoActualizado) => {
            if (err) return res.status(500).send({ mensaje: 'Error en la peticion'});
            if(!productoActualizado) return res.status(404).send( { mensaje: 'Error, no a podido editar el producto'});
        
            return res.status(200).send({ producto: productoActualizado});
        });
        
    }
}

function eliminarProducto(req, res) {
    var idProd = req.params.idProducto;
    var parametros = req.body;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes permiso para realizar esta accion'});
    }else{
        Productos.findByIdAndDelete(idProd, (err, productoEliminado) => {
            if(err) return res.status(500).send({ mensaje: 'Error en la peticion'});
            if(!productoEliminado) return res.status(404).send( { mensaje: 'Error no se a podido eliminar el producto'});
    
            return res.status(200).send({ producto: productoEliminado});
        });
    }
}

function stockProducto(req, res) {
    const productoId = req.params.idProducto;
    const parametros = req.body;


    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes permiso para realizar esta accion'});
    }else{
        let comparar = 0;
        Productos.findById(productoId, (err, productoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
            if(!productoEncontrado) return res.status(500).send({ mensaje: 'Error no se puede editar la cantidad del producto'});

            if(parametros.cantidad < 0){
                comparar = Number(parametros.cantidad) + Number(productoEncontrado.cantidad)
                if(comparar < 0) return res.status(500).send({mensaje : 'No se pudo quitar esa cantidad'})

                Productos.findByIdAndUpdate(productoId, { $inc : { cantidad: parametros.cantidad } }, { new: true },
                    (err, productoModificado) => {
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if(!productoModificado) return res.status(500).send({ mensaje: 'Error no se a podido editar la cantidad del producto'});
            
                    return res.status(200).send({ producto: productoModificado});
                });
            }else{
                Productos.findByIdAndUpdate(productoId, { $inc : { cantidad: parametros.cantidad } }, { new: true },
                    (err, productoModificado) => {
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if(!productoModificado) return res.status(500).send({ mensaje: 'Error no se pudo editar la cantidad del producto'});
            
                    return res.status(200).send({ producto: productoModificado});
                });
            }
        })
        
    }
}

module.exports = {
    obtenerProductos,
    obtenerProductoId,
    obtenerProductoNombre,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    stockProducto,
    obtenerProductosPorCategoria
}