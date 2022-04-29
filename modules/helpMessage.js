export {helpMessage}

function helpMessage(){
    console.log("server.js [options]\n\
        \n\
        --port	Set the port number for the server to listen on. Must be an integer\n\
                    between 1 and 65535.\n\
        \n\
        --debug	If set to \`true\`, creates endlpoints /app/log/access/ which returns\n\
                    a JSON access log from the database and /app/error which throws\n\
                    an error with the message \"Error test successful.\" Defaults to\n\
                    \`false\`.\n\
        \n\
        --log		If set to false, no log files are written. Defaults to true.\n\
                    Logs are always written to database.\n\
        \n\
        --help	Return this message and exit.")

}