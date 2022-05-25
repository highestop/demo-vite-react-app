import { pathsToModuleNameMapper } from 'ts-jest'
import tsConfig from './tsconfig.json'

export default {
    verbose: true,
    testEnvironment: 'jest-environment-jsdom',
    preset: 'ts-jest',
    setupFiles: [],
    setupFilesAfterEnv: [],
    globals: {
        NODE_ENV: 'test',
        'ts-jest': {
            isolatedModules: true,
            tsconfig: tsConfig.compilerOptions
        }
    },
    testMatch: ['src/**/__tests__/**/*.test.(ts|tsx)'],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(css|styl|less|sass|scss|svg|png|jpg)$': 'jest-transform-stub'
    },
    transformIgnorePatterns: ['<rootDir>/node_modules/(?!lodash-es)'],
    // https://kulshekhar.github.io/ts-jest/docs/getting-started/paths-mapping/
    moduleNameMapper: {
        '^lodash-es$': 'lodash',
        ...pathsToModuleNameMapper(tsConfig.compilerOptions.paths, { prefix: '<rootDir>/packages/' })
    },
    testResultsProcessor: 'jest-junit',
    collectCoverageFrom: [`src/**/*.(ts|tsx)`, '!**/__tests__/**', '!**/*.test.(ts|tsx)'],
    // https://gist.github.com/rishitells/3c4536131819cff4eba2c8ab5bbb4570
    coverageReporters: ['cobertura', 'text', 'text-summary'],
    reporters: ['default', 'jest-junit'],
    coverageDirectory: 'out/Test'
}
