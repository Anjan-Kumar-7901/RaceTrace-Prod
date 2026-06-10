import "dotenv/config";
import express from "express";
import path from "path";
import app from "./server";

const PORT = Number(process.env.PORT) || 3000;

async function startServer(): Promise<void> {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Mounted Vite middleware on Express server.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`RaceTrace server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start RaceTrace server:", error);
  process.exitCode = 1;
});
