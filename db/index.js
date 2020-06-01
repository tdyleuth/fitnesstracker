const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/fitness-dev');


//User helper functions
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


// Activities helper functions
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



//Routine helper functions

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


async function updateRoutine(id, fields = {}) {

  const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ routine ] }= await client.query(`
        UPDATE routines
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return routine;
    } catch (error) {
      throw error;
    }
  }



async function getAllRoutines() {

  try {
    const { rows } = await client.query(`

    SELECT routines.id AS id, routines."creatorId" AS userId, routines.name AS routine, routines.goal AS goal, routines.public AS public, activities.name as activity
    FROM routine_activities
    INNER JOIN routines ON routine_activities."routineId" = routines.id
    INNER JOIN activities ON routine_activities."activityId" = activities.id;
    `);

   return rows;
  }

  catch (error) {
   throw error;
  }
}

async function getPublicRoutines() {
  try {
    const { rows: [ routines ] } = await client.query(`
    SELECT routines.id AS id, routines."creatorId" AS userId, routines.name AS routine, routines.goal AS goal, routines.public AS public, activities.name as activity
    FROM routine_activities
    INNER JOIN routines ON routine_activities."routineId" = routines.id
    INNER JOIN activities ON routine_activities."activityId" = activities.id
    WHERE public = 'true';   
    `);

    return routines;
  } catch(error){
    throw error;
  }
}

async function getAllRoutinesByUser({
  username
}) {
  try{
   
    const { rows: [ routines ]} = await client.query(`
        SELECT routines.id AS id, users.username AS username, routines.name AS routine, routines.goal AS goal, routines.public AS public FROM routines
        INNER JOIN users ON routines."creatorId" = users.id
        WHERE users.username = $1;
    `, [username]);

    return routines;

  }
  catch(error){
    throw error;
  }
}

async function getPublicRoutinesByUser({
  username
}) {
  try{
   
    const { rows: [ routines ]} = await client.query(`
        SELECT routines.id AS id, users.username AS username, routines.name AS routine, routines.goal AS goal, routines.public AS public FROM routines
        INNER JOIN users ON routines."creatorId" = users.id
        WHERE public = 'true' AND users.username = $1;
    `, [username]);

    return routines;

  }
  catch(error){
    throw error;
  }
}


async function getPublicRoutinesByActivity({
  activityId
}) {
  try{
   
    const { rows: [ routines ]} = await client.query(`
    SELECT routines.id AS id, routines."creatorId" AS userId, routines.name AS routine, routines.goal AS goal, routines.public AS public, activities.name as activity
    FROM routine_activities
    INNER JOIN routines ON routine_activities."routineId" = routines.id
    INNER JOIN activities ON routine_activities."activityId" = activities.id
    WHERE public = 'true' AND routine_activities."activityId" = $1;   
    `, [activityId]);

    return routines;

  }
  catch(error){
    throw error;
  }
}


//Routine_activities helper functions

async function addActivityToRoutine({
  routineId,
  activityId,
  count,
  duration
}) {
   try {
     const { rows: [ result ] } = await client.query(`
        INSERT INTO routine_activities("routineId","activityId",count,duration)
        VALUES ($1,$2,$3,$4);
     `, [routineId,activityId,count,duration]);

    return result;
   }
   catch(error){
     throw error;
   }
}

async function getAllRoutinesActivities() {
  try {
    const { rows } = await client.query(`
      SELECT * FROM routine_activities;
    `)
  return rows;

  } catch (error){
    throw error;
  }
}


async function updateRoutineActivity(id, fields = {}) {

  const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    if (setString.length === 0) {
      return;
    }
  
    try {
      const { rows: [ routine_activity ] }= await client.query(`
        UPDATE routine_activities
        SET ${ setString }
        WHERE id=${ id }
        RETURNING *;
      `, Object.values(fields));
  
      return routine_activity;
    } catch (error) {
      throw error;
    }
  }

async function destroyRoutineActivity({
    id
}) {
  try {
      await client.query(`
      DELETE FROM routine_activities
      WHERE id = $1;
      `,[id])
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
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    createRoutine,
    updateRoutine,
    addActivityToRoutine,
    getAllRoutinesActivities,
    updateRoutineActivity,
    destroyRoutineActivity,
}


