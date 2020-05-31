const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/fitness-dev');



async function createUser({
    username,
    password,
    name

  }) {
      try {
          const { rows: [ users ] } = await client.query(
              `INSERT INTO users(username, password, name)
               VALUES($1,$2,$3)
               ON CONFLICT (username) DO NOTHING
               RETURNING *;
               `, [username, password, name]);
  
               return users;
          
      } catch (error) {
          throw error;
        }
   }

async function getUserByUsername(username) {
    try {
      const { rows: [ users ] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1
      `, [username]);
  
      return users;
    } catch (error) {
      throw error;
    }
  }

async function getAllUsers() {
   
  try {
    const { rows } = await client.query(`
       SELECT id, users, name, active 
       FROM users;
    `);

    return rows;

  } catch (error){
    throw error;
  }

}


async function updateUser(id, fields = {}) {

  const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ users ] }= await client.query(`
        UPDATE users
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return users;
    } catch (error) {
      throw error;
    }
  }

async function getAllActivities() {
   try {
    
   const { rows } = await client.query(`
     SELECT id, name, description FROM activities;
   `);

   return rows;


   } catch (error){
     throw error;
   }

}

async function createActivity({
  
  name,
  description

}) {
  try {
    const { rows: [ activity ]} = await client.query(`
     INSERT INTO activities(name,description)
     VALUES (LOWER($1),$2)
     RETURNING *;
    `, [name,description]); 
   
  return activity;
  }
  catch (error) {
    throw error;
  }
}


async function updateActivity(id, fields = {}) {

  const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ activity ] }= await client.query(`
        UPDATE activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return activity;
    } catch (error) {
      throw error;
    }
  }


async function createRoutine({
   creatorId,
   name,
   goal,
   public

}) { 
  try {
    const  { rows: [ routine ] } = await client.query(`
       INSERT INTO routines("creatorId",name,goal,public)
       VALUES($1,$2,$3,$4)
       RETURNING *;
    `, [creatorId,name,goal,public] );

    return routine;
  }
  catch(error){
    throw error;
  } 
}


async function getAllRoutines() {

  try {
    const { rows: [ routines ] } = await client.query(`
        SELECT * FROM routines;
    `);

   return routines;
  }

  catch (error) {
   throw error;
  }
}

async function getPublicRoutines() {
  try {
    const { rows: [ routines ] } = await client.query(`
        SELECT * FROM routines
        WHERE public = 'true';   
    `);

    return routines;
  } catch(error){
    throw error;
  }
}



module.exports = {
    client,
    createUser,
    getUserByUsername,
    getAllUsers,
    updateUser,
    getAllActivities,
    createActivity,
    updateActivity,
    getAllRoutines,
    getPublicRoutines,
    createRoutine,
}


