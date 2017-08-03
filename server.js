const mongo = require('mongodb').MongoClient;
const client = require('socket.io').listen(4000).sockets;

mongo.connect('mongodb://127.0.0.1/mongochat', function (err, db) {
    if (err) {
        throw err;
    }

    console.log('Connected to MongoDB');

    client.on('connection', function (socket) {
        let chat = db.collection('chats');

        sendStatus = function (s) {
            socket.emit('status', s);
        }

        chat.find().limit(100).sort({_id:1}).toArray(function(err, result){
            if(err) {
                throw err;
            }
            socket.emit('output', result);
        });

        socket.on('input', function(data){
            let name = data.name;
            let message = data.message;

            if(name == '' || message == ''){
                sendStatus('Please enter a name and a message');
            } else {
                chat.insert({name: name, message: message}, function(){
                    client.emit('output', [data]);
                    
                    sendStatus({
                        message: 'Message Sent',
                        clear: 'true'
                    });
                });
            }
        });

        socket.on('clear', function(data){
            chat.remove({}, function(){
                socket.emit('cleared');
            })
        })
    });    
});