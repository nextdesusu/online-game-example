import Server from "./Server";

const DEFAULT_PORT = 3000;
const CLIEND_PORT = 3001;

const GameServer: Server = new Server(DEFAULT_PORT, CLIEND_PORT);

GameServer.listen(port => {
  console.log(`Server is listening on http://localhost:${port}`);
});
