import express, { Request, Response, NextFunction } from 'express';
import jwt from 'npm:jsonwebtoken';
import passport from 'npm:passport';

const authRouter = express.Router();

/* POST login. */
authRouter.post('/login', (req: Request, res: Response, next: NextFunction) => {
    passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user: user
            });
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                return res.send(err);
            }
            // generate a signed JWT with the contents of user object and return it in the response
            const token = jwt.sign(user, 'unc');
            return res.json({ user, token });
        });
    })(req, res);
});

export default authRouter;
