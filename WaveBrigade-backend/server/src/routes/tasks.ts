//!!!!!!!!!USE AS A RESOURCE!!!!!!!!

// import { Router, Request, Response } from 'express';
// import { Task } from '../models/task';

// const router = Router();
// let tasks: Task[] = [];

// // Add your CRUD API implementation here
// router.post('/', (req: Request, res: Response) => {
//     const task: Task = {
//       id: tasks.length + 1,
//       title: req.body.title,
//       description: req.body.description,
//       completed: false,
//     };
  
//     tasks.push(task);
//     res.status(201).json(task);
//   });

//   router.get('/', (req: Request, res: Response) => {
//     res.json(tasks);
//   });
//   router.get('/:id', (req: Request, res: Response) => {
//     const task = tasks.find((t) => t.id === parseInt(req.params.id));
  
//     if (!task) {
//       res.status(404).send('Task not found');
//     } else {
//       res.json(task);
//     }
//   });
//   router.put('/:id', (req: Request, res: Response) => {
//     const task = tasks.find((t) => t.id === parseInt(req.params.id));
  
//     if (!task) {
//       res.status(404).send('Task not found');
//     } else {
//       task.title = req.body.title || task.title;
//       task.description = req.body.description || task.description;
//       task.completed = req.body.completed || task.completed;
  
//       res.json(task);
//     }
//   });
//   router.delete('/:id', (req: Request, res: Response) => {
//     const index = tasks.findIndex((t) => t.id === parseInt(req.params.id));
  
//     if (index === -1) {
//       res.status(404).send('Task not found');
//     } else {
//       tasks.splice(index, 1);
//       res.status(204).send();
//     }
//   });

// import taskRoutes from './routes/tasks';

// const app = express();
// const port = process.env.PORT || 3000;

// app.use(express.json()); // Add this line to enable JSON parsing in the request body
// app.use('/tasks', taskRoutes); // Add this line to mount the Task API routes

// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello, TypeScript Express!');
// });

// // Add this error handling middleware
// app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
//     console.error(err.stack);
//     res.status(500).send('Something went wrong');
//   });
  

// app.listen(port, () => {
//   console.log(`Server running at http://localhost:${port}`);
// });

// const taskValidationRules = [
//     body('title').notEmpty().withMessage('Title is required'),
//     body('description').notEmpty().withMessage('Description is required'),
//     body('completed').isBoolean().withMessage('Completed must be a boolean'),
//   ];
  
//   router.post('/', taskValidationRules, (req: Request, res: Response) => {
//     const errors = validationResult(req);
  
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
  
//      const task: Task = {
//       id: tasks.length + 1,
//       title: req.body.title,
//       description: req.body.description,
//       completed: false,
//     };
  
//     tasks.push(task);
//     res.status(201).json(task)
//   });
  
//   router.put('/:id', taskValidationRules, (req: Request, res: Response) => {
//     const errors = validationResult(req);
  
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() });
//     }
  
//   const task = tasks.find((t) => t.id === parseInt(req.params.id));
  
//     if (!task) {
//       res.status(404).send('Task not found');
//     } else {
//       task.title = req.body.title || task.title;
//       task.description = req.body.description || task.description;
//       task.completed = req.body.completed || task.completed;
  
//       res.json(task);
//     }
  
//   });




// export default router;