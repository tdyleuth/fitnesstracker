const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/fitness-dev');


async function getAllUsers() {

  try {

    const { rows } = await client.query(
        `SELECT id, username
        FROM users;`
    );

    return rows;

    }
    catch (error){
        console.error(error);
    }
}

async function createUser({
  username,
  password,
  name,
  location
}) {
    try{
        const { rows: [ users ] } = await client.query(
            `INSERT INTO users(username, password, name, location)
             VALUES($1,$2,$3,$4)
             ON CONFLICT (username) DO NOTHING
             RETURNING *;
             `, [username, password, name, location]);

             return users;
        
    } catch (error) {
        throw error;
      }
 }



module.exports = {
    client,
    getAllUsers,
    createUser,
}