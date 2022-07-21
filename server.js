const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const fs = require('fs');
let products = [];
let messages = [];

const productsFile = './products.txt';
const messagesFile = './messages.txt';

app.set('view engine', 'pug');
app.set('views', path.resolve(__dirname, './views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('*/js', express.static('public/js'));
app.use('*/css', express.static('public/css'));

const readFile = (path) => {
	let dataFormatted = [];
	try {
		const data = fs.readFileSync(path, 'utf-8');
		if (data) {
			dataFormatted = JSON.parse(data);
		}
	} catch (error) {
		console.error(error);
	}
	return dataFormatted;
};

const writeFile = (path, item) => {
	let items = readFile(path);
	items.push(item);
	fs.writeFileSync(path, JSON.stringify(items));
};

io.on('connection', function (socket) {
	console.log('Conectado!');
	products = readFile(productsFile);
	messages = readFile(messagesFile);
	socket.emit('products', products);
	socket.emit('messages', messages);

	socket.on('new-product', function (data) {
		const product = { socketId: socket.id, product: data };
		writeFile(productsFile, product);
		products = readFile(productsFile);
		io.sockets.emit('products', products);
	});

	socket.on('new-message', function (data) {
		const message = { socketId: socket.id, message: data };
		writeFile(messagesFile, message);
		messages = readFile(messagesFile);
		io.sockets.emit('messages', messages);
	});
});

app.get('/', (req, res) => res.render('form'));

const PORT = 8080;
const srv = server.listen(PORT, () =>
	console.log(`Servidor corriendo en el puerto ${srv.address().port}`)
);
srv.on('error', (err) => console.error(`Error en el servidor ${err}`));
