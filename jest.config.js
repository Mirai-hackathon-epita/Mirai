/** @type {import('jest').Config} */
const config = {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
    "!src/app/page.tsx",
    "!src/app/student/page.tsx",
    "!src/app/teacher/page.tsx",
    "!src/app/teacher/student/[id]/page.tsx",
    "!src/app/globals.css",
    "!src/components/**",
  ],
  moduleNameMapper: {
    "^server-only$": "<rootDir>/src/__mocks__/server-only.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: { jsx: "react" } }],
  },
};

module.exports = config;
