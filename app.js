const express = require('express')
const app = require('express')()
const cookieSession = require('cookie-session');
const passport = require('passport');
const authRoutes = require('./routes/auth-routes');
const profileRoutes = require('./routes/profile-routes');
const passportSetup = require('./config/passport-setup');
const mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
const keys = require('./config/keys');
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);
const status = require('./models/status-model');
const User = require('./models/user-model');

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

app.get('/', (req, res) => {
    res.render('login', { user: req.user })
})

// create home route


// for chatting
app.get('/chat', (req, res) => {
    res.render('chat',{ user: req.user });
});

// sockets
io.sockets.on('connection', function(socket) {
    app.get('/homepage', (req, res) => {
        console.log('On homepage finding status')
        status.find({}).then(function(docs) {
            var jobQueries = [];
           docs.forEach(function(u) {
              jobQueries.push(User.find({_id:u.id}));
              jobQueries.push(u)
            });
          
            return Promise.all(jobQueries );
          }).then(function(listOfJobs) {    
            socket.emit('dashboard_status',listOfJobs);
            console.log('all status sent to client side(homepage)',listOfJobs)    
          }).catch(function(error) {
              console.log(error)
          });
          res.render('home', { user: req.user });
    });
    
    socket.on('username', function(data) {
        socket.username = data.username;
        socket.avatar = data.avatar;
        io.emit('is_online', '<img src="'+socket.avatar+'" /><i>' + socket.username + ' join the chat..</i>');
    });

    socket.on('disconnect', function(username) {
        io.emit('is_offline', '<i>' + socket.username + ' left the chat..</i>');
    })

    socket.on('chat_message', function(message) {
        io.emit('chat_message', '<strong>' + socket.username + '</strong>: ' + message);
    });
// for status and images    
    socket.on('status_imgs', function(id) { 
        console.log('finding data only for the user') 
        status.find({id:id},function(err,docs){
            io.emit('status_imgs',docs );
            console.log('user data sent to profile')
        })
    });
// status
    socket.on('status_update', function(data) {
        var imgs = new status
        imgs.id = data.id;  
        imgs.img.data = data.file;
        imgs.img.contentType = 'image/png';
        imgs.status = data.status;
        imgs.name = data.name; 
        imgs.save()     
        console.log('Status saved')
        io.emit('update_status', '<p>' + data.status + '</p>');
    });

});

app.start = app.listen = function(){
    return server.listen.apply(server, arguments)
  }

app.start(process.env.PORT  || 8080)
