const express = require('express');
const activitiesRouter = express.Router();
const { requireUser } = require('./utils');

const { getAllActivities, createActivity, getActivityById, updateActivity, getPublicRoutinesByActivity } = require('../db');


activitiesRouter.use((req, res, next) => {
    console.log("A request is being made to /activities");

    next();
});


//Return all activities in DB
activitiesRouter.get('/', async (req, res) => {
    const activities = await getAllActivities();
  
    res.send({
      activities
    });
  });



// Create new activity
activitiesRouter.post('/',requireUser, async (req, res, next) => { 
  const { name, description } = req.body;
  
  try{
    const activity = await createActivity({
      name,
      description,
    })
    if(activity){

      res.send({
      message: "New activity created!",  
      activity
      })
    } else {
      next({ name:'NoActivityRetrieved', message: 'No activity Retrieved!'})
    }
  }
  catch ({ name, message }) {
      next({ name, message });
  }
  
});

//Update an activity (Any user can update)
activitiesRouter.patch('/:activityId',requireUser, async (req, res, next) => {
  const { activityId } = req.params;
  const { name, description } = req.body;
  
  const updateFields = {};
  
  if(name) {
    updateFields.name = name;
  }

  if(description){
    updateFields.description = description;
  }

  try {
    const originalActivity = await getActivityById(activityId);

    if(originalActivity){
      const updatedActivity = await updateActivity(activityId, updateFields);
      res.send({
        message:"Activity has been updated",
        post: updatedActivity
      });
    } else{
      next({
      name: 'UpdateActivityError',
      message: 'Activity cannot be updated'
    })
  }
}
  catch ({ name, message }) {

    next({ name, message });
  }     
});


// Get public routines by activityId
activitiesRouter.get('/:activityId/routines', async (req, res, next) => {
   const { activityId } = req.params;
   console.log(activityId)
   
   const publicRoutines = await getPublicRoutinesByActivity(activityId);

  try {

    if(publicRoutines){
      res.send({
       publicRoutines
      });
    } else {
      next({
      name: 'NoRoutinesForActivitiesError',
      message: 'Did not find any public routines for this activity'
      })
    }
   
} catch ({name, message}) {
  next({name, message});
}
})

module.exports = activitiesRouter;