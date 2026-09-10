# Nihara D Aura - API Documentation

---

## 1. User Profile API

### `POST /api/profile`
- **Description:** Create a new user profile.
- **Body Fields:**
  ```json
  {
    "fullName": "Rahul Kumar",
    "email": "rahul@example.com",
    "mobileNumber": "9876543210",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```

### `POST /api/profile/update`
- **Description:** Update user profile details (like avatar).
- **Body Fields:**
  ```json
  {
    "email": "rahul@example.com",
    "avatar": "https://example.com/new-avatar.jpg"
  }
  ```
*(Can also accept avatar URL as text)*

---

## 2. Authentication Flow

### `POST /api/auth/register`
- **Description:** Register a new user and send an OTP to the provided email.
- **Body Fields:**
  ```json
  {
    "fullName": "Rahul Kumar",
    "email": "rahul@example.com",
    "mobileNumber": "9876543210",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```

### `POST /api/auth/verify-otp`
- **Description:** Verify the OTP sent to the user's email.
- **Body Fields:**
  ```json
  {
    "email": "rahul@example.com",
    "otp": "123456"
  }
  ```

### `POST /api/auth/create-password`
- **Description:** Create a password after successful OTP verification.
- **Body Fields:**
  ```json
  {
    "email": "rahul@example.com",
    "password": "mySecurePassword123"
  }
  ```

### `POST /api/auth/login`
- **Description:** Login with email and password to receive a JWT token.
- **Body Fields:**
  ```json
  {
    "email": "rahul@example.com",
    "password": "mySecurePassword123"
  }
  ```
