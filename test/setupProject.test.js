import { setupProject } from "../src/setupProject.js";
import shell from "shelljs";

jest.mock("shelljs");

describe("setupProject", () => {
  it("should set up a NestJS project with PostgreSQL and Prisma", () => {
    const answers = {
      projectName: "my-nest-app",
      database: "PostgreSQL",
      orm: "Prisma",
    };
    setupProject(answers);

    expect(shell.exec).toHaveBeenCalledWith("npx @nestjs/cli new my-nest-app");
    expect(shell.exec).toHaveBeenCalledWith(
      "npm install @prisma/client prisma"
    );
    expect(shell.exec).toHaveBeenCalledWith("npx prisma init");
  });
});
