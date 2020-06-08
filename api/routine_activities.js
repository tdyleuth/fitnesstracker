const express = require('express')
const routineActivitiesRouter = express.Router();
const { requireUser } = require('./utils');

const { updateRoutineActivity, destroyRoutineActivity, getRoutineActivityById, getRoutineById, getAllRoutinesActivities} = require('../db')

routineActivitiesRouter.use((req, res, next) => {
    console.log("A request is being made to /routine_activities")

    next();
});


//Get all routine_activities

routineActivitiesRouter.get('/', async (req, res) => {
  const routine_activities = await getAllRoutinesActivities();
 
  res.send({
   routine_activities
  });

});

//Update routine_activities count or duration
routineActivitiesRouter.patch('/:routineActivityId',requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { count, duration } = req.body;
    const { id } = req.user;
    
    const updateFields = {};

    if(count) {
      updateFields.count = count;
    }
  
    if(duration){
      updateFields.duration = duration;
    }
   
    try {
      const originalRoutineActivity = await getRoutineActivityById(routineActivityId)
      const routineId = originalRoutineActivity.routineId;
      const originalRoutine = await getRoutineById(routineId)
      const creatorId = originalRoutine.creatorId;
  
      if(creatorId === id){

        const updatedRoutineActivity = await updateRoutineActivity(routineActivityId, updateFields);

        res.send({
          message:"Routine_Activity has been updated",
          routineActivity: updatedRoutineActivity
        });

      } else{
        next({
        name: 'UnauthorizedUserError',
        message: 'You do not have permission to update Routine_Activity'
      })
    }
  }
    catch ({ name, message }) {
  
      next({ name, message });
    }     
  });


//Remove activity from a routine
routineActivitiesRouter.delete('/routineActivityId', requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { id } = req.user;

    try{
      const originalRoutineActivity = await getRoutineActivityById(routineActivityId)
      const routineId = originalRoutineActivity.routineId;
      const originalRoutine = await getRoutineById(routineId)
      const creatorId = originalRoutine.creatorId;

      if(creatorId === id){
        const deletedActivity = await destroyRoutineActivity(routineActivityId);

        res.send({
          name: 'Routine_Activity has been deleted',
          DeletedActivity: deletedActivity
        });
      } else {
        next({
        name: 'UnauthorizedUserError',
        message: 'You do not have permission to update Routine_Activity'
      })
    }
  }
     catch ({ name, message }) {
  
      next({ name, message });
    }     
});

module.exports = routineActivitiesRouter;