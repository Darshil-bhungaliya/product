
import { con } from "../db/connection.db..js";
import { insertquery, selectquery } from "../helper/func.helper.js";
import { validateUser } from "../model/auth.model.js";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
    try {
        let response = validateUser(req.body)

        if (response.error) {
            return res.status(400).json(response.error.details)
        }
        else {
            const { firstname, lastname, email, password } = req.body;

            if (
                [firstname, lastname, email, password].some((x) => x?.trim() === "")
            ) {
                return res.status(400).json({ status: 0, message: " All filed are required" });
            }
            let obj = {
                field: "*",
                tablename: "authentication",
                wherecondition: `email="${email}"`
            }

            let sql = selectquery(obj)
            const emailchek = await con.query(sql, async (err, result) => {
                if (err) {
                    throw err
                }
                if (result.length != 0) {
                    return res
                        .status(400)
                        .json({ status: 0, message: "you already register your self" });
                } else {
                    let hashpassword = await bcrypt.hash(password, 10);
                    let accessToken = jwt.sign({ email }, "darshil", { expiresIn: "1d" });
                    const options = {
                        httpOnly: true,
                        secure: true,
                    };
                    let insertobj = {
                        tablename: `authentication`,
                        tablefield: `(firstname, lastname, email, password)`,
                        tablevalue: `("${firstname}","${lastname}","${email}","${hashpassword}")`
                    }
                    let insertsql = insertquery(insertobj)
                    const storeindb = await con.query(insertsql)
                    return res
                        .status(200)
                        .cookie("accessToken", accessToken, options)
                        .json({ status: 1, message: " register successfully" });
                }
            })
        }
    } catch (error) {
        return res.status(400).json({ status: 0, message: error })
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (
            [email, password].some((x) => x?.trim() === "")
        ) {
            return res.status(400).json({ status: 0, message: " All filed are required" });
        }
        let obj = {
            field: "*",
            tablename: "authentication",
            wherecondition: `email="${email}"`
        }

        let sql = selectquery(obj)
        const emailchek = await con.query(sql, async (err, result) => {
            if (err) {
                throw err
            }
            if (result.length != 0) {
                let passwordcheck = await bcrypt.compare(password, result[0].password)
                if (passwordcheck) {
                    let accessToken = jwt.sign({ email }, "darshil", { expiresIn: "1d" });
                    const options = {
                        httpOnly: true,
                        secure: true,
                    };
                    return res
                        .status(200)
                        .cookie("accessToken", accessToken, options)
                        .json({ status: 1, message: " login successfully" });
                } else {
                    return res
                        .status(400)
                        .json({ status: 0, message: "Password is invalid" });
                }
            } else {
                return res
                    .status(400)
                    .json({ status: 0, message: "First register your self" });
            }
        })
    } catch (error) {
        return res.status(400).json({ status: 0, message: error })
    }
}



