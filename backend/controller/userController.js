const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const generateToken = require("../config/generateToken")



const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, pic } = req.body;
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("pls entrer all the field");

    }
    const userExist = await User.findOne({ email });
    if (userExist) {

        res.status(400);
        throw new Error("User already Exist");
    }
    const user = await User.create({ name, email, password, pic, });
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });

    } else {
        res.status(400);
        throw new Error("User not found!")
    }

})
//./api/chat
const allUsers = asyncHandler(async (req, res) => {
    const searchQuery = req.query.search ? {
        $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
        ]
    } : {};

    const users = await User.find({ ...searchQuery, _id: { $ne: req.user._id } });
    res.send(users);
});

const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            pic: user.pic,
            token: generateToken(user._id),
        });
    } else {
        res.status(404);
        throw new Error("Invalid username or password")
    }
});

module.exports = { registerUser, authUser, allUsers }