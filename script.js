function log(text) {
    console.log(text)
}

let intervalList = {}

function syncIntervals(calback, idName) {
    const now = new Date();
    const currentMilliseconds = now.getMilliseconds();
    const millisecondsUntilNextSecond = 1000 - currentMilliseconds;

    // Use setTimeout to wait for next second to start, then start the setInterval
    setTimeout(function () {
        calback();
        let id = setInterval(calback, 1000);

        intervalList[idName] && intervalList[idName].length > 0 ? intervalList[idName].push(id) : intervalList[idName] = [id]
    }, millisecondsUntilNextSecond);
}



function addEvent() {
    const newEventBtn = document.getElementById("addNew")
    const newEventName = document.getElementById("eventName").value;
    const eventName = newEventName ? newEventName : "New Event"
    const selectedDate = document.getElementById("eventDate").value
    const selectedTime = document.getElementById("eventTime").value
    const eventTime = new Date(selectedDate + " " + selectedTime).getTime()
    const currentTime = new Date().getTime();

    //if (eventTime > currentTime) {

    if (selectedTime === "") {
        validateDateTme();
        return;
    } else {}

    // Store the event in localStorage
    const event = {
        id: Date.now(),
        name: eventName,
        time: eventTime,
        isOut: JSON.parse(document.getElementById("outButton").value),
        endTime: false,
    };

    let cue = JSON.parse(localStorage.getItem('cue')) || [];
    cue.push(event);
    cue.sort((a, b) => a.time - b.time);
    localStorage.setItem('cue', JSON.stringify(cue));


    resetForm()
    renderCountdown(event)
    sortCountdownsDiv()
    document.getElementById('timeline').innerHTML = "";
    buildTimeline();

    /*  } else {
         setTimeout(() => {
             alert("Please enter a valid event name and a future event time.");
         }, 25)
     } */


    // Clar all selected
    document.querySelectorAll('.countdown-item').forEach(e =>
        e.classList.remove('selectedEvent'));


}


function renderCountdown(event) {

    const existingCountdownElement = document.getElementById(`countdown_${event.id}`);
    const localString = new Date(event.time).toLocaleString();
    const todayDateString = new Date().toLocaleString().split(",").slice(0, -1).join();
    const timeString = localString.split(" ").slice(-1).join();
    const dateString = localString.split(",").slice(0, -1).join();
    const eventTimeString = dateString === todayDateString ? timeString : dateString + " " + timeString

    let countdownElement = existingCountdownElement
    if (!existingCountdownElement) {

        countdownElement = document.createElement("div");
        countdownElement.className = `countdown-item ${event.time}`;
        countdownElement.id = `countdown_${event.id}`;
        document.getElementById("countdowns").appendChild(countdownElement);
    };



    function updateCountdown() {

        const now = new Date().getTime();
        const timeRemaining = event.time - now;


        // Started Events
        if (timeRemaining < 0 && !event.isOut) {

            countdownElement.classList.add("transitionToHistory");

            //remove event from countdowns
            setTimeout(function () {
                var element = document.getElementById(`countdown_${event.id}`);
                if (element) {
                    element.parentNode.removeChild(element);
                }
            }, 500);


            buildTable();

        } else { // Due events

            const isOutBtn = event.isOut ? `<button onclick="startEvent(${event.id})" class="largeBtn">Start Event</button>` : ""


            const countDownClock = `
            <div class='child1 unselectable'><b>${event.name}</b> at ${eventTimeString} starts in </div>
            <div class='child2 unselectable'><b>${formatCountDownClock(timeRemaining)}</b> </div>
            `
            const nowClock = `
            <div class='child1 unselectable'><b>${event.name}</b> is past due</div>
            <div class='child2 unselectable'><b>${formatNowClock()}</b> </div>
            `
            const clock = timeRemaining <= 0 && event.isOut ? nowClock : countDownClock


            countdownElement.innerHTML = `
            <div class='parent'>
                ${clock}
                ${isOutBtn}
                <button class="inEventDeleteBtn" onclick="deleteEvent(${event.id})">Delete</button>
            </div>
            `

            countdownElement.ondblclick = () => {
                setFormFromEvent(event)
            };


            if (timeRemaining <= 21000) {
                countdownElement.style.color = 'DarkOrange'
            }
            if (timeRemaining <= 6000) {
                countdownElement.style.color = 'red'
            }
            if (timeRemaining <= 0 && event.isOut) {
                countdownElement.style.color = 'black'
            }
        }
        //////////////////////////////////////////////////////////////////
    } // end of  function updateCountdown()


    updateCountdown();
    // custom setInterval
    syncIntervals(updateCountdown, "countDown")

}


function setEventsFromMemory() {

    let cue = JSON.parse(localStorage.getItem('cue'))

    if (cue && cue.length > 0) {

        // Load events from localStorage when the page loads
        for (let i = 0; i < cue.length; i++) {
            // const key = localStorage.key(i);

            let event = cue[i]

            renderCountdown(event);

        }
    }

}

function formatCountDownClock(ms) {
    const days = Math.floor(ms / (1000 * 60 * 60 * 24))
    const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
    const seconds = Math.floor((ms % (1000 * 60)) / 1000).toString().padStart(2, '0');

    let daysView = days > 0 ? days + "d" : ""

    return `${daysView} ${hours}h ${minutes}m ${seconds}s`;
}

function formatNowClock() {
    const now = new Date();
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const hours = now.getHours();
    const days = now.getDate() - 1;

    let daysView = days > 0 ? days + "d" : ""

    return `${hours}h ${minutes}m ${seconds}s`;
};

function formatTime(ms) {
    return new Date(ms).toISOString().split("T")[1].split(".")[0];
}



function deleteEvent(eventId, message = 'delete', callBack) {
    setTimeout(() => { // Allow 25ms for the btn animations 
        if (confirm(`Are you sure you want to ${message} this event?`)) {

            let cue = JSON.parse(localStorage.getItem('cue'))

            // Remove this id
            let newCue = cue.filter(e => e.id !== eventId)
            cue.sort((a, b) => a.time - b.time);
            // Write new cue
            localStorage.setItem('cue', JSON.stringify(newCue));

            // For modify function
            if (callBack) {
                callBack()
            };

            location.reload();
        };
    }, 25)
};


function clearAllEvents() {
    if (confirm("Are you sure you want to delete all events?")) {
        localStorage.removeItem("cue");

        // Refresh the page to get empty cue
        location.reload();
    }
}


function setFormFromEvent(event) {

    const tooltip = document.getElementById(`tooltip_${event.id}`);
    const countdown = document.getElementById(`countdown_${event.id}`);
    const isSelectedEvent = tooltip.classList.contains("selectedEvent");
    const outButton = document.getElementById("outButton");
    const newButton = document.getElementById('addNew');
    const updateButton = document.getElementById('updateBtn');




    if (isSelectedEvent) {

        resetForm()
        tooltip && tooltip.classList.remove('selectedEvent');
        countdown && countdown.classList.remove('selectedEvent');
        outButton.value = "false"

    } else {

        updateButton.firstElementChild.style.visibility = "visible"
        newButton.firstElementChild.style.visibility = "hidden"

        // Clear all selected to add to new selection
        document.querySelectorAll('.countdown-item').forEach(e =>
            e.classList.remove('selectedEvent'));


        const timelineToolTips = document.querySelectorAll('.tooltiptext')
        timelineToolTips.forEach(ch => {
            ch.classList.remove('selectedEvent')
        });


        // Setting Form
        // Name
        document.getElementById("eventName").value = event.name;

        //Date & Time
        let date = new Date(event.time).toISOString().slice(0, 10)
        let time = new Date(event.time).toISOString().slice(11, 19)

        document.getElementById("eventDate").value = date
        document.getElementById("eventTime").value = time

        // Out Btn
        event.isOut || event.endTime ? outButton.value = "true" : outButton.value = "false"
        event.isOut || event.endTime ? outButton.classList.add("selected") : outButton.classList.remove("selected");

        ///////////////


        // Set View update btn
        const updateBtn = document.getElementById(`updateBtn`);
        updateBtn.style = 'visibility: visible'

        updateBtn.classList.add('fadeIn')
        setInterval(() => updateBtn.classList.remove('fadeIn'), 1000)
        updateBtn.onclick = () => updateEvent(event);

        // Set View delete btn
        const formDeleteBtn = document.getElementById(`formDeleteBtn`);
        formDeleteBtn.style = 'visibility: visible'

        formDeleteBtn.classList.add('fadeIn')
        setInterval(() => formDeleteBtn.classList.remove('fadeIn'), 1000)
        formDeleteBtn.onclick = () => deleteEvent(event.id);

        // Make elements selected
        tooltip.classList.add('selectedEvent')
        countdown && countdown.classList.add('selectedEvent')
        shineAnimation('eventForm')
    }


    validateDateTme();
};


function updateEvent(event) {
    deleteEvent(event.id, 'update', addEvent)
}


function resetForm() {
    document.getElementById("eventName").value = "";
    document.getElementById("eventDate").value = new Date().toISOString().slice(0, 10)
    document.getElementById("eventTime").value = ""
    const outButton = document.getElementById("outButton")
    outButton.classList.remove("selected");
    outButton.value = "false"

    const selectedDateEl = document.getElementById("eventDate")
    const selectedTimeEL = document.getElementById("eventTime")
    selectedDateEl.classList.remove('inputInvalid')
    selectedTimeEL.classList.remove('inputInvalid')

    ///  Update and Delete Btn

    const updateBtn = document.getElementById("updateBtn")
    const formDeleteBtn = document.getElementById(`formDeleteBtn`);
    const newButton = document.getElementById('addNew')
    updateBtn.style = 'visibility: hidden'
    formDeleteBtn.style = 'visibility: hidden';



    updateBtn.firstElementChild.style.visibility = ""
    newButton.firstElementChild.style.visibility = "visible"
    shineAnimation('eventForm')
};


function buildTable() {

    var table = document.querySelector("table");

    let cue = JSON.parse(localStorage.getItem('cue'))
    let oldEvents = cue.filter(e => e.time - new Date().getTime() <= 0 && !e.isOut)
    let deleteAllEventsBtn = `<div class='child5 unselectable'><button class="inEventDeleteBtn" onclick="clearAllEvents()">Clear Event History</button></div>`



    if (oldEvents.length != table.rows.length - 2) { // -2 because there are 2 header rows
        console.log("build table")
        // clear and rebuild table
        table.innerHTML = `
        <tr>
           <th id="historyRow" colspan="4">${deleteAllEventsBtn}</th>
        </tr>
        <tr>
          <th>TC In</th>
          <th>TC Out</th>
          <th>Description</th>
          <th></th>
        </tr>`

        for (let i = 0; i < oldEvents.length; i++) {

            let event = oldEvents[i]

            let evStartTime = event.endTime ? "" : formatTime(event.time)
            let evEndTime = event.endTime ? formatTime(event.time) : ""
            let deleteBtn = `<div class='child5 unselectable'><button class="inEventDeleteBtn" onclick="deleteEvent(${event.id})">Delete</button></div>`

            var newRow = table.insertRow(-1); // Insert at the end of the table

            var startDate = newRow.insertCell(0);
            var endTime = newRow.insertCell(1);
            var description = newRow.insertCell(2);
            var deleteRow = newRow.insertCell(3);

            startDate.innerHTML = evStartTime;
            endTime.innerHTML = evEndTime
            description.innerHTML = event.name
            deleteRow.innerHTML = deleteBtn


            //Fade in on last cell in table5
            // if it's last row and event time has past in the last 3 seconds
            if (i === oldEvents.length - 1 && event.time > new Date() - 2000) {
                newRow.classList.add("fadeInAndGrow")
                const cells = newRow.getElementsByTagName("td");
                for (let i = 0; i < cells.length; i++) {
                    cells[i].classList.add("fadeInAndGrow");
                }

            }
        }
    }

}





function startEvent(eventId) {

    let cue = JSON.parse(localStorage.getItem('cue'))

    let eventToOut = cue.find(e => e.id === eventId)
    eventToOut.time = Date.now();
    eventToOut.isOut = !eventToOut.isOut
    eventToOut.endTime = true

    let clearEventToOut = cue.filter(e => e.id !== eventId)

    clearEventToOut.push(eventToOut)

    clearEventToOut.sort((a, b) => a.time - b.time);
    localStorage.setItem('cue', JSON.stringify(clearEventToOut));

    // Refresh the page to get new cue
    // location.reload();

    const thisEventElement = document.getElementById(`countdown_${eventId}`)
    thisEventElement.classList.add("transitionToHistory")

    setTimeout(function () {
        var element = document.getElementById(`countdown_${eventId}`);
        if (element) {
            element.parentNode.removeChild(thisEventElement);
        }
    }, 500); // Adjust the delay time as needed


    sortCountdownsDiv()
    document.getElementById('timeline').innerHTML = "";
    buildTimeline();

}

function buildTimeline() {

    const timelineData = JSON.parse(localStorage.getItem('cue'));
    const timeline = document.getElementById('timeline');



    if (!timelineData || timelineData.length === 0) {
        timeline.style.visibility = 'hidden'
        return
    } else {
        timeline.style.visibility = 'visible'
    };


    // Reset all intervals for liveMarker
    if (intervalList["liveMarker"]) {
        //console.log(intervalList["liveMarker"])
        intervalList["liveMarker"].reverse().forEach(id => {
            clearInterval(id);
            // console.log("clearing ids: " + id)
            intervalList["liveMarker"] = intervalList["liveMarker"].filter(e => e != id)
            //console.log(intervalList["liveMarker"])
        });
    }
    //console.log(intervalList["liveMarker"])

    // Crete Markers
    for (let i = 0; i < timelineData.length; i++) {

        let event = timelineData[i]


        const marker = document.createElement('div');
        marker.classList.add('marker');
        marker.style.left = calculateMarkerPosition(event.time).position + 'px';
        marker.title = event.name;

        if (event.isOut || event.endTime) {
            marker.classList.add('markerIsOut')
        }


        const tooltip = document.createElement('span');
        tooltip.classList.add('tooltiptext');
        tooltip.innerHTML = `${event.name}<br>${new Date(event.time).toLocaleString().split(" ").slice(-1).join()}`;
        tooltip.id = `tooltip_${event.id}`

        marker.appendChild(tooltip);
        timeline.appendChild(marker);

        marker.addEventListener('dblclick', () => {
            setFormFromEvent(event)
        });



        if (i === timelineData.length - 1) { // bring tooltip to front for ever, not implemented
            //tooltip.style = 'z-index: 10000';
        }

    };

    /// Shine on last created
    const lastCreatedEvent = timelineData.slice().sort((a, b) => a.id - b.id).slice(-1)[0];
    shineAnimation(`tooltip_${lastCreatedEvent.id}`)


    function calculateMarkerPosition(time) {
        const startDate = timelineData[0].time;
        const endDate = timelineData[timelineData.length - 1].time;
        const eventDate = time;
        const totalMilliseconds = eventDate - startDate;
        const timelineWidth = timeline.offsetWidth - 3; // Subtract marker width

        // Adjust the scaling factor based on the range between start and end dates
        const scaleFactor = timelineWidth / (endDate - startDate);

        // Add 3 pixel to the position for the first marker
        const position = Math.round(totalMilliseconds * scaleFactor) + (timelineData[0].time === time ? 3 : 0);
        return {
            position,
            timelineWidth
        }
    }


    // Live Marker
    const liveMarker = document.createElement('div');
    liveMarker.classList.add('live-marker');
    timeline.appendChild(liveMarker);


    function updateLiveMarker() {

        const now = Date.now();
        const {
            position,
            timelineWidth
        } = calculateMarkerPosition(now);

        /* log('timelineWidth: ' + timelineWidth)
        log('position: ' + position) */

        let arrowLeft = document.getElementById('arrow-left')
        let arrowRight = document.getElementById('arrow-right')

        if (position < 0) {
            // Before timeline

            arrowLeft.style.visibility = 'visible'
            arrowRight.style.visibility = 'hidden'

            liveMarker.style.visibility = 'hidden'

        } else if (position > timelineWidth) {
            // Past timeline

            arrowLeft.style.visibility = 'hidden'
            arrowRight.style.visibility = 'visible'

            liveMarker.style.visibility = 'hidden'

        } else { // Normal

            arrowLeft.style.visibility = 'hidden'
            arrowRight.style.visibility = 'hidden'

            liveMarker.style.visibility = 'visible'
            liveMarker.style.left = position + 'px';
        }
    }
    // Update the live marker every second
    updateLiveMarker();
    // custom setInterval
    syncIntervals(updateLiveMarker, "liveMarker")

}




function sortCountdownsDiv() {
    var countdownsDiv = document.getElementById('countdowns');
    var divs = countdownsDiv.getElementsByTagName('div');
    var listitems = [];
    for (i = 0; i < divs.length; i++) {

        let divClass = divs[i].getAttribute('class')
        let inneHtml = divs[1].innerHTML
        if (divClass.startsWith("countdown-item")) {
            let time = divClass.split(" ")[1]
            listitems.push({
                time: time,
                el: divs.item(i)
            });
        }
    }
    listitems.sort(function (a, b) {
        var compA = Number(a.time);
        var compB = Number(b.time);
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    });
    for (i = 0; i < listitems.length; i++) {
        countdownsDiv.appendChild(listitems[i].el);
    }
}


/** 
 * @param {string} elementId - html element id
 */
function shineAnimation(elementId) {
    const element = document.getElementById(elementId)
    if (element) {
        element.style.animation = 'shine 0.5s ease-in forwards';
        setTimeout(() => element.style.removeProperty('animation'), 500)
    }
};


function validateDateTme() {

    const newEventBtn = document.getElementById("addNew")
    const selectedDateEl = document.getElementById("eventDate")
    const selectedTimeEL = document.getElementById("eventTime")
    const selectedDate = selectedDateEl.value;

    const selectedTime = selectedTimeEL.value;
    const eventTime = new Date(selectedDate + " " + selectedTime).getTime()

    const currentTime = new Date().getTime();
    const selectedHour = Number(selectedTime.split(":")[0])
    const nowHour = new Date(currentTime).getHours()

    let currentDateFormat = new Date(new Date().toISOString().split("T")[0]).getTime()
    let selectedDateFormat= new Date(new Date(selectedDate).toISOString().split("T")[0]).getTime()
  
    let dateIsValid = selectedDateFormat >= currentDateFormat

    let timeIsValid = selectedTime !== "" && eventTime >= currentTime

    // Date
    if (dateIsValid) {
        selectedDateEl.classList.remove('inputInvalid')
    } else {
        selectedDateEl.classList.add('inputInvalid')
    }

    //Time
    if (timeIsValid) {
        selectedTimeEL.classList.remove('inputInvalid')
        newEventBtn.style.color = 'white'
    } else if (selectedTime == "") {
        newEventBtn.style.color = "grey"
        selectedTimeEL.classList.add('inputInvalid')

    } else if (selectedHour <= 5 && nowHour >= 5) {

        newEventBtn.style.color = 'white'
        const oneDayMilliseconds = 24 * 60 * 60 * 1000;
        selectedDateEl.value = new Date(new Date().getTime() + oneDayMilliseconds).toISOString().slice(0, 10)

        shineAnimation(selectedDateEl.id)

    } else {
        newEventBtn.style.color = 'white'
        selectedTimeEL.classList.add('inputInvalid')
    }
};



function toggleOutBtnState() {
    const outButton = document.getElementById("outButton");


    if (outButton.value === "false") {
        outButton.value = "true"
        outButton.classList.add("selected");
    } else {
        outButton.value = "false"
        outButton.classList.remove("selected");
    }
    console.log("is type Out: " + outButton.value)
}

function setEventListeners() {

    let eventDate = document.getElementById("eventDate");
    let eventTime = document.getElementById("eventTime");
    let eventName = document.getElementById("eventName");
    let outButton = document.getElementById("outButton");
    let updateBtn = document.getElementById("updateBtn");
    let addNew = document.getElementById("addNew");


    // Form
    eventDate.addEventListener('dblclick', () => {
        const nowDate = new Date().toISOString().slice(0, 10)
        const isSameDate = eventDate.value === nowDate
        if (!isSameDate) {
            eventDate.value = nowDate
            shineAnimation('eventDate')
        }
    });
    eventTime.addEventListener('dblclick', () => {
        eventTime.value = new Date().toISOString().slice(11, 19)
        shineAnimation('eventTime')
    });
    /* outButton.addEventListener('click', () => {
        toggleOutBtnState()
    }) */


    let arrForDateTime = [eventDate, eventTime]
    for (let i = 0; i < arrForDateTime.length; i++) {
        arrForDateTime[i].addEventListener('input', () => {
            validateDateTme()
        })
        arrForDateTime[i].addEventListener('change', () => {
            validateDateTme()
        })
        arrForDateTime[i].addEventListener('dblclick', () => {
            validateDateTme()
        })
    };
    ////////////////////////////////

    // Press return to create new event

    //
    let arrForKeypress = [eventDate, eventTime, eventName, outButton, addNew]


    for (let i = 0; i < arrForKeypress.length; i++) {

        arrForKeypress[i].addEventListener("keypress", function (event) {

            if (event.key === "Enter") {
                // Cancel the default action, if needed
                event.preventDefault();

                let isSelected = document.querySelectorAll('.selectedEvent').length > 0

                if (isSelected) {

                    updateBtn.click();

                } else {
                    addNew.click();
                }


            };
        });
    };
    ////////////////////////////////////

    //Reset timeline on window resize 
    //(timeline uses the width of the timeline element to calculate event position)
    window.addEventListener("resize", function () {
        setTimeout(function () {
            document.getElementById('timeline').innerHTML = "";
            buildTimeline();

        }, 500); // Adjust the delay time as needed
    });
    ////////////////////////////////////
    let timelineContainer = document.querySelector('.timeline-container');
    let originalPosition = timelineContainer.offsetTop;

    window.addEventListener('scroll', () => {
        var timelineContainerRect = timelineContainer.getBoundingClientRect();
        var countdowns = document.getElementById('countdowns');
        if (timelineContainerRect.top <= 0) {
            timelineContainer.classList.add('fixed');

            countdowns.style.marginTop = timelineContainer.offsetHeight + 25 + "px"
            // margin:220

        } else {
            timelineContainer.classList.remove('fixed');
            countdowns.style.marginTop = "0"
        }

        // Check if the element has returned to its original position on the page
        if (window.scrollY <= originalPosition) {
            timelineContainer.classList.remove('fixed');
            countdowns.style.marginTop = "0"
        }
    });
    ////////////////////////////////////

}; // end of  function setEventListeners()




// Page Main CLock
function setMainPageClock() {
    const nowClock = formatNowClock()
    document.getElementById("pageClock").textContent = nowClock
    // document.title = nowClock
}



window.onload = function () {
    setMainPageClock()
    syncIntervals(setMainPageClock, "pageClock")

    setEventsFromMemory();
    buildTimeline();
    setEventListeners();

    //////////////////////////////////

    // Set default date to today
    eventDate.value = new Date().toISOString().slice(0, 10)

    /*     document.addEventListener("visibilitychange", (event) => {
            let isTabVisible = document.visibilityState === 'visible'
            if (isTabVisible) {
                window.screensaver.start();
                log("visible")
            } else {
                window.screensaver.

                log("not visible")
            }

        }); */


    console.log(localStorage.getItem('cue'))
    //console.log(JSON.parse(localStorage.getItem('cue')))
};