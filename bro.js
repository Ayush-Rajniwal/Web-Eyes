/**
 * Author: Ayush Rajniwal
 * Project Name: Web Eyes
 * Github Link: https://github.com/Ayush-Rajniwal/Web-Eyes
 * 
 * Tip:
 * Uncomment console.log() to better debug this application.
 */


const puppeteer = require('puppeteer');
let say = require('say');
var morse = require('morse');
var express = require('express');
var ejs=require('ejs');

var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var os = require('os');



var incomingMsg = '';
var gData;
var pointer = 0;
let tree;
let treePointer = 0;
app.use(express.static('public'));

// set the view engine to ejs
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
   res.render('index');
})

//Whenever someone connects this gets executed
io.on('connection', async function (socket) {

   console.log("A Device Connected");

   //Start Puppeteer
   const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
      args: [
         '--start-maximized', // you can also use '--start-fullscreen'
         //  '--start-fullscreen'
      ]
   });

   const page = await browser.newPage();

   await page.goto('https://www.google.com')
      .then(async () => {
         say.speak(await page.title())
   });

   socket.on('dash', () => {
      console.log('dash received');
      incomingMsg += '-'
   });


   socket.on('dot', () => {
      console.log('dot received');
      incomingMsg += '.';
   });

   //Execute for right swipe with 1 finger
   socket.on('letter', async () => {
      console.log(morse.decode(incomingMsg));
      await page.type('input[type=text]', morse.decode(incomingMsg), { delay: 100 });
      say.speak(morse.decode(incomingMsg))
      incomingMsg = "";
   });

   //Execute for left swipe with 1 finger
   socket.on('delete', async () => {
      console.log("deleting");
      say.speak("Deleting")
      await page.keyboard.press('Backspace');
   });

   //Execute for Left swipe with 2 finger
   socket.on('left', async () => {
      console.log("Two Fingers Left...Going back");
      await page.goBack();
   });

    //Execute for Right swipe with 2 finger
   socket.on('right', async () => {
      console.log("Two Fingers Right....Going Forward");
      await page.goForward();
   });

    //Execute for Tap with 1 finger
   socket.on('enter', async () => {
      console.log("Enter Received");
      await page.keyboard.press('Enter');
   });

   //two finger select
   socket.on('select', async () => {
      console.log("Select Received");
      let title= await page.title();
      if(title.includes('- Google Search')){
         //on google search page....open link
         say.stop(true);
         say.speak("Opening link, "+gData[pointer][0]);
      await page.goto(gData[pointer][1]);
   }
      else{
         //on page link....open that link..
         //console.log("inside else");
         //console.log(tree.children[treePointer].role);
         var searchText = tree.children[treePointer].name;
         if(tree.children[treePointer].role=='link'){
            //open link only if it is a link
           // console.log("inside link");
            
            //fing the link on the page...and return it's url
       let r=  await page.evaluate((searchText)=>{
        // console.log(searchText);
         var linkArray= document.querySelectorAll('a');
         let toUrl;
         for(let i=0;i<linkArray.length;i++){
            if(linkArray[i].innerText == searchText){
               //console.log(linkArray[i]);
               toUrl=linkArray[i].href;
               break;
            }
         }
       //  console.log(toUrl);
         return toUrl;
              
         },searchText);
         //goto the link...selected on the page.
         say.stop(true);
         say.speak("Opening link "+searchText);
         await page.goto(r);
       //  console.log("Result",r);
      }
      }
   });

   socket.on('up', async () => {
      console.log("Two finger up received");
      let title = await page.title();
      if (title.includes('- Google Search')) {
            // moving up in google search links
         pointer++;
         if (pointer >= gData.length) {
            pointer = gData.length - 1;
            say.stop(true);
            say.speak("You reach to the end of result")
         }
         else {
            say.stop(true);
            say.speak(gData[pointer][0]);
         }
      }
      else {
         //moving up on the text of page.
         treePointer++;
         say.stop(true);
         if(tree.children[treePointer].role=='link')
         say.speak("On Link. "+tree.children[treePointer].name)
         else
         say.speak(tree.children[treePointer].name);
        // console.log(tree.children[treePointer]);
       
      }
   })

   socket.on('down', async () => {
      console.log("Two finger down received");
      let title = await page.title();
      if (title.includes('- Google Search')) {
         // moving down in google search links
      pointer--;
      if (pointer < 0) {
         pointer = 0;
         say.stop(true);
         say.speak("You are at the top of the result")
      } else {
         say.stop(true);
         say.speak(gData[pointer][0]);

      }
   }
   else{
      //moving down on text of page.
      treePointer--;
      say.stop(true);
      if(tree.children[treePointer].role=='link')
      say.speak("On Link. "+tree.children[treePointer].name)
      else
      say.speak(tree.children[treePointer].name);
    //  console.log(tree.children[treePointer]);
      
   }
   })


   //Whenever someone disconnects close browser
   socket.on('disconnect', async function () {
      console.log('A Device disconnected');
      await browser.close();
   });



   page.on('load', async (e) => {
      pointer = 0;
      treePointer=0;
      let pageTitle = await page.title();
      say.speak("On page, "+pageTitle);
      if (pageTitle.includes('- Google Search')) {
         //when on google search page...pull out links
         gData = await page.evaluate(() => {
            let linkName = [];

            document.querySelectorAll('.r a h3').forEach((e) => {
               linkName.push([e.innerHTML, e.parentElement.href]);
            });
            return linkName;
         })
         //console.log(gData);
      }
      else {
         //When not on google search page...take snapshot of the page
         tree = await page.accessibility.snapshot();
        // console.log(tree);
        // console.log("-----------SnapShot done!!---------------");
         await new Promise(async function (resolve, reject) {
            for(let i=0;i<tree.children.length;i++){
               if(tree.children[i].role != 'heading')
               treePointer++;
               else
               break;
            }
            resolve("yes")
         })

      }
   })
});



http.listen(3000, function () {
   var interfaces = os.networkInterfaces();
var addresses = [];
for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
        var address = interfaces[k][k2];
        if (address.family === 'IPv4' && !address.internal) {
            addresses.push(address.address);
        }
    }
}
   console.log('Open http://'+addresses[1]+':3000 in your phone');
   console.log("Make sure your phone and computer are on the same network (i.e. on same wifi or hotspot)")
});