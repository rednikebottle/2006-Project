import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { verifyToken } from './middlewares/authMiddleware';

interface ConnectedClient {
  ws: WebSocket;
  userId: string;
}

const connectedClients: ConnectedClient[] = [];

export const setupWebSocketServer = (server: Server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws: WebSocket, req) => {
    try {
      // Extract token from URL query parameters
      const url = new URL(req.url || '', 'http://localhost');
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(1008, 'Authentication token required');
        return;
      }

      // Verify token and get user ID
      const decodedToken = await verifyToken(token);
      if (!decodedToken) {
        ws.close(1008, 'Invalid token');
        return;
      }

      // Add client to connected clients
      const client: ConnectedClient = { ws, userId: decodedToken.uid };
      connectedClients.push(client);

      // Handle client disconnection
      ws.on('close', () => {
        const index = connectedClients.findIndex(client => client.userId === decodedToken.uid);
        if (index !== -1) {
          connectedClients.splice(index, 1);
        }
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        ws.close();
      });

    } catch (error) {
      console.error('Error setting up WebSocket connection:', error);
      ws.close(1011, 'Internal server error');
    }
  });
};

export const broadcastBookingUpdate = (userId: string) => {
  const message = JSON.stringify({ type: 'booking_update' });
  
  // Send update to all connected clients for this user
  connectedClients.forEach(client => {
    if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  });
}; 