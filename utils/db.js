require('dotenv').config;
const { rejects } = require('assert');
const fs = require('fs');
const { helpers } = require('handlebars');
const { resolve } = require('path');

const pgp=require('pg-promise')({
   capSQL:true
});

const cn={
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DBNAME,
    user: process.env.DB_USER,
    password: process.env.DB_PW
};


const db=pgp(cn);

module.exports={
    getAll: async (tbName)=>{
        let dbcn=null;
            try{
                dbcn=await db.connect();
                const data=await dbcn.any(`SELECT * FROM $1:name`,tbName);
                return data;
            } catch (error){
                throw error;
            } finally{
                dbcn.done();
            }
    },
    insert: async(tbName, entity)=>{
        const query=pgp.helpers.insert(entity,null, tbName);
        const data=await db.one(query+'Returning id');
        return data;
    }, 
    import: async(tbName, dataList)=>{
        let dbcn=null;
        try{
            dbcn=await db.connect();
            const result = await dbcn.one('SELECT COUNT(*) FROM $1:name', tbName);
            const rowCount = result.count;
            if (rowCount > 0) {
                console.log(`Table has data.`);
                
            } else {
                console.log(`Table is empty.`);
                for (const data of dataList){
                    //console.log(data);
                    const query=pgp.helpers.insert(data,null,tbName);
                    const rs=await db.one(query+'Returning id');
                    console.log(rs);
                }
            }
        } catch (error) {
            console.error('Error checking table data:', error);
        } finally {
            // Close the database connection
            dbcn.done();
        }
        }
};
