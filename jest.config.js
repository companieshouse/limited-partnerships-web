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
  moduleNameMapper: {
    "^@config/(.*)$": "<rootDir>/src/config/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@locales/(.*)$": "<rootDir>/locales/$1",
    "^@middlewares/(.*)$": "<rootDir>/src/middlewares/$1",
    "^@presentation/(.*)$": "<rootDir>/src/presentation/$1",
    "^@routes/(.*)$": "<rootDir>/src/routes/$1",
    "^@service/(.*)$": "<rootDir>/src/application/service/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@utils$": "<rootDir>/src/utils/index.ts",
    "^@views/(.*)$": "<rootDir>/src/views/$1",
  }
};
