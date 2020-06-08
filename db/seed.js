const { 
    client,
    createUser,
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
    getAllRoutinesActivities,
    addActivityToRoutine,
    updateRoutineActivity,
    destroyRoutineActivity,
    
 } = require('./index');

const bcrypt = require('bcrypt');


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

   console.log("Testing PublicAllRoutines")
   const publicRoutines = await getPublicRoutines();
   console.log("Result:", publicRoutines)

   console.log("Testing AllRoutinesByUser")
   const AllRoutinesByUser = await getAllRoutinesByUser({
       username: 'tony'
   });
   console.log("Result:", AllRoutinesByUser)

   console.log("Testing getPublicRoutinesByUser")
   const PublicRoutinesByUser = await getPublicRoutinesByUser({
       username: 'mona'
   });
   console.log("Result:", PublicRoutinesByUser)

   console.log("Testing getPublicRoutinesByActivity")
   const AllRoutinesByActivity = await getPublicRoutinesByActivity({
       activityId: 1
    
    });
   console.log("Result:", AllRoutinesByActivity)


   console.log("Testing updateRoutine")
   const updatedRoutine = await updateRoutine(routines[0].id, {
       name: 'Back Day',
       goal: 'Work on on those back muscles',
       public: false
   }); 
   console.log("Result", updatedRoutine)

   console.log("Testing getAllRoutineActivities")
   const routinesActivities = await getAllRoutinesActivities();
   console.log("Result:", routinesActivities)

   console.log("Testing updateRoutineActivity")
   const updateedRoutineActivitiesResults = await updateRoutineActivity(routinesActivities[0].id, {
      count:10,
      duration:30
   });
   console.log("Result:", updateedRoutineActivitiesResults)

   console.log("Testing destroyRoutineActivitY")
   const destroyedActivityResults = await destroyRoutineActivity(1);
   console.log("Result:", destroyedActivityResults)

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
              "activityId" INTEGER REFERENCES activities(id) NOT NULL,
              count INTEGER,
              duration INTEGER,
              UNIQUE ("routineId","activityId")
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
   
   const tonyPass = 'password12';
   const monaPass = 'lisa12';
   const jackPass = 'jackspass';
   const SALT_COUNT = 10;
   
   try {
   
   const tony = await createUser({
         username: 'tony', 
         password: await bcrypt.hash(tonyPass, SALT_COUNT),
         name: 'Tony Dyleuth'
        });
   

     const mona = await createUser({
         username: 'mona',
         password:  await bcrypt.hash(monaPass,SALT_COUNT),
         name: 'Mona Lisa Navaorro'
     });

     const jack = await createUser({
        username: 'jack',
        password:  await bcrypt.hash(jackPass,SALT_COUNT),
        name: 'Jack Smith'
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

      const pushups = await createActivity({
        name: 'pushups',
        description: 'Do as many pushups in a hour'
    });

      
      console.log("Finished creating activities!")
     

   } catch(error){
     console.error("Error creating activities!")
     throw error;
   }
 }


 async function createInitialRoutines() {
  try {
    const [ tony, mona, jack ] = await getAllUsers();

    
    const legDay = await createRoutine({
        creatorId: tony.id,
        name: 'Leg Day',
        goal: 'Get those legs stonger!',
        public: false
    });
    const fullBody = await createRoutine({
        creatorId: mona.id,
        name: 'Full Body Day',
        goal: 'Work out entire body',
        public: true
    });

    const armsDay = await createRoutine({
        creatorId: jack.id,
        name: 'Arm and Chest Day',
        goal: 'Work out arms and chest muscles',
        public: true
    });
  
  
    console.log("Finished creating routines")

  } catch (error) {
      console.log("Error creating routines!")
      throw error;
  }
 }

 async function createInitialRoutineActivities() {
    try {
       
        await addActivityToRoutine({
            routineId: 3,
            activityId: 4,
            duration: 60,
            count: 100
        });

        await addActivityToRoutine({
            routineId: 3,
            activityId: 2,
            duration: 60,
            count: 30
        });

        await addActivityToRoutine({
            routineId: 2,
            activityId: 1,
            duration: 120
        });

        await addActivityToRoutine({
            routineId: 1,
            activityId: 2,
            duration: 120
        });

        await addActivityToRoutine({
            routineId: 2,
            activityId: 3,
            duration: 30
        })


    console.log("Finished adding Activity to Routine")
    }
    catch(error){
        console.log("Error adding Activity to Routine")
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
          await createInitialRoutineActivities();
      } catch (error) {
          throw error;
      }
  }
  
rebuildDB()
.then(testDB)
.catch(console.error)
.finally(() => client.end());