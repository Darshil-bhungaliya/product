import { con } from "../db/connection.db..js";
import { insertquery, selectquery, updatequery } from "../helper/func.helper.js";

export const user_order = (req, res) => {
    try {
        const { totalproduct, totaldiscount } = req.body;

        const { email } = req.user[0];
        let totalproductid = [];
        let totalquantity = 0;
        let totalprice = 0;
        let totalrevenue = 0;
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
                            totalquantity += +quantity
                            if (product_discount_type == 0) {
                                perqtyprice = perqtyprice - perproduct_discount;
                                if (totaldiscount?.type == 0) {
                                    quantity * perqtyprice > totaldiscount.discount / totalproduct.length ? totalrevenue += quantity * perqtyprice - totaldiscount.discount / totalproduct.length : totalrevenue += 0;
                                }
                                if (!totaldiscount?.type || totaldiscount?.type == 1) {
                                    totalrevenue += quantity * perqtyprice;
                                }

                            } else if (product_discount_type == 1) {
                                perqtyprice = perqtyprice - (perproduct_discount / 100) * perqtyprice;
                                if (totaldiscount?.type == 0) {
                                    quantity * perqtyprice > totaldiscount.discount / totalproduct.length ? totalrevenue += quantity * perqtyprice - totaldiscount.discount / totalproduct.length : totalrevenue += 0;
                                }
                                if (!totaldiscount?.type || totaldiscount?.type == 1) {
                                    totalrevenue += quantity * perqtyprice;
                                }
                            }
                            if (totaldiscount?.type == 0) {
                                quantity * perqtyprice > totaldiscount.discount / totalproduct.length ? totalprice += quantity * perqtyprice - totaldiscount.discount / totalproduct.length : totalprice += 0;
                            } else if (totaldiscount?.type == 1 || !totaldiscount?.type) {

                                totalprice += quantity * perqtyprice;
                            }
                            console.log(totalprice, "totalprice")
                            console.log(totalrevenue, "totalrevenue")
                            totalproductid.push(product_id);
                            queryCount++;
                            if (queryCount === totalproduct.length) {
                                if (totaldiscount?.type == 1) {
                                    totalprice = totalprice - (totaldiscount.discount / 100) * totalprice
                                    product_discount_type ? totalrevenue = totalrevenue - (totaldiscount.discount / 100) * totalrevenue : null
                                }
                                const insertobj = {
                                    tablename: `user_order`,
                                    tablefield: `(product_id,product_quantity,user_id,total_price,total_revenue)`,
                                    tablevalue: `('[${totalproductid}]','${totalquantity}','${user_id}','${totalprice}','${totalrevenue}')`
                                };
                                const insertsql = insertquery(insertobj);
                                con.query(insertsql, function (err, result) {
                                    if (err) throw err;
                                    res.status(200).json({
                                        status: 1,
                                        message: `Your order Successfully Placed`
                                    });
                                });

                            }
                        }
                    });
                } else {
                    queryCount++;
                    if (queryCount === totalproduct.length) {
                        res.status(200).json({
                            status: 0,
                            message: "Product is out of stock"
                        });
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
                    field: "count(id) as totalorder,SUM(total_revenue) as totalrevenue,SUM(total_price) as totalcost",
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


