import { setupServer } from "msw/node";

// No default handlers: each test declares the API replies it needs.
const server = setupServer();

export default server;
