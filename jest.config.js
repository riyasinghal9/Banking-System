module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  testTimeout: 10000,
  forceExit: true,
  detectOpenHandles: true,
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
    "!src/database/migrate.js",
    "!src/database/seed.js"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"]
};
