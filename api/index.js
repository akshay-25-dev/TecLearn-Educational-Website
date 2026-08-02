let app;
try {
  app = require("../server/index.js");
} catch (error) {
  console.error("Vercel Serverless Startup Error:", error);
  app = (req, res) => {
    res.status(500).json({
      success: false,
      message: "Serverless Function Initialisation Error",
      error: error.message,
    });
  };
}

module.exports = app;
