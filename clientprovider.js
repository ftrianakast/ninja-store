var Db = require('mongodb').Db;
var Connection = require('mongodb').Connection;
var Server = require('mongodb').Server;
var BSON = require('mongodb').BSON;
var ObjectID = require('mongodb').ObjectID;
var mongo = require('mongodb');
var mongoUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/mydb';

//Constructir de la clase
ClientProvider = function(host, port) {
  console.log(host);
  console.log(port); 
};

//Obtiene la colección de empleados, sino puede en primera instacia
//Vuelve y lo intenta

ClientProvider.prototype.getCollection= function(callback) {
  mongo.Db.connect(mongoUri, function(error,db)
        {
          db.collection('client', function(err,client_collection)
                {
                   if(err)
                   {
                    callback(error);
                   } 

                   else callback(null, client_collection);
                }
            );
        }
    );   
}

//Obtiene un cliente dado un login y un password que están dados por parámetro
ClientProvider.prototype.getClient = function(login, password, callback)
{
  this.getCollection(function(error,client_collection)
          {
            if(error) callback(error)
            else
            {
              client_collection.findOne({"username":login,"password":password}, function (error, results)
                {
                  if(error) callback(error)
                  else callback (null, results)                    
                }
                );
            } 
          }
    );
}



//Obtiene un cliente dado su login
ClientProvider.prototype.getClientByLogin = function(login, callback)
{
  this.getCollection(function(error,client_collection)
          {
            if(error) callback(error)
            else
            {
              client_collection.findOne({"username":login}, function (error, client)
                {
                  if(error) callback(error)
                  else callback (null, results)                    
                }
                );
            } 
          }
    );
}


//Obtiene todos los clientes que estan registrados en ese momento
ClientProvider.prototype.getClients = function(callback)
{
  this.getCollection(function(error,client_collection)
          {
            if(error) callback(error)
            else
            {
              client_collection.find().toArray(function (error, results)
                {
                  if(error) callback(error)
                  else callback (null, results)                    
                }
                );
            } 
          }
    );
}


//Retorna los productos de un usuario dado su login
ClientProvider.prototype.getProductsByLogin = function(login, callback)
{
  this.getCollection(function(error, client_collection)
    {
      if(error) callback(error)
      else
      {
        client_collection.findOne({"username":login},{fields:{"products":true}}, function (error, products)
                {
                  if(error) callback(error)
                  else callback (null, products)                    
                }
        );
      }  
    }
  );
}


//Asigna un objeto producto al cliente con el user_name ingresado por parámetro
ClientProvider.prototype.updateProductList= function(username, product_object,callback)
{
  console.log("La clienta a la que se le quiere agregar el producto es:" +username);  
    this.getCollection(function(error, client_collection)
    {

      if(error) callback(error)
      else  
      {
        client_collection.update({'username':username},{$push:{"products":product_object}}, function(error,data)  
          {
            if(error) callback(error,null)
            else{
              console.log("La operación ha sido un éxito");
              callback(null,data);
            }  
          }
          );
      }
    });
}


ClientProvider.prototype.addClient= function(usernameP,passwordP,rolP,callback) {
  var newClient = {username:usernameP, password:passwordP, rol: rolP};
  this.getCollection(function(error, client_collection)
  {
    if(error) callback(error)
    else
    {
      client_collection.insert(newClient, function(err, records){
        callback(null, records);
      }
      );
    } 
  }
 );
}

ClientProvider.prototype.deleteProductReferences = function(product_name,callback)

{
          console.log("El producto para borrar las referencias es: "+product_name);
          this.getCollection(function(error, client_collection)
          {
            if(error){
              console.log("Hubo un error");
              callback(error)}
            else
            {
              console.log("No hubo errores");
              client_collection.update({"products":product_name},{$pull:{"products":product_name}}, function(err, records)
              {
                if(error) callback(error)
                else callback (null, records)  
              }
               );
            }
          });
}

exports.ClientProvider = ClientProvider;




