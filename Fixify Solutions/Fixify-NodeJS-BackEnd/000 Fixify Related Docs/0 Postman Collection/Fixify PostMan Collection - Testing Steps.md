# 🔥 **3. How to Test Each API (Step-by-Step)**
### **Step 1 → Register**
POST → `/auth/register`

### **Step 2 → Login**
POST → `/auth/login`
Copy `"token"` → Set Postman variable `{{token}}`

### **Step 3 → Test Protected Routes**
GET `/auth/profile`
GET `/users/me`
PUT `/users/me`

### **Step 4 → Forgot Password Flow**
1. `/auth/forgot-password` → check email for OTP
2. `/auth/verify-otp`
3. `/auth/reset-password`

### **Step 5 → User Management**
GET `/users/all`
GET `/users/{{userId}}`
DELETE `/users/{{userId}}`

### **Step 6 → Services**
GET `/services/services`
POST `/services/service`
PUT `/services/service/{{serviceId}}`
DELETE `/services/service/{{serviceId}}`