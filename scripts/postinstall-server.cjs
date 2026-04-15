if (process.env.VERCEL) {
  console.log("[postinstall] skip server/ deps on Vercel")
  process.exit(0)
}

const { execSync } = require("child_process")
execSync("npm install --prefix server", { stdio: "inherit" })
