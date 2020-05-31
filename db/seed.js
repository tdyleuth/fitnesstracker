const { 
    client,
    createUser,
    getUserByUsername,
    getAllUsers,
    updateUser,
    getAllActivities,
    createActivity,
    updateActivity,
    getAllRoutines,
    createRoutine,
    updateRoutine,
    addActivityToRoutine,
    
 } = require('./index');

async function testDB() {
   try {

   console.log("Testing getAllUsers")
   const users = await getAllUsers();
   console.log("Result:", users)


   console.log("Testing updateUser");
   const result = await updateUser(users[0].id, {
    name: "Tony Montana",
  });

   console.log("Result:", result);
   
   console.log("Testing getAllActivities")
   const activities = await getAllActivities();
   console.log("Result:", activities)

   console.log("Testing updateActivity")
   const activity = await updateActivity(activities[0].id, {
       name: 'yoga',
       description: 'Yoga for an hour'
   });
   console.log("Result", activity)
   
   console.log("Testing getAllRoutines")
   const routines = await getAllRoutines();
   console.log("Result:", routines)

   console.log("Testing updateRoutine")
   const updatedRoutine = await updateRoutine(routines[0].id, {
       name: 'Back Day',
       goal: 'Work on on those back muscles',
       public: false
   }); 
   console.log("Result", updatedRoutine)

   console.log("Finished testing DB")
   }
   catch (error){
    console.error("Error testing DB!")
    throw error;
   }



}

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
              password VARCHAR(255) NOT NULL,
              name VARCHAR(255) NOT NULL,
              active boolean DEFAULT true
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
              name VARCHAR(255) UNIQUE NOT NULL,
              goal TEXT NOT NULL,
              public BOOLEAN DEFAULT false
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

async function createInitialUsers() {
   try {
     const tony = await createUser({
         username: 'tony', 
         password: 'tony123',
         name: 'Tony Dyleuth'
     });

     const mona = await createUser({
         username: 'mona',
         password: 'lisa12',
         name: 'Mona Lisa Navaorro'
     });

     console.log("Finished creating users!");
   }
   catch(error){
       console.error("Error creating users!")
       throw error;
   }
 }


 async function createInitialActivities() {
   try {
      const biking = await createActivity({
         name: 'Biking',
         description: 'Go biking for 3 miles'
      });

      const swimming = await createActivity({
          name:'swimming',
          description: 'Swim 20 laps in the pool'
      });

      const jogging = await createActivity({
          name: 'jogging',
          description: 'Go for 10 min jog'
      });

      
      console.log("Finished creating activities!")
     

   } catch(error){
     console.error("Error creating activities!")
     throw error;
   }
 }


 async function createInitialRoutines() {
  try {
    const [ tony, mona] = await getAllUsers();
    console.log(tony.id) 
    
    const legDay = await createRoutine({
        creatorId: tony.id,
        name: 'Leg Day',
        goal: 'Get those legs stonger!',
        public: false
    });
    const fullBody = await createRoutine({
        creatorId: mona.id,
        name: 'Full Body Day',
        goal: 'Total body workout for a month',
        public: true
    });
  
    console.log("Finished creating routines")

  } catch (error) {
      console.log("Error creating routines!")
      throw error;
  }
 }



  async function rebuildDB(){
      try{
          client.connect();
          console.log("Connected to DB!")

          await dropTables();
          await createTables();
          await createInitialUsers();
          await createInitialActivities();
          await createInitialRoutines();
      } catch (error) {
          throw error;
      }
  }
  
rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());