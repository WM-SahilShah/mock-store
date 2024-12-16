# Your Next Store

## Demo

[Live Demo](https://demo.yournextstore.com/)

[Video Demo] (https://github.com/user-attachments/assets/64197310-29bd-4dd3-a736-1494340e20e8)

## Prerequisites

### Node.js 20+

We officially support the current LTS version – 20 at the time of writing. YNS should work on versions 18, 20, and 22. If you're using one of those versions and encounter a problem, please report it!

#### Installing Node.js

Follow the instructions for your operating system found here: [nodejs.org/en/download](https://nodejs.org/en/download)

### pnpm 9+

We officially support pnpm version 9, but we will do our best to keep it compatible with npm and yarn.

#### Installing pnpm

The easiest way to install pnpm is via Node.js Corepack. Inside the folder with YNS, run these commands:

```bash
corepack enable
corepack install
```

Alternatively, follow the instructions for your operating system found here: [pnpm.io/installation](https://pnpm.io/installation)

### Docker

To deploy on Docker, follow these steps:

1. Clone this repository into an empty folder and create the .env file in the repository as described [here](#add-environment-variables).
2. Set the variable DOCKER=1 in .env
3. Execute `pnpm run docker:build`.
4. After that, you can start the container with `pnpm run docker:run`.
