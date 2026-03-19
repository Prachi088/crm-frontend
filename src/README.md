# CRM Lite 🚀

A full-stack Customer Relationship Management (CRM) application built with **Spring Boot** and **React**. Designed to manage leads, track deal values, and visualize sales pipeline data.

---

## 🌐 Live Demo
- Frontend: https://crm-frontend-drab-eight.vercel.app
- Backend API: https://crm-backend-production-3671.up.railway.app

---

## 📸 Screenshots

> Add screenshots of your app here after deployment

---

## ✨ Features

- ✅ Add, Edit, Delete Leads
- ✅ Lead status pipeline — Prospect → Qualified → Proposal → Closed Won → Closed Lost
- ✅ Deal Value tracking per lead
- ✅ Notes per lead
- ✅ Search and filter leads
- ✅ Analytics dashboard with Pie and Bar charts
- ✅ Export leads to CSV
- ✅ REST API with full CRUD operations
- ✅ MySQL database

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|-----------|---------|
| Java 17 | Programming language |
| Spring Boot 3 | Backend framework |
| Spring Data JPA | Database ORM |
| MySQL | Database |
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
git clone https://github.com/YOUR_USERNAME/crm-lite.git

# 2. Open the backend folder in IntelliJ

# 3. Create MySQL database
mysql -u root -p
CREATE DATABASE crmdb;

# 4. Update application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/crmdb
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

# 5. Run the Spring Boot application
./mvnw spring-boot:run
```

### Frontend Setup
```bash
# 1. Go to frontend folder
cd crm-frontend

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
| PUT | `/api/leads/{id}` | Update lead |
| DELETE | `/api/leads/{id}` | Delete lead |

### Notes
| Method | Endpoint | Description |
|--------|---------|-------------|
| GET | `/api/notes/lead/{leadId}` | Get notes for a lead |
| POST | `/api/notes/lead/{leadId}` | Add note to lead |
| PUT | `/api/notes/{id}` | Update note |
| DELETE | `/api/notes/{id}` | Delete note |

---

## 📁 Project Structure

```
crm-lite/                          # Spring Boot Backend
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

crm-frontend/                      # React Frontend
├── src/
│   ├── components/
│   │   ├── LeadForm.js
│   │   └── LeadList.js
│   ├── App.js
│   └── App.css
└── package.json
```

---

## 👨‍💻 Author

**Your Name**
- GitHub: [Prachi088 ](https://github.com/Prachi088)
- LinkedIn: [Prachi Rajput](https://linkedin.com/in/prachi-rajput-023985280)
---

## 📝 License
This project is open source and available under the [MIT License](LICENSE).