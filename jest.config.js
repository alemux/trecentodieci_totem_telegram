module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    verbose: true,
    setupFiles: ['<rootDir>/tests/setup.js'],
    testTimeout: 10000,
    detectOpenHandles: true,
    forceExit: true,
    logHeapUsage: true
}; 