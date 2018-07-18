function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function fixDates(messages){
	for(var message of messages)
	if(typeof message.date != "object"){
		message.date = new Date(message.date);
	}
	setTimeout(function(){
		$("#messageContainer").scrollTop(9999999);
		},10);
	return messages
}
$(document).ready(function(){

var socket = io();

Vue.filter('formatDate', function(value) {
	var date = new Date(value);
  if (value) {
    return pad(date.getHours(),2)+":"+pad(date.getMinutes(),2)+":"+pad(date.getSeconds(),2);
  }
});
	
$.ajaxSetup({ cache: false });
      new Vue({
        el: "#hello-world-app",
		 created: function () {
			var parent = this;
			socket.on('chat message', function(msg){
				  parent.messages.push(msg);
				  fixDates(parent.messages);
			});
			parent.allmessages();
		  },
		  computed: {
			  sortedMessages: function() {
				function compare(a, b) {
				  if (a.date.getTime() < b.date.getTime())
					return -1;
				  else 
					return 1
				}
				return this.messages.sort(compare);
			  }
		},

		methods: {
			createAccount: function(event){	
				var parent = this;
				var email = $("#registerEmail").val()
				var password = $("#registerPassword").val()
				this.errormessage = "";
				if(password != $("#registerPassword2").val()){
					this.errormessage = "Passwords must match";
				}
				var fullname = $("#registerFullname").val()
				if(!email || !password || !fullname){
					alert("Fill out all fields");
					return ;
				}
				$.ajax({
					type: "GET",
					url: "/register",
					data: {
						fullname: fullname,
						email: email,
						password: password
					},
					complete: function(data){
						parent.errormessage =data.responseJSON.message
					}
				});
			},
			allmessages: function(event){
				var parent = this;
				$.ajax({
					type: "GET",
					url: "/allmessages",
					complete: function(data){
						if(data && data.responseJSON){
							parent.messages = data.responseJSON.data;
							fixDates(parent.messages);
							parent.user = data.responseJSON.user;
						}
						
					}
				});
			
			},
			login: function(event){	
				var parent = this;
				parent.errormessage ="";
				$.ajax({
					type: "GET",
					url: "/login",
					data: {
						email: $("#loginEmail").val(),
						password: $("#loginPassword").val()

					},
					complete: function(data){
						parent.errormessage = data.responseJSON.status?"Login Successful":"Login Failed, no user found";
						parent.allmessages();
						
					}
				});
			},
			logout: function(event){
				$.ajax({
					type: "GET",
					url: "/logout",
					complete: function(data){
						location.reload();
						
					}
				});
			},
			send: function(event){
				var parent = this;
				
						$.ajax({
							type: "GET",
							url: "/send",
							data: {
								message: $("#message").val()

							},
							complete: function(data){
								if(data.responseJSON && data.responseJSON.logout){
									parent.errormessage ="Logged out";
									parent.user = {};
								}
								
							}
						})
					  socket.emit('chat message', $('#message').val());
					  $('#message').val('');
			}
		},
		
        data: function() {
          return {
            msg: "Hello World!",
			messages: [],
			user: {},
			errormessage: "",
			counter: 0
          }
        }
      });

});