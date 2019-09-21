const express = require('express')
const cookieSession = require('cookie-session');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
const keys = require('./config/keys');
//const http = require('http').Server(express);
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
//const profile = require('./views/profile.ejs')
const status = require('./models/status-model');
const User = require('./models/user-model');
var fs = require('fs');

var imgPath = './img/715451.png'



// set view engine
app.set('view engine', 'ejs');

//
app.use(express.static('img'))

// set up session cookies
app.use(cookieSession({
    maxAge: 24 * 60 * 60 * 1000,
    keys: [keys.session.cookieKey]
}));



// initialize passport
app.use(passport.initialize());
app.use(passport.session());


// connect to mongodb
mongoose.connect(keys.mongodb.dbURI, () => {
    console.log('connected to mongodb');
});

// set up routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);

// create home route

app.get('/', (req, res) => {
    status.find({},function(err,docs){
        var statusarray = []         
        var user_status = {}
        for (var x=0;x<docs.length;x++){
            //var user_status={}
                user_status.dp = User.findOne({_id: docs[x].id}).exec(function (error, user){
                    console.log(user.thumbnail)
                     return user.thumbnail;                     
                });
                sleep(1000);
                console.log("end")
                function sleep(milliseconds) {
                    var start = new Date().getTime();
                    for (var i = 0; i < 1e7; i++) {
                      if ((new Date().getTime() - start) > milliseconds){
                        break;
                      }
                    }
                  }
                console.log('111',user_status.dp)
                user_status.username = docs[x].user;
                user_status.status_img = docs[x].statusimg
                user_status.status =  docs[x].status                                   
                statusarray.push(user_status);            
        }  
        console.log("array-1",statusarray)   
        io.emit('dashboard_status',docs );
    })
    res.render('home', { user: req.user });
});

// status
app.on('status_update',function(status){
    //console.log('new status',status)
})

// for chatting
app.get('/chat', (req, res) => {
    res.render('chat',{ user: req.user });
});

// sockets
io.sockets.on('connection', function(socket) {
    socket.on('username', function(data) {
        //console.log(data)
        socket.username = data.username;
        socket.avatar = data.avatar;
        io.emit('is_online', '<img src="'+socket.avatar+'" /><i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_online', '<i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {
        //console.log("hello",message)
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });
// for status and images    
    socket.on('status_imgs', function() {            
        status.find({},function(err,docs){
            io.emit('status_imgs',docs );
        })
    });
// status
    socket.on('status_update', function(data) {
        console.log("statusssssssss",data)
        /*
        new status({
            id: data.id,
            status: data.status
        }).save()
        */
        var imgs = new status
        //console.log(data.file)
        /*
        imgs.img.data = fs.readFile(imgPath , function read(err, data) {
            if (err) {
                throw err;
            }
        });  
        */  
        imgs.id = data.id;  
        imgs.img.data = data.file;
        imgs.img.contentType = 'image/png';
        imgs.status = data.status;
        imgs.name = data.name; 
        console.log("status",data.status)
        imgs.save()     
        io.emit('update_status', '<p>' + data.status + '</p>');
        io.emit('img_dp',imgs.img.data.buffer );
        //console.log(imgs)
        //console.log('img',imgs.img.data.buffer)
    });

});

app.listen(8080, () => {
    console.log('App now listening for requests on port 8080');
});

const server = http.listen(3000, function() {
    console.log('Listening for socket.io on port 3000');
});
