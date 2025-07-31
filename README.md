# limited-partnerships-web
Web front-end for the Limited Partnerships service

Requires >= Node v20
         >= npm v10

## Local build instructions
1. run 'npm i' to install packages
2. run 'npm run build' to compile
3. run 'npm run start' to start the service

use http://chs.local/limited-partnerships/registration/continue-saved-filing to view the first page of the journey.

## Technologies and Utils

- [NodeJS](https://nodejs.org/)
- [ExpressJS](https://expressjs.com/)
- [Typescript](https://www.typescriptlang.org/)
- [Sonarqube](https://www.sonarqube.org)

## Run Tests

Unit tests:
```
$ npm run test:unit
```
Unit tests watch mode: 
```
$ npm run test:unit:watch
```

---
\
integration tests:
```
$ npm run test:integration
```

integration tests watch mode:
```
$ npm run test:integration:watch
```

---
\
all tests:
```
$ npm run test
```

all tests watch mode:
```
$ npm run test:watch
```