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
  setupFilesAfterEnv: ['./src/test/setup-jest.ts'],
  testTimeout: 10000 // timeout in milliseconds (10 seconds)
};
