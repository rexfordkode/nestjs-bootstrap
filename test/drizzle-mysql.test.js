// tests/drizzle-mysql.test.js
test("Generates MySQL+Drizzle files", () => {
  setupProject({
    projectName: "test-app",
    database: "MySQL",
    orm: "Drizzle",
  });

  expect(fs.readFileSync("src/database/database.module.ts", "utf-8")).toContain(
    "mysql2/promise"
  );
});
