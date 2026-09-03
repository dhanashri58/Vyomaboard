const Y = require('yjs');
const { WebsocketProvider } = require('y-websocket');

const doc = new Y.Doc();
const provider = new WebsocketProvider('ws://127.0.0.1:5173/yjs', 'test-room', doc, { connect: true });

provider.on('status', (event) => {
  console.log('status', event);
});
provider.on('sync', (synced) => {
  console.log('sync', synced);
  provider.destroy();
  doc.destroy();
});

setTimeout(() => {
  console.log('timeout');
  provider.destroy();
  doc.destroy();
  process.exit(0);
}, 8000);
