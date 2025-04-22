export default {
  testEnvironment: 'jsdom',
  verbose: true,
  collectCoverage: true,
  coverageDirectory: './coverage/',
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  moduleFileExtensions: ['js', 'json'],
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: './script',
      outputName: 'report.xml'
    }]
  ],
  // Usar el reporter de json incorporado en vez de jest-json-reporter
  jsonReporter: {
    outputFile: './script/report.json'
  }
};
