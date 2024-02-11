The project and this readme is under active development. ⚠️

## Description

This is a backend application written in NestJS for a simple chess platform, inspired by lichess.org and others alike.

## Implemented features
- [x] i18n (internationalization)
- [x] multi tenancy using aggregation by locale
- [x] extended/customized logging
- [x] zero dependencies authentication/authorization with jwt
- [x] robust gameplay logic using `chess.js` as the base

## OpenAPI
Swagger docs can be found [here](https://github.com/StiliyanKushev/pawnychess/blob/master/API_DOCUMENTATION.md).</br>
Websocket docs can be found [here](https://github.com/StiliyanKushev/pawnychess/blob/master/WS_API_DOCUMENTATION.md).

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
