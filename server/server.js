require("dotenv").config();

const connectDB = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(`🚀 Cyber Shield backend running on port ${PORT}`);
  console.log(`🌐 http://localhost:${PORT}`);
});