import fs from "fs";
import { DRIZZLE_CONFIG } from "./utils.js";

export function configureDatabase(database, orm) {
  // 1. Create .env file
  const envContent = `DATABASE_URL="${getDatabaseUrl(database)}"`;
  fs.writeFileSync(".env", envContent);

  // 2. Generate database module
  if (orm === "Drizzle") {
    generateDrizzleFiles(database);
  } else {
    generateOtherORMFiles(database, orm);
  }
}

function generateDrizzleFiles(database) {
  const config = DRIZZLE_CONFIG[database];

  // a) Generate drizzle.config.ts
  fs.writeFileSync(
    "drizzle.config.ts",
    `import type { Config } from "drizzle-kit";
export default {
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "${config.driver}",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;`
  );

  // b) Generate schema.ts
  fs.writeFileSync(
    "src/schema.ts",
    `import { ${config.schemaImport}, serial, varchar } from "drizzle-orm/${config.drizzleOrmModule}";

export const users = ${config.schemaImport}("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }),
});`
  );

  // c) Generate DatabaseModule
  fs.writeFileSync(
    "src/database/database.module.ts",
    `import { Module } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/${config.drizzleOrmModule}';
import * as client from '${config.clientImport}';

@Module({
  providers: [
    {
      provide: 'DB',
      useFactory: async () => {
        ${config.connectionSetup}
      },
    },
  ],
  exports: ['DB'],
})
export class DatabaseModule {}`
  );
}

function generateOtherORMFiles(database, orm) {
  if (orm === "Prisma") {
    generatePrismaFiles(database);
  } else if (orm === "TypeORM") {
    generateTypeORMFiles(database);
  } else if (orm === "Sequelize") {
    generateSequelizeFiles(database);
  } else {
    throw new Error(`Unsupported ORM: ${orm}`);
  }
}

function generatePrismaFiles(database) {
  // Logic to generate Prisma files
  fs.writeFileSync(
    "prisma/schema.prisma",
    `datasource db {
    provider = "${database.toLowerCase()}"
    url      = env("DATABASE_URL")
  }

  generator client {
    provider = "prisma-client-js"
  }

  model User {
    id    Int     @id @default(autoincrement())
    name  String
  }`
  );
}

function generateTypeORMFiles(database) {
  // Logic to generate TypeORM files
  fs.writeFileSync(
    "src/database/ormconfig.ts",
    `import { TypeOrmModuleOptions } from '@nestjs/typeorm';

  const config: TypeOrmModuleOptions = {
    type: "${database.toLowerCase()}",
    url: process.env.DATABASE_URL,
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  };

  export default config;`
  );
}

function generateSequelizeFiles(database) {
  // Logic to generate Sequelize files
  fs.writeFileSync(
    "src/database/sequelize.config.ts",
    `import { Sequelize } from 'sequelize-typescript';

  const sequelize = new Sequelize({
    dialect: '${database.toLowerCase()}',
    url: process.env.DATABASE_URL,
    models: [__dirname + '/../**/*.model{.ts,.js}'],
  });

  export default sequelize;`
  );
}

function getDatabaseUrl(database) {
  switch (database) {
    case "PostgreSQL":
      return "postgresql://user:pass@localhost:5432/db";
    case "MySQL":
      return "mysql://user:pass@localhost:3306/db";
    case "SQLite":
      return "file:./dev.db";
    default:
      return "";
  }
}
