import jwt from "jsonwebtoken";

const tokenChecker = function (req, res, next) {
	var token =
		req.query.token || req.headers["x-access-token"] || req.cookies?.token;

	if (!token) {
		if (req.headers.accept && req.headers.accept.includes("text/html")) {
			return res.redirect("/login.html");
		}
		return res.status(401).send({
			success: false,
			message: "No token provided.",
		});
	}

	jwt.verify(token, process.env.SUPER_SECRET, (err, decoded) => {
		if (err) {
			if (req.headers.accept && req.headers.accept.includes("text/html")) {
				return res.redirect("/login.html");
			}
			return res.status(403).send({
				success: false,
				message: "Failed to authenticate token.",
			});
		} else {
			req.loggedUser = decoded;
			next();
		}
	});
};

export default tokenChecker;
