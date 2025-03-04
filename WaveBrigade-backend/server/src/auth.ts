import { Request, Response, NextFunction } from "express";
import jwt from "npm:jsonwebtoken";

import passport from "npm:passport";
import  LocalStrategy  from "npm:passport-local";
import {verifyUserExists} from "./controllers/database.ts";
import { delay } from "https://deno.land/std@0.160.0/async/delay.ts";

const SECRET_KEY = "your-secret-key"; // Change this to a secure key

// ✅ Define Local Strategy for authentication
passport.use(new LocalStrategy({
        usernameField: "userID",
        passwordField: "socketID"
    },
    async (userID, socketID, done) => {
        console.log("Authenticating:", userID, socketID);

        try {
            const user = await verifyUserExists(userID, socketID);
            if (user) {
                return done(user, true); // Successful authentication
            } else {
                return done(null, false); // User not found
            }
            // if (!user) {
            //     return done(user, user); // Successful authentication
            // } else {
            //     return done(user, user); // User not found
            // }
        } catch (error) {
            console.log("Error authenticating user:", error);
            return done(error);
        }
    }
));


//Generate JWT token
export async function generateToken(user: any) {
    console.log("Generating token for user:", user);

    
    const token = await jwt.sign(
        { userID: user, exp: Date.now() + 3600000 }, // Payload (expires in 1 hour)
        SECRET_KEY
    );
    console.log("Generated token:", token);
    return token;

}

//Verify JSON Web Token
export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    console.log("Auth Header: ", authHeader);
    console.log("type ",  typeof(authHeader));

    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
    console.log("Token: ", token);
    console.log("Secret Key: ", SECRET_KEY);

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
    
        console.log(decoded);
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }

        console.log("Decoded: ", decoded);
        req.user = decoded; // Attach user data to the request object
        next(); // Proceed to the next middleware
    });
}
