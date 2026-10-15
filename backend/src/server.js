// require('dotenv').config();
// const app = require('./app');

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`CloudVault API running on http://localhost:${PORT}`);
// });


require("dotenv").config();

const app = require("./app");

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`CloudVault API running on port ${PORT}`);
  });
}

module.exports = app;