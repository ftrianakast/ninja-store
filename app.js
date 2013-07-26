
/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path');
var ClientProvider = require('./clientprovider').ClientProvider;

var store = require('./routes/store');
var app = express();


// all environments
app.set('port', process.env.PORT || 5000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(__dirname + '/public'));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', store.home);
app.post('/', store.home_post_handler);
app.post('/agregar', store.agregar_producto);
app.post('/asignar', store.asignar_producto_cliente);
app.post('/addusers', store.agregar_cliente);
app.post('/deleteProducts', store.borrarProducto);
app.post('/editarProductos', store.editarProducto);


// display the list of item
app.get('/items', store.items);
// show individual item
app.get('/item/:id', store.item);
// show general pages
app.get('/page', store.page);

//Dirige a la página de borrar productos

// show general pages
app.get('/addusers', function(req,res)
	{
		res.render('addusers.jade', { title: 'Ninja Store', operacion:''});
	});


app.get('/logout', function(req, res) {
    // delete the session variable
    delete req.session.username;
    // redirect user to homepage
    res.redirect('/');
});

app.get('/agregar', function(req,res)
{
	res.render('agregar', { title: 'Ninja Store', operacion:''}); 
});

app.get('/asignar', store.obtener_clientes);

app.get('/deleteProducts', store.obtener_productos);

app.get('/editarProductos', store.obtener_productos);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
