module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|js)$': require.resolve('ts-jest'),
  },
  transformIgnorePatterns: [
    '/node_modules/(?!uuid/)',
  ],
  moduleDirectories: ['node_modules', 'src'],
  globalSetup: "./src/test/global.setup.ts",
  setupFilesAfterEnv: ['./src/test/setup-jest.ts'],
  forceExit: true,
  maxWorkers: "50%",
  clearMocks: true,
  testTimeout: 15000,
};
