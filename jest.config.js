const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  testEnvironment: 'node',
};

// This line is crucial! It applies the Next.js SWC magic.
module.exports = createJestConfig(customJestConfig);