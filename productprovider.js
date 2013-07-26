var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';

//Constructir de la clase
ProductProvider = function(host, port) {
  console.log(host);
  console.log(port);
};


//Obtiene la colección de productos
ProductProvider.prototype.getCollection= function(callback) {
     mongo.Db.connect(mongoUri, function(error,db)
      { 
          db.collection('product', function(err,product_collection)
                {
                   if(err)
                   {
                    callback(error);
                   } 

                   else callback(null, product_collection);
                }
            ); 
      }
    );      
}


//El administrador es capaz de actualizar la base de datos
//con productos
ProductProvider.prototype.agregarProducto= function(nombre,descripcionP,cantidadP,precioP,callback) {
  var newProduct = {product_name:nombre, descripcion:descripcionP, cantidad: cantidadP, precio:precioP};
  this.getCollection(function(error, product_collection)
  {
  	if(error) callback(error)
  	else
  	{
  		product_collection.insert(newProduct, function(err, records){
  			callback(null, records);
      }
	  	);
  	}	
  }
 );
}

//Obtiene todos los productos que estan registrados en ese momento
ProductProvider.prototype.getProducts = function(callback)
{
  this.getCollection(function(error,product_collection)
          {
            if(error) callback(error)
            else
            {
              product_collection.find().toArray(function (error, results)
                {
                  if(error) callback(error)
                  else callback (null, results)                    
                }
                );
            } 
          }
    );
}


// Obtiene un producto dado el product_name de ese producto.Para efectos prácticos 
// el product_name es el identificador único de un producto
//Obtiene un cliente dado un login y un password que están dados por parámetro
ProductProvider.prototype.getProduct = function(product_name, callback)
{
  this.getCollection(function(error,product_collection)
          {
            if(error) callback(error)
            else
            {
              product_collection.findOne({"product_name":product_name}, function (error, product)
                {
                  if(error) callback(error)
                  else callback (null, product)                    
                }
                );
            } 
          }
    );
}


// Obtiene un producto dado el id de ese producto
ProductProvider.prototype.getProductById = function(product_id, callback)
{

  this.getCollection(function(error,product_collection)
          {
            if(error) callback(error)
            else
            {
              product_collection.findOne({"_id":product_id}, function (error, product)
                {
                  console.log(product);
                  if(error) callback(error)
                  else callback (null, product)                    
                }
                );
            } 
          }
    );
}

//Obtiene el id de un producto dado su nombre
ProductProvider.prototype.getProductIdByName = function(product_name, callback)
{
  
  this.getCollection(function(error,product_collection)
          {
            if(error) callback(error)
            else
            {
              product_collection.findOne({"product_name":product_name},{"_id":true}, function (error, product)
                {
                  console.log(product);
                  if(error) {
                    console.log("Paila la mocha");
                    callback(error)
                  }
                  else 
                    {
                      callback (null, product) 
                    }                   
                }
                );
            } 
          }
    );
}


//Borra un producto dado su id 
ProductProvider.prototype.deleteProduct = function(product_id, callback)
{
  this.getCollection(function(error,product_collection)
          {
            if(error) callback(error)
            else
            {
              product_collection.remove({"product_name":product_id}, function (error, numberOfRemovedProducts)
                {
                  if(error) callback(error)
                  else callback (null, numberOfRemovedProducts)                    
                }
                );
            } 
          }
    );
}


//Actualiza un producto dado su nombre y los otros parametros adicionales
ProductProvider.prototype.updateProduct = function(product_name,new_name,descripcionP,cantidadP, precioP, callback)
{
  this.getCollection(function(error,product_collection)
          {
            if(error) callback(error)
            else
            {
              product_collection.update({"product_name":product_name}, {$set:{"product_name":new_name, "descripcion": descripcionP, "cantidad":cantidadP, "precio":precioP}}, function (error, results)
                {
                  if(error) callback(error)
                  else callback (null, results)                    
                }
                );
            } 
          }
    );
}

exports.ProductProvider = ProductProvider;


