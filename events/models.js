'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const EventSchema = mongoose.Schema({
	weekday: {
		type: String,
		required: true
	},
	hour: {
		type: Number,
		required: true
	},
	timeSlot: {
		type: Number,
		required: true
	},
	name: {
		type: String,
		required: true
	},
	where: {
		type: String,
		required: true
	},
	when: {
		type: String, 
		required: true
	},
	owner: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: {
			type: String,
		}
	},

	joiners: [
		{
			id: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			username: {
				type: String,
			}
		}
	],

	weekStartDate: {
		type: Date,
		required: true
	}
	
});

EventSchema.methods.serialize = function() {
  return {
    name: this.name || '',
    where: this.where || '',
    when: this.when || ''
  };
};


const Event = mongoose.model('Event', EventSchema);

module.exports = {Event};
