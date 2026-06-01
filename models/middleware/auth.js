const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
try {

    const token = req.headers.authorization;

    if (!token) {

        return res.status(401).json({
            message: "Access Denied"
        });

    }

    const verified = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    req.user = verified;

    next();

} catch (error) {

    res.status(401).json({
        message: "Invalid Token"
    });

}
};