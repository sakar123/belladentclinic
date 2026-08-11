import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const standaloneDir = path.join(root, ".next", "standalone");

function copyFresh(source, destination) {
  if (!fs.existsSync(source)) return false;
  fs.rmSync(destination, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
  return true;
}

if (!fs.existsSync(standaloneDir)) {
  process.exit(0);
}

const copiedStatic = copyFresh(
  path.join(root, ".next", "static"),
  path.join(standaloneDir, ".next", "static")
);

const copiedPublic = copyFresh(
  path.join(root, "public"),
  path.join(standaloneDir, "public")
);

if (copiedStatic || copiedPublic) {
  console.log("Prepared standalone runtime assets.");
}
