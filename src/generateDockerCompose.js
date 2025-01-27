import fs from "fs";

export function generateDockerCompose(database) {
  let dbService = "";

  switch (database) {
    case "PostgreSQL":
      dbService = `
  postgres:
    image: postgres:13
    environment:
      POSTGRES_USER: your_user
      POSTGRES_PASSWORD: your_password
      POSTGRES_DB: your_database
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data
`;
      break;
    case "MySQL":
      dbService = `
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: your_password
      MYSQL_DATABASE: your_database
      MYSQL_USER: your_user
      MYSQL_PASSWORD: your_password
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
`;
      break;
    case "MongoDB":
      dbService = `
  mongo:
    image: mongo:6.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: your_user
      MONGO_INITDB_ROOT_PASSWORD: your_password
      MONGO_INITDB_DATABASE: your_database
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
`;
      break;
  }

  const dockerComposeContent = `
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: ${getDatabaseUrl(database)}
    depends_on:
      - ${database.toLowerCase()}

${dbService}

volumes:
  ${
    database === "PostgreSQL"
      ? "postgres-data:"
      : database === "MySQL"
      ? "mysql-data:"
      : "mongo-data:"
  }
`;

  fs.writeFileSync("docker-compose.yml", dockerComposeContent);

  const dockerfileContent = `
# Use the official Node.js image
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start:prod"]
`;

  fs.writeFileSync("Dockerfile", dockerfileContent);
}

function getDatabaseUrl(database) {
  switch (database) {
    case "PostgreSQL":
      return "postgresql://your_user:your_password@postgres:5432/your_database";
    case "MySQL":
      return "mysql://your_user:your_password@mysql:3306/your_database";
    case "MongoDB":
      return "mongodb://your_user:your_password@mongo:27017/your_database";
  }
}
