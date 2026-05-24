# ShopGenius - Enterprise E-Commerce Backend

This is a complete, production-ready, highly scalable e-commerce backend system built with **Java 21** and **Spring Boot 3.x**. 

## Features
- **Clean Architecture**: Package-by-feature structure.
- **Security**: JWT Authentication, Refresh Token Rotation, BCrypt hashing, and Role-Based Access Control (RBAC).
- **Products & Cart**: Full inventory tracking, complex discount/coupon logic, and pagination.
- **Order & Payments**: Mock payment gateway, order lifecycle management.
- **AI Negotiation Engine**: Users can dynamically negotiate prices with a rule-based AI.
- **Fraud Detection Engine**: Algorithmic scoring of user behavior and order risk.
- **Smart Analytics**: Cart recovery, price drop watchers, and behavior recommendations.
- **Containerized Infrastructure**: Docker-compose setup for PostgreSQL and Redis.
- **Automated Database Migrations**: Flyway.

## Tech Stack
- **Java 21**, **Spring Boot 3.x**, **Maven**
- **Database**: PostgreSQL (via Spring Data JPA / Hibernate) + Flyway
- **Cache / Session**: Redis
- **Security**: Spring Security + JJWT
- **Mapping**: MapStruct + Lombok
- **Testing**: JUnit 5, Mockito, Testcontainers

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Java 21 & Maven (Optional, you can run directly via Docker)

### 1. Start Infrastructure
Run the following to start PostgreSQL and Redis containers:
```bash
docker-compose up -d postgres redis
```

### 2. Run the Application
You can run it via Maven:
```bash
mvn clean spring-boot:run
```
Flyway will automatically create the schema `V1__init_schema.sql` on startup.

### 3. API Documentation
Once the app is running on port 8080, visit:
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/v3/api-docs`

## Architecture Highlights
- The system adheres strictly to **SOLID** principles.
- Use of robust **DTOs** to segregate entity layer from presentation.
- Uniform API responses via a generic `ApiResponse<T>` wrapper.
- Global Exception Handling mapping business errors to precise HTTP status codes.
