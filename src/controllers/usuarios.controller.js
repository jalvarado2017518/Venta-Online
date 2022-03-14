const Usuarios = require('../models/usuarios.model');
const Producto = require('../models/productos.model');
const Factura = require('../models/Factura.model');
const bcrypt = require('bcrypt-nodejs');
const jwt = require('../services/jwt'); 

function UsuarioInicial() {
    Usuarios.find({ rol: "Admin", usuario: "ADMIN" }, (err, usuarioEcontrado) => {
      if (usuarioEcontrado.length == 0) {
        bcrypt.hash("123456", null, null, (err, passwordEncriptada) => {
          Usuarios.create({
            usuario: "ADMIN",
            password: passwordEncriptada,
            rol: "Admin",
          });
        });
      }
    });
  }


function obtenerUsuarios(req, res) {

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No puede ver esta informacion'})
    }else{
        Usuarios.find((err , usuariosObtenidos) => {
            if(err) return res.send({mensaje: "error:" + err})
            if(!usuariosObtenidos) return res.status(500).send({mensaje: 'No se han encontrado usuarios en la base de datos'});
        
        return res.send({usuarios: usuariosObtenidos})
    })
    }
} 

function registrarClientes(req, res){
    var parametros = req.body;
    var usuarioModelo = new Usuarios();
        if (parametros.nombre && parametros.usuario && parametros.password) {
            usuarioModelo.nombre = parametros.nombre;
            usuarioModelo.usuario = parametros.usuario;
            usuarioModelo.rol = 'Cliente';   
            usuarioModelo.totalCarrito = 0;
            if(parametros.rol == 'Cliente') return res.status(500).send({mensaje: 'No puedes escoger el rol, eres CLIENTE'});
            Usuarios.find({usuario: parametros.usuario}, (err, usuarioEcontrado) => {
                if(usuarioEcontrado == 0){   
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModelo.password = passwordEncriptada;  
                        usuarioModelo.save((err, usuarioGuardado) => {
                            if(err) return res.status(500).send({message: 'Error en la peticion'});
                            if(!usuarioGuardado) return res.status(404).send({message: 'No se han encontrado los usuarios'});
                            return res.status(200).send({usuario: usuarioGuardado});
                        });
                    });
                }else{
                    return res.status(404).send({mensaje: 'Error pruebe otro usuario'});
                }                
            })
        }else{
            return res.status(500).send({mensaje: 'Por favor, llene todos los campos'});
        }
}

function registrarAdministradores(req, res){
    var parametros = req.body;
    var usuarioModelo = new Usuarios();

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No puedes realizar esta accion'});
    }else{
        if (parametros.nombre && parametros.usuario && parametros.password) {
            usuarioModelo.nombre = parametros.nombre;
            usuarioModelo.usuario = parametros.usuario;
            usuarioModelo.rol = 'ADMIN';   
            Usuarios.find({usuario: parametros.usuario}, (err, usuarioEcontrado) => {
                if(usuarioEcontrado == 0){
                    bcrypt.hash(parametros.password, null, null, (err, passwordEncriptada) => {
                        usuarioModelo.password = passwordEncriptada;
    
                        usuarioModelo.save((err, usuarioGuardado) => {
                            if(err) return res.status(500).send({message: 'Error en la peticion'});
                            if(!usuarioGuardado) return res.status(404).send({message: 'No se han encontrado los usuarios'});
                
                            return res.status(200).send({usuario: usuarioGuardado});
                        });
                    });
                }else{
                    return res.status(500).send({mensaje: 'Error pruebe otro usuario'});
                } 
                
            })
        }
    }
}

function Login(req, res) {
    var parametros = req.body;
    Usuarios.findOne({usuario: parametros.usuario}, (err, usuarioEcontrado) =>{
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(usuarioEcontrado){
            bcrypt.compare(parametros.password, usuarioEcontrado.password, (err, verificacionPassword)=>{
                if(verificacionPassword){
                    if(parametros.obtenerToken === 'true'){
                        Factura.find({idUsuario: usuarioEcontrado._id}, (err, facturaEncontrada)=>{
                            if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                            if(!facturaEncontrada) return res.status(500).send({mensaje: 'Este usuario no ha hecho ninguna compra'})
                    
                            return res.status(200).send({token: jwt.crearToken(usuarioEcontrado), 'tus compras: ': facturaEncontrada}
                                );
                        })
                    }else{
                        usuarioEcontrado.password = undefined;
                        return res.status(200).send({usuario: usuarioEcontrado});
                    }
                }else{
                    return res.status(500).send({message: 'contraseña incorrecta, pruebe otra vez'});
                }
            }); 
        }else{
            return res.status(500).send({mensaje: 'Usuario no encontrado'});
        }
    });
}



function editarUsuarios(req, res) {
    var idUsuario = req.params.idUsuario;
    var parametros = req.body;

   if(req.user.rol == 'Cliente'){
    if(parametros.rol){
        return res.status(500).send({message: 'No puedes modificar el rol'})
    }else{
    Usuarios.findByIdAndUpdate({_id: req.user.sub}, parametros, {new: true}, (err, usuarioActualizado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioActualizado) return res.status(404).send({message: 'No se han encontrado los usuarios'});

        return res.status(200).send({usuario: usuarioActualizado});
    });
}
   }else{
       Usuarios.findById(idUsuario, (err, usuarioEcontrado)=>{
           if (err) return res.status(500).send({message: 'Ocurrio un error en la peticion de usuario'});
           if(!usuarioEcontrado) return res.status(500).send({message: 'Este usuaio no existe'});

           if(usuarioEcontrado.rol == 'Cliente'){
            Usuarios.findByIdAndUpdate({_id: idUsuario}, parametros, {new: true}, (err, usuarioActualizado) => {
                if(err) return res.status(500).send({message: 'Error en la peticion'});
                if(!usuarioActualizado) return res.status(404).send({message: 'No puedes modificar a otro admnistrador'});
        
                return res.status(200).send({usuarios: usuarioActualizado});
            });
           }else{
               if(idUsdddu == req.user.sub){
                   if(!parametros.rol){
                    Usuarios.findByIdAndUpdate({_id: idUsuario}, parametros, {new: true}, (err, usuarioActualizado) => {
                        if(err) return res.status(500).send({message: 'Error en la peticion'});
                        if(!usuarioActualizado) return res.status(404).send({message: 'No puedes modificar a otro admnistrador'});
                
                        return res.status(200).send({usuarios: usuarioActualizado});
                    });
                   }else{
                       return res.status(500).send({mensaje: 'No puedes modificar tu rol'})
                   }
               }else{
                   return res.status(500).send({mensaje: 'No puedes modificar a otro admnistrador'});
               }
           }
       })
        
       }
  
}

function eliminarUsuarios(req, res) {
    var idUsuario = req.params.idUsuario;

    if(req.user.rol == 'ADMIN'){
        Usuarios.findByIdAndDelete({_id: req.user.sub}, {new: true}, (err, usuarioEliminado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEliminado) return res.status(404).send({message: 'No se encontraron usuarios'});

        return res.status(200).send({usuario: usuarioEliminado});
    })
    }else if(req.user.rol == 'Cliente'){
        if(idUsuario == req.user.sub){
            Usuarios.findByIdAndDelete(idUsuario, {new: true}, (err, usuarioEliminado) => {
                if(err) return res.status(500).send({message: 'Error en la peticion'});
                if(!usuarioEliminado) return res.status(404).send({message: 'No se encontraron usuarios'});
        
                return res.status(200).send({usuarios: usuarioEliminado});
            })
        }else{
            return res.status(404).send({mensaje: 'No puedes eliminar a otros administradores'})
        }
    }else{
        return res.status(500).send({mensaje: 'Ocurrio un error, intentelo mas tarde'})
    }
}

function buscarUsuarios(req, res) {
    var busqueda = req.params.dBusqueda;

    Usuarios.find({nombre: {$regex: busqueda, $options: 'i'}}, (err, usuarioEcontrado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEcontrado) return res.status(404).send({message: 'No se encontraron usuarios'});

        return res.status(200).send({usuarios: usuarioEcontrado});
    })

    
}

function buscarUsuariosRol(req, res) {
    var busqueda = req.params.dBusqueda;

    Usuarios.find({rol: {$regex: busqueda, $options: 'i'}}, (err, usuarioEcontrado) => {
        if(err) return res.status(500).send({message: 'Error en la peticion'});
        if(!usuarioEcontrado) return res.status(404).send({message: 'No se encontraron usuarios'});

        return res.status(200).send({usuarios: usuarioEcontrado});
    })

    
}

function buscarUsuariosId(req, res) {
    var idUsu = req.params.idUsuario;
    Usuarios.findById(idUsu, (err, usuarioEcontrado) => {

        if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
        if (!usuarioEcontrado) return res.status(500).send({ mensaje: "" });

        return res.status(200).send({ usuarios: usuarioEcontrado });
    })
}


function agregarProductoCarrito(req, res) {
    const usuarioLogeado = req.user.sub;
    const parametros = req.body;

    if(req.user.rol == 'ADMIN'){
        return res.status(500).send({mensaje: 'El administrador no puede tener carrito'});
    }else{
        Producto.findOne({ nombre: parametros.nombreProducto }, (err, productoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"});
            if(!productoEncontrado) return res.status(404).send({ mensaje: 'El producto no existe'});
    
            if(parametros.cantidad > productoEncontrado.cantidad){
                return res.status(500).send({mensaje: 'No contamos con suficiente stock'})
            }else{
                Usuarios.findOne({_id: req.user.sub, carrito:{$elemMatch: {nombreProducto: parametros.nombreProducto}}}, (err, carritoEncontrado) => {
                    if (err) return res.status(500).send({ mensaje: 'Ocurrio un error en la petición'});
                    
        
                    let cantidadLocal = 0;
                    let subTotalLocal = 0;
                    let compararStock = 0;
                    if(carritoEncontrado){
                        for (let i = 0; i <carritoEncontrado.carrito.length; i++) {
                            if(carritoEncontrado.carrito[i].nombreProducto == parametros.nombreProducto){
                                cantidadLocal = carritoEncontrado.carrito[i].cantidadComprada;
                                subTotalLocal = Number(cantidadLocal) + Number(parametros.cantidad);
                                if(subTotalLocal > productoEncontrado.cantidad){
                                    return res.status(500).send({mensaje: 'No contamos con stock suficiente'})
                                }else{
                                    Usuarios.findOneAndUpdate({ carrito: { $elemMatch : { _id: carritoEncontrado.carrito[i]._id} } },
                                        {$inc: { "carrito.$.cantidadComprada":parametros.cantidad}, "carrito.$.subTotal": subTotalLocal  *  productoEncontrado.precio}, 
                                         {new : true}, (err, cantidadAgregada)=>{
                                            if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                                            if(!cantidadAgregada) return res.status(500)
                                                .send({ mensaje: "Error no se guardo la cantidad"});
                                
                                                let totalCantidad =0
                                                let totalCarritoLocal = 0;
                                
                                                for(let i = 0; i < cantidadAgregada.carrito.length; i++){
                                                    totalCarritoLocal += cantidadAgregada.carrito[i].subTotal 
                                                     
                                                }
                                
                                                Usuarios.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal }, {new: true},
                                                    (err, totalActualizado)=> {
                                                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                                                        if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
                                
                                                        return res.status(200).send({ sdf: totalActualizado })
                                                    })
                                    })
                                }
                            }else{
        
                            }
                        }
                    }else{
                        Usuarios.findByIdAndUpdate(usuarioLogeado, { $push: { carrito: { nombreProducto: parametros.nombreProducto,
                            cantidadComprada: parametros.cantidad, precioUnitario: productoEncontrado.precio, subTotal: parametros.cantidad *  productoEncontrado.precio} } }, { new: true}, 
                            (err, usuarioActualizado)=>{
                                if(err) return res.status(500).send({ mensaje: "Error en la peticion de Usuario"});
                                if(!usuarioActualizado) return res.status(500).send({ mensaje: 'Error al agregar el producto al carrito'});
                
                                let totalCantidad =0
                                let totalCarritoLocal = 0;
                
                                for(let i = 0; i < usuarioActualizado.carrito.length; i++){

                                    totalCarritoLocal += usuarioActualizado.carrito[i].subTotal 
                                     
                                }
                
                                Usuarios.findByIdAndUpdate(usuarioLogeado, { totalCarrito: totalCarritoLocal }, {new: true},
                                    (err, totalActualizado)=> {
                                        if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                                        if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
                
                                        return res.status(200).send({ usuario: totalActualizado })
                                    })
                            })
                    }
                    
                })
        
            }
        })
    }
    
}


function carroAfactura(req, res){
    var parametros = req.body;
    var logueado = req.user.nombre;

     const facturaModel = new Factura();

     if(req.user.rol == 'ADMIN'){
         return res.status(500).send({mensaje: 'Eres un administrador, no puedes tener carrito y tampoco facturas'})
     }else{
        Usuarios.findById(req.user.sub, (err, usuarioEncontrado)=>{

            if(usuarioEncontrado.carrito == ''){
                return res.status(500).send({mensaje: 'El carrito esta vacio, no se puede generar una factura'})
            }else{
                facturaModel.listaProductos = usuarioEncontrado.carrito;
                facturaModel.idUsuario = req.user.sub;
                facturaModel.totalFactura = usuarioEncontrado.totalCarrito;
                if(parametros.nit){
                    facturaModel.nit = parametros.nit
                }else{
                    facturaModel.nit = 'Consumidor final'
                }
                
    
                facturaModel.save((err, facturaGuaardada) => {
                    if (err) return res.status(500).send({mensaje : "Error en la peticion"});
                    if(!facturaGuaardada) return res.status(500).send({mensaje : "Ocurrio un error al intentar guardar la factura"})
                    obtenerPDF(facturaGuaardada, logueado);
                    
                
                    for (let i = 0; i < usuarioEncontrado.carrito.length; i++) {
                        Producto.findOneAndUpdate({nombre: usuarioEncontrado.carrito[i].nombreProducto} , 
                            {  $inc : { cantidad: usuarioEncontrado.carrito[i].cantidadComprada * -1, 
                            vendido: usuarioEncontrado.carrito[i].cantidadComprada }}, (err, datosProducto) =>{
                        if (err) return res.status(500).send({mensaje: 'Error en la peticion'});
                        if(!datosProducto) return res.status(500).send({mensaje: 'Ocurrio un error al modificar el stock'})
    
                    })
                    }
                    Usuarios.findByIdAndUpdate(req.user.sub, { $set: { carrito: [] }, totalCarrito: 0 }, { new: true }, 
                        (err, carritoVacio)=>{
                            return res.status(200).send({ factura: facturaGuaardada })
                        })
                })
                
            }
        }) 
     }
}


function eliminarProductoCarrito(req, res) {
    var parametros = req.body;
    
    let totalCarritoLocal = 0;

    if(req.user.rol == 'ADMIN'){
        return res.status(500).send({mensaje: 'El administrador no puede realizar esta accion'})
    }else{
        Producto.findOne({nombre: parametros.nombreProducto}, (err, productoEncontrado) => {
            if (err) return res.status(500).send({mensaje: 'Error en la peticion'})
            if(!productoEncontrado) return res.status(500).send({mensaje: 'Producto no existente, ingrese otro nombre'});
    
            Usuarios.updateOne({_id: req.user.sub},{ $pull: { carrito: {nombreProducto:parametros.nombreProducto} } }, (err, carritoEliminado)=>{
                if(err) return res.status(500).send({mensaje: 'Error en la peticion'});
                if(!carritoEliminado) return res.status(500).send({mensaje: 'Este producto no esta en tu carrito, verfica bien el nombre'});
                Usuarios.findOne({_id: req.user.sub}, (err, usuarioEncontrado) =>{
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                    if(!usuarioEncontrado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
        
                    for (let i = 0; i < usuarioEncontrado.carrito.length; i++){
                        totalCarritoLocal += usuarioEncontrado.carrito[i].subTotal  
                    }
                    Usuarios.findByIdAndUpdate({_id: req.user.sub},  { totalCarrito: totalCarritoLocal }, {new: true},
                        (err, totalActualizado)=> {
                            if(err) return res.status(500).send({ mensaje: "Error en la peticion de Total Carrito"});
                            if(!totalActualizado) return res.status(500).send({ mensaje: 'Error al modificar el total del carrito'});
            
                            return res.status(200).send({ usuario: totalActualizado })
                        });
                });
                
            });
        });
    }
}




module.exports = {
    UsuarioInicial,
    obtenerUsuarios,
    registrarClientes,
    registrarAdministradores,
    editarUsuarios,
    eliminarUsuarios,
    buscarUsuarios,
    buscarUsuariosRol,
    buscarUsuariosId,
    Login,
    agregarProductoCarrito,
    carroAfactura,
    eliminarProductoCarrito
}