import app from "./app";
import { env } from "./config/env";
import { connectDB } from "./config/db";

async function start() {
  await connectDB();

  if (!process.env.VERCEL) {
    app.listen(env.port, () => {
      console.log(`Server running on http://localhost:${env.port}`);
    });
  }
}

start();

export default app;


