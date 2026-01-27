module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  moduleDirectories: ['node_modules', 'src'],
  globalSetup: "./src/test/global.setup.ts",
  // exclude test helper / setup files from coverage reporting
  coveragePathIgnorePatterns: [
    "<rootDir>/src/test/global.setup.ts"
  ],
  setupFilesAfterEnv: ['./src/test/setup-jest.ts'],
  testTimeout: 10000
};
