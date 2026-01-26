flowchart LR
    A[Client / Frontend] --> B[Express Server (server.js)]
    B --> C1[/auth routes/]
    B --> C2[/users routes/]
    B --> C3[/services routes/]

    subgraph AUTH [/auth/*/]
        C1 --> D1[POST /register]
        C1 --> D2[POST /login]
        C1 --> D3[GET /profile]
        C1 --> D4[POST /forgot-password]
        C1 --> D5[POST /verify-otp]
        C1 --> D6[POST /reset-password]

        D1 --> E1[authController.registerUser]
        D2 --> E2[authController.loginUser]
        D3 --> E3[authController.getProfile]
        D4 --> E4[authController.forgotPassword]
        D5 --> E5[authController.verifyOtp]
        D6 --> E6[authController.resetPassword]

        E1 --> M1[(User Model)]
        E2 --> M1
        E3 --> M1
        E4 --> M1
        E5 --> M1
        E6 --> M1
    end

    subgraph USERS [/users/*/]
        C2 --> U1[GET /me]
        C2 --> U2[PUT /me]
        C2 --> U3[GET /all]
        C2 --> U4[GET /:id]
        C2 --> U5[DELETE /:id]

        U1 --> UC1[userController.getMe]
        U2 --> UC2[userController.updateMe]
        U3 --> UC3[userController.getAllUsers]
        U4 --> UC4[userController.getUserById]
        U5 --> UC5[userController.deleteUser]

        UC1 --> M1
        UC2 --> M1
        UC3 --> M1
        UC4 --> M1
        UC5 --> M1
    end

    subgraph SERVICES [/services/*/]
        C3 --> S1[GET /services]
        C3 --> S2[POST /service]
        C3 --> S3[PUT /service/:id]
        C3 --> S4[DELETE /service/:id]

        S1 --> SC1[serviceController.getServices]
        S2 --> SC2[serviceController.createService]
        S3 --> SC3[serviceController.updateService]
        S4 --> SC4[serviceController.deleteService]

        SC1 --> M2[(Service Model)]
        SC2 --> M2
        SC3 --> M2
        SC4 --> M2
    end

    B --> MW1[authMiddleware (for protected routes)]
    B --> MW2[errorMiddleware]
