/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  roots: ["<rootDir>"],
  testMatch: ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  testTimeout: 30_000,
  collectCoverageFrom: ["src/**/*.ts", "!src/index.ts"],
  coverageDirectory: "coverage",
  verbose: true,
}
