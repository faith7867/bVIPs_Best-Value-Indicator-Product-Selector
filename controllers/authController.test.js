
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


/*REGISTER FORM TEST*/

const mockRegisterUser = jest.fn();    //mock function for registerUer service method

//
jest.mock('../service/authService', () => {
    //
    return () => ({
        registerUser: mockRegisterUser     //replacing real registerUser with mock function
    });
});

//
jest.mock('../model/db', () => ({
    //
    pool: {
        //Mock database connection:
        connect: jest.fn().mockResolvedValue({
            release: jest.fn()      //mock database release method
        })
    }
}));


const { postRegister } = require('./authController');   //importing the function being tested (postRegister)


//
describe( 'postRegister', () => {
    let req, res;   //mock request & response objects

    //
    beforeEach(() => {
        //
        req = {
            body: {},   //simulated body inout
            session: {}     //simulated session storage
        };

        //
        res = {
            render: jest.fn(),  //mock render function for returning views
            redirect: jest.fn(),    //mock redirect function
            status: jest.fn().mockReturnThis(),     //mock status to allow chaining
            send: jest.fn()     //mock send for respones
        };

        mockRegisterUser.mockReset();   //resetting mock before each test
        
    });


    /*Testing empty feilds*/
    test('show error when fields are missing', async () => {
        //Simulating service, throwing missing feilds error:
        mockRegisterUser.mockRejectedValue(new Error("Missing fields"));
        
        await postRegister(req, res);   //calling controller function

        //Expect error message to be passed to view:
        expect(res.render).toHaveBeenCalledWith("register", expect.objectContaining({
            error: "Missing fields" //throwing error message
        }));
    }); //end test 1


    /*Testing password mismatch*/
    test('show error when passwords do not match', async () => {
        //Simulating password mismatch:
        mockRegisterUser.mockRejectedValue(new Error("Passwords do not match"));

        await postRegister(req, res);   //calling controller function

        //Expect correct error message:
        expect(res.render).toHaveBeenCalledWith("register", expect.objectContaining ({
            error: 'Passwords do not match'     //throwing error message
        }));
    }); //end test 2


    /*Testing valid registration*/
    test('should register user when data is valid', async () => {
        
        //Sample values for testing:
        mockRegisterUser.mockResolvedValue({
            id: 1,
            first_name: 'Nicola',
            last_name: 'Byrne',
            username: 'Nicola91',
            email: 'nicolaB@email.com',
            phone: '0987654321',
            date_of_birth: '2000-04-11'
        });     //simulate successful registration

        await postRegister(req, res);   //calling controller function

        expect(res.redirect).toHaveBeenCalledWith("/");   //expect redirect after success
    }); //end test 3


    /*Testing password length validation*/
    test('shows error when password is too short', async () => {
        //Simulating short password error:
        mockRegisterUser.mockRejectedValue(
            new Error("Password must be at least 8 characters")
        );

        await postRegister(req, res);   //calling controller function

        //Expect correct error validation
        expect(res.render).toHaveBeenCalledWith("register", expect.objectContaining({
            error: "Password must be at least 8 characters"
        }));
    });


    /*Testing unexpected server error handling*/
    test('Handle unexpected server error', async () => {
        //Simulate unknown error:
        mockRegisterUser.mockRejectedValue(new Error("Something random"));

        await postRegister(req, res);   //call controller function

        expect(res.status).toHaveBeenCalledWith(500);   //expect http 500 status
        expect(res.send).toHaveBeenCalledWith("Error registering user");    //expect error response
    });



}); //end describe
