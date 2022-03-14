const Categorias = require('../models/categorias.model');
const Productos = require('../models/productos.model');

function obtenerCategorias (req, res) {
    Categorias.find((err, categoriasObtenidas) => {
        if (err) return res.send({ mensaje: "Error: " + err });
        return res.send({ categoria: categoriasObtenidas })
    });
}

function obtenerCategoriaId(req, res) {
    var idCat = req.params.idCategoria;
    Categorias.findById(idCat, (err, categoriaEncontrada) => {
        if (err) return res.status(404).send({ mensaje: 'Error en la peticion' });
        if (!categoriaEncontrada) return res.status(500).send( { mensaje: 'Error, no se obtuvieron los datos' });
        return res.status(200).send({ categoria: categoriaEncontrada });
    })
}

function obtenerCategoriaNombre(req, res) {
    var nomCat = req.params.nombreCategoria;

    Categorias.find( { nombreCategoria : { $regex: nomCat, $options: 'i' } }, (err, categoiraEncontrada) => {
        if(err) return res.status(404).send({ mensaje: "Error en la peticion" });
        if(!categoiraEncontrada) return res.status(500).send({ mensaje: "Error no han encontrado las categorias" });

        return res.status(200).send({ categoria: categoiraEncontrada });
    })
}

function agregarCategoria (req, res){
    var parametros = req.body;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No cuentas con los permisos suficientes para poder realizar esta acción'});
    }else{      
        if( parametros.nombre) {
            
            Categorias.find({nombreCategoria: parametros.nombre}).exec((err, categoriasEncontradas)=>{
                for(let i = 0; i < categoriasEncontradas.length; i++){
                    if(categoriasEncontradas[i].nombreCategoria === parametros.nombre) return res.status(400).send({ mensaje: "Esta categoria ya existe" });           
                }
                    var categoriaModelo = new Categorias();
                    categoriaModelo.nombreCategoria = parametros.nombre;
                    categoriaModelo.save((err, categoriaGuardada) => {
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion" });
                        if(!categoriaGuardada) return res.status(500).send({ mensaje: "Error al guardar la categoria"});
                                                
                        return res.status(200).send({ categoria: categoriaGuardada});
                    })
            });
        }
    }
}

function editarCategoria (req, res) {
    var idCat = req.params.idCategoria;
    var parametros = req.body;

    if(req.user.rol == 'Cliente'){
        return res.status(404).send({mensaje: 'No tienes permiso para realizar esta accion'});
    }else{
        Categorias.findByIdAndUpdate(idCat, parametros, { new: true } ,(err, categoriaActualizada) => {
            if (err) return res.status(404).send({ mensaje: 'Error en la peticion'});
            if(!categoriaActualizada) return res.status(500).send( { mensaje: 'Error no se puede editar categoria'});
    
            return res.status(200).send({ categoria: categoriaActualizada});
        });
    }
}

function eliminarCategoria(req, res) {
    var idCat = req.params.idCategoria;

    if(req.user.rol == 'Cliente'){
        return res.status(500).send({mensaje: 'No tienes permiso para realizar esta accion'});
    }else{
        Categorias.findOne({_id: idCat}, (err, categoriaProducto)=>{
            if(err) return res.status(404).send({ mensaje: "Error en la peticion" });
            if(!categoriaProducto) return res.status(500).send({ mensaje: "no se han encontrado los productos"})
    
            Categorias.findOne({nombreCategoria: 'Por Defecto'}, (err, categoriaEncontrada)=>{
                if(err) return res.status(500).send({ mensaje: "Error no hay categoria por defecto" });
                if(!categoriaEncontrada){
                    const modeloCategoria = new Categorias();
                    modeloCategoria.nombreCategoria = 'Por Defecto';
    
                    modeloCategoria.save((err, categoriaGuardada)=>{
                        if(err) return res.status(404).send({ mensaje: "Error en la peticion" })
                        if(!categoriaGuardada) return res.status(500).send({ mensaje: 'no se ha agregado la categoria'})
    
                        Productos.updateMany({idCategoria: idCat}, {idCategoria: categoriaGuardada._id}, (err, categoriaActualizada)=>{
                            if(err) return res.status(404).send({ mensaje: "Error en la peticion de actualizar productos" })
                            Categorias.findByIdAndDelete(idCat,{new: true}, (categoriaEliminada)=>{
                                if(err) return res.status(500).send({ mensaje: "Error en la peticion de eliminar la categoria" })
                                if(categoriaEliminada) return res.status(404).send({ mensaje: "error al eliminar categoria"})
    
                                return res.status(200).send({
                                    editado: categoriaActualizada,
                                    eliminado: categoriaEliminada
                                })
                            })
                        })
                    });
                }else{
                    Productos.updateMany({idCategoria: idCat}, {idCategoria: categoriaEncontrada._id},(err, productosActualizados)=>{
                        if(err) return res.status(404).send({ mensaje: "Error en la peticion al actualizar los productos"})
                        Categorias.findByIdAndDelete(idCat, (err, categoriaEliminada)=>{
                            if(err) return res.status(500).send({ mensaje: 'error en la peticion al eliminar la categoria'})
                            return res.status(200).send({
                                editado: productosActualizados,
                                eliminado: categoriaEliminada
                            })
                        })
                    })
                }
            })
        })
    }
}

module.exports = {
    obtenerCategorias,
    obtenerCategoriaId,
    obtenerCategoriaNombre,
    agregarCategoria,
    editarCategoria,
    eliminarCategoria
}