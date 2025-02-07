// jest.config.js
export default {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // Adjust this to match your project's alias configuration
  },
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
  testMatch: ["**/?(*.)+(spec|test).[jt]s?(x)"],
};
