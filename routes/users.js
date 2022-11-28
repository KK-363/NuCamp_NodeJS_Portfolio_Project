const User = require('../models/user');
const Schedule = require('../models/schedule');
const passport = require('passport');
const cors = require('./cors');
const authenticate = require('../authenticate');
const express = require('express');

const router = express.Router();


/* GET users listing. */
router.get('/', cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find()
    .populate('studentInfo.teacher')
    .then(users => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(users);
    })
    .catch(err => next(err));
});

// TEACHERS routes for admins
router.route('/teachers')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find()
    .then(teachers => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(teachers.filter(teacher => teacher.role === 'teacher'));
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('POST operation not supported on /users/teachers');
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('PUT operation not supported on /users/teachers');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('DELETE operation not supported on /users/teachers');
});

router.route('/teachers/:teacherId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.findById(req.params.teacherId)
    .then(teacher => {
        if (teacher) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(teacher);
        }
        else {
            res.statusCode = 404;
            res.end(`No teacher was found.`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /users/teachers/${req.params.teacherId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`PUT operation not supported on /users/teachers/${req.params.teacherId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.findByIdAndDelete(req.params.teacherId)
    .then(teacher => {
        if (teacher) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(teacher);
        }
        else {
            res.statusCode = 404;
            res.end(`No teacher was found.`);
        }
    })
    .catch(err => next(err));
});

// STUDENTS routes for admins
router.route('/students')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.find()
    .populate('studentInfo.teacher')
    .then(students => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(students.filter(student => student.role === 'student'));
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('POST operation not supported on /users/students');
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('PUT operation not supported on /users/students');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('DELETE operation not supported on /users/students');
});

router.route('/students/:studentId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    User.findById(req.params.studentId)
    .then(student => {
        if (student) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(student);
        }
        else {
            res.statusCode = 404;
            res.end(`No student was found.`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('POST operation not supported on /users/students');
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('PUT operation not supported on /users/students');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.findByIdAndDelete(req.params.studentId)
    .then(student => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(student);
    })
    .catch(err => next(err));
});

// SCHEDULES routes for admins
router.route('/schedules')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Schedule.find()
    .populate('student')
    .populate('teacher')
    .then(schedules => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(schedules);
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('POST operation not supported on /users/schedules');
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('PUT operation not supported on /users/schedules');
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end('DELETE operation not supported on /users/schedules');
});

router.route('/schedules/:scheduleId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.all((req, res, next) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    next();
})
.get(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Schedule.findById(req.params.scheduleId)
    .populate('student')
    .populate('teacher')
    .then(schedule => {
        if (schedule) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(schedule);
        }
        else {
            res.statusCode = 404;
            res.end(`No schedule was found.`);
        }
    })
    .catch(err => next(err));
})
.post(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`POST operation not supported on /users/schedules/${req.params.scheduleId}`);
})
.put(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res) => {
    res.end(`PUT operation not supported on /users/schedules/${req.params.scheduleId}`);
})
.delete(cors.corsWithOptions, authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    Schedule.findByIdAndDelete(req.params.scheduleId)
    .then(schedule => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(schedule);
    })
    .catch(err => next(err));
});


// LOGIN all users
router.post('/login', cors.corsWithOptions, passport.authenticate('local'), (req, res) => {
    const token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({success: true, token: token, status: 'You are successfully logged in!'});
});

module.exports = router;