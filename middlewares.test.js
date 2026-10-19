
/*
README - Instructions for running test files & web app:

1. Open project terminal
2. In terminal run the web app using the following:
    - 'Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass'
    - 'npm install'
    - 'nodemon app'
    - Run the app with live server OR open the following link: 'http://localhost:3000/login'
    - Login with the username: admin26 AND password: 12345678
    - Don't forget to enter the given captcha as well
3. Test the web app using the following:
    - 'npm test -- --coverage --verbose --silent'
*/


/*MIDDLEWARE TESTS*/

//import middleware function:
const middlewares = require('./middlewares');

//
describe("middlewares", () => {

    let req, res, next;     //mock request, response & next function

    //
    beforeEach(() => {
        //
        req = {
            session: {},    //simulated session object
            body: {},   //simulated request body
            path: "/login"  //simulated request path
        };

        //
        res = {
            locals: {},     //stores variables passed to views
            render: jest.fn(),  //mock render function
            redirect: jest.fn()     //mock redirect function
        };

        next = jest.fn();   //mock next middleware function
    });

    /*Test to ensure user is attatched to response*/
    test("attachUserToLocals sets user in res.locals and calls next", () => {
        //Simulate logged-in user:
        req.session.user = {id: 1, username: "testUser"};

        middlewares.attachUserToLocals(req, res, next);     //call middleware

        expect(res.locals.user).toEqual(req.session.user);  //check user was copied
        expect(next).toHaveBeenCalled();    //ensure next middleware is triggered
    });


    /*Test to allow access when user is logged in*/
    test("checkLoggedIn calls next if user exists", () => {
        //Simulate logged-in user:
        req.session.user = {id: 1};

        middlewares.checkLoggedIn(req, res, next);  //call middleware

        expect(next).toHaveBeenCalled();    //ensure request proceeds
        expect(res.redirect).not.toHaveBeenCalled();    //ensure no redirection occurs
    });


    /*Test to block access when user is not logged in*/
    test("checkLoggedIn redirects to /login if no user", () => {
        
        middlewares.checkLoggedIn(req, res, next);  //calling middleware

        expect(res.redirect).toHaveBeenCalledWith("/login");    //expect redirect to login
        expect(next).not.toHaveBeenCalled();    //ensure request doesn't proceed
    });


    /*Test to allow login / register when not logged in*/
    test("bypass allows access when user is not logged in", () => {
        
        middlewares.bypassLogin(req, res, next);    //call middleware

        expect(next).toHaveBeenCalled();    //allow request to cintinue
        expect(res.redirect).not.toHaveBeenCalled();    //ensure no redirection
    });


    /*Test to prevent acces when user is already logged in*/
    test("bypassLogin redirects to when user is logged in", () => {
        //Simulater logged in user
        req.session.user = {id: 1};

        middlewares.bypassLogin(req, res, next);  //call middleware

        expect(res.redirect).toHaveBeenCalledWith("/");     //expect redirection to home page
        expect(next).not.toHaveBeenCalled();    ///ensure request is blocked
    });

}); //end describe
