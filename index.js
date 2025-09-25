const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const connectDB = require("./config/db");
const swagger = require('./config/swagger')
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/bookRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

connectDB();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.use("/auth", authRoutes);
app.use("/books", bookRoutes);
app.use("/", reviewRoutes);


swagger(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});