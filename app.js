var robot = require("robotjs");
const puppeteer = require('puppeteer');
var morse = require('morse');
var express = require('express')

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var incomingMsg='';
app.use(express.static('public'))

// set the view engine to ejs
app.set('view engine', 'ejs');


app.get('/',(req,res)=>{
res.render('index');
})


//Whenever someone connects this gets executed
io.on('connection', function(socket) {
    console.log('A user connected');

    socket.on('dash',()=>{
        console.log('dash received');
        incomingMsg += '-'
        count=0;
    })

    socket.on('dot',()=>{
        console.log('dot received');
        incomingMsg+='.';
    })

    socket.on('letter',()=>{
    //    incomingMsg +=" ";
       console.log(morse.decode(incomingMsg));
       robot.typeString(morse.decode(incomingMsg));
       incomingMsg=""
    });

    
    socket.on('delete',()=>{
        robot.keyTap('backspace') 
     })



     socket.on('begin',()=>{
      console.log("Starting Browser!!");
      (async () => {
         socket.on('enter',()=>{
            console.log("enter received");
            (async ()=>await page.keyboard.type('test54'))()
         })
    
         const browser = await puppeteer.launch({
            headless:false,
            defaultViewport: null,
            args:[
               '--start-maximized', // you can also use '--start-fullscreen'
               '--start-fullscreen'
            ]});
         const page = await browser.newPage();
         await page.goto('https://www.google.com/',{waitUntil: 'networkidle2'});
         await page.click('input.gLFyf.gsfi');
       })()
   })
    
    socket.on('finish',()=>{
       count=0;
       console.log('finish received');
       console.log(incomingMsg);
       console.log(morse.decode(incomingMsg));
       robot.typeString(morse.decode(incomingMsg));
       incomingMsg=""
    })
 
    //Whenever someone disconnects this piece of code executed
    socket.on('disconnect', function () {

       console.log('A user disconnected');
    });
 });
 


 http.listen(3000, function() {
    console.log('listening on *:3000');
 });