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