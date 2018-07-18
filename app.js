const express = require('express');
const mysql = require('mysql');
const path = require('path')
const session = require('express-session');
const MemoryStore = require('memorystore')(session);



const app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

const db = mysql.createPool({
    host: 'localhost',
    user: 'newuser',
    password: 'testpass',
    database: 'ASAPPTESTDB',
});

app.use(session({saveUninitialized: true,
	secret:'AAAAAAAAAAAAAAAAAAAAABBBB',
	resave: true,
	maxAge: Date.now() + (30 * 86400 * 1000) ,
	store:  new MemoryStore({
		checkPeriod: 86400000 // prune expired entries every 24h
	}),
}));

app.get('/register', function(req,res){
	console.log("REGISTERING");
	var today = new Date();
	var users={
		"fullname":req.query.fullname,
		"email":req.query.email,
		"password":req.query.password,
		"reg_date":today
	}
    db.getConnection(function (err, connection) {
		connection.query('INSERT INTO test SET ?',users, function (error, results, fields) {
		  if (error) {
			res.json({
				status:false,
				message:'there are some error with query '+error
			})
		  }else{
			  res.json({
				status:true,
				data:results,
				message:'user registered sucessfully'
			})
		  }
		});
	});
	

});

app.get('/allmessages', function(req,res){
    ssn=req.session;
	if(req.session.user){
		console.log(req.session.user.fullname);
	}
	var today = new Date();
    db.getConnection(function (err, connection) {
		connection.query('SELECT * FROM messages',[], function (error, results, fields) {
		  if (error) {
			res.json({
				status:false,
				message:'there are some error with query '+error
			})
		  }else{
			  res.json({
				status:true,
				data:results,
				user: req.session.user
			});
		  }
		  connection.release();
		});
	});

});
app.get('/logout', function(req,res){
    req.session.destroy();
	res.end();

});

app.get('/login', function(req,res){
		console.log("LOGIN");
    ssn=req.session;
	var today = new Date();
    db.getConnection(function (err, connection) {
		connection.query('SELECT * FROM test where email= ? and password= ?',[req.query.email,req.query.password], function (error, results, fields) {
		  if (error) {
			res.json({
				status:false,
				message:'there are some error with query '+error
			})
		  }else{
				
				if(results.length>0){
					results[0].password = null;
					ssn.user = results[0];
				}
			  res.json({
				user: results[0],
				status:(results.length>0),
				data:results,
				message:(results.length>0?'user logged in':('no user found for '+req.query.email))
			});
		  }
		  connection.release();
		});
	});

});


app.get('/send', function(req,res){
    ssn=req.session;
	console.log("SEND");
	if(!ssn.user){
		res.json({message: "not logged in", logout: true});
		return;
	}
	
	var messages = {
			user_id: ssn.user.user_id,
			fullname: ssn.user.fullname,
			text: req.query.message,
			date: new Date()
	}
    db.getConnection(function (err, connection) {
		connection.query('INSERT INTO messages SET ?',messages, function (error, results, fields) {
		  if (error) {
			res.json({
				status:false,
				message:'there are some error with query '+error
			})
		  }else{
			io.emit('chat message', messages);
			res.end();
			
		  }
		  connection.release();
		});
	});

});



app.get('/test', function (req, res) {
    db.getConnection(function (err, connection) {
        if (err) {
            res.status(501).send(err.message);
            return;
        }
        connection.query('SELECT * FROM test', function (err, results, fields) {
            if (err) {
                res.status(501).send(err.message);
                connection.release();
                return;
            }
			if(results.length < 1){
				res.json({
					result: "Database empty :/",
					backend: 'nodejs',
					});
			} else {
				res.json({
					result: results[0].fullname,
					backend: 'nodejs',
				});
			}
            connection.release();
        });
    });
});

app.get('/', function(req, res){
  res.sendFile(__dirname + "/index.html");
});
app.use(express.static('static'));



app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});


http.listen(port, function(){
  console.log('listening on *:' + port);
});

