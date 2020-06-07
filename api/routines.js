const express = require('express')
const routinesRouter = express.Router();
const { requireUser } = require('./utils');

const { getPublicRoutines, createRoutine, getRoutineById, updateRoutine, destroyRoutineActivity, destroyRoutine, addActivityToRoutine } = require('../db')

routinesRouter.use((req, res, next) => {
    console.log("A request is being made to /routines")

    next();
});

//Get all public routines
routinesRouter.get('/', async (req, res) => {
    const routines = await getPublicRoutines();

    res.send({
        routines
    });

});

//Create new routine
routinesRouter.post('/',requireUser, async (req,res,next) => {
    const { name, goal, public } = req.body;
    const { id } = req.user;
  
    try{
      const routine = await createRoutine({
        creatorId: id,
        name,
        goal,
        public,
      })
      if(routine){
  
        res.send({
        message: "New routine created!",  
        routine
        })
      } else {
        next({ name:'NoRoutineRetrievedError', message: 'No Routine Retrieved!'})
      }
    }
    catch ({ name, message }) {
        next({ name, message });
    }
})


//Update routine
routinesRouter.patch('/:routineId',requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    const { name, goal, public } = req.body;
    const { id } = req.user;
    
    const updateFields = {};

    if(name) {
      updateFields.name = name;
    }
  
    if(goal){
      updateFields.goal = goal;
    }

    if(public){
        updateFields.public = public
    }


    try {
      const originalRoutine = await getRoutineById(routineId);
      const _creatorID = originalRoutine.creatorId;
  
      if(id === _creatorID){
        const updatedRoutine = await updateRoutine(routineId, updateFields);

        res.send({
          message:"Routine has been updated",
          routine: updatedRoutine
        });

      } else{
        next({
        name: 'UnauthorizedUserError',
        message: 'You do not have permission to update Routine'
      })
    }
  }
    catch ({ name, message }) {
  
      next({ name, message });
    }     
  });


//Delete routine and routine_activities related
routinesRouter.delete('/:routineId', requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    const { id } = req.user;
    try{
        const routine = await getRoutineById(routineId);

        if(routine && routine.creatorId === id) {
        
        const deletedRoutineActivity = await destroyRoutineActivity(routineId);
        const deletedRoutine = await destroyRoutine(routineId);
        

        res.send({ 
            message: "Routine Deleted",
            deleletedroutine: deletedRoutine,
            deletedRoutineActivity: deletedRoutineActivity
        });
        } else {
            next(routine 
            ? {
                name:"UnauthorizedUserError",
                message: "You cannot delete a routine which is not yours"
            }
            : {
              name: "RoutineNotFoundError",
              message: "Routine does not exist"
            });
         }

    } catch ({name, message }){
      next({ name, message })
    }
});


//Add activity to a routine

routinesRouter.post('/:routineId', requireUser, async (req, res, next) => {
    const { routineId } = req.params;
    const { activityId, count, duration } =req.body;
    const { id } = req.user;


    const routines = await getRoutineById(routineId)

    if(routines.creatorId != id){
        next({
            name:"UnauthroizedUser",
            message:"You do not have permission to add acivity to this Routine'"
        })
    }

    try{
        const newActivity = await addActivityToRoutine({
            routineId: routineId,
            activityId,
            count,
            duration,
         });
  
            res.send({
            message: "Activity added to routine!",  
            newActivity
            })
        
        } catch ({ name, message }) {
        next({ name, message });
    }    
});


module.exports = routinesRouter;