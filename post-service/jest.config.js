module.exports = {
    testEnvironment: "node", // Use Node.js environment
    coveragePathIgnorePatterns: ["/node_modules/"], // Ignore node_modules for coverage
    testMatch: ["**/__tests__/**/*.test.js"], // Look for test files in __tests__ folder
  };