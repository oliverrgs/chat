A simple multi-user chat application in NODE.js
TECH SPECS:
To simplify, this project uses just a single node server for both backend and frontend code.
Communication is handled by some ajax calls and socket.io. This makes the chat experience instantaneous.
 A lot of things are in just for speed and ease of debugging : Some calls should use POST over GET, Passwords should be encrypted.
VUE is used as the front-end framework. This streamlines a lot of the code.
CSS/HTML is very basic, could stand to be a lot more attractive.

INSTALLATION
1. To run it you'll need node and MySQL.
2. Paste the databasesetup.txt into MySQL console
3. npm install
4. node app.js
5. Your server now runs on port 3000!

USAGE
1. Register an account with a name, email and password
2. login with email and password
