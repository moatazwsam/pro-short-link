require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const shortid = require("shortid");
const path = require("path");

const Url = require("./models/Url");

const app = express();

app.use(express.json());
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


// Create Short Link
app.post("/shorten", async (req, res) => {

    try {

        const { originalUrl } = req.body;

        if (!originalUrl) {
            return res.status(400).json({
                message: "Please enter URL"
            });
        }

        const shortCode = shortid.generate();

        const newLink = new Url({
            originalUrl,
            shortCode,
            clicks: 0
        });

        await newLink.save();

        res.json({
            shortUrl: `https://${req.get("host")}/${shortCode}`
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Server Error"
        });

    }

});


// Get All Links
app.get("/links", async (req, res) => {

    try {

        const links = await Url.find().sort({
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
app.delete("/delete/:id", async (req, res) => {

    try {

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


// Redirect Link
app.get("/:code", async (req, res) => {

    try {

        const link = await Url.findOne({
            shortCode: req.params.code
        });

        if (!link) {
            return res.send("Link not found");
        }

        link.clicks += 1;

        await link.save();

        res.redirect(link.originalUrl);

    } catch (error) {

        console.log(error);

        res.send("Server Error");

    }

});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});