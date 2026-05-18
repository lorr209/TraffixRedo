import jwt from "jsonwebtoken";

const tokenChecker = function (req, res, next) {
	// check header or url parameters or post parameters for token
	var token =
		req.query.token || req.headers["x-access-token"] || req.cookies?.token;

	// if there is no token
	if (!token) {
		if (req.headers.accept && req.headers.accept.includes("text/html")) {
			return res.redirect("/login.html");
		}
		return res.status(401).send({
			success: false,
			message: "No token provided.",
		});
	}

	// decode token, verifies secret and checks exp
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
			// if everything is good, save to request for use in other routes
			req.loggedUser = decoded;
			next();
		}
	});
};

export default tokenChecker;
