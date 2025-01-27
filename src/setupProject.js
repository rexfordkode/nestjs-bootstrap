import shell from "shelljs";
import { configureDatabase } from "./configureDatabase.js";
import { generateDockerCompose } from "./generateDocker.js";
import { DRIZZLE_CONFIG } from "./utils.js";
import { DRIZZLE } from "./constant.js";

export function setupProject(answers) {
  const { projectName, database, orm } = answers;

  // Create a new NestJS project with the specified name
  shell.exec(`npx @nestjs/cli new ${projectName}`);

  // Navigate to the project directory
  shell.cd(projectName);

  // Install the selected ORM/client
  if (orm === DRIZZLE) {
    const { dependencies, devDependencies } = DRIZZLE_CONFIG[database];

    shell.exec(`npm install ${dependencies.join(" ")} `);
    shell.exec(`npm install -D${devDependencies.join(" ")}`);
  } else {
    switch (orm) {
      case "Prisma":
        shell.exec("npm install @prisma/client prisma");
        shell.exec("npx prisma init");
        break;

      case "TypeORM":
        shell.exec("npm install @nestjs/typeorm typeorm");
        break;
      case "Sequelize":
        shell.exec(
          "npm install @nestjs/sequelize sequelize sequelize-typescript"
        );
        break;
      case "Mongoose":
        shell.exec("npm install @nestjs/mongoose mongoose");
        break;
    }
  }
  // Add database-specific configuration
  configureDatabase(database, orm);

  // Generate Docker configuration
  generateDockerCompose(database);

  console.log(`Project "${projectName}" setup complete!`);
}
