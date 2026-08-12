import { readConfig, setUser } from "./config";
function main() {
  setUser("mhmd");
  const cfg = readConfig();
  console.log(cfg);
}

main();
