window.onload = () => {
    let power = localStorage.getItem("power");
    let health = localStorage.getItem("health");
    let time = localStorage.getItem("time");

    // localStorage.removeItem("heart");
    // localStorage.removeItem("power");
    // localStorage.removeItem("time");

    let powerDisplay = document.querySelector("#jar-text");
    let healthDisplay = document.querySelector("#heart-text");
    let timeDisplay = document.querySelector("#time-text");



    powerDisplay.innerText = (power !== null ?  power + "/18" : "0");
    healthDisplay.innerText = (health !== null ?  health  : "0");

    let minutes = 0;
    let seconds = 0;

    if(time !== null) {
        //time is in milliseconds
        minutes = Math.floor(+time/1000/60);
        seconds = Math.round(+time/1000 - minutes*60);
    }

    timeDisplay.innerText = minutes + " min " + seconds + " s"
}