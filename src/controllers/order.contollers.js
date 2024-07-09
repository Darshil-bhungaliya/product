import { con } from "../db/connection.db..js";
import { insertquery, selectquery, updatequery } from "../helper/func.helper.js";

export const user_order = (req, res, next) => {
    try {
        let { totalproduct, totaldiscount } = req.body;
        // console.log(totalproduct,totaldiscount)
        let total_discount = JSON.stringify(totaldiscount)
        console.log(total_discount)
        const { email } = req.user[0];
        let once = false;
        let updateqty = null

        for (let i = 0; i < totalproduct.length; i++) {
            let product_id = totalproduct[i].product_id;
            let quantity = totalproduct[i].product_quantity;
            let product_discount = JSON.stringify(totalproduct[i].product_discount)

            let obj = {
                field: "*",
                tablename: "product_listing",
                wherecondition: `id = '${product_id}'`
            }
            let sql = selectquery(obj)
            con.query(sql, function (err, result) {
                if (err) throw err;
                console.log(result, "sadkfgskjdfgkjgdfg")
                if (result[0].quantity > 0) {
                    let perqtyprice = result[0].price

                    updateqty = result[0].quantity - quantity

                    if (updateqty < 0) {
                        quantity = Math.min(result[0].quantity, quantity)
                        updateqty = 0;
                    }
                    let updateobj = {
                        tablename: `product_listing`,
                        set: `quantity='${updateqty}'`,
                        wherecondition: `id = '${product_id}'`
                    }
                    let updatesql = updatequery(updateobj)
                    con.query(updatesql, function (err, result) {
                        if (err) throw err;
                    })
                    let getid = {
                        field: "id",
                        tablename: "authentication",
                        wherecondition: `email = '${email}'`
                    }

                    let sqlid = selectquery(getid)
                    con.query(sqlid, function (err, result) {
                        if (err) throw err;
                        let user_id = result[0].id
                        if (user_id) {
                            let insertobj = {
                                tablename: `user_order`,
                                tablefield: `(product_id,product_quantity,product_discount,total_discount,user_id,order_price)`,
                                tablevalue: `('${product_id}','${quantity}','${product_discount}','${total_discount}','${user_id}','${quantity * perqtyprice}')`
                            }
                            let insertsql = insertquery(insertobj)
                            con.query(insertsql, function (err, result) {
                                if (err) throw err;
                                console.log("dfsdfhjsdgfjgasdjfghjsdgfhjgsdhjfgahjsdgfhjadsghjgfgggggggggggggggggggggggggggg")
                                if (!once) {
                                    once = true;
                                    if (result) {
                                        res.status(200).json({ status: 1, message: `Your order Successfully Placed ` })
                                        return;
                                    } else {
                                        return res.status(400).json({ status: 0, message: `something went wrong` })
                                    }
                                }
                            })
                        }
                    })
                } else {
                    console.log("sdkhjgjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj")
                    if (!once) {
                        once = true;
                        return res.status(400).json({ status: 0, message: "Product is out of stock" })
                    }
                }
            })
        }
        //     let obj = {
        //         field: "*",
        //         tablename: "product_listing",
        //         wherecondition: `id = '${product_id}'`
        //     }
        //   console.log()
        //     let sql = selectquery(obj)
        //     con.query(sql, function (err, result) {
        //         if (err) throw err;

        //         if (result[0].quantity > 0) {
        //             let perqtyprice = result[0].price
        //             updateqty = result[0].quantity - quantity
        //             if (updateqty < 0) {
        //                 quantity = Math.min(result[0].quantity, quantity)
        //                 updateqty = 0;
        //             }
        //             let updateobj = {
        //                 tablename: `product_listing`,
        //                 set: `quantity='${updateqty}'`,
        //                 wherecondition: `id = '${product_id}'`
        //             }
        //             let updatesql = updatequery(updateobj)
        //             con.query(updatesql, function (err, result) {
        //                 if (err) throw err;
        //             })
        //             let getid = {
        //                 field: "id",
        //                 tablename: "authentication",
        //                 wherecondition: `email = '${email}'`
        //             }

        //             let sqlid = selectquery(getid)
        //             con.query(sqlid, function (err, result) {
        //                 if (err) throw err;
        //                 let user_id = result[0].id
        //                 if (user_id) {
        //                     let insertobj = {
        //                         tablename: `user_order`,
        //                         tablefield: `(product_id,product_quantity,product_discount,totaldiscount,user_id,order_price)`,
        //                         tablevalue: `('${product_id}','${quantity}','{"hello:"dfsd"}','{"hello:"dfsd"}','{${user_id}}','${quantity * perqtyprice}')`
        //                     }
        //                     let insertsql = insertquery(insertobj)
        //                     con.query(insertsql, function (err, result) {
        //                        if(result){
        //                         return res.status(200).json({ status: 1, message: `Your order Successfully Placed and your order quantity placed is ${quantity}` })
        //                        }else{
        //                         return res.status(400).json({ status: 0, message: `something went wrong`})
        //                        }
        //                     })
        //                 }
        //             })
        //         } else {
        //             return res.status(400).json({ status: 0, message: "Product is out of stock" })
        //         }
        //     })
    } catch (error) {
        return res.status(400).json({ status: 0, message: error })
    }
}

export const totalcost = (req, res) => {
    try {
        const { search_email } = req.body;
        if (!search_email) {
            return res.status(400).json({ status: 0, message: "user NOT data found" })
        }
        let obj = {
            field: "id",
            tablename: "authentication",
            wherecondition: `email = '${search_email}'`
        }
        let sql = selectquery(obj)
        // `SELECT  total_quantity, total_cost FROM user_data WHERE user_id = '${search_email}'`
        con.query(sql, function (err, result) {
            if (err) throw err;
            if (result) {
                console.log(result[0].id)
                let obj = {
                    tablename: "user_order",
                    field: "SUM(product_quantity) as totalquantity,SUM(order_price) as totalcost",
                    wherecondition: `user_id = '${result[0].id}'`
                }
                let sql = selectquery(obj)
                con.query(sql, function (err, result) {
                    if (err) throw err;
                    if (result) {
                        return res.status(200).json({ status: 1, message: result[0] })
                    } else {
                        return res.status(400).json({ status: 0, message: "something went wrong " })
                    }
                })
            }
        })
    } catch (error) {
        return res.status(400).json({ status: 0, message: error })
    }
}


