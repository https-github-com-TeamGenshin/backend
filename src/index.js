"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
require("dotenv").config();
const pusher_1 = __importDefault(require("pusher"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: false, limit: 10000, parameterLimit: 6 }));
// Initialize Pusher
const pusher = new pusher_1.default({
    appId: process.env.PUSHER_APP_ID || "",
    key: process.env.PUSHER_KEY || "",
    secret: process.env.PUSHER_SECRET || "",
    cluster: "ap2",
    useTLS: true,
});
// validation and reset password
const index_1 = __importDefault(require("./otpServices/index"));
app.use("/otp", index_1.default);
// Cab Route connection
const cab_1 = __importDefault(require("./routes/cab"));
app.use("/api/cab", cab_1.default);
// driver Route connection
const driver_1 = __importDefault(require("./routes/driver"));
app.use("/api/driver", driver_1.default);
// requests Route connection
const requests_1 = __importDefault(require("./routes/requests"));
app.use("/api/request", requests_1.default);
// user Route connection
const user_1 = __importDefault(require("./routes/user"));
app.use("/api/user", user_1.default);
// Connecting to the Mongo DB from config folder
const db_1 = __importDefault(require("./config/db"));
(0, db_1.default)();
// Listening to the port
app.listen(PORT, () => {
    console.log(`Running on PORT ${PORT}`);
});
