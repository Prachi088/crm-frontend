 # CRM Lite 🚀

A full-stack Customer Relationship Management (CRM) application built with **Spring Boot** and **React**. Designed to manage leads, track deal values, and visualize sales pipeline data.

---

## 🌐 Live Demo
- 🌐 Frontend: https://crm-frontend-drab-eight.vercel.app
- ⚙️ Backend API: https://crm-backend-8ir9.onrender.com
- 📦 Database: PostgreSQL on Render

---

## 📸 Screenshots

> Add screenshots of your app here

---

## ✨ Features

- ✅ Add, Edit, Delete Leads
- ✅ Lead status pipeline — Prospect → Qualified → Proposal → Closed Won → Closed Lost
- ✅ Deal Value tracking per lead (₹)
- ✅ Notes per lead
- ✅ Search and filter leads
- ✅ Analytics dashboard with Pie and Bar charts
- ✅ Export leads to CSV
- ✅ REST API with full CRUD operations
- ✅ PostgreSQL database (production) + MySQL (local)
- ✅ Deployed on Render (backend) + Vercel (frontend)

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Java 21 | Programming language |
| Spring Boot 4 | Backend framework |
| Spring Data JPA | Database ORM |
| PostgreSQL | Production database (Render) |
| MySQL | Local development database |
| Maven | Dependency management |

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 | Frontend framework |
| Recharts | Charts and analytics |
| CSS3 | Styling |

---

## 🚀 How to Run Locally

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL

### Backend Setup
```bash
# 1. Clone the repository
git clone https://github.com/Prachi088/crm-backend.git

# 2. Open in IntelliJ IDEA

# 3. Create MySQL database
mysql -u root -p
CREATE DATABASE crmdb;

# 4. Update application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/crmdb
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

# 5. Run the Spring Boot application
./mvnw spring-boot:run

# Backend runs at https://crm-backend-8ir9.onrender.com
```

### Frontend Setup
```bash
# 1. Clone the repository
git clone https://github.com/Prachi088/crm-frontend.git

# 2. Install dependencies
npm install

# 3. Start the app
npm start

# 4. Open browser at
http://localhost:3000
```

---

## 📡 API Endpoints

### Leads
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/leads` | Get all leads |
| GET | `/api/leads/{id}` | Get lead by ID |
| POST | `/api/leads` | Create new lead |
| PUT | `/api/leads/{id}` | Update lead by ID |
| DELETE | `/api/leads/{id}` | Delete lead by ID |

### Notes
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/notes` | Get all notes |
| GET | `/api/notes/{id}` | Get note by ID |
| GET | `/api/notes/lead/{leadId}` | Get all notes for a lead |
| POST | `/api/notes/lead/{leadId}` | Add note to a lead |
| PUT | `/api/notes/{id}` | Update note by ID |
| DELETE | `/api/notes/{id}` | Delete note by ID |

---

## 📁 Project Structure

```
crm-backend/                        # Spring Boot Backend
├── src/main/java/com/crm/crm_lite/
│   ├── controller/
│   │   ├── LeadController.java
│   │   └── NoteController.java
│   ├── model/
│   │   ├── Lead.java
│   │   └── Note.java
│   ├── repository/
│   │   ├── LeadRepository.java
│   │   └── NoteRepository.java
│   └── service/
│       ├── LeadService.java
│       └── NoteService.java
└── src/main/resources/
    └── application.properties

crm-frontend/                       # React Frontend
├── src/
│   ├── components/
│   │   ├── LeadForm.js
│   │   └── LeadList.js
│   ├── App.js
│   ├── App.css
│   └── index.css
└── package.json
```

---

## 🌍 Deployment

| Service | Platform | URL |
|---------|---------|-----|
| Frontend | Vercel | https://crm-frontend-drab-eight.vercel.app |
| Backend | Render | https://crm-backend-8ir9.onrender.com |
| Database | Render PostgreSQL | Managed by Render |

---

## 👩‍💻 Author

**Prachi Rajput**
- GitHub: [Prachi088](https://github.com/Prachi088)
- LinkedIn: [Prachi Rajput](https://linkedin.com/in/prachi-rajput-023985280)

---

## 📝 License
This project is open source and available under the [MIT License](LICENSE).