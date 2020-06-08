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


   async function getUserById(userId) {
    try {
      const { rows: [ user ] } = await client.query(`
        SELECT *
        FROM users
        WHERE id=${ userId }
      `);
  
      if (!user) {
        return null
      }

  
      return user;
    } catch (error) {
      throw error;
    }
  }
  


async function getUserByUsername(username) {
    try {
      const { rows: [user] } = await client.query(`
        SELECT *
        FROM users
        WHERE username=$1
      `, [username]);
  
      return user;
    } catch (error) {
      throw error;
    }
  }

async function getAllUsers() {
   
  try {
    const { rows } = await client.query(`
       SELECT *
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

async function getActivityById(activityId) {
    try {
      const { rows: [ activity ] } = await client.query(`
        SELECT *
        FROM activities
        WHERE id=${ activityId }
      `);
  
      if (!activity) {
        throw {
          name: "ActivityNotFoundError",
          message: "Could not find a activity with that activityId"
        };
      }
  
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
    const { rows:routinesIds } = await client.query(`

    SELECT id
    FROM routines;
    `);

    const routines = await Promise.all(routinesIds.map(
      routine => getRoutineById( routine.id )
    ));

    return routines;
  }

  catch (error) {
   throw error;
  }
}

async function getPublicRoutines() {
  try {
    const { rows: routinesIds } = await client.query(`
    SELECT id
    FROM routines
    WHERE public = 'true';
    `);
  

    const routines = await Promise.all(routinesIds.map(
      routine => getRoutineById( routine.id )
    ));


    return routines;
  } catch(error){
    throw error;
  }
}

async function getAllRoutinesByUser({
  username
}) {
  try{
   
    const { rows: routinesIds } = await client.query(`
        SELECT routines.id FROM routines
        INNER JOIN users ON routines."creatorId" = users.id
        WHERE users.username = $1;
    `, [username]);

    const routines = await Promise.all(routinesIds.map(
      routine => getRoutineById( routine.id )
    ));


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
   
    const { rows: routinesIds } = await client.query(`
        SELECT routines.id FROM routines
        INNER JOIN users ON routines."creatorId" = users.id
        WHERE public = 'true' AND users.username = $1;
    `, [username]);

    const routines = await Promise.all(routinesIds.map(
      routine => getRoutineById( routine.id )
    ));


    return routines;

  }
  catch(error){
    throw error;
  }
}


async function getPublicRoutinesByActivity({
  activityId
})
 {
  try{
   
    const { rows: routinesIds } = await client.query(`
    SELECT routines.id
    FROM routine_activities
    INNER JOIN routines ON routine_activities."routineId" = routines.id
    INNER JOIN activities ON routine_activities."activityId" = activities.id
    WHERE public = 'true' AND routine_activities."activityId" = ${activityId};   
    `);


    const routines = await Promise.all(routinesIds.map(
      routine => getRoutineById( routine.id )
    ));
    
    return routines;

  }
  catch(error){
    throw error;
  }
}

async function destroyRoutine(routineId) {

  try {
    await client.query(`
    DELETE FROM routines
    WHERE id = ${routineId};
    `);
    } catch(error){
       throw error;
      }
}

async function getRoutineById(routineId) {
  try {
    const { rows: [ routine ] } = await client.query(`
      SELECT *
      FROM routines
      WHERE id=${ routineId }
    `);

    if (!routine) {
      throw {
        name: "RoutineNotFoundError",
        message: "Could not find a routine with that routineId"
      };
    }

    const { rows: activities } = await client.query(`
       SELECT activities.* FROM activities
       JOIN routine_activities ON activities.id = routine_activities."activityId"
       WHERE routine_activities."routineId" = ${routineId};
    `)

    const { rows: [username] } = await client.query(`
       SELECT * FROM users
       WHERE id =$1;
    `, [routine.creatorId] );

    routine.activities = activities;
    routine.username = username;

    delete routine.username;

    return routine;

  } catch (error) {
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



async function destroyRoutineActivity(routineId) {
  try {
      await client.query(`
      DELETE FROM routine_activities
      WHERE "routineId" = ${routineId};
      `);
   } catch(error){
      throw error;
  }
}

async function getRoutineActivityById(routineActivityId) {
  try {
    const { rows: [ routine_activity ] } = await client.query(`
      SELECT *
      FROM routine_activities
      WHERE id=${ routineActivityId }
    `);

    if (!routine_activity) {
      throw {
        name: "RoutineActivityNotFoundError",
        message: "Could not find a routine_activity with that routine_activiityId"
      };
    }

    return routine_activity;

  } catch (error) {
    throw error;
  }
}


module.exports = {
    client,
    createUser,
    getUserByUsername,
    getUserById,
    getAllUsers,
    updateUser,
    getAllActivities,
    createActivity,
    updateActivity,
    getActivityById,
    getAllRoutines,
    getPublicRoutines,
    getAllRoutinesByUser,
    getPublicRoutinesByUser,
    getPublicRoutinesByActivity,
    getRoutineById,
    createRoutine,
    updateRoutine,
    destroyRoutine,
    addActivityToRoutine,
    getAllRoutinesActivities,
    updateRoutineActivity,
    getRoutineActivityById,
    destroyRoutineActivity,
}


