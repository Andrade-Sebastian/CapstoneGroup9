import express, { Request, Response, NextFunction } from 'npm:express';

const userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.send('respond with a resource');
});

/* GET user profile. */
userRouter.get('/profile', (req: Request, res: Response, next: NextFunction) => {
  res.send((req as any).user); // Cast to any if req.user is not typed
});

export default userRouter;

