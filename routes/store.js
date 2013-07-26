// our 'database'

var ClientProvider = require('../clientprovider').ClientProvider;
var ProductProvider = require('../productprovider').ProductProvider;
var mongo = require('mongodb');
var BSON = mongo.BSONPure;
var async=require('async');

var items = {
    SKN:{name:'Shuriken', price:100},
    ASK:{name:'Ashiko', price:690},
    CGI:{name:'Chigiriki', price:250},
    NGT:{name:'Naginata', price:900},
    KTN:{name:'Katana', price:1000},
    ESP:{name:'Espada', price:2000}
};

var actualClients=[];
var actualProducts=[];

var clientProvider = new ClientProvider('ds037358.mongolab.com/heroku_app17049919',37358);
var productProvider = new ProductProvider('ds037358.mongolab.com/heroku_app17049919',37358);
var temporalRol;

exports.home = function(req, res){
	// if user is not logged in, ask them to login
    if (typeof req.session.username == 'undefined') res.render('home', { title: 'Ninja Store', operacion:""});
    // if user is logged in already, take them straight to the items list
    else if(temporalRol=="client")
    {
     res.redirect('/items');
    }
    else if (temporalRol=="admin") {
     res.render('admin', { title: 'Ninja Store', operacion:""});   
    };
};

exports.home_post_handler = function(req, res) {
    //Se envía contra la base de datos el request
    username = req.body.username; 
       if(!req.body.username.length<1 || !req.body.password.length<1)
        {          
            clientProvider.getClient(req.body.username,req.body.password,function(error,client)
            {
                if (client!=null)
                  {  
                    if(client.hasOwnProperty('rol'))
                    {
                       if(client.rol=="administrador")
                       {
                            console.log("Soy administrador");
                            req.session.username = username;
                            temporalRol = "admin";
                            res.redirect('/');
                       } 

                       else if(client.rol=="client")
                       {
                            req.session.username = username;
                            temporalRol = "client";
                            res.redirect('/');
                       }
                    }
                    else
                    {
                            //Usted es un cliente en la base de datos pero no tiene rol
                            res.redirect('/');
                    }
                 }
                 else
                 {
                    console.log("El cliente no existe en la base de datos");
                    res.render('home', {title:'Ninja Store', operacion:"Alguno de sus parámetros es inválido, vuelva a intentarlo"});
                 }
             
            });
        }

        else
        {
            //El cliente no ha digitado nada
            res.render('home', {title:'Ninja Store', operacion:"Alguno de sus parámetros es inválido, vuelva a intentarlo"});                
        }
};

// handler for displaying the items
exports.items = function(req, res) {
    // don't let nameless people view the items, redirect them back to the homepage
    if (typeof req.session.username == 'undefined') res.redirect('/');
    else {
            //Buscar los productos de ese usuario en específico
            clientProvider.getProductsByLogin(req.session.username, function(error, products)
                {
                    var productos =products.products;
                    var respuesta = {};
                    listaProductos =[];
                    console.log("los productos son: "+productos)

                    if(typeof productos!='undefined')
                    {  
                            var callsRemaining = productos.length;

                           
                            for(var i=0; i<productos.length;i++)
                            {
                                productProvider.getProductById(productos[i],function(error, product)
                                {
                                    listaProductos.push(product);
                                    --callsRemaining;

                                    if(callsRemaining<=0)
                                    {
                                        res.render('items', {title:'Ninja Store', items:listaProductos});                       
                                    }
                                });
                            }
                    }
                    else
                    {
                      res.render('items', {title:'Ninja Store', items:[]});                       
                    }
                }
            );   
         }
};
// handler for displaying individual items
exports.item = function(req, res) {
    // don't let nameless people view the items, redirect them back to the homepage
    if (typeof req.session.username == 'undefined') res.redirect('/');
    else {
        var name = items[req.params.id].name;
        var price = items[req.params.id].price;
        res.render('item', { title: 'Ninja Store - ' + name, username: req.session.username, name:name, price:price });
    }
};

// handler for showing simple pages
exports.page = function(req, res) {
    var name = req.query.name;
    var contents = {
        about: 'Ninja Store sells the coolest ninja stuff in the world. Anyone shopping here is cool.',
        contact: 'You can contact us at <address><strong>Ninja Store</strong>,<br>1, World Ninja Headquarters,<br>Ninja Avenue,<br>NIN80B7-JP,<br>Nihongo.</address>'
    };
    res.render('page', { title: 'Ninja Store - ' + name, username: req.session.username, content:contents[name] });
};


//El administrador puede agregar productos a la tienda
exports.agregar_producto = function(req, res)
{
    if (typeof req.session.username == 'undefined') res.redirect('/');
    else
    {
        if(req.body.producto!="" && req.body.cantidad!="" && req.body.precio!="" && req.body.description!="")
        {       
                //Llame a la funcion de la base de datos que agrega productos
                productProvider.agregarProducto(req.body.producto, req.body.description, req.body.cantidad, req.body.precio, function(error, records)
                {
                    if(error)
                    {
                        res.render('admin', {title:'Ninja Store', operacion:"La operacion agregar ha fallado en la base de datos, vuelva a intentarlo"});       
                        console.log("Ocurrio un error");
                    }
                    else
                    {
                        res.render('admin', {title:'Ninja Store', operacion:"La operacion agregar ha sido un éxito"});
                        console.log("Todo bien dijo el pibe");
                    }
                }
             );
        }
        else
        {
            //No haga nada el man no ha digitado nada
            res.render('admin', {title:'Ninja Store', operacion:"Su producto no se ha guardado porque es vacío"});                
            console.log("El productor que quiere guardar es vacio");
        }
    }
}

exports.obtener_clientes = function (req, res)
{
 if (typeof req.session.username == 'undefined') res.redirect('/');  
 else
 {
    clientProvider.getClients(function(error,clients)
        {
            if(!error)
            {
                //No hubo errores al obtener los clientes
                   for(var i=0;i<clients.length;i++){
                         var obj = clients[i];
                     for(var key in obj){
                         var attrName = key;
                         var attrValue = obj[key];
                         if(attrName=="username")
                         {
                            actualClients.push(attrValue); 
                         }
                      }
                    }

                    productProvider.getProducts(function(error,products)
                        {
                            if(!error)
                            {
                                //No hubo errores al obtener los clientes
                                   for(var i=0;i<products.length;i++){
                                         var obj = products[i];
                                     for(var key in obj){
                                         var attrName = key;
                                         var attrValue = obj[key];
                                         if(attrName=="product_name")
                                         {
                                            actualProducts.push(attrValue); 
                                         }
                                      }
                                    }
                              res.render('asignarproductos', {title: 'Ninja Store', operacion:'',items:clients, products:products});    
                            }
                            else
                            {

                            }
                        }
                    );
            }

            else
            {

            }
        }
    ); 
 
 } 
}


exports.obtener_productos = function (req, res)
{
 if (typeof req.session.username == 'undefined') res.redirect('/');  
 else
 {
                  productProvider.getProducts(function(error,products)
                        {
                            if(!error)
                            {
                                //No hubo errores al obtener los clientes
                                   for(var i=0;i<products.length;i++){
                                         var obj = products[i];
                                     for(var key in obj){
                                         var attrName = key;
                                         var attrValue = obj[key];
                                         if(attrName=="product_name")
                                         {
                                            actualProducts.push(attrValue); 
                                         }
                                      }
                                    }
                              res.render('editarproducto', {title: 'Ninja Store', operacion:'',products:products});    
                            }
                            else
                            {

                            }
                        }
                    );
 } 
}

exports.asignar_producto_cliente = function (req, res)
{
 if (typeof req.session.username == 'undefined') res.redirect('/');  
 else
 {
    //Buscar el producto con product_name ingresado por parámetro,
    //asigar el producto específico al cliente
    var product_name = req.body.prod;
    var user_name = req.body.browser;

    //La interfaz asegura que los clientes y los productos que se insertan existen,
    //No hay que preocuparse por estos errores

    console.log("El producto que desea asignar al cliente: "+user_name +" es: "+product_name);

        productProvider.getProduct(product_name, function(error, product)
        {
            if (error) {
                console.log("Ha ocurrido un error con la base de datos, obteniendo el producto, probablemente no exista")
                res.render('admin', { title: 'Ninja Store', operacion:"Ha ocurrido un error accediendo la base de datos"});  
            }
            else
            {
               clientProvider.updateProductList(user_name, product._id, function(error, data)
               {
                    if(error)
                    { 
                        console.log("Ha ocurrido un error accediendo la base de datos");
                        res.render('admin', { title: 'Ninja Store', operacion:"Ha ocurrido un error accediendo la base de datos"});  
                    }
                    else
                    {
                        console.log("Se asignado con el éxito el producto al cliente especificado");
                        res.render('admin', { title: 'Ninja Store', operacion:"Se asignado con el éxito, el producto al cliente especificado"});   
                    }    
               });
            }    
        });
 }
}



exports.agregar_cliente = function (req, res){
  if (typeof req.session.username == 'undefined') res.redirect('/'); 
  else
  {
    //Hacer un update sobre la base de datos
    var user_name = req.body.usuario;
    var password = req.body.password;
    var rol = req.body.roles;

    console.log(user_name);
    console.log(password);
    console.log(rol);


    if(user_name!="" && password!="" && rol!="")
    {
        clientProvider.addClient(user_name, password, rol, function(error, records)
        {
            if(error)
            {
              res.render('admin', {title:'Ninja Store', operacion:"La operacion agregar-usuario ha fallado en la base de datos, vuelva a intentarlo"});       
            }

            else
            {
              res.render('admin', {title:'Ninja Store', operacion:"La operacion agregar-usuario ha sido un exito"});        
            }

        });
       
    }
    else
    {
      res.render('admin', {title:'Ninja Store', operacion:"Todos los campos son necesarios"});        
    }
  }
}  


exports.borrarProducto = function (req, res)
{
  if (typeof req.session.username == 'undefined') res.redirect('/'); 
  else
  {
    console.log("El producto que se desea borrar es: "+req.body.productos)
    //1- Sobre cada objeto cliente borrar la referencia
    productProvider.deleteProduct(req.body.productos, function(error, records)
    {
      if(!error)
      {
          clientProvider.deleteProductReferences(function ()
          {
              productProvider.getProductIdByName(req.body.productos, function(error, productId)
                  {
                          //Borre la referencia en la tabla de productos
                          if(!error)
                          {
                            return productId;
                          }
                          else
                          {
                            console.log("Ha ocurrido un error");
                          }
                  }); 

          }  
          , 
          function(error, numberOfRemovedFiles)
          {
            if(!error)
            {
                //Buscar el id del producto dado su noombre
                console.log("No hubo errores y hubo: "+numberOfRemovedFiles)

            }
            else
            {
              //No se borro de la tabla de productos
              console.log("No se pudo borrar el producto en la tabla de productos");
            }       
        });
          
      }
      else
      {

      }
    });
  }
}

exports.editarProducto = function(req, res)
{
  if (typeof req.session.username == 'undefined') res.redirect('/'); 
  else
  {
    var product_name = req.body.productos;
    var nombre_nuevo = req.body.producto;
    var cantidad_nueva = req.body.cantidad;
    var descripcion_nueva = req.body.description;
    var precio_producto = req.body.precio;

    if(product_name!=null && nombre_nuevo !=null && descripcion_nueva!=null && cantidad_nueva!=null && precio_producto!=null)
    {
        productProvider.updateProduct(product_name,nombre_nuevo,descripcion_nueva,cantidad_nueva, precio_producto, function (error, results)
        {
            if(!error)
            {
                res.render('admin', {title:'Ninja Store', operacion:"Se actualizó el producto correctamente"});         
            }
            else
            {
                res.render('admin', {title:'Ninja Store', operacion:"Hubo error, intentelo nuevamente"});          
            }
        });
    }
    else
    {
      res.render('admin', {title:'Ninja Store', operacion:"Todos los campos son necesarios"});         
    }
  }
}





