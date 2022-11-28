const express = require('express');
const passport = require('passport');
const cors = require('./cors');
const Schedule = require('../models/schedule');
const User = require('../models/user');
const authenticate = require('../authenticate');

const studentRouter = express.Router();

// STUDENTS signup route
studentRouter.route('/signup')
.post(cors.corsWithOptions, (req, res, next) => {

if (!req.body.teacher || !req.body.grade){
    res.statusCode = 400;
    res.end(`Both grade and teacher are required`);
}
else {
    User.findOne({username: req.body.teacher})
    .then(teacher => {
    if(teacher){
        let studentInfo = {};
        studentInfo.teacher = teacher._id;
        studentInfo.grade = req.body.grade

        User.register(
        new User({username: req.body.username, role: 'student'}),
        req.body.password, 
        (err, user) => {
            if (err) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.json({err: err});
            }
            else {
            if (req.body.firstname) {
                user.firstname = req.body.firstname;
            }
            if (req.body.lastname) {
                user.lastname = req.body.lastname;
            }
            user.studentInfo = studentInfo;

            user.save(err => {
                if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({err: err});
                return;
                }
                passport.authenticate('local')(req, res, () => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({success: true, status: 'Registration Successful!'});
                });
            })
            }
        }
        )
    }
    else{
        res.statusCode = 404;
        res.end(`Teacher with username ${req.body.teacher} was not found`);
    }
    })
}
});

// SCHEDULES routes for students
studentRouter.route('/schedules')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyStudent, (req, res, next) => {
    Schedule.find({ student: req.user._id})
    .populate('teacher')
    .then(schedules => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(schedules);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('POST operation not supported on /students/schedules');
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('PUT operation not supported on /students/schedules');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('DELETE operation not supported on /students/schedules');
});

studentRouter.route('/schedules/:scheduleId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyStudent, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if (schedule) {
            if (req.user._id.equals(schedule.student._id)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(schedule);
            }
            else {
                res.end(`You are not the authorized student for this Schedule`);
            }
        } 
        else {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /students/schedules/${req.params.scheduleId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    res.end(`PUT operation not supported on /students/schedules/${req.params.scheduleId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`DELETE operation not supported on /students/schedules/${req.params.scheduleId}`);
});

//ASSIGNMENTS  routes for students
studentRouter.route('/schedules/:scheduleId/assignments')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyStudent, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if (schedule && schedule.assignments !== []) {
            if (req.user._id.equals(schedule.student._id)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(schedule.assignments);
            }
            else {
                res.end(`You are not the authorized student for this schedule`);
            }
        } else if (!schedule) {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        } else {
            res.statusCode = 404;
            res.end(`No assignments found`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /students/schedules/${req.params.scheduleId}/assigments`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`PUT operation not supported on /students/schedules/${req.params.scheduleId}/assigments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`DELETE operation not supported on /students/schedules/${req.params.scheduleId}/assigments`);
});

studentRouter.route('/schedules/:scheduleId/assignments/:assignmentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyStudent, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if (schedule && schedule.assignments.id(req.params.assignmentId)) {
            if (req.user._id.equals(schedule.student._id)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(schedule.assignments.id(req.params.assignmentId));
            }
            else {
                res.end(`You are not the authorized student for this schedule`);
            }
        } else if (!schedule) {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        } else {
            res.statusCode = 404;
            res.end(`Assignment not found`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /students/schedules/${req.params.scheduleId}/assignments/${req.params.assignmentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyStudent, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if (schedule && schedule.assignments.id(req.params.assignmentId)) {
            if (req.user._id.equals(schedule.student._id)) {
                if (req.body.completed !== null) {
                    schedule.assignments.id(req.params.assignmentId).completed = req.body.completed;
                }
                schedule.save()
                .then(schedule => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(schedule);
                })
                .catch(err => next(err));
            }
            else {
                res.end(`You are not the authorized student for this schedule`);
            }
        } else if (!schedule) {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        } else {
            res.statusCode = 404;
            res.end(`Assignment not found`);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`DELETE operation not supported on /students/schedules/${req.params.scheduleId}/assignments/${req.params.assignmentId}`);
});

module.exports = studentRouter;