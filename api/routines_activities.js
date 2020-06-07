const express = require('express')
const routinesActivitiesRouter = express.Router();
const { requireUser } = require('./utils');

const { updateRoutineActivity, destroyRoutineActivity, getRoutineActivityById, getRoutineById} = require('../db')

routinesActivitiesRouter.use((req, res, next) => {
    console.log("A request is being made to /routines_activities")

    next();
});

//Update routine_activities count or duration
routinesActivitiesRouter.patch('/:routineActivityId',requireUser, async (req, res, next) => {
    const { routineActivityId } = req.params;
    console.log(routineActivityId)
    const { count, duration } = req.body;
    const { id } = req.user;
    
    const updateFields = {};

    if(count) {
      updateFields.count= count;
    }
  
    if(duration){
      updateFields.duration= duration;
    }


    try {
      const originalRoutineActivity = await getRoutineActivityById(routineActivityId);
      const routineId = originalRoutineActivity.routineId;

      const originalRoutine = await getRoutineById(routineId)

  
      if(id === originalRoutine.creatoriD){
        const updatedRoutineActivity = await updateRoutineActivity(routineActivity, updateFields);

        res.send({
          message:"Routine has been updated",
          routineActivity: updatedRoutineActivity
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

module.exports = routinesActivitiesRouter;