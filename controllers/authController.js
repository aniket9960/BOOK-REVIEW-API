const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, ACCESS_EXPIRY, REFRESH_EXPIRY } = require("../utils/constants");

const createTokens = (userId, email) => {
    const accessToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: ACCESS_EXPIRY });
    const refreshToken = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: REFRESH_EXPIRY });
    return { accessToken, refreshToken };
};

exports.signUp = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        
        if (existingUser) {
            return res.status(400).json({ message: "Email already used" });
        }

        const user = new User({name, email, password});
        await user.save();

        const { accessToken, refreshToken } = createTokens(user._id, user.email);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(201).json({
            accessToken,
            refreshToken,
            user: {
                id: user._id, name: user.name, email: user.email
            }
        })

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid Credentials" });
        }

        const { accessToken, refreshToken } = createTokens(user._id, user.email);

        user.refreshToken = refreshToken;
        await user.save();

        res.status(200).json({
            accessToken,
            refreshToken,
            user: { id: user._id, name: user.name, email: user.email },
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}

exports.refresh = async (req, res)=> {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Missing refresh token" });

    try {
        const payload = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(payload.userId);
        
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const { accessToken, refreshToken: newRefreshToken } = createTokens(user._id, user.email);

        user.refreshToken = newRefreshToken;
        await user.save();

        res.json({
            accessToken, refreshToken: newRefreshToken
        });

    } catch (error) {
        console.error(error);
        res.status(403).json({ message: error.message });
    }
}


exports.logout = async(req,res) =>{
    const {refreshToken} = req.body;

    if(!refreshToken) {
        return res.status(400).json({message: "Missing refresh token"});
    }

    try {
        
        const payload = jwt.verify(refreshToken, JWT_SECRET);
        const user = await User.findById(payload.userId);
        if(user) {
            user.refreshToken = null;
            await user.save();
        }

        res.json({ message: "Logged out successfully" });

    } catch (error) {
        console.error("error logging out: ", error)
    }
}