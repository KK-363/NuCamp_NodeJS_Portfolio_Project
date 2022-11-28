const express = require('express');
const passport = require('passport');
const cors = require('./cors');
const Schedule = require("../models/schedule");
const User = require('../models/user');
const authenticate = require('../authenticate');

const teacherRouter = express.Router();

// TEACHER signup route
teacherRouter.route('/signup')
.post(cors.corsWithOptions, (req, res) => {
    User.register(
    new User({username: req.body.username, role: 'teacher'}),
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
        });
        }
    });
});


// STUDENTS routes for teachers
teacherRouter.route('/students')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    User.find({role: 'student'})
    .then(students => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(students.filter(student => student.studentInfo.teacher._id.equals(req.user._id))
        );
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('POST operation not supported on /teachers/students');
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('PUT operation not supported on /teachers/students');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('DELETE operation not supported on /teachers/students');
});

teacherRouter.route('/students/:studentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    User.findById(req.params.studentId)
    .then(student => {
        if (student){
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student);
        }
        else {
            res.statusCode = 404;
            res.end('No student was found.');
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /teachers/students/${req.params.studentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    User.findById(req.params.studentId)
    .then(student => {
        if(student) {
            if (req.user._id.equals(student.studentInfo.teacher._id)) {
                if (req.body.rating) {
                    student.studentInfo.rating = req.body.rating;
                }
                if (req.body.grade) {
                    student.studentInfo.grade = req.body.grade;
                }
                student.save()
                .then(student => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(student);
                })
                .catch (err => next(err));
            }
            else {
                res.end(`You are not the authorized teacher for this student`);
            }
        }
        else  {
            res.statusCode = 404;
            res.end(`No student was found`);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`DELETE operation not supported on /teachers/students/${req.params.studentId}`);
});

// SCHEDULES routes for teachers
teacherRouter.route('/schedules')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.find()
    .populate('student')
    .populate('teacher')
    .then(schedules => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(schedules.filter(schedule => schedule.teacher._id.equals(req.user._id)));
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    if (!req.body.title) {
        res.statusCode = 400;
        res.end('Title is required');
    }
    else {
        User.findOne({username: req.body.student})
        .then(student => {
            if (student) {
                if (req.user._id.equals(student.studentInfo.teacher._id)) {
                    req.body.title = `${student.username}'s schedule for ${req.body.title}`;
                    req.body.student = student._id;
                    req.body.teacher = student.studentInfo.teacher;

                    Schedule.create(req.body)
                        .then(schedule => {
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json(schedule);
                    })
                    .catch(err => next(err));
                }
                else {
                    res.end(`You are not the authorized teacher for this student`);
                }
            }
            else  {
                res.statusCode = 400;
                res.end(`Invalid student/no student was found`);
            }
        })
        .catch(err => next(err));
    }
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('PUT operation not supported on /teachers/schedules');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('DELETE operation not supported on /teachers/schedules');
});

teacherRouter.route('/schedules/:scheduleId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .populate('student')
    .then(schedule => {
        if(schedule) {
            if (req.user._id.equals(schedule.teacher._id)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(schedule);
            }
            else {
                res.end(`You are not the authorized teacher for this schedule`);
            }
        }
        else  {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /teachers/schedules/${req.params.scheduleId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if(schedule) {
            if (req.user._id.equals(schedule.teacher._id)) {
                if (req.body.title) {
                    if (req.body.student){
                        User.findOne({username: req.body.student})
                        .then(student => {
                            if (student) {
                                if(student.studentInfo.teacher.equals(req.user._id)) {
                                    if (req.body.completed !== null){
                                        schedule.completed = req.body.completed;
                                    }
                                    schedule.title = `${req.body.student}'s schedule for ${req.body.title}`;
                                    schedule.student = student._id;
                                    schedule.save()
                                    .then(schedule => {
                                        res.statusCode = 200;
                                        res.setHeader('Content-Type', 'application/json');
                                        res.json(schedule);
                                    })
                                    .catch(err => next(err));
                                }
                                else {
                                    res.end(`You aren't the authorized teacher for ${req.body.student} student.`)
                                }
                            }
                            else {
                                res.statusCode = 404;
                                res.end(`Student with username ${req.body.student} was not found.`);
                            }
                        })
                        .catch(err => next(err));
                    }
                    else {  
                        if (req.body.completed !== null){
                            schedule.completed = req.body.completed;
                        }
                        schedule.title = `${schedule.title.split(" ")[0]} schedule for ${req.body.title}`;
                        schedule.save()
                        .then(schedule => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(schedule);
                        })
                        .catch(err => next(err));
                    }
                }
                else {
                    if (req.body.completed !== null){
                        Schedule.findByIdAndUpdate(req.params.scheduleId, { $set: {completed: req.body.completed} }, { new: true })
                        .then(schedule => {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.json(schedule);
                        })
                        .catch(err => next(err));
                    }
                }
            }
            else {
                res.end(`You are not the authorized teacher for this schedule`);
            }
        }
        else  {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if(schedule) {
            if (req.user._id.equals(schedule.teacher._id)) {
                Schedule.findByIdAndDelete(req.params.scheduleId)
                .then(response => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(response);
                })
                .catch(err => next(err));
            }
            else {
                res.end(`You are not the authorized teacher for this schedule`);
            }
        }
        else  {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
    })
    .catch(err => next(err));
});

// ASSIGNMENTS routes for teachers
teacherRouter.route('/schedules/:scheduleId/assignments')
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if(schedule) {
            if (req.user._id.equals(schedule.teacher._id)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(schedule.assignments);
            }
            else {
                res.end(`You are not the authorized teacher for this schedule`);
            }
        }
        else  {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if(schedule) {
            if (req.user._id.equals(schedule.teacher._id)) {
                schedule.assignments.push(req.body);
                schedule.save()
                .then(schedule => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(schedule);
                })
                .catch (err => next(err));
            }
            else {
                res.end(`You are not the authorized teacher for this schedule`);
            }
        }
        else  {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
    })
    .catch(err => next(err));
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /teachers/schedules/${req.params.scheduleId}/assignments`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if (schedule) {
            if (req.user._id.equals(schedule.teacher._id)) {
                for (let i = (schedule.assignments.length-1); i >= 0; i--) {
                    schedule.assignments.id(schedule.assignments[i]._id).remove();
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
                res.end(`You are not the authorized teacher for this schedule.`);
            }
        } else {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
    })
    .catch(err => next(err));
});

teacherRouter.route('/schedules/:scheduleId/assignments/:assignmentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.cors, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if(schedule && schedule.assignments.id(req.params.assignmentId)) {
            if (req.user._id.equals(schedule.teacher._id)) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(schedule.assignments.id(req.params.assignmentId));
            }
            else {
                res.end(`You are not the authorized teacher for this schedule`);
            }
        }
        else if (!schedule) {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
        else {
            res.statusCode = 404;
            res.end(`Assignment not found`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /teachers/schedules/${req.params.scheduleId}/assignments/${req.params.assignmentId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if(schedule && schedule.assignments.id(req.params.assignmentId)) {
            if (req.user._id.equals(schedule.teacher._id)) {
                if (req.body.subject) {
                    schedule.assignments.id(req.params.assignmentId).subject = req.body.subject;
                }
                if (req.body.assignment) {
                    schedule.assignments.id(req.params.assignmentId).assignment = req.body.assignment;
                }
                schedule.save()
                .then(schedule => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(schedule);
                })
                .catch (err => next(err));
            }
            else {
                res.end(`You are not the authorized teacher for this schedule`);
            }
        }
        else if (!schedule) {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
        else  {
            res.statusCode = 404;
            res.end(`Assignment not found`);
        }
    })
    .catch(err => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyTeacher, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .then(schedule => {
        if(schedule && schedule.assignments.id(req.params.assignmentId)) {
            if (req.user._id.equals(schedule.teacher._id)) {
                schedule.assignments.id(req.params.assignmentId).remove();
                schedule.save()
                .then(schedule => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(schedule);
                })
                .catch (err => next(err));
            }
            else {
                res.end(`You are not the authorized teacher for this schedule`);
            }
        }
        else if (!schedule) {
            res.statusCode = 404;
            res.end(`Schedule not found`);
        }
        else  {
            res.statusCode = 404;
            res.end(`Assignment not found`);
        }
    })
    .catch(err => next(err));
});

module.exports = teacherRouter;