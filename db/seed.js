const { 
    client,
    getAllUsers,
 } = require('./index');


async function dropTables() {
    try {
        await client.query(
            `DROP TABLE IF EXISTS users;`
        );
  
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
             )`
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