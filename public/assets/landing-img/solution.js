
var array = ["Hungry ?" , "Game Night ?", "Cooking gone wrong ?", "Unexpected guests ?", "Movie marathon ?"]

// for (var i = 0 ; i < 5 ; i++){
//     $(".unique-heading").text(array[i]);
//     setInterval(function(){ 
//        }, 10000);
      
// }

// var timer = setInterval(changeHeader,3000);

// function changeHeader(){
//     var elem = document.getElementById('unique-heading');
  
//     elem.innerHTML = elem.innerHTML == 'Hungry ?' ? 'Cooking gone wrong ?' : 'Hungry ?';
//     elem.innerHTML = elem.innerHTML == 'Cooking gone wrong ?' ? 'Unexpected guests ?' : 'Cooking gone wrong ?';
    
// }

i = -1;
var elem = document.getElementById('unique-heading');
(function f(){
    i = (i + 1) % array.length;
    // document.write(stories[ i ] + '<br/>');
    elem.innerHTML = array[i];
    setTimeout(f, 3500);
 })();
