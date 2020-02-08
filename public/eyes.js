function handler(val){

    if(val=='dash'){
        var x = document.getElementById("dashAudio");
        x.play(); 
        socket.emit('dash')
    
    }
    else if (val=='dot'){
        var y= document.getElementById("dotAudio");
        y.play(); 
        socket.emit('dot')
    
    }
    
}
var socket = io(
    window.location.href
      .split("/")
      .slice(0, 3)
      .join("/")
  );
//Pad Gesture Control
var myElement = document.getElementById('pad');
// var hammertime = new Hammer(myElement);
// hammertime.on('swipeleft', function(ev) {
// 	alert('a')
// });

var mc = new Hammer.Manager(myElement);

//Swipe Right to complete a letter or to give a space
mc.add( new Hammer.Swipe({ event: 'letter', pointers: 1,direction:4}) );
mc.on("letter", function(ev) {
    socket.emit('letter')
});
    

//Swipe Left to delete a letter
mc.add( new Hammer.Swipe({ event: 'delete', pointers: 1,direction:2}) );
mc.on("delete", function(ev) {
    socket.emit('delete')
});
        
//One finger tap for enter
mc.add( new Hammer.Tap({ event: 'enter', pointers: 1}) );
mc.on("enter", function(ev) {
    socket.emit('enter')
});

//Two finger tap to select
mc.add( new Hammer.Tap({ event: 'select', pointers: 2}) );
mc.on("select", function(ev) {
    socket.emit('select')
});


//Swipe Up Two finger
mc.add( new Hammer.Swipe({ event: 'up', pointers: 2,direction: 	8}) );
mc.on("up", function(ev) {
    socket.emit('up')
});

//Swipe Down Two finger
mc.add( new Hammer.Swipe({ event: 'down', pointers: 2,direction:16}) );
mc.on("down", function(ev) {
    socket.emit('down')
});

//Swipe Left Two finger
mc.add( new Hammer.Swipe({ event: 'left', pointers: 2,direction:2}) );
mc.on("left", function(ev) {
    socket.emit('left')
});

//Swipe Right Two finger
mc.add( new Hammer.Swipe({ event: 'right', pointers: 2,direction:4}) );
mc.on("right", function(ev) {
    socket.emit('right')
});