# syntax=docker/dockerfile:1.7

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace

COPY pom.xml ./
COPY mvnw ./
COPY .mvn ./.mvn
COPY src ./src

RUN chmod +x mvnw && ./mvnw -DskipTests package

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app/backend

COPY --from=build /workspace/target/*.jar /app/backend/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/backend/app.jar"]
