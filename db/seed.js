const { 
    client,
    getAllUsers,
    createUser,
 } = require('./index');


async function dropTables() {
    try {
        await client.query(`
            DROP TABLE IF EXISTS routine_activities;
            DROP TABLE IF EXISTS routines;
            DROP TABLE IF EXISTS activities;
            DROP TABLE IF EXISTS users;
            `);
  
        console.log("Finished dropping tables!");
  
     } catch (error){
        console.error("Error dropping tables!");
         throw error;
     }
  
  
  }
  
  async function createTables() {
     try{
         await client.query(
             `CREATE TABLE users (
              id SERIAL PRIMARY KEY,
              username VARCHAR(255) UNIQUE NOT NULL,
              password VARCHAR(255) NOT NULL
             );`
         );

         await client.query(
             `CREATE TABLE activities (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) UNIQUE NOT NULL,
              description TEXT NOT NULL
             );`
         );

         await client.query(
             `CREATE TABLE routines (
              id SERIAL PRIMARY KEY,
              "creatorId" INTEGER REFERENCES users(id) NOT NULL,
              public BOOLEAN DEFAULT false,
              goal TEXT NOT NULL
             );`
         );

         await client.query(
             `CREATE TABLE routine_activities (
              id SERIAL PRIMARY KEY,
              "routineId" INTEGER REFERENCES routines(id) NOT NULL,
              "activityId" INTEGER REFERENCES activities(id),
              count INTEGER NOT NULL
             );`
         );
  
      console.log("Finished creating tables!");
     }
     catch (error){
         console.error("Error creating tables!");
         throw error;
     }
  }


  async function rebuildDB(){
      try{
          client.connect();

          await dropTables();
          await createTables();
      } catch (error) {
          throw error;
      }
  }
  

  rebuildDB()