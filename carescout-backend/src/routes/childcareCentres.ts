import express, { Request, Response, NextFunction } from 'express';
import { searchCentres } from '../controllers/childcarecentreController';

const router = express.Router();

router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const results = await searchCentres(req.query);
    res.json(results);
    return;
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'Unknown error occurred' });
    }
    return;
  }
});

export default router;
