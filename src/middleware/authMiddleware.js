const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
    const token = req.headers['authorization']
    if (!token) { return res.status(401).json({ message: "No token provided" }) }

    jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
        if (error) { return res.status(401).json({ message: "Invalid token" }) }

        req.userID = decoded.id
        next()
    })
}

module.exports = authMiddleware