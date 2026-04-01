# Meeting Room Booking System

**IFN 636 Assignment 1.2: Software Requirements Analysis and Design (Full-Stack CRUD Application Development with DevOps Practices)**
---
## Student Details

| | |
|---|---|
| **Name** | Hashim Hilal |
| **ID** | N12540447 |

---

## Objective

For this assessment, the task was to develop a system that implements CRUD (Create, Read, Update, Delete) operations based on the selected project. The system includes a user panel with full booking management functionality. The starter project provided user authentication using Node.js, React.js, and MongoDB — this application has been extended with full meeting room booking CRUD operations, automated testing, CI/CD integration, and cloud deployment.

---

## Project Overview

The **Meeting Room Booking System** allows authenticated users to create, view, update, and delete meeting room bookings. Each booking is tied to the logged-in user and protected by JWT authentication, ensuring users can only manage their own bookings.

---
## Credentials
**RDP** 
Username: ububtu   
Password: Password123!

**MongoDB**
Username: hashim_db_user   
Password: Password123!

---
## Meeting Room Booking Application

After RDP please access via localhost as Public IP port 80 is not accessible
Use following Credentials to test CRUD Functionality for Bookings

User Email: test@test.com    
Password: Test1234!

---

## Features Implemented

### 1. User Authentication (Starter Code Extended)
- User registration with hashed passwords (bcrypt)
- User login with JWT token generation
- Protected routes using JWT middleware
- User profile view and update
- Session persistence via localStorage

### 2. CRUD — Meeting Room Bookings (New Feature)
- **Create** — Book a meeting room with title, room name, date, start time and end time
- **Read** — View all bookings for the logged-in user
- **Update** — Edit an existing booking inline
- **Delete** — Remove a booking with confirmation dialog
- Ownership protection — users can only modify their own bookings (403 Forbidden for others)

### 3. Version Control using GitHub
- Git repository initialized and connected to GitHub
- Feature branch workflow — `feature/crud-bookings` branch created
- Pull Request raised and merged into `main`
- `.gitignore` configured to exclude `node_modules`, `.env`, and `build/` folders

### 4. CI/CD Integration with GitHub Actions
- Automated pipeline triggered on every push to `main`
- Three jobs running in sequence:
  - **Job 1 — Backend Tests**: installs dependencies and runs 16 unit tests
  - **Job 2 — Frontend Build**: builds React app with production environment variables
  - **Job 3 — Deploy**: writes `.env` from GitHub Secrets, restarts PM2 backend, reloads Nginx
- Build and deploy only proceed if all tests pass
- Self-hosted GitHub Actions runner installed on Azure VM

### 5. Cloud Deployment on AWS EC2
- Application deployed on AWS EC2 (Ubuntu)
- Nginx configured as reverse proxy — serves React frontend on port 80, proxies `/api/*` to Node.js backend on port 5001
- PM2 manages backend process with auto-restart on failure
- Startup script (`startup.sh`) ensures everything recovers automatically after VM restarts
- systemd service configured to run startup script on every boot

### 6. Unit Testing
- 16 unit tests covering all CRUD operations
- Tests written using Mocha, Chai, and Sinon
- Stubs used to mock database calls — no real DB connection required for tests
- Test coverage includes success cases, 404 not found, 403 unauthorized, and 500 server error scenarios

| Test Suite | Tests |
|---|---|
| createBooking | 2 tests |
| getBookings | 2 tests |
| getBookingById | 4 tests |
| updateBooking | 4 tests |
| deleteBooking | 4 tests |
| **Total** | **16 passing** |
---

## Test Cases Details

The test suite is located in `backend/test/booking_test.js` and is executed using the **Mocha** testing framework with **Chai** for assertions and **Sinon** for stubbing and spying. All database calls are mocked using Sinon stubs so that tests run in isolation without requiring a real MongoDB connection.

**Shared Mock Data** used across all test groups:
```
mockUserId    : Generated MongoDB ObjectId representing a logged-in user
mockBookingId : Generated MongoDB ObjectId representing a booking document
mockBookingBody : {
  title     : 'Team Standup'
  room      : 'Room A'
  date      : '2026-04-01'
  startTime : '09:00'
  endTime   : '09:30'
}
```

---

### DESCRIBE: createBooking Function Test
**Purpose:** Validates the CREATE operation — verifies that a new booking is correctly saved to the database and that the appropriate HTTP response is returned.

---

**IT: Should create a new booking successfully**

| | |
|---|---|
| **Test Type** | Positive / Happy Path |
| **Stub** | `Booking.create` stubbed to resolve with a mock booking object |
| **Mock Request** | `req.user._id = mockUserId`, `req.body = mockBookingBody` |
| **Mock Response** | `res.status` stub, `res.json` spy |
| **Assertions** | `expect(Booking.create calledOnceWith { ...mockBookingBody, user: mockUserId })` → `true` |
| | `expect(res.status calledWith 201)` → `true` |
| | `expect(res.json calledWith createdBooking)` → `true` |
| **Expected Result** | HTTP 201 Created with booking object in response body |

---

**IT: Should return 500 if an error occurs during creation**

| | |
|---|---|
| **Test Type** | Negative / Error Handling |
| **Stub** | `Booking.create` stubbed to throw `new Error('DB Error')` |
| **Mock Request** | `req.user._id = mockUserId`, `req.body = mockBookingBody` |
| **Mock Response** | `res.status` stub, `res.json` spy |
| **Assertions** | `expect(res.status calledWith 500)` → `true` |
| | `expect(res.json calledWithMatch { message: 'DB Error' })` → `true` |
| **Expected Result** | HTTP 500 Internal Server Error with error message |

---

### DESCRIBE: getBookings Function Test
**Purpose:** Validates the READ ALL operation — verifies that all bookings belonging to the authenticated user are retrieved and returned correctly.

---

**IT: Should return all bookings for the logged-in user**

| | |
|---|---|
| **Test Type** | Positive / Happy Path |
| **Stub** | `Booking.find` stubbed to return chainable object with `.sort()` resolving to array of 2 bookings |
| **Mock Request** | `req.user._id = mockUserId` |
| **Mock Response** | `res.json` spy, `res.status` stub |
| **Assertions** | `expect(Booking.find calledOnceWith { user: mockUserId })` → `true` |
| | `expect(res.json calledWith bookings array)` → `true` |
| | `expect(res.status.called)` → `false` (no error status set) |
| **Expected Result** | HTTP 200 with array of booking objects sorted by date and time |

---

**IT: Should return 500 if an error occurs during fetch**

| | |
|---|---|
| **Test Type** | Negative / Error Handling |
| **Stub** | `Booking.find` stubbed to throw `new Error('DB Error')` |
| **Mock Request** | `req.user._id = mockUserId` |
| **Mock Response** | `res.json` spy, `res.status` stub |
| **Assertions** | `expect(res.status calledWith 500)` → `true` |
| | `expect(res.json calledWithMatch { message: 'DB Error' })` → `true` |
| **Expected Result** | HTTP 500 Internal Server Error with error message |

---

### DESCRIBE: getBookingById Function Test
**Purpose:** Validates the READ SINGLE operation — verifies that a specific booking is retrieved by ID, with ownership checks enforced and appropriate error responses returned.

---

**IT: Should return a single booking by ID**

| | |
|---|---|
| **Test Type** | Positive / Happy Path |
| **Stub** | `Booking.findById` stubbed to resolve with mock booking object |
| **Mock Request** | `req.params.id = mockBookingId`, `req.user._id = mockUserId` |
| **Mock Response** | `res.json` spy, `res.status` stub |
| **Assertions** | `expect(Booking.findById calledOnceWith mockBookingId)` → `true` |
| | `expect(res.json calledWith booking)` → `true` |
| **Expected Result** | HTTP 200 with the matching booking object |

---

**IT: Should return 404 if booking is not found**

| | |
|---|---|
| **Test Type** | Negative / Not Found |
| **Stub** | `Booking.findById` stubbed to resolve with `null` |
| **Mock Request** | `req.params.id = randomObjectId`, `req.user._id = mockUserId` |
| **Mock Response** | `res.status` stub, `res.json` spy |
| **Assertions** | `expect(res.status calledWith 404)` → `true` |
| | `expect(res.json calledWith { message: 'Booking not found' })` → `true` |
| **Expected Result** | HTTP 404 Not Found |

---

**IT: Should return 403 if booking belongs to a different user**

| | |
|---|---|
| **Test Type** | Negative / Authorisation |
| **Stub** | `Booking.findById` stubbed to resolve with booking owned by `otherUserId` |
| **Mock Request** | `req.params.id = mockBookingId`, `req.user._id = mockUserId` (different user) |
| **Mock Response** | `res.status` stub, `res.json` spy |
| **Assertions** | `expect(res.status calledWith 403)` → `true` |
| | `expect(res.json calledWith { message: 'Not authorized' })` → `true` |
| **Expected Result** | HTTP 403 Forbidden — ownership mismatch detected |

---

**IT: Should return 500 if an error occurs**

| | |
|---|---|
| **Test Type** | Negative / Error Handling |
| **Stub** | `Booking.findById` stubbed to throw `new Error('DB Error')` |
| **Assertions** | `expect(res.status calledWith 500)` → `true` |
| | `expect(res.json calledWithMatch { message: 'DB Error' })` → `true` |
| **Expected Result** | HTTP 500 Internal Server Error |

---

### DESCRIBE: updateBooking Function Test
**Purpose:** Validates the UPDATE operation — verifies that an existing booking's fields are correctly modified, saved to the database, and that ownership and error conditions are handled appropriately.

---

**IT: Should update a booking successfully**

| | |
|---|---|
| **Test Type** | Positive / Happy Path |
| **Stub** | `Booking.findById` resolves with existing booking; `booking.save` stubbed to resolve |
| **Mock Request** | `req.body = { title: 'Updated Standup', room: 'Room C' }` |
| **Mock Response** | `res.json` spy, `res.status` stub |
| **Assertions** | `expect(existingBooking.title)` → `'Updated Standup'` |
| | `expect(existingBooking.room)` → `'Room C'` |
| | `expect(existingBooking.save.calledOnce)` → `true` |
| | `expect(res.status.called)` → `false` (no error) |
| | `expect(res.json.calledOnce)` → `true` |
| **Expected Result** | HTTP 200 with updated booking object |

---

**IT: Should return 404 if booking is not found**

| | |
|---|---|
| **Test Type** | Negative / Not Found |
| **Stub** | `Booking.findById` resolves with `null` |
| **Assertions** | `expect(res.status calledWith 404)` → `true` |
| | `expect(res.json calledWith { message: 'Booking not found' })` → `true` |
| **Expected Result** | HTTP 404 Not Found |

---

**IT: Should return 403 if booking belongs to a different user**

| | |
|---|---|
| **Test Type** | Negative / Authorisation |
| **Stub** | `Booking.findById` resolves with booking owned by `otherUserId` |
| **Assertions** | `expect(res.status calledWith 403)` → `true` |
| | `expect(res.json calledWith { message: 'Not authorized' })` → `true` |
| **Expected Result** | HTTP 403 Forbidden — user cannot update another user's booking |

---

**IT: Should return 500 if an error occurs**

| | |
|---|---|
| **Test Type** | Negative / Error Handling |
| **Stub** | `Booking.findById` throws `new Error('DB Error')` |
| **Assertions** | `expect(res.status calledWith 500)` → `true` |
| | `expect(res.json calledWithMatch { message: 'DB Error' })` → `true` |
| **Expected Result** | HTTP 500 Internal Server Error |

---

### DESCRIBE: deleteBooking Function Test
**Purpose:** Validates the DELETE operation — verifies that a booking is permanently removed from the database, with ownership verification and proper error handling enforced at every step.

---

**IT: Should delete a booking successfully**

| | |
|---|---|
| **Test Type** | Positive / Happy Path |
| **Stub** | `Booking.findById` resolves with booking; `booking.deleteOne` stubbed to resolve |
| **Mock Request** | `req.params.id = mockBookingId.toString()` |
| **Mock Response** | `res.json` spy, `res.status` stub |
| **Assertions** | `expect(Booking.findById calledOnceWith mockBookingId)` → `true` |
| | `expect(booking.deleteOne.calledOnce)` → `true` |
| | `expect(res.json calledWith { message: 'Booking deleted' })` → `true` |
| **Expected Result** | HTTP 200 with confirmation message `'Booking deleted'` |

---

**IT: should return 404 if booking is not found**

| | |
|---|---|
| **Test Type** | Negative / Not Found |
| **Stub** | `Booking.findById` resolves with `null` |
| **Assertions** | `expect(res.status calledWith 404)` → `true` |
| | `expect(res.json calledWith { message: 'Booking not found' })` → `true` |
| **Expected Result** | HTTP 404 Not Found |

---

**IT: Should return 403 if booking belongs to a different user**

| | |
|---|---|
| **Test Type** | Negative / Authorisation |
| **Stub** | `Booking.findById` resolves with booking owned by `otherUserId` |
| **Assertions** | `expect(res.status calledWith 403)` → `true` |
| | `expect(res.json calledWith { message: 'Not authorized' })` → `true` |
| **Expected Result** | HTTP 403 Forbidden — user cannot delete another user's booking |

---

**IT: should return 500 if an error occurs**

| | |
|---|---|
| **Test Type** | Negative / Error Handling |
| **Stub** | `Booking.findById` throws `new Error('DB Error')` |
| **Assertions** | `expect(res.status calledWith 500)` → `true` |
| | `expect(res.json calledWithMatch { message: 'DB Error' })` → `true` |
| **Expected Result** | HTTP 500 Internal Server Error |

---

### Test Results Summary

```
  createBooking Function Test
    ✓ should create a new booking successfully
    ✓ should return 500 if an error occurs during creation

  getBookings Function Test
    ✓ should return all bookings for the logged-in user
    ✓ should return 500 if an error occurs during fetch

  getBookingById Function Test
    ✓ should return a single booking by ID
    ✓ should return 404 if booking is not found
    ✓ should return 403 if booking belongs to a different user
    ✓ should return 500 if an error occurs

  updateBooking Function Test
    ✓ should update a booking successfully
    ✓ should return 404 if booking is not found
    ✓ should return 403 if booking belongs to a different user
    ✓ should return 500 if an error occurs

  deleteBooking Function Test
    ✓ should delete a booking successfully
    ✓ should return 404 if booking is not found
    ✓ should return 403 if booking belongs to a different user
    ✓ should return 500 if an error occurs

  16 passing (70ms)
```

| Test Group | Total ITs | Passing |
|---|---|---|
| createBooking | 2 | ✅ 2 |
| getBookings | 2 | ✅ 2 |
| getBookingById | 4 | ✅ 4 |
| updateBooking | 4 | ✅ 4 |
| deleteBooking | 4 | ✅ 4 |
| **Total** | **16** | **✅ 16** |
---

## Project Structure

```
MeetingRoomBook2/
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI/CD pipeline
├── backend/
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js       # Register, login, profile
│   │   └── bookingController.js    # CRUD operations (NEW)
│   ├── middleware/
│   │   └── authMiddleware.js       # JWT protection
│   ├── models/
│   │   ├── User.js                 # User schema
│   │   └── Booking.js              # Booking schema (NEW)
│   ├── routes/
│   │   ├── authRoutes.js           # Auth endpoints
│   │   └── bookingRoutes.js        # Booking endpoints (NEW)
│   ├── test/
│   │   └── booking_test.js         # 16 unit tests (NEW)
│   ├── server.js                   # Express app entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BookingForm.jsx     # Create/Update form (NEW)
│   │   │   ├── BookingList.jsx     # Read/Delete list (NEW)
│   │   │   └── Navbar.jsx          # Navigation bar
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state with localStorage
│   │   ├── pages/
│   │   │   ├── Bookings.jsx        # Main bookings page (NEW)
│   │   │   ├── Login.jsx           # Login page
│   │   │   ├── Register.jsx        # Registration page
│   │   │   └── Profile.jsx         # User profile page
│   │   ├── axiosConfig.jsx         # Axios with env variable base URL
│   │   └── App.js                  # Routes
│   └── package.json
├── startup.sh                      # Auto-startup script for VM restarts
└── README.md
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/profile` | Get user profile | Yes |
| PUT | `/api/auth/profile` | Update user profile | Yes |

### Bookings (CRUD)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/bookings` | Create a booking | Yes |
| GET | `/api/bookings` | Get all my bookings | Yes |
| GET | `/api/bookings/:id` | Get booking by ID | Yes |
| PUT | `/api/bookings/:id` | Update a booking | Yes |
| DELETE | `/api/bookings/:id` | Delete a booking | Yes |

---

## Running the Application

### Local Development
```bash
# Backend
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run dev               # runs on port 5001

# Frontend (new terminal)
cd frontend
npm install
npm start                 # runs on port 3000
```

### Run Tests
```bash
cd backend
npm test
# Expected output: 16 passing
```

### Production 
```bash
# After every VM restart, run:
./startup.sh
# Then open Firefox and go to http://localhost
```

---

## CI/CD Pipeline

```
Push to main branch
        ↓
Job 1: Backend Tests      ← runs 16 unit tests
        ↓ (only if pass)
Job 2: Frontend Build     ← builds React app
        ↓ (only if pass)
Job 3: Deploy             ← restarts PM2 + reloads Nginx
```

---

