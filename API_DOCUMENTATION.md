# Nihara D'Aura - Backend API Documentation

> **Base URL:** `http://localhost:3000`  
> **Database:** MongoDB Atlas (`nihara_d_aura`)  
> **Headers Required:** `Content-Type: application/json`  
> *(Protected routes will require `Authorization: Bearer <token>`)*

---

## Table of Contents
1. [Authentication APIs (`/api/auth`)](#1-authentication-apis-apiauth)
2. [User Profile APIs (`/api/profile`)](#2-user-profile-apis-apiprofile)
3. [Products APIs (`/api/products`)](#3-products-apis-apiproducts)
4. [Categories APIs (`/api/categories`)](#4-categories-apis-apicategories)
5. [Services APIs (`/api/services`)](#5-services-apis-apiservices)
6. [Artists APIs (`/api/artists`)](#6-artists-apis-apiartists)

---

## 1. Authentication APIs (`/api/auth`)

### 1.1 Register User (Send OTP)
- **Endpoint:** `POST /api/auth/register`
- **Description:** Initiates new user registration using Full Name and Email. Generates a 6-digit OTP, saves user as unverified, and sends OTP to the user's email (also logs in server console for testing).
- **Request Body:**
  ```json
  {
    "fullName": "Priya Sharma",
    "email": "priya@example.com",
    "mobileNumber": "9876543210"
  }
  ```
  *(Note: `fullName` or `name` and `email` are required. `mobileNumber` or `phone` and `avatar` are optional.)*
- **Response (200 OK):**
  ```json
  {
    "message": "OTP sent successfully to email",
    "email": "priya@example.com"
  }
  ```

---

### 1.2 Verify OTP (Account Created & Auto-Login)
- **Endpoint:** `POST /api/auth/verify-otp`
- **Description:** Verifies the 6-digit OTP sent to the email. Upon success, marks the account verified (`isVerified: true`), creates the user session, and returns a JWT auth token and user profile.
- **Request Body:**
  ```json
  {
    "email": "priya@example.com",
    "otp": "654321"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Account verified and created successfully",
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "673f4e19876a1c5d01234567",
      "fullName": "Priya Sharma",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "mobileNumber": "9876543210",
      "phone": "9876543210",
      "avatar": "",
      "tier": "Royal Member",
      "rewardPoints": 0,
      "isVerified": true
    }
  }
  ```

---

### 1.3 Create / Set Password (Optional)
- **Endpoint:** `POST /api/auth/create-password`
- **Description:** Allows an OTP-verified user to set a password for future email & password logins.
- **Request Body:**
  ```json
  {
    "email": "priya@example.com",
    "password": "mySecurePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "message": "Password created successfully. You can now login with password."
  }
  ```

---

### 1.4 Login (Email & Password)
- **Endpoint:** `POST /api/auth/login`
- **Description:** Authenticate existing user with password and receive a fresh JWT token.
- **Request Body:**
  ```json
  {
    "email": "priya@example.com",
    "password": "mySecurePassword123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": "673f4e19876a1c5d01234567",
      "fullName": "Priya Sharma",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "mobileNumber": "9876543210",
      "phone": "9876543210",
      "avatar": "",
      "tier": "Royal Member",
      "rewardPoints": 0
    }
  }
  ```

---

## 2. User Profile APIs (`/api/profile`)

### 2.1 Get All Users / Query User
- **Endpoint:** `GET /api/profile`
- **Query Params:**
  - `email` *(Optional)*: `GET /api/profile?email=priya@example.com`
- **Response (200 OK):**
  ```json
  [
    {
      "_id": "673f4e19876a1c5d01234567",
      "fullName": "Priya Sharma",
      "name": "Priya Sharma",
      "email": "priya@example.com",
      "mobileNumber": "9876543210",
      "tier": "Royal Member",
      "rewardPoints": 0,
      "isVerified": true
    }
  ]
  ```

---

### 2.2 Get User by ID or Email
- **Endpoint:** `GET /api/profile/:idOrEmail`
- **Example:** `GET /api/profile/priya@example.com` or `GET /api/profile/673f4e19876a1c5d01234567`
- **Response (200 OK):** Returns single user object.

---

### 2.3 Create Profile Directly
- **Endpoint:** `POST /api/profile`
- **Request Body:**
  ```json
  {
    "fullName": "Rahul Verma",
    "email": "rahul@example.com",
    "mobileNumber": "9812345678",
    "avatar": "https://example.com/avatar.jpg"
  }
  ```

---

### 2.4 Update Profile
- **Endpoint:** `POST /api/profile/update`
- **Request Body:**
  ```json
  {
    "email": "priya@example.com",
    "fullName": "Priya S. Sharma",
    "mobileNumber": "9876543211",
    "avatar": "https://example.com/new-avatar.jpg"
  }
  ```

---

## 3. Products APIs (`/api/products`)

### 3.1 List Products (Search & Filter)
- **Endpoint:** `GET /api/products`
- **Query Parameters:**
  - `category` (e.g. `Jewellery`, `Makeup`, `Nails`, `Candles`)
  - `categorySlug` (e.g. `jewellery`, `makeup`)
  - `subcategory` (e.g. `Rose Gold Chokers`)
  - `isFeatured` (`true` / `false`)
  - `isBestseller` (`true` / `false`)
  - `search` (keyword search in title & description)
  - `sort` (`price_asc`, `price_desc`, `rating`, `name`)
  - `page` (default: 1)
  - `limit` (default: 100)
- **Example:** `GET /api/products?category=Jewellery&isFeatured=true`
- **Response (200 OK):**
  ```json
  {
    "total": 90,
    "page": 1,
    "totalPages": 1,
    "products": [...]
  }
  ```

---

### 3.2 Get Product by Slug or ID
- **Endpoint:** `GET /api/products/:slugOrId`
- **Example:** `GET /api/products/nihara-signature-18k-rose-gold-choker`

---

### 3.3 Create Product
- **Endpoint:** `POST /api/products`
- **Request Body:**
  ```json
  {
    "name": "Nihara Signature 18K Rose Gold Choker",
    "slug": "nihara-signature-18k-rose-gold-choker",
    "category": "Jewellery",
    "categorySlug": "jewellery",
    "subcategory": "Rose Gold Chokers",
    "price": 24500,
    "originalPrice": 28000,
    "discountPercent": 13,
    "images": ["https://images.unsplash.com/photo-1535632066927-ab7c9ab60908"],
    "description": "Handcrafted in 18K Rose Gold with luminous uncut polki diamonds.",
    "variants": ["18K Rose Gold"],
    "sizes": ["Adjustable Silk Dori Choker"],
    "features": ["18K BIS Hallmarked"],
    "stock": 10,
    "isFeatured": true,
    "isBestseller": true
  }
  ```

---

### 3.4 Update Product
- **Endpoint:** `PUT /api/products/:id`

---

### 3.5 Delete Product
- **Endpoint:** `DELETE /api/products/:id`

---

## 4. Categories APIs (`/api/categories`)

### 4.1 List Categories
- **Endpoint:** `GET /api/categories`

---

### 4.2 Get Category by Slug or ID
- **Endpoint:** `GET /api/categories/:slugOrId`
- **Example:** `GET /api/categories/jewellery`

---

### 4.3 Create Category
- **Endpoint:** `POST /api/categories`
- **Request Body:**
  ```json
  {
    "name": "22K Real Gold & Diamond Jewellery",
    "slug": "jewellery",
    "itemCount": 30,
    "image": "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f",
    "description": "BIS 22K/18K Hallmarked gold and diamond jewellery",
    "subcategories": ["Gold Earrings & Jhumkas", "Bridal Haar & Sets", "Rose Gold Chokers"]
  }
  ```

---

### 4.4 Update Category
- **Endpoint:** `PUT /api/categories/:id`

---

### 4.5 Delete Category
- **Endpoint:** `DELETE /api/categories/:id`

---

## 5. Services APIs (`/api/services`)

### 5.1 List Services
- **Endpoint:** `GET /api/services`
- **Query Params:** `?category=Makeup`

---

### 5.2 Get Service by Slug or ID
- **Endpoint:** `GET /api/services/:slugOrId`
- **Example:** `GET /api/services/royal-bridal-glow-makeup-package`

---

### 5.3 Create Service
- **Endpoint:** `POST /api/services`
- **Request Body:**
  ```json
  {
    "name": "Royal Bridal Glow & Makeup Package",
    "slug": "royal-bridal-glow-makeup-package",
    "category": "Makeup",
    "price": 18500,
    "durationMinutes": 180,
    "image": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e",
    "description": "Comprehensive royal bridal package including HD Airbrush makeup.",
    "inclusions": [
      "High-Definition Airbrush Makeup & Hydration Prep",
      "Intricate Bridal Hair Artistry"
    ]
  }
  ```

---

### 5.4 Update Service
- **Endpoint:** `PUT /api/services/:id`

---

### 5.5 Delete Service
- **Endpoint:** `DELETE /api/services/:id`

---

## 6. Artists APIs (`/api/artists`)

### 6.1 List Artists
- **Endpoint:** `GET /api/artists`

---

### 6.2 Get Artist by Slug or ID
- **Endpoint:** `GET /api/artists/:slugOrId`

---

### 6.3 Create Artist
- **Endpoint:** `POST /api/artists`
- **Request Body:**
  ```json
  {
    "name": "Ananya Sharma",
    "slug": "ananya-sharma",
    "role": "Master Bridal Stylist",
    "experience": "8+ Years",
    "rating": 5,
    "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    "bio": "Specialized in celebrity HD Airbrush bridal makeup and royal hairstyling.",
    "specialties": ["Airbrush HD", "Bridal Saree Draping"]
  }
  ```

---

### 6.4 Update Artist
- **Endpoint:** `PUT /api/artists/:id`

---

### 6.5 Delete Artist
- **Endpoint:** `DELETE /api/artists/:id`

