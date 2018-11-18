$(function () {
    const socket = io();

    socket.on("user-count", (data) => {
        $(".chat-info").text("There are currently " + data + " people in the chat room");
    });
    socket.on("user-online", (data) => {
        let html = "";

        for(user of data) {
            html += "<div>" + user + "</div>";
        }

        $("#user-online").html(html);
    });

    function joinChat() {
        const username = $.trim($("#username").val());   

        socket.emit("join", username);
        
        socket.on("status", (data) => {
            if(data.status === 1) {
                socket.on("messages", (data) => {
                    let html = "";

                    for(let i = 0; i < data.length; i++) {
                        html += "<div class='msg'><div class='user'>" + data[i]['user'] + ":</div><div class='txt'>" + data[i]['message'] + "</div></div>";
                    }

                    $(".messages").html(html);
                });
                
                $('#leave-chat').data('username', username);
                $('#send-message').data('username', username);
                $(".join-chat").hide();
                $("#content").removeClass("d-none");
            }else if(data.status === 0) {
                alert("Sorry but the username already exists, please choose another one");
                $("#username").val("").focus();
                location.reload();
            }
        });

    }

    $("#username").keyup((evt) => {
        if(evt.keyCode === 13){
            evt.preventDefault();
            joinChat();
        }
    });

    $("#join-chat").click(() => {        
        joinChat();
    });

    function leaveChat(){
        const username = $("#leave-chat").data("username");   

        socket.emit("leave", username);

        socket.on("status", (data) => {
            if(data.status === 1){
                $("#content").addClass("d-none");
                $(".join-chat").show();
                $("#username").val('');                
                alert(data.userName + " you have successfully left the chat room");
                location.reload();
            } else {
                alert(data.userName + " failed leave the chat room");
            }
        });
    }

    $("#leave-chat").click(() => {
        leaveChat();    
    });

    function sendMessage(){
        const username = $("#send-message").data("username");
        const message = $.trim($("#message").val());
        
        socket.emit("message", { username, message });
        $("#message").val("");                        
    }

    $("#message").keyup((evt) => {
        if(evt.keyCode === 13) {
            evt.preventDefault();
            sendMessage();
        }
    });

    $("#send-message").click(() => {
        sendMessage();
    });

    socket.on("users", (data) => {
        const username = data.username;
        const message = data.message;
        const html = "<div class='msg'><div class='user'>" + username + ":</div><div class='txt'>" + message + "</div></div>";

        $(".messages").append(html);

        function getMessages() {
            const div = $("#outputMessage");
            div.scrollTop(div.prop("scrollHeight"));
        }

        getMessages();
    });
});