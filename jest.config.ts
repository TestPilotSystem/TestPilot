import type { Config } from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
    dir: './',
});

const mockFile = '<rootDir>/__mocks__/fileMock.js';
const mockIdentity = 'identity-obj-proxy';

const baseConfig: Config = {
    coverageProvider: 'v8', 
    moduleDirectories: ['node_modules', '<rootDir>/'],
    
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1', 
        '\\.(css|less|sass|scss)$': mockIdentity,
        '\\.(gif|ttf|eot|svg|png)$': mockFile,
    },
    
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],

    transform: {
        '^.+\\.(ts|tsx|js|jsx)$': ['babel-jest', { configFile: './babel.config.js' }],
    },

    testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
};

const jestConfig: Config = {
    ...baseConfig,
    projects: [
        {
            displayName: 'client',
            testEnvironment: 'jsdom',
            setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], 
            testMatch: ['<rootDir>/src/components/**/*.((test|spec)).(ts|tsx)'],
        },
        {
            displayName: 'server',
            testEnvironment: 'node',
            testMatch: ['<rootDir>/src/app/api/**/*.test.ts'],
        },
    ],
};

export default createJestConfig(jestConfig);