module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/backend/__tests__/setup.js'],
  testTimeout: 60000,
  testMatch: ['**/backend/__tests__/**/*.spec.js'],
  collectCoverageFrom: [
    'backend/**/*.js',
    '!backend/__tests__/**',
    '!backend/node_modules/**'
  ]
};