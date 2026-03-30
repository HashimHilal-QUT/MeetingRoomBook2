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

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js, Tailwind CSS, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Cloud) |
| Authentication | JWT (JSON Web Tokens) |
| Web Server | Nginx (Reverse Proxy) |
| Process Manager | PM2 |
| Testing | Mocha, Chai, Sinon |
| CI/CD | GitHub Actions |
| Deployment | AWS EC2 Instance |

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

### 3. Unit Testing
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

### 4. Version Control using GitHub
- Git repository initialized and connected to GitHub
- Feature branch workflow — `feature/crud-bookings` branch created
- Pull Request raised and merged into `main`
- `.gitignore` configured to exclude `node_modules`, `.env`, and `build/` folders

### 5. CI/CD Integration with GitHub Actions
- Automated pipeline triggered on every push to `main`
- Three jobs running in sequence:
  - **Job 1 — Backend Tests**: installs dependencies and runs 16 unit tests
  - **Job 2 — Frontend Build**: builds React app with production environment variables
  - **Job 3 — Deploy**: writes `.env` from GitHub Secrets, restarts PM2 backend, reloads Nginx
- Build and deploy only proceed if all tests pass
- Self-hosted GitHub Actions runner installed on Azure VM

### 6. Cloud Deployment on AWS EC2
- Application deployed on AWS EC2 (Ubuntu)
- Nginx configured as reverse proxy — serves React frontend on port 80, proxies `/api/*` to Node.js backend on port 5001
- PM2 manages backend process with auto-restart on failure
- Startup script (`startup.sh`) ensures everything recovers automatically after VM restarts
- systemd service configured to run startup script on every boot

---

## Additional Features — Infrastructure Resilience
### Automatic Recovery on VM Restart

A custom startup script (startup.sh) was developed to ensure the application recovers automatically every time the EC2 instance restarts. The script runs as a systemd service, meaning it executes automatically on boot without any manual intervention. It performs six steps in sequence — setting the API URL, verifying environment variables, installing dependencies, rebuilding the frontend, restarting the backend via PM2, and reloading Nginx. This ensures the application is always in a fully operational state within minutes of the VM starting up.

### Resilience to Public IP Address Changes

The EC2 instance IP changes every time the VM is restarted. To handle this, the application was designed to operate independently of the public IP address. The frontend is configured to communicate with the backend via http://localhost rather than a hardcoded public IP, meaning no code changes or manual reconfiguration are required after a restart. The startup.sh script automatically writes the correct REACT_APP_API_URL=http://localhost value into the frontend environment file and rebuilds the React application on every boot, guaranteeing the frontend always points to the correct backend regardless of what IP the VM is assigned.

### IP Management Utility

An additional utility script (update-ip.sh) was developed to provide flexibility for switching between localhost and public IP access modes. When external access is required, the script auto-detects the current public IP using curl -s ifconfig.me, updates the frontend environment variable, rebuilds the application, and restarts all services in a single command. This eliminates the risk of human error when manually updating configuration files and makes the deployment process repeatable and reliable.

### Environment Variable Protection

All sensitive configuration values — including the MongoDB connection string, JWT secret, and API URLs — are stored as GitHub Secrets and injected into the application at deploy time through the CI/CD pipeline. The .env file is excluded from version control via .gitignore, ensuring credentials are never exposed in the GitHub repository. This follows industry best practices for secrets management in cloud-deployed applications.


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

## GitHub Repository

**Meeting Room Booking App:** https://github.com/HashimHilal-QUT/MeetingRoomBook2


