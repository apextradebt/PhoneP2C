## Getting Started

This is the front of the Nexus App. An app that allow the user to monitor all his orders about phone recovery. It can analyse the market to give advice on when to buy and when to sell. 

First, install all the libraries and dependencies:

```bash
npm install
```

Then, you will need to create the .env file in order to have all the required keys, and variables.

You can copy paste the .env.example if you prefer

```bash
VITE_AUTH0_DOMAIN ="domain auth0"
VITE_AUTH0_CLIENT_ID ="client id auth0"
AUTH0_CLIENT_SECRET="client secret"
AUTH0_SECRET="secret other or same"
VITE_AUTH0_IDENTIFIER="identifier M2M i think"
VITE_API_URL = "The api address used for the front"
VITE_API_URL_Local = "http://localhost:3001"
BASE_URL =http://localhost:5173/PhoneP2C/
```

You will need to fill all the missing key with the file kiven with all the keys



Then, you can run the development server:

```bash
npm run dev
```

enjoy ! 

