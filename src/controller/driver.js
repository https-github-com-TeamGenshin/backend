"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAcceptedRequestsController = exports.getPendingRequestsController = exports.updateDriverStatusController = exports.deleteDriverController = exports.changeAvailabilityController = exports.getDriversbyTypeController = exports.getAllSearchedDriversController = exports.getDriversbyFilterController = exports.updateDriverController = exports.getAllDriversController = exports.findOneDriverController = exports.createDriverController = exports.verifyDriverByToken = exports.loginDriverController = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const SecretKey = "lim4yAey6K78dA8N1yKof4Stp9H4A";
const driver_1 = __importDefault(require("../models/driver"));
const user_1 = __importDefault(require("../models/user"));
// login driver by username (email or mobile_no) and password.
const loginDriverController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.body.username) {
            return res.status(400).json({ message: "Email or Mobile no. not found" });
        }
        else if (!req.body.password) {
            return res.status(400).json({ message: "Password not found" });
        }
        else {
            let { username, password } = req.body;
            password = password.trim();
            // find the driver in the database according to mobile_no or email_id.
            const email_id = username.trim();
            const mobile_no = username.trim();
            const driver = yield driver_1.default.findOne({
                $or: [{ email_id }, { mobile_no }],
            });
            // if driver not found.
            if (driver === null) {
                //Error: if driver not found in database.
                return res.status(404).json({ message: "Driver does not exist" });
            }
            else {
                // Check for the valid password by comparing the hashed password in database.
                const hashedPassword = driver.password;
                bcrypt_1.default.compare(password, hashedPassword).then((results) => {
                    if (results) {
                        // creating the token
                        const token = jsonwebtoken_1.default.sign({
                            id: driver._id.toString(),
                            username: driver.username,
                            email_id: driver.email_id,
                            mobile_no: driver.mobile_no,
                            rating: driver.rating,
                            experience_years: driver.experience_years,
                            location: driver.location,
                            rate_per_km: driver.rate_per_km,
                            rate_per_hrs: driver.rate_per_hrs,
                            role: "driver",
                        }, SecretKey);
                        if (token) {
                            //Success: if data is found and all operations are done.
                            return res.status(200).send({
                                message: "Login Successful",
                                data: {
                                    id: driver._id,
                                    username: username,
                                    email_id: driver.email_id,
                                    mobile_no: driver.mobile_no,
                                    rating: driver.rating,
                                    experience_years: driver.experience_years,
                                    location: driver.location,
                                    rate_per_km: driver.rate_per_km,
                                    rate_per_hrs: driver.rate_per_hrs,
                                    role: "driver",
                                },
                                token: token,
                            });
                        }
                        else {
                            //Error: if token is not created.
                            return res.status(500).json({ message: "Cannot create token" });
                        }
                    }
                    else {
                        //Error: if wrong password is entered.
                        return res.status(404).json({ message: "Wrong Password Error" });
                    }
                });
            }
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.loginDriverController = loginDriverController;
// Verify Driver by token got from frontend.
const verifyDriverByToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                // Success : Token id
                return res.status(200).send({
                    message: "Login by token Successful",
                    data: tokenVerify,
                });
            }
            else {
                // Error : Invalid Token
                res.status(400).json({ message: "Cannot verify token" });
            }
        }
        else {
            // Error : Token not found
            res.status(400).json({ message: "Token not found" });
        }
    }
    catch (e) {
        // Error : verifying the token
        return res.status(500).json({ message: "Problem in verifying the token" });
    }
});
exports.verifyDriverByToken = verifyDriverByToken;
// Create Driver in Database Controller
const createDriverController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { username, email_id, mobile_no, gender, age, imageurl, password, experience_years, location, vehicle_preferred, rate_per_km, rate_per_hrs, } = req.body;
        if (!username ||
            !email_id ||
            !mobile_no ||
            !gender ||
            !imageurl ||
            !age ||
            !password ||
            !experience_years ||
            !location ||
            !vehicle_preferred ||
            !rate_per_km ||
            !rate_per_hrs) {
            //Error anyone details not available.
            return res.status(400).json({ message: "Data Incomplete Error" });
        }
        if (password.length < 8) {
            //Error: password less than 8 characters.
            return res
                .status(400)
                .json({ message: "password less than 8 characters" });
        }
        // checking if the Driver already exists in database.
        email_id = email_id.trim();
        mobile_no = mobile_no.trim();
        password = password.trim();
        const user = yield user_1.default.findOne({
            $or: [{ email_id }, { mobile_no }],
        });
        const driver = yield driver_1.default.findOne({
            $or: [{ email_id }, { mobile_no }],
        });
        if (user !== null || driver !== null) {
            //Error: user or driver exists with that credentials
            return res.status(400).json({ message: "user or driver already Exists" });
        }
        else {
            // Password Hashing using bcrypt.
            const saltRounds = 10;
            bcrypt_1.default
                .hash(password, saltRounds)
                .then((hashedPassword) => {
                // finally creating and saving the user.
                driver_1.default
                    .create({
                    username: username,
                    email_id: email_id,
                    mobile_no: mobile_no,
                    gender: gender,
                    imageurl: imageurl,
                    age: age,
                    password: hashedPassword,
                    experience_years: experience_years,
                    location: location,
                    vehicle_preferred: vehicle_preferred,
                    rate_per_km: rate_per_km,
                    rate_per_hrs: rate_per_hrs,
                    rating: 5,
                    acceptedRequests: [],
                    pendingRequests: [],
                })
                    .then((driver) => {
                    //Success: Returning the Driver Id of the driver.
                    return res.status(200).json({
                        message: "Driver created successfully",
                        data: driver,
                    });
                });
            })
                .catch((e) => {
                //Error: in making the hasing password.
                return res
                    .status(500)
                    .json({ message: "error while hashing the password" });
            });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.createDriverController = createDriverController;
// Find driver by id in params...
const findOneDriverController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                // finding the driver by id got from the frontend.
                let data = yield driver_1.default
                    .findById({ _id: tokenVerify.id })
                    .select("-password -acceptedRequests -pendingRequests -rating");
                // checking if the driver exists or not.
                if (!data) {
                    return res.status(404).json({ message: "driver not found" });
                }
                else {
                    const driver = data;
                    //Success: Return the all driver details.
                    return res.status(200).json({
                        message: "finding one driver is successful",
                        data: driver,
                    });
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.findOneDriverController = findOneDriverController;
// Get all drivers in the database.
const getAllDriversController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                // find all the drivers
                let drivers = yield driver_1.default.find();
                // Success : send all drivers
                return res.json({
                    message: "Finding all drivers are successful!",
                    data: drivers,
                });
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getAllDriversController = getAllDriversController;
// Update one driver details
const updateDriverController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                const { username, gender, age, imageurl, experience_years, location, rate_per_km, rate_per_hrs, } = req.body;
                if (!username &&
                    !gender &&
                    !age &&
                    !imageurl &&
                    !experience_years &&
                    !location &&
                    !rate_per_km &&
                    !rate_per_hrs) {
                    // Error: Data Incomplete
                    return res.status(400).json({ message: "Data Incomplete" });
                }
                else {
                    // find the driver
                    const driver = yield driver_1.default.findById({ _id: tokenVerify.id });
                    if (!driver) {
                        // Error: Driver not found
                        return res.status(404).json({ message: "Driver not found" });
                    }
                    else {
                        driver.username = username || driver.username;
                        driver.gender = gender || driver.gender;
                        driver.age = age || driver.age;
                        driver.imageurl = imageurl || driver.imageurl;
                        driver.experience_years =
                            experience_years || driver.experience_years;
                        driver.location = location || driver.location;
                        driver.rate_per_km = rate_per_km || driver.rate_per_km;
                        driver.rate_per_hrs = rate_per_hrs || driver.rate_per_hrs;
                        yield driver.save();
                        // Success: Driver updated successfully
                        return res.status(200).json({
                            message: "Driver updated successfully",
                            data: driver,
                        });
                    }
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.updateDriverController = updateDriverController;
// get all filtered drivers
const getDriversbyFilterController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                let { rating, experience_years, location, type, rate_per_hrs, rate_per_km, } = req.body;
                let data = null;
                if (type && location) {
                    // find data based on the type and the location
                    data = yield driver_1.default.find({
                        vehicle_preferred: { $in: [type] },
                    });
                    data = data.filter((driver) => {
                        return driver.location === location;
                    });
                    if (data.length === 0) {
                        return res.status(200).json({ message: "Data not found" });
                    }
                }
                else {
                    // Error: Data Incomplete (Type and Location)
                    return res
                        .status(400)
                        .json({ message: "Data Incomplete (Type and Location)" });
                }
                if (rating && !experience_years) {
                    // find data based on the rating
                    data = yield driver_1.default.find({
                        rating: { $gte: rating },
                    });
                }
                else if (!rating && experience_years) {
                    // find data based on the experience_years
                    data = yield driver_1.default.find({
                        experience_years: { $gte: experience_years },
                    });
                }
                else if (rating && experience_years) {
                    // find data based on the rating and experience_years
                    data = yield driver_1.default.find({
                        rating: { $gte: rating },
                        experience_years: { $gte: experience_years },
                    });
                }
                else {
                    // find the static data if not given details
                    data = yield driver_1.default.find({
                        rating: { $gte: 3.5 },
                        experience_years: { $gte: 2 },
                    });
                }
                // Sort the cabs by hrs_rate and kms_rate
                if (data && rate_per_hrs && !rate_per_km) {
                    data = data.sort((a, b) => {
                        return a.rate_per_hrs - b.rate_per_hrs;
                    });
                }
                else if (data && !rate_per_hrs && rate_per_km) {
                    data = data.sort((a, b) => {
                        return a.rate_per_km - b.rate_per_km;
                    });
                }
                else if (data && rate_per_hrs && rate_per_km) {
                    data = data.sort((a, b) => {
                        return (a.rate_per_km + a.rate_per_hrs - (b.rate_per_km + b.rate_per_hrs));
                    });
                }
                if (!data) {
                    return res.status(404).json({ message: "Data not found" });
                }
                else {
                    // Define the chunk size
                    const chunkSize = 8; // Number of items in each chunk
                    // Calculate the total number of chunks
                    const totalChunks = Math.ceil(data.length / chunkSize);
                    // Get the requested chunk number from the query parameter
                    const requestedChunk = parseInt(req.query.chunk) || 1;
                    // Calculate the start and end indices of the chunk
                    const startIndex = (requestedChunk - 1) * chunkSize;
                    const endIndex = requestedChunk * chunkSize;
                    // Slice the data array to get the desired chunk
                    const chunkData = data.slice(startIndex, endIndex);
                    // Send the chunk data as a response
                    return res.status(200).json({
                        message: "Get All Filtered Cabs is successful",
                        totalChunks: totalChunks,
                        chunkData: chunkData,
                    });
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getDriversbyFilterController = getDriversbyFilterController;
const getAllSearchedDriversController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                const { search, location, type, } = req.body;
                let data = null;
                let acceptedRequests = null;
                const searchLength = search.length;
                if (searchLength < 3) {
                    return res.status(400).json({
                        message: "Search string should be atleast 3 characters long",
                    });
                }
                const dataInUser = yield user_1.default.findById({ _id: tokenVerify.id });
                if (!dataInUser) {
                    return res.status(404).json({ message: "User not found" });
                }
                if (!search && location && type) {
                    // find data based on the type and the location
                    data = yield driver_1.default.find({
                        $and: [
                            { vehicle_preferred: { $in: [type] } },
                            { location: location },
                        ],
                    });
                }
                else if (search && location && type) {
                    const regex = new RegExp(search, "i");
                    // Check if the search string is a number
                    const regexNumber = Number(search);
                    if (isNaN(regexNumber)) {
                        // If the search string is not a number, then search for the string in the following fields
                        data = yield driver_1.default.find({
                            $or: [
                                { username: regex },
                                { email_id: regex },
                                { mobile_no: regex },
                            ],
                            vehicle_preferred: { $in: [type] },
                            location: location,
                        });
                    }
                    else {
                        // If the search string is a number, then search for the number in the following fields
                        data = yield driver_1.default.find({
                            $or: [
                                { username: regex },
                                { email_id: regex },
                                { mobile_no: regex },
                                { rate_per_hrs: regexNumber },
                                { rate_per_km: regexNumber },
                                { experience_years: regexNumber },
                                { rating: regexNumber },
                            ],
                            vehicle_preferred: { $in: [type] },
                            location: location,
                        });
                    }
                }
                else {
                    // Error: Data Incomplete (Type and Location)
                    return res
                        .status(400)
                        .json({ message: "Data Incomplete ( Location and Type)" });
                }
                if (!data || data.length === 0) {
                    return res.status(404).json({ message: "Data not found" });
                }
                else {
                    // Define the chunk size
                    // const chunkSize = 7; // Number of items in each chunk
                    // let totalChunks: number = 0;
                    // let chunkData: Driver[] = [];
                    let filteredDrivers = [];
                    for (let i = 0; i < data.length; i++) {
                        filteredDrivers = data.filter((driver) => {
                            // Perform the filtering based on the regular expression or model_name
                            const regex = new RegExp(search, "i");
                            return (regex.test(driver.username) ||
                                regex.test(driver.email_id) ||
                                regex.test(driver.mobile_no) ||
                                regex.test(driver.rating.toString()) ||
                                regex.test(driver.experience_years.toString()) ||
                                regex.test(driver.rate_per_hrs.toString()) ||
                                regex.test(driver.rate_per_km.toString()));
                        });
                    }
                    dataInUser === null || dataInUser === void 0 ? void 0 : dataInUser.accepted_request.forEach((request) => {
                        acceptedRequests = filteredDrivers === null || filteredDrivers === void 0 ? void 0 : filteredDrivers.filter((driver) => {
                            return driver._id === request.driver_id;
                        });
                    });
                    // Calculate the total number of chunks
                    // totalChunks += Math.ceil(filteredCabs.length / chunkSize);
                    // Get the requested chunk number from the query parameter
                    // const requestedChunk = parseInt(req.query.chunk as string) || 1;
                    // Slice the filtered data array to get the desired chunk
                    // const startIndex = (requestedChunk - 1) * chunkSize;
                    // const endIndex = requestedChunk * chunkSize;
                    // const chunkDataSlice = filteredCabs.slice(startIndex, endIndex);
                    // Merge the filtered chunk data with the overall chunk data
                    //   chunkData = chunkData.concat(chunkDataSlice);
                    // }
                    // Send the chunk data as a response
                    // return res.status(200).json({
                    //   message: "Get All Searched Drivers is successful",
                    //   totalChunks: totalChunks,
                    //   chunkData: chunkData,
                    // });
                    // send the whole data as a response
                    return res.status(200).json({
                        message: "Get All Searched Drivers is successful",
                        data: data,
                        previouslyAccepted: acceptedRequests,
                    });
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getAllSearchedDriversController = getAllSearchedDriversController;
// Get all drivers with respect to type in the database.
const getDriversbyTypeController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                const { type } = req.body;
                if (!type) {
                    // Error: type not found.
                    return res.status(404).json({ message: "Imcompelete Data" });
                }
                else {
                    // find all the drivers
                    const drivers = yield driver_1.default.find({
                        vehicle_preferred: { $in: [type] },
                    });
                    // Success : send all drivers
                    return res.json({
                        message: "Finding all drivers are successful!",
                        data: drivers,
                    });
                }
            }
            else {
                //Error: Token not valid.
                return res.status(404).json({ message: "Token not valid" });
            }
        }
        else {
            //Error: if Header not found.
            return res.status(404).json({ message: "Token not found" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getDriversbyTypeController = getDriversbyTypeController;
// Manually change the availability of the driver.
const changeAvailabilityController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { availability } = req.body;
        if (availability === undefined) {
            //Error: availability not found.
            return res.status(404).json({ message: "Availability not found" });
        }
        else {
            // access the header
            const bearerHeader = req.headers.authorization;
            if (bearerHeader !== undefined) {
                const bearer = bearerHeader;
                const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
                if (tokenVerify) {
                    // find the driver by id got from the frontend.
                    let data = yield driver_1.default.findById({ _id: tokenVerify.id });
                    if (data === null) {
                        return res.status(404).json({ message: "Driver not found" });
                    }
                    else {
                        data.availability = availability;
                        data = yield data.save();
                        //Success: Return the all driver details.
                        return res.status(200).json({
                            message: "Availability changed successfully",
                            data: data,
                        });
                    }
                }
                else {
                    //Error: Token not valid.
                    return res.status(404).json({ message: "Token not valid" });
                }
            }
            else {
                //Error: if Header not found.
                return res.status(404).json({ message: "Token not found" });
            }
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.changeAvailabilityController = changeAvailabilityController;
// delete Driver in the database by id.
const deleteDriverController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify.id === "64ad2bbdd73ea6b35065340e" &&
                tokenVerify.username === "Admin") {
                const { _id } = req.body;
                if (!_id) {
                    return res.status(400).json({ message: "Driver Id not found" });
                }
                // deleting the Driver by filter.
                let data = yield driver_1.default.findByIdAndDelete({
                    _id: _id,
                });
                // handling if Driver not deleted.
                if (data !== null) {
                    //Success: Driver is deleted successfully.
                    return res.status(200).json({
                        message: "Driver Deleted Successfully",
                        data: data,
                    });
                }
                else {
                    //Error: Token not valid.
                    return res.status(404).json({ message: "Data not found" });
                }
            }
            else {
                //Error: if Header not found.
                return res.status(404).json({ message: "Token not verified" });
            }
        }
        else {
            //Error: Driver provided not found in database.
            return res.status(400).json({ message: "Cannot find Driver" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.deleteDriverController = deleteDriverController;
const updateDriverStatusController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        if (status === undefined) {
            //Error: status not found.
            return res.status(404).json({ message: "Status not found" });
        }
        else {
            // access the header
            const bearerHeader = req.headers.authorization;
            if (bearerHeader !== undefined) {
                const bearer = bearerHeader;
                const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
                if (tokenVerify) {
                    // find the driver by id got from the frontend.
                    let data = yield driver_1.default.findById({ _id: tokenVerify.id });
                    if (data === null) {
                        return res.status(404).json({ message: "Driver not found" });
                    }
                    else {
                        data.availability = status;
                        data = yield data.save();
                        //Success: Return the all driver details.
                        return res.status(200).json({
                            message: "Status changed successfully",
                            data: data,
                        });
                    }
                }
                else {
                    //Error: Token not valid.
                    return res.status(404).json({ message: "Token not valid" });
                }
            }
            else {
                //Error: if Header not found.
                return res.status(404).json({ message: "Token not found" });
            }
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.updateDriverStatusController = updateDriverStatusController;
const getPendingRequestsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                const driver = yield driver_1.default.findById({ _id: tokenVerify.id });
                if (driver) {
                    // Success:
                    return res.status(200).json({
                        message: "Get Drivers Pending is successful",
                        data: driver.pendingRequests,
                    });
                }
                else {
                    //Error: if Header not found.
                    return res.status(404).json({ message: "Driver not found" });
                }
            }
            else {
                //Error: if Header not found.
                return res.status(404).json({ message: "Token not verified" });
            }
        }
        else {
            //Error: Driver provided not found in database.
            return res.status(400).json({ message: "Cannot find Driver" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getPendingRequestsController = getPendingRequestsController;
const getAcceptedRequestsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // access the header
        const bearerHeader = req.headers.authorization;
        if (bearerHeader !== undefined) {
            const bearer = bearerHeader;
            const tokenVerify = jsonwebtoken_1.default.verify(bearer.split(" ")[1], SecretKey);
            if (tokenVerify) {
                const driver = yield driver_1.default.findById({ _id: tokenVerify.id });
                if (driver) {
                    // Success:
                    return res.status(200).json({
                        message: "Get Drivers Accepted is successful",
                        data: driver.acceptedRequests,
                    });
                }
                else {
                    //Error: if Header not found.
                    return res.status(404).json({ message: "Driver not found" });
                }
            }
            else {
                //Error: if Header not found.
                return res.status(404).json({ message: "Token not verified" });
            }
        }
        else {
            //Error: Driver provided not found in database.
            return res.status(400).json({ message: "Cannot find Driver" });
        }
    }
    catch (e) {
        //Error: if something breaks in code.
        return res.status(500).json({ message: "Server Error" });
    }
});
exports.getAcceptedRequestsController = getAcceptedRequestsController;
