import express, { Router, RequestHandler } from 'express';
import { authenticate } from '../middlewares/authMiddleware';
import {
  createChat,
  getChats,
  sendMessage,
  getChatMessages,
  deleteChat,
} from '../controllers/chatController';

const router: Router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authenticate);

// Chat routes
router.post('/', createChat as RequestHandler);
router.get('/', getChats as RequestHandler);
router.post('/:chatId/messages', sendMessage as RequestHandler);
router.get('/:chatId/messages', getChatMessages as RequestHandler);
router.delete('/:chatId', deleteChat as RequestHandler);

export default router; 