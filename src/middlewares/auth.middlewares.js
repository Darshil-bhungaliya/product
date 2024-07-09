import jwt from "jsonwebtoken";
import { con } from "../db/connection.db..js";

export const verify = async (req, res, next) => {
    try {
        const token =
            req.cookies?.accessToken ||
            req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Token is not Valid" });
        }

        const decode = jwt.verify(token, "darshil");

        const user = con.query(`SELECT * FROM authentication where email="${decode.email}" `, function (err, result) {
            if (err) throw err;
            if (result) {
                req.user = result
                next();
            } else {
                return res.status(400).json({ message: "User are not authorized" });
            }
        })

    } catch (error) {
        return res.status(400).json({ error: error });
    }
};