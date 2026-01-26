### 🔐 **1. authRoutes.js**
Handles only authentication:
* POST `/register`
* POST `/login`
* POST `/forgot-password` (future)
* POST `/verify-otp` (future)
* POST `/refresh-token` (future)

### 👤 **2. userRoutes.js**
Handles user profile & user-related operations:
* GET `/me` (get profile)
* PUT `/me` (update profile)
* GET `/all` (fetch all users — admin only)
* GET `/user/:id`
* DELETE `/user/:id`

### 🛠 **3. serviceRoutes.js**
Handles services / contractors / bookings:
* GET `/services`
* POST `/service`
* PUT `/service/:id`
* DELETE `/service/:id`
