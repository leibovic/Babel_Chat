    var in_room = null;
    
    $(document).ready(function(){
        console.log("sockets fired");
        namespace = '/chat';

        var socket = io.connect('http://' + document.domain + ':' + location.port + namespace);

        var game_content_list = []; 
        var room_name = "{{ room_name }}";
        var counter = 0;
        var placeholder_txt = "It's not your turn now. Listen to your partner and guess the word."
        var turn = false;


        //1.upon socket connection, emit the message "you're connected" to the client and send message "join" to server with room name
        socket.on('connect', function() {
            $('#log').append("<br>You're connected");
            //if initiating usr, join room in server and invite others to join
            {% if room_name %}
                //populate input box with room name if in room
                //upon connect of initiating, join room
                socket.emit('join', {start: 1, room: "{{ room_name }}" });
            {% endif %}
            });

        //5. put a button on the page for jose when 1st client starts room to join the room and pass the room name and maybe his name?)
        socket.on('invite_to_join', function(msg) {
            //invites usr in waiting room to join room via btn click
            console.log(msg);

            {% if room_name==None %}
                $("#join_room").removeClass('hidden');
                $("#join_room").html("Join " + msg.room_name);
                $("#join_room").click(function(evt){
                    socket.emit('join', {start: 2, room: msg.room_name});
                    room_name = msg.room_name;
                });
                $("#navbar").addClass("hidden");
            {% endif %}

            //append received message to log div
            $('#log').append('<br>Received #' + msg.count + ': ' + msg.data);
        });

//-----------handles starting conversation game-----------------------


        //msg 'start_game' to server to get game content
        socket.on("start_game", function(msg) {
            console.log("game started");
            $('#join_room').addClass("hidden");
            room_name=msg.room_name; 
            socket.emit('get_game_content', {room: msg.room_name});
        });


        //display 1st game element to both clients
        socket.on("display_game_content", function(msg) {
            
            //save content as list in game_content_list (global var) 
            for (var i = 0; i < msg.game_content.length; i++) {
                game_content_list.push(msg.game_content[i]);
            };
            counter = 0;
            //display first question
            $('#game_content').append(msg.game_content[counter]);
           //remove hidden class on 'next' button
           $('#nxt_q').removeClass('hidden');
        });

        //event listener for nxt-question button
        $('#nxt_q').click(function(evt){
            socket.emit("request_nxt_q", {counter:counter+1, room: room_name});
        });

        //displays next q by updated counter #
        socket.on("display_nxt_q", function(msg) {
            //get next item in list by counter
            counter = msg.counter;
            console.log(" this is the room: {{ room_name}} ");
            //if 

            $('#game_content').html(game_content_list[msg.counter]);
        });

//-------------------handles card games and game moves-----------------------

        socket.on("display_card_content", function(msg) {

            for (var i = 0; i < msg.card_content.length; i++) {
                    game_content_list.push(msg.card_content[i]);
                };
                console.log(msg.game_content_list);
           
            counter = 0;
           $('#nxt_card').removeClass('hidden');

            {% if room_name==None %}
                 $('#card_wrapper').html('<img src="' + game_content_list[counter] + '" id="card"></img>');
                turn = true;
            {% elif room_name!=None %}
                $('#nxt_card').addClass('hidden');
                $('#game_content').html(placeholder_txt);
                turn = false;
           {% endif %}

        });

 
        //event listener for next card button
        $("#nxt_card").click(function(evt) {
            //request next card from server
            socket.emit("request_nxt_q", {counter:counter+1, room: room_name, game_type:"cards", });
        });

        
        // displays next card by updated counter #
        socket.on("display_nxt_card", function(msg) {
            //get next item in list by counter
            
            if (counter < game_content_list.length){
                //switch values for turn for each player
                turn = !turn;
                counter = msg.counter;
                //put placeholder txt, clear img src, hide nxt btn
                if (turn==false) {
                    $('#game_content').html(placeholder_txt);
                    $('#card_wrapper').html('');

                    // $('#card').attr('src', '');
                    $('#nxt_card').addClass('hidden');
                }
                //clear txt area, add next card img, unhide nxt btn
                else {
                    $('#game_content').html('');
                    // $('#card').attr('src', game_content_list[msg.counter]);
                    $('#card_wrapper').html('<img src="' + game_content_list[msg.counter] + '" id="card"></img>');
                    $('#nxt_card').removeClass('hidden');
                }
            }

            else {
                //clear button and image
                //call another function to play again or end session
            }
        });

        socket.on('output to log', function(msg) {
            console.log(msg);
            $('#log').append('<br>Received: ' + msg.data);
        });
    
});
