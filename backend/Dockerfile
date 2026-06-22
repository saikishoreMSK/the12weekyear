# syntax=docker/dockerfile:1

# ---- Build stage: compile and package the jar ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Resolve dependencies first so this layer is cached when only source changes.
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B -q clean package -DskipTests

# ---- Run stage: small JRE image with just the jar ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# Run as a non-root user.
RUN useradd -r -u 1001 appuser
COPY --from=build /app/target/*.jar app.jar
USER appuser

# Render provides PORT; the app reads it via application.yml. EXPOSE is informational.
EXPOSE 8080

# MaxRAMPercentage keeps the JVM within the container's memory limit (important on small plans).
ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -jar app.jar"]
