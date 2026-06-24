
export JAVA_HOME=/Users/pappu.kumar/.vaadin/jdk/jbrsdk-25-osx-aarch64-b176.4/Contents/Home
export PATH="$JAVA_HOME/bin:$PATH"
./mvnw clean spotless:apply checkstyle:check spotbugs:check spring-boot:run