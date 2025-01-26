#!/usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
import { setupProject } from "./setupProject.js";

const questions = [
  {
    type: "input",
    name: "projectName",
    message: "What is the name of your project?",
    validate: (input) => {
      if (/^[a-z0-9-]+$/.test(input)) return true;
      return "Project name must be lowercase and can only contain letters, numbers, and hyphens.";
    },
  },
  {
    type: "list",
    name: "database",
    message: "Which database do you want to use?",
    choices: ["PostgreSQL", "MySQL", "SQLite", "MongoDB"],
  },
  {
    type: "list",
    name: "orm",
    message: "Which ORM/client do you want to use?",
    choices: ["Prisma", "Drizzle", "TypeORM", "Sequelize", "Mongoose"],
  },
];

inquirer.prompt(questions).then((answers) => {
  console.log(
    chalk.green(`You selected ${answers.database} with ${answers.orm}`)
  );
  setupProject(answers);
});
