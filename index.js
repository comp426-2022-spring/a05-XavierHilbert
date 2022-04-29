// Place your server entry point code here
import minimist from "minimist"
import express from "express"
import morgan from "morgan"
import fs from "fs"
import {coinFlip, coinFlips, countFlips, flipACoin} from "./modules/coin.mjs"
import {helpMessage} from "./modules/helpMessage.js"
import db from "./src/services/database.js"

const args = minimist(process.argv.slice(2))
const port = args["port"] || 5000
const help = args["help"] || false
const log = args["log"] || true
const debug = args["debug"] || false

if(help){
    helpMessage()
    process.exit(0)
}

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(logger)
app.use(express.static('./public'));


// Start an app server
const server = app.listen(port, () => {
    console.log('App listening on port %PORT%'.replace('%PORT%',port))
});

app.get('/app/', (req, res) => {
    res.sendFile('index.html', { root: 'public' })
    // Respond with status 200
        res.statusCode = 200;
    // Respond with status message "OK"
        res.statusMessage = 'OK';
        res.writeHead( res.statusCode, { 'Content-Type' : 'text/plain' });
        res.end(res.statusCode+ ' ' +res.statusMessage)
    });


app.get('/app/flip/', (req, res) => {
    res.status(200).json({"flip":coinFlip()})
});

app.get('/app/flips/:number', (req, res) => {
    const flips = coinFlips(req.body.number)
    res.status(200).json({
        "raw":flips,
        "summary":countFlips(flips)
    })
});

app.get('/app/flip/call/heads', (req, res) => {
    res.status(200).json(flipACoin("heads"))
});

app.get('/app/flip/call/tails', (req, res) => {
    res.status(200).json(flipACoin("tails"))
});

if(debug){
    app.get('/app/log/access', (req, res) => {
        const data = db.prepare("SELECT * FROM accesslog").all()
        res.status(200).send(data)
    });
    
    app.get('/app/error', (req, res) => {
        throw new Error("Error test successful")
    });
}

if("false" !== log){
    const accesslog = fs.createWriteStream("access.log", {flags: 'a'})
    app.use(morgan('combined', {stream: accesslog}))
}

function logger(req, res, next){
    let logdata = {
        remoteaddr: req.ip,
        remoteuser: req.user,
        time: Date.now(),
        method: req.method,
        url: req.url,
        protocol: req.protocol,
        httpversion: req.httpVersion,
        status: res.statusCode,
        referer: req.headers['referer'],
        useragent: req.headers['user-agent']
    }
    const stmt = db.prepare("INSERT INTO accesslog (remoteaddr, remoteuser, time, method, url, protocol, httpversion, status, referer, useragent) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)")
    stmt.run(
        String(logdata.remoteaddr), 
        String(logdata.remoteuser),
        String(logdata.time),
        String(logdata.method),
        String(logdata.url),
        String(logdata.protocol),
        String(logdata.httpversion),
        String(logdata.status),
        String(logdata.referer),
        String(logdata.useragent))
    next()
}

app.use(function(req, res){
    res.status(404).send('404 NOT FOUND')
});