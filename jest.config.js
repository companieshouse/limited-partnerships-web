module.exports = {
  roots: [
    "<rootDir>"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  collectCoverageFrom: [
    "./src/**/*.ts"
  ],
  coveragePathIgnorePatterns: [
    "/src/bin/",
  ],
  preset: "ts-jest",
  testEnvironment: "node",
  testTimeout: 25000,
  verbose: true,
  testMatch: ["**/test/**/*.spec.[jt]s", "**/test/**/*.test.[jt]s"],
  globalSetup: "./test/setup.ts",
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      // Add any other ts-jest configuration options here
    }],
  }
};
