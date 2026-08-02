const dotenv = require("dotenv");
// Loading environment variables FIRST — before any other imports that read process.env
dotenv.config();

const express = require("express");
const os = require("os");
const app = express();
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/Profile");
const courseRoutes = require("./routes/Course");
const paymentRoutes = require("./routes/Payments");
const withdrawalRoutes = require("./routes/Withdrawal");
const contactUsRoute = require("./routes/Contact");
const database = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { cloudinaryConnect } = require("./config/cloudinary");
const fileUpload = require("express-fileupload");
// Setting up port number
const PORT = process.env.PORT || 4000;

// Connecting to database
database.connect();
 
// Middlewares
app.use(express.json());
app.use(cookieParser());
// Enable CORS for frontend applications
const allowedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(",")
	: [
			"http://localhost:3000",
			"http://localhost:5173",
			"http://localhost:5174",
			"http://localhost:5175",
			"http://127.0.0.1:3000",
			"http://127.0.0.1:5173",
			"http://127.0.0.1:5174",
			"http://127.0.0.1:5175",
	  ];

app.use(
	cors({
		origin: allowedOrigins,
		credentials: true,
	})
);

app.use(
	fileUpload({
		useTempFiles: true,
		tempFileDir: os.tmpdir(), // cross-platform: works on Windows & Linux
	})
);

// Connecting to cloudinary
cloudinaryConnect();

// Setting up routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);
app.use("/api/v1/withdrawal", withdrawalRoutes);
app.use("/api/v1/reach", contactUsRoute);

//default route
app.get("/", (req, res) => {
	return res.json({
		success: true,
		message: "Congrats, Your server is up and running ...",
	});
});

// Listening to the server
app.listen(PORT, () => {
	console.log(`App is listening at ${PORT}`);
});


