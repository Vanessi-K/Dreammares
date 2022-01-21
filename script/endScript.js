let power;
let health;
let time;

window.onload = () => {
    readValues();
    displayValues();
    displayRating(calculateRating());
}

function readValues() {
    power = localStorage.getItem("power");
    health = localStorage.getItem("health");
    time = localStorage.getItem("time");

    localStorage.removeItem("power");
    localStorage.removeItem("health");
    localStorage.removeItem("time");
}

function displayValues() {
    let powerDisplay = document.querySelector("#jar-text");
    let healthDisplay = document.querySelector("#heart-text");
    let timeDisplay = document.querySelector("#time-text");

    powerDisplay.innerText = (power !== null ?  power + "/18" : "0");
    healthDisplay.innerText = (health !== null ?  health  : "0");

    let minutes = 0;
    let seconds = 0;

    if(time !== null) {
        //time is in milliseconds
        minutes = Math.floor(time/1000/60);
        seconds = Math.round(time/1000 - minutes*60);
    }

    timeDisplay.innerText = minutes + " min " + seconds + " s";
}

function calculateRating() {
    return Math.round(power/6) + (+health) - Math.round(+time/1000/60);
}

function displayRating(rating) {
    for(let i = 1;  i <= rating; i++) {
        //set star rating
        let star = document.querySelector("#star-" + i);

        if(star !== null) {
            star.classList.remove("st-dark");
            star.classList.add("st-light");
        }
    }
}