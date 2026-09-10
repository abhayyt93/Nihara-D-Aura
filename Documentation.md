# Nihara D Aura - API Documentation

---

## 1. User Profile API

**Endpoint:** `http://3.7.180.215:3000/api/profile`

```json
{
    "fullName": "Rahul Kumar",
    "email": "rahul@example.com",
    "mobileNumber": "9876543210",
    "avatar": "https://example.com/avatar.jpg"
}
```

### Update Profile
**Endpoint:** `http://3.7.180.215:3000/api/profile/update`

```json
{
    "email": "rahul@example.com",
    "avatar": "https://example.com/new-avatar.jpg"
}
```

---

## 2. Authentication Flow

### Register (Send OTP)
**Endpoint:** `http://3.7.180.215:3000/api/auth/register`
```json
{
    "fullName": "Rahul Kumar",
    "email": "rahul@example.com",
    "mobileNumber": "9876543210",
    "avatar": "https://example.com/avatar.jpg"
}
```

### Verify OTP
**Endpoint:** `http://3.7.180.215:3000/api/auth/verify-otp`
```json
{
    "email": "rahul@example.com",
    "otp": "123456"
}
```

### Create Password
**Endpoint:** `http://3.7.180.215:3000/api/auth/create-password`
```json
{
    "email": "rahul@example.com",
    "password": "mySecurePassword123"
}
```

### Login
**Endpoint:** `http://3.7.180.215:3000/api/auth/login`
```json
{
    "email": "rahul@example.com",
    "password": "mySecurePassword123"
}
```
