# ECommerce

An eCommerce web application that uses React, GraphQL, Next, and Apollo.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Installing

Installing the front end

```sh
cd frontend
npm install
npm run dev
```

Installing the back end

```sh
cd backend
npm install
npm run dev
```

Create variables.env in /backend

```sh
FRONTEND_URL="http://localhost:7777"
PRISMA_ENDPOINT="<your prisma endpoint>"
PRISMA_SECRET="<your prisma secret>"
APP_SECRET="<your app secret>"
STRIPE_SECRET="<your stripe secret>"
PORT=4444
MAIL_HOST="<your mail host>"
MAIL_PORT=2525
MAIL_USER="<your mail username>"
MAIL_PASSWORD="<your mail password>"
```

Then open http://localhost:7777/ to see your app.
