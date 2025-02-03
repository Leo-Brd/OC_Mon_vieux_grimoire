const jwt = require('jsonwebtoken');

// We verify the token and extract the user ID
module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'e558edc155ea772af3dbf6653269b1a08b2d9057b53d4df99a5180ead485312bf1139f405a080a6acc355fa3b8aa46678a9994e71937f2bfc319627a391dc6d1');
        const userId = decodedToken.userId;
        req.auth = { userId: userId };
        next();
    } catch (error) {
        res.status(401).json({ error });
    }
};