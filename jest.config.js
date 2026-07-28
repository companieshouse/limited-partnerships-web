module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.(ts|js)$': ['@swc/jest', {
      jsc: {
        parser: {
          syntax: 'typescript',
          decorators: true,
        },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
        },
      },
      module: {
        type: 'commonjs',
      },
    }],
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
