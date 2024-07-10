import { con } from "../db/connection.db..js";
import { insertquery, selectquery, updatequery } from "../helper/func.helper.js";

export const user_order = (req, res) => {
    try {
        const { totalproduct, totaldiscount } = req.body;
        const total_discount = JSON.stringify(totaldiscount);
        const { email } = req.user[0];

        const results = [];
        let queryCount = 0;

        for (let i = 0; i < totalproduct.length; i++) {
            const product_id = totalproduct[i].product_id;
            let quantity = totalproduct[i].product_quantity;
            const product_discount = JSON.stringify(totalproduct[i].product_discount);
            const product_discount_type = JSON.parse(product_discount).type
            const perproduct_discount = JSON.parse(product_discount).discount
           
            const obj = {
                field: "*",
                tablename: "product_listing",
                wherecondition: `id = '${product_id}'`
            };
            const sql = selectquery(obj);
            con.query(sql, function (err, result) {
                if (err) throw err;
                if (result[0].quantity > 0) {
                    let perqtyprice = result[0].price;
                    let updateqty = result[0].quantity - quantity;
                    if (updateqty < 0) {
                        quantity = Math.min(result[0].quantity, quantity);
                        updateqty = 0;
                    }
                    const updateobj = {
                        tablename: `product_listing`,
                        set: `quantity='${updateqty}'`,
                        wherecondition: `id = '${product_id}'`
                    };
                    const updatesql = updatequery(updateobj);
                    con.query(updatesql, function (err, result) {
                        if (err) throw err;
                    });
                    const getid = {
                        field: "id",
                        tablename: "authentication",
                        wherecondition: `email = '${email}'`
                    };
                    const sqlid = selectquery(getid);
                    con.query(sqlid, function (err, result) {
                        if (err) throw err;
                        const user_id = result[0].id;
                        if (user_id) {
                            if(product_discount_type == 0){
                                perqtyprice = perqtyprice - perproduct_discount;
                            }else if(product_discount_type == 1){
                                 perqtyprice = perqtyprice - (perproduct_discount/100) * perqtyprice
                            }
                            const insertobj = {
                                tablename: `user_order`,
                                tablefield: `(product_id,product_quantity,product_discount,total_discount,user_id,order_price)`,
                                tablevalue: `('${product_id}','${quantity}','${product_discount}','${total_discount}','${user_id}','${quantity * perqtyprice}')`
                            };
                            const insertsql = insertquery(insertobj);
                            con.query(insertsql, function (err, result) {
                                if (result) {
                                    results.push({
                                        status: 1,
                                        message: `Your order Successfully Placed and your order quantity placed is ${quantity}`
                                    });
                                } else {
                                    results.push({
                                        status: 0,
                                        message: `something went wrong`
                                    });
                                }
                                queryCount++;
                                if (queryCount === totalproduct.length) {
                                    res.status(200).json(results);
                                }
                            });
                        }
                    });
                } else {
                    results.push({
                        status: 0,
                        message: "Product is out of stock"
                    });
                    queryCount++;
                    if (queryCount === totalproduct.length) {
                        res.status(200).json(results);
                    }
                }
            });
        }
    } catch (error) {
        return res.status(400).json({ status: 0, message: error });
    }
};

export const totalcost = (req, res) => {
    try {
        const { search_email } = req.body;
        if (!search_email) {
            return res.status(400).json({ status: 0, message: "user NOT data found" });
        }
        const obj = {
            field: "id",
            tablename: "authentication",
            wherecondition: `email = '${search_email}'`
        };
        const sql = selectquery(obj);
        con.query(sql, function (err, result) {
            if (err) throw err;
            if (result) {
                console.log(result[0].id);
                const obj = {
                    tablename: "user_order",
                    field: "SUM(product_quantity) as totalquantity,SUM(order_price) as totalcost",
                    wherecondition: `user_id = '${result[0].id}'`
                };
                const sql = selectquery(obj);
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    if (result) {
                        return res.status(200).json({ status: 1, message: result[0] });
                    } else {
                        return res.status(400).json({ status: 0, message: "something went wrong " });
                    }
                });
            }
        });
    } catch (error) {
        return res.status(400).json({ status: 0, message: error });
    }
};


