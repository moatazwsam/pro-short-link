require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const path = require("path");

const Url = require("./models/Url");
const User = require("./models/User");
const bcrypt = require("bcryptjs");
const app = express();
const jwt = require("jsonwebtoken");
app.use(express.json());
const auth = require("./models/middleware/auth");
app.use(express.static("public"));


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
    tls: true,
    tlsAllowInvalidCertificates: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000
})
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));


// Home Page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.post("/register", async (req, res) => {
    try {
    
        const { username, email, password } = req.body;
    
        const existingUser = await User.findOne({
            email
        });
    
        if (existingUser) {
    
            return res.status(400).json({
                message: "Email already exists"
            });
    
        }
    
        const hashedPassword =
        await bcrypt.hash(password, 10);
    
        const newUser = new User({
    
            username,
            email,
            password: hashedPassword
    
        });
    
        await newUser.save();
    
        res.json({
            message: "Registration successful"
        });
    
    } catch (error) {
    
        console.log(error);
    
        res.status(500).json({
            message: "Server Error"
        });
    
    }
    });
app.post("/login", async (req, res) => {
try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {

        return res.status(400).json({
            message: "Invalid Email"
        });

    }

    const isMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!isMatch) {

        return res.status(400).json({
            message: "Invalid Password"
        });

    }

    const token = jwt.sign(

        {
            userId: user._id
        },

        process.env.JWT_SECRET,

        {
            expiresIn: "7d"
        }

    );

    res.json({

        message: "Login Successful",
        token,
        username: user.username
    
    });

} catch (error) {

    console.log(error);

    res.status(500).json({
        message: "Server Error"
    });

}
});
// Create Short Link
app.post("/shorten", auth, async (req, res) => {

    try {

        const { originalUrl } = req.body;

        if (!originalUrl) {
            return res.status(400).json({
                message: "Please enter URL"
            });
        }
        if (!originalUrl.startsWith("http://") &&
    !originalUrl.startsWith("https://")) {

    return res.status(400).json({
        message: "Invalid URL"
    });

}

        const shortCode = shortid.generate();

        const newLink = new Url({
            originalUrl,
            shortCode,
            userId: req.user.userId,
            clicks: 0
        });

        await newLink.save();

        res.json({
            shortUrl: `https://${req.get("host")}/s/${shortCode}`
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});


// Get All Links
app.get("/links", auth, async (req, res) => {

    try {

        const links = await Url.find({
            userId: req.user.userId
        }).sort({
            createdAt: -1
        });

        res.json(links);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Error fetching links"
        });

    }

});


// Delete Link
app.delete("/delete/:id", auth, async (req, res) => {

    try {

        const link = await Url.findOne({

            _id: req.params.id,
            userId: req.user.userId

        });

        if (!link) {

            return res.status(404).json({
                message: "Link not found"
            });

        }

        await Url.findByIdAndDelete(req.params.id);

        res.json({
            message: "Deleted Successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Delete Failed"
        });

    }

});
app.get("/ad/:code", async (req, res) => {

    try {

        const link = await Url.findOne({
            shortCode: req.params.code
        });

        if (!link) {
            return res.send("Link not found");
        }

        res.sendFile(
            path.join(__dirname, "public", "ads.html")
        );

    } catch (error) {

        console.log(error);

        res.send("Server Error");

    }

});
app.get("/go/:code", async (req, res) => {

    try {

        const link = await Url.findOne({
            shortCode: req.params.code
        });

        if (!link) {

            return res.send("Link not found");

        }

        // زيادة المشاهدات
        link.clicks += 1;

        // حساب الربح حسب CPM
        const earningPerView = link.cpm / 1000;

        link.earnings += earningPerView;

        await link.save();

        res.redirect(link.originalUrl);

    } catch (error) {

        console.log(error);

        res.send("Server Error");

    }

});
// Redirect Link
app.get("/s/:code", async (req, res) => {

    res.redirect(`/ad/${req.params.code}`);

});
app.get("/stats", auth, async (req, res) => {

    try {

        const links = await Url.find({
            userId: req.user.userId
        });

        const totalLinks = links.length;

        const totalViews = links.reduce(
            (sum, link) => sum + link.clicks,
            0
        );

        const totalEarnings = links.reduce(
            (sum, link) => sum + link.earnings,
            0
        );

        const averageCPM =
            totalLinks > 0
                ? links.reduce(
                      (sum, link) => sum + link.cpm,
                      0
                  ) / totalLinks
                : 0;

        res.json({
            totalLinks,
            totalViews,
            totalEarnings,
            averageCPM
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});
const PORT = process.env.PORT || 3000;
app.get("/dashboard",(req, res) => {

    res.sendFile(
        path.join(__dirname, "public", "dashboard.html")
    );

});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});