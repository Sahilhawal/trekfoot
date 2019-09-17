const router = require('express').Router();
const status = require('../models/status-model');


const authCheck = (req, res, next) => {
    console.log('authCheck',req.user)
    if(!req.user){
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/', authCheck, (req, res) => {
/*    
    status.findOne({id: req.user.id}).then((data) => {
        console.log(data.status)
        res.render('profile', { user: req.user ,data:data.status});
    })
*/    
    status.find({ id : req.user.id },'status', function (err, docs) {
        // docs is an array
        console.log('doc',docs)
        res.render('profile', { user: req.user ,data:docs});
      });
    //res.render('profile', { user: req.user ,data:data.status});
});

module.exports = router;