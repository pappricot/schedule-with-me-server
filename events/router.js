'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const {Event} = require('./models');
const config = require('../config');
const router = express.Router();
const passport = require('passport');
const {agenda} = require('../agenda');
const moment = require('moment');


const jwtAuth = passport.authenticate('jwt', {session: false});

function dateForEvent({weekday, hour, timeSlot, weekStartDate}) {
const date= moment(weekStartDate).zone(0).day(weekday).hour(hour).minute((timeSlot-1)*30).toDate()
//  console.log('date', date)
 console.log(weekday)
 console.log(hour)
 console.log(timeSlot)
 console.log(weekStartDate)
console.log(date)
  return  date

}

router.post('/', jwtAuth, (req, res, next) => {
  console.log('req.user',req.user);
  const owner = {
    id: req.user.id,
    username: req.user.username
  }
  let allEvents;
  const {timeSlots} = req.body;
  const {name, where, when, weekStartDate} = req.body;
  console.log(weekStartDate, 'weekStartDate')
  return Promise.all(timeSlots.map(ts => Event.create({
      weekday: ts.weekday,
      hour: ts.hour,
      timeSlot: ts.timeSlot,
      name,
      when,
      where,
      owner,
      weekStartDate
  })))
    .then(events => {
      allEvents = events;

      return Promise.all(events.map(event => agenda.schedule(dateForEvent(event), 'notify event start', event)));
      
    })
    .then(() => res.status(201).json(allEvents) )
    .catch(err => res.status(500).send(err))
 
})

router.get('/', (req, res, next) => {
  console.log(req.query.weekStartDate, 'weekStartDate')
  return Event.find({
    weekStartDate: req.query.weekStartDate
  })
  .then(events => {
    const workingObject = {};

    for (let i = 0; i < events.length; i++) {
      let event = events[i];
      workingObject[event.weekday] = workingObject[event.weekday] || {};
      workingObject[event.weekday][event.hour] = workingObject[event.weekday][event.hour] || {};
      workingObject[event.weekday][event.hour][event.timeSlot] = {
        name: event.name,
        where: event.where,
        when: event.when,
        id: event._id,
        joiners: event.joiners,
        owner: event.owner,
        weekStartDate: event.weekStartDate
      };
    }
    return res.json(workingObject)
  })
  
})

router.delete('/:_id', (req, res, next) => {
  return Event.remove({
    _id: req.params._id
  })
  .then(() => res.status(204).send())
})

router.put('/:_id/join', jwtAuth, (req, res, next) => {
  // find an event by _id in mongoose

  // update the event by adding the logged in user's username and id to the list of joiners

  // save

  // return response ok
  const eventId = req.params._id
  const joiner = {
    id: req.user.id,
    username: req.user.username
  }
  const options = { new: true };
  console.log('req.user', req.user)
  Event
    .findByIdAndUpdate(
       eventId,
       {
         "$push": {joiners: joiner}
       },
       options
    )
    .then(events => {
      return res.status(201).json(events);
    })
    .catch(err => res.status(500).send(err))


})

router.put('/:_id/unjoin', jwtAuth, (req, res, next) => {
  // find an event by _id in mongoose

  // update the event by REMOVING the logged in user's username and id to the list of joiners

  // save

  // return response ok
  const eventId = req.params._id
  const joiner = {
    id: req.user.id,
    username: req.user.username
  }
  const options = { new: true };
  console.log('req.user', req.user)
  Event
    .findByIdAndUpdate(
       eventId,
       {
         "$pull": {joiners: joiner}
       },
       options
    )
    .then(events => {
      return res.status(201).json(events);
    })
    .catch(err => res.status(500).send(err))

})

module.exports = router