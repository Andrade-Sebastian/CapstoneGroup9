
import passport from "npm:passport";
import LocalStrategy from "npm:passport-local";

console.log("testing", LocalStrategy)
passport.use(new LocalStrategy({
    usernameField: 'userID',
    passwordField: 'socketID'
}, function ({

}))

const testingVar = "34"
export default testingVar

