const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'Boufet Relay Online', connections: io.engine.clientsCount }));
});

const io = new Server(server, { 
  cors: { origin: '*' }, 
  transports: ['websocket', 'polling'] 
});

io.on('connection', (socket) => {
  console.log('[CONNECT]', socket.id);

  socket.on('join_cgo', () => { 
    socket.join('cgo'); 
    console.log('[CGO]', socket.id); 
  });

  socket.on('join_kds', (slug) => { 
    socket.join('kds_' + slug); 
    console.log('[KDS]', socket.id, slug); 
  });

  socket.on('join_restaurant', (id) => { 
    socket.join('restaurant_' + id); 
    console.log('[REST]', socket.id, id); 
  });

  socket.on('order_status_change', (data) => {
    console.log('[STATUS]', data.order_id, '->', data.status);
    io.to('cgo').emit('order_update', { 
      id: data.order_id, 
      status: data.status, 
      driverName: data.driverName, 
      driverId: data.driverId, 
      restaurantSlug: data.restaurantSlug 
    });
    if (data.restaurantSlug) {
      io.to('kds_' + data.restaurantSlug).emit('order_update', { 
        id: data.order_id, 
        status: data.status 
      });
    }
  });

  socket.on('new_order_created', (order) => {
    io.to('cgo').emit('new_order', order);
    if (order.restaurantSlug) {
      io.to('kds_' + order.restaurantSlug).emit('new_order', order);
    }
  });

  socket.on('disconnect', () => console.log('[DISCONNECT]', socket.id));
});

server.listen(3001, () => console.log('🚀 Boufet Relay on port 3001'));
