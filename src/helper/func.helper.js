export const selectquery = (obj) => {
    console.log(obj)
    let query = `SELECT ${obj.field} FROM ${obj.tablename} `;

    if (obj.join) {
        query += ` ${obj.join} `
    }
    if (obj.wherecondition) {
        query += ` WHERE  ${obj.wherecondition} `;
    }

    if (obj.group) {
        query += ` GROUP BY ${obj.group} `
    }
    console.log(obj)
    // console.log(query)
    return query;
}

export const updatequery = (obj) => {
    // let query = `UPDATE product_listing SET quantity=${updateqty} WHERE id = ${product_id}`
    console.log(obj)
    let query = `UPDATE ${obj.tablename} SET ${obj.set}`;
    if (obj.wherecondition) {
        query += ` WHERE  ${obj.wherecondition}`;
    }
    // console.log(query)
    return query;
}

export const insertquery = (obj) => {
    console.log(obj)
    // let query = `INSERT INTO user_order(product_id,product_quantity,user) VALUES ('${product_id}','${quantity}','${email}')`;
    let query = ` INSERT INTO  ${obj.tablename} ${obj.tablefield} `;
    if (obj.tablevalue) {
        query += `VALUES  ${obj.tablevalue}`
    }

    if (obj.subquery) {
        query += selectquery(obj.subquery)
    }

    // console.log(query)
    return query;
}   