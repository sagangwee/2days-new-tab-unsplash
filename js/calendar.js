window.onload = getSettings;
//var CLIENT_ID = '559223177845-pcv87vtaid3f0imeh6f3g7lc3hqtj1jv.apps.googleusercontent.com'; //chromebook
//var CLIENT_ID = '559223177845-orlvkhl9pkq9jf7f98gf7qepmp6iuqda.apps.googleusercontent.com'; //thinkpad
//var CLIENT_ID = '559223177845-tlcomk97jck9d9tjdr27hgs3eu95b5qi.apps.googleusercontent.com'; //desktop
//var CLIENT_ID = "559223177845-v4du335uoum4at9s27ego1qetif666db.apps.googleusercontent.com" //desktop local
var CLIENT_ID = '559223177845-t78ldg5pg7t7nqlskkuksqa6r3sl6l2e.apps.googleusercontent.com'; //published

var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly",
            "https://www.googleapis.com/auth/plus.login",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/calendar",
            "https://www.googleapis.com/auth/plus.me"];

var apiKey = "AIzaSyCdneDaG1uHV0gxjmmw6znWcemFamIy_yA"
var accessToken;

var today = new Date();
today.setHours(0,0,0,0);
var tomorrow = new Date(today.getTime() + (24 * 60 * 60 * 1000))
var todayList = document.getElementById("today-list");
var tomorrowList = document.getElementById("tomorrow-list");
var colors;
var settings;
var cal_counter = 0;

/*
var settings = {
    "displayedCals": {
        calId: {
            "name": event.summary
            "show": true/false
        },
    },
    "startHour": "6 AM",
    "endHour": "11 PM",
    "units": "°F"
}*/

function getSettings() {
    findExtFolder();
    startTime();

    document.body.classList.toggle('loaded');
    chrome.storage.sync.get("settings", function(obj) {
        if (!obj.settings) {
            var starter_settings = {
                "settings": {
                    "displayedCals": {/*
                        calId: {
                            "name": event.summary
                            "show": true/false
                        },
                    */},
                    "startHour": "6 AM",
                    "endHour": "11 PM",
                    "units": "°F",
                    "format": 12,
                    "location": "Berkeley, CA"
                },
                "note": "To Do:\n-resize page with ctrl +/- \n-open settings\n-upload wallpaper\n-enter location for weather\n-use 'New Bookmark' button to add bookmarks and/or folders\n-use Chrome Bookmark Manager to import exisiting bookmarks\n-click on extension icon to read Troubleshooting and FAQ\n-leave a review\n\nThanks for downloading 2Day's New Tab Extension!  We hope you make good use of our app and please send any issues, comments, or feedback in the link at the bottom of the FAQ. Thanks so much!"
            }
            chrome.storage.sync.set(starter_settings, function() {
                settings = starter_settings.settings;
                initNote();
                setGrid();
                loadWeather();
                setInterval(loadWeather, 10000);
                formSetTimeIntervals();
                handleClientLoadAuto();
            })
        } else {
            settings = obj.settings;
            initNote();
            setGrid();
            loadWeather();
            setInterval(loadWeather, 10000);
            formSetTimeIntervals();
            handleClientLoadAuto();
        }
    });
}

document.getElementById("authorize-button").addEventListener("click", handleAuthClick);

function handleAuthClick(event) {
  handleClientLoadAuto();
  // gapi.auth.authorize(
  //   {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
  //   handleAuthResult);
  //   return false;
}


var handleClientLoadAuto = function () {
  chrome.identity.getAuthToken({ 'interactive': true }, function(token) {
    accessToken = token;
    if (accessToken) {
      var authorizeBtn = document.getElementById('authorize-button');
      authorizeBtn.style.display = "none";
      loadCalendarApi();
    }
  });
  //gapi.client.setApiKey(apiKey);
  //window.setTimeout(checkAuthAuto, 1);
}

var checkAuthAuto = function () {
  // gapi.auth2.authorize(
  //   {
  //     'client_id': CLIENT_ID,
  //     'scope': "email profile openid",
  //     'response_type': 'id_token permission',
  //     'immediate': true
  //   }, function(response) {
  //     if (response.error) {
  //       // An error happened!
  //       return;
  //     }
  //     // The user authorized the application for the scopes requested.
  //     var accessToken = response.access_token;
  //     var idToken = response.id_token;
  //     // You can also now use gapi.client to perform authenticated requests.);
  //     })
}

function handleAuthResult(authResult) {
  // var authorizeBtn = document.getElementById('authorize-button');
  // if (authResult && !authResult.error) {
  //   // Hide auth UI, then load client library.
  //   authorizeBtn.style.display = "none";
  //   loadCalendarApi();
  // } else {
  //   // Show auth UI, allowing the user to initiate authorization by
  //   // clicking authorize button.
  // }
}

/**
* Load Google Calendar client library. List upcoming events
* once client library is loaded.
*/
function loadCalendarApi() {
  //gapi.client.load('calendar', 'v3', getColors);
  getColors();
}



function getColors() {
  // var crequest = gapi.client.calendar.colors.get({});
  // crequest.execute(function(response) {
  //   colors = response;
  //   getListOfCalendars();
  // })
  var xhr = new XMLHttpRequest();
  xhr.open('GET',
      'https://www.googleapis.com/calendar/v3/colors?' +
      'access_token=' + accessToken);
  xhr.onreadystatechange = function (e) {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      colors = xhr.response;
      getListofCalendars();
    }
  };
  xhr.responseType = "json";
  xhr.send(null);
}


function getListofCalendars() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET',
      'https://www.googleapis.com/calendar/v3/users/me/calendarList?' +
      'access_token=' + accessToken);
  xhr.onreadystatechange = function (e) {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      handleListOfCalendars(xhr.response);
    }
  };
  xhr.responseType = "json";
  xhr.send(null);
}

function handleListOfCalendars(response) {
    cal_counter++;
  //var cListRequest = gapi.client.calendar.calendarList.list({});
  //cListRequest.execute(function(response) {
    todayList.numItems = 0;
    tomorrowList.numItems = 0;
    todayList.numDayItems = 0;
    tomorrowList.numDayItems = 0;
    todayList.indexes = [];
    tomorrowList.indexes = [];
    
    var label = document.getElementById("time-labels").children[0].children[0];
    label.style.height = 0 + "px";
    
    for (i = 0; calendar_list.children.length > 0; i++) {
      calendar_list.removeChild(calendar_list.children[0]);
    }
    
    //Naive Synchronization (Only display if last API call)
    cal_counter--;
    if (cal_counter !== 0) {
      return;
    }
    
    var calendarList = response.items;
    for (var i = 0; i < calendarList.length; i++) {
        var cid = calendarList[i].id;
        if (!settings.displayedCals[cid]) {
            settings.displayedCals[cid] = {
                "name": calendarList[i].summary,
                "show": true
            }
        }
        addCalendarToSettings(calendarList[i]);
        if (settings.displayedCals[cid].show) {
            getUpcomingEvents(calendarList[i]);
        }
    }
}

function getUpcomingEvents(cal) {
  
  //CLear Displayed Events
  for (i = 0; i < todayList.children.length; i++) {
    slot = todayList.children[i]
    if (slot.children.length) {
      for (j = 0; slot.children.length > 0; j++) {
        slot.removeChild(slot.children[0]);
      }
      slot.numItems = null;
    }
  }

  for (i = 0; i < tomorrowList.children.length; i++) {
    slot = tomorrowList.children[i];
    if (slot.children.length) {
      for (j = 0; slot.children.length > 0; j++) {
        slot.removeChild(slot.children[0]);
      }
      slot.numItems = null;
    }
  }
  
  todayList.children[0].style.height = "0px";
  tomorrowList.children[0].style.height = "0px";

  var xhr = new XMLHttpRequest();
  xhr.open('GET',
      'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(String(cal.id)) +
      '/events?access_token=' + encodeURIComponent(accessToken) +
      '&maxResults=30' +
      '&timeMin=' + (new Date(today.getFullYear(), today.getMonth(), today.getDate())).toISOString() +
      '&showDelete=false' +
      '&singleEvents=true' +
      '&orderBy=startTime')
  xhr.onreadystatechange = function (e) {
    if(xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
      displayEvents(xhr.response, cal);
    }
  };
  xhr.responseType = "json";
  xhr.send(null);
  
  // var request = gapi.client.calendar.events.list({
  //   'calendarId': cal.id,
  //   'timeMin': (new Date(today.getFullYear(), today.getMonth(), today.getDate())).toISOString(),
  //   'showDeleted': false,
  //   'singleEvents': true,
  //   'maxResults': 30,
  //   'orderBy': 'startTime'
  // });
  // request.execute(function(response) {
  //   displayEvents(response, cal);
  // });
}

var a;
function displayEvents(response, cal) {
  a = response;
  events = response;
  var len = events.items.length;
  var i = 0;
  var loop = 1;

  while ((i < len) && loop) {
    if (events.items[i].start.dateTime) {
        var loop = displaySingleEvent(events.items[i], cal.colorId);
    } else if (events.items[i].start.date) {
        var loop = displayAllDayEvent(events.items[i], cal.colorId);
    }
    i++;
  }
}

function displayAllDayEvent(event, calColor) {
  todayList.style.zIndex = 50;
  var str = event.start.date;
  var startDate = new Date(str.slice(0,4), parseInt(str.slice(5,7)) - 1, str.slice(8,10));
  str = event.end.date;
  var endDate = new Date(str.slice(0,4), parseInt(str.slice(5,7)) - 1, str.slice(8,10));
  var div = document.createElement("div");
  div.style.borderRadius = "2px";
  div.style.position = "absolute";

  var dayList;
  var otherList;
    //cases: starts before today ends today; starts today ends today; starts today ends tomorrow;
    //       starts today ends after tomorrow; starts tomorrow ends tomorrow; starts tomorrow ends after tomorrow;
  if (endDate.getTime() < today.getTime() || startDate.getTime() > tomorrow.getTime()) {
    return 1;
  } else if (endDate.getTime() == tomorrow.getTime()) {
    var both = false;
    dayList = todayList;
    otherList = tomorrowList;
    div.style.width = "100%";
  } else if (startDate.getTime() == tomorrow.getTime()) {
    var both = false;
    dayList = tomorrowList;
    otherList = todayList;
    div.style.width = "100%";
  } else {
    var both = true;
    dayList = todayList;
    otherList = tomorrowList;
    div.style.width = "200%";
    otherList.numDayItems++;
  }
  dayList.numDayItems++;

  var label = document.getElementById("time-labels").children[0].children[0];
  var label_height = dayList.numDayItems;
  if (otherList.numDayItems > dayList.numDayItems) {
    label_height = otherList.numDayItems;
  }
  label.style.height = 20*label_height + "px";
  var slot = dayList.children[0];
  slot.style.height = 20*label_height + "px";
  var other_slot = otherList.children[0];
  other_slot.style.height = 20*label_height + "px";
  var name = document.createElement("p");
  name.style.zIndex = "inerit";
  name.style.paddingTop = "3px";
  name.innerHTML = event.summary;
  div.appendChild(name);

  var dateStr = document.createElement("p");
  var realEndDate = new Date(endDate.getTime() - (24 * 60 * 60 * 1000))
  if (startDate.getTime() == realEndDate.getTime()) {
    dateStr.innerHTML = startDate.getMonth() + "/" + startDate.getDate();
  } else {
    dateStr.innerHTML = startDate.getMonth() + "/" + startDate.getDate() + " - " +
        realEndDate.getMonth() + "/" + realEndDate.getDate()
  }
  div.appendChild(dateStr);

  var place = document.createElement("p");
  place.style.paddingBottom = "5px";
  if (event.location) {
    place.innerHTML = event.location;
  }
  div.appendChild(place);

  div.className = "event";
  div.style.maxWidth = "200%";

  if (event.colorId) {
    var RGB = colors.event[event.colorId].background;
  } else {
    var RGB = colors.calendar[calColor].background;
  }
  var A = 0.3;
  var colorStr = 'rgba('+parseInt(RGB.substring(1,3),16)+','+parseInt(RGB.substring(3,5),16)+','+parseInt(RGB.substring(5,7),16)+','+A+')';
  div.style.background = colorStr;
  div.defaultZIndex = dayList.numItems;
  div.style.zIndex = div.defaultZIndex;

  var i = 0;
  while($.inArray(i, dayList.indexes) != -1) {
    i++;
  }
  dayList.indexes.push(i);
  if (both) {
    otherList.indexes.push(i);
  }

  div.style.top = 20*(i) + "px"
  div.smallHeight = 20;
  div.style.height = "auto";
  setTimeout(function() {
    div.autoHeight = div.offsetHeight;
    if (div.autoHeight < div.smallHeight) {
      div.autoHeight = div.smallHeight;
    }
    div.style.height = "20px";
  }, 10);

  div.onmouseover = function(event){
    var item = event.target;
    item.style.zIndex = 9999;
    item.parentNode.style.zIndex = 9999;
    item.style.height = item.autoHeight + "px";
    div.style.background = "white";
  }

  div.onmouseout = function(event){
    var item = event.target;
    item.style.zIndex = event.target.defaultZIndex;
    item.parentNode.style.zIndex = 3;
    div.style.background = colorStr;
    div.style.height = "20px";
  }
  
  if (slot.children.length) {
    div.defaultZIndex = slot.children[slot.children.length - 1].style.zIndex;
    slot.insertBefore(div, slot.children[0]);
  } else {
    slot.appendChild(div);
  }

  slot.appendChild(div);
  return 1;
}

function displaySingleEvent(event, calColor) {
  var startTime = new Date(event.start.dateTime);
  var endTime = new Date(event.end.dateTime);
  var duration = endTime.getTime() - startTime.getTime();
  duration = duration/(1000 * 60 * 60);
  var offset = (startTime.getMinutes() / 60) * 100;
  var todayDate = new Date(today.getYear(), today.getMonth(), today.getDate());

  var dayList;
  if (startTime.getDate() == today.getDate() && startTime.getMonth() == today.getMonth()) {
    dayList = todayList;
  } else if (startTime.getDate() == tomorrow.getDate() && startTime.getMonth() == tomorrow.getMonth()) {
    dayList = tomorrowList;
  } else if (startTime.getTime() < today.getTime()) {
    return 1;
  } else {
    return 0;
  }

  var start_offset = parseInt(settings.startHour.slice(0, -3)) - 1;
  var slot = dayList.children[startTime.getHours() - start_offset];
  if (slot) {

  var div = document.createElement("div");
  var name = document.createElement("p");
  name.style.paddingTop = "3px";
  name.style.fontSize = "12pt";
  name.style.transition = "font-size 0.15s ease 0s";

  name.innerHTML = event.summary;
  div.appendChild(name);

  var dateStr = document.createElement("p");
  dateStr.innerHTML = formatAMPM(startTime) + " - " + formatAMPM(endTime);
  dateStr.style.fontSize = "12pt";
  dateStr.style.transition = "font-size 0.15s ease 0s";
  div.appendChild(dateStr);

  var place = document.createElement("p");
  if (event.location) {
    place.innerHTML = event.location;
  }
  place.style.fontSize = "12pt";
  place.style.transition = "font-size 0.15s ease 0s";
  div.appendChild(place);


  div.className = "event";

  if (event.colorId) {
    var RGB = colors.event[event.colorId].background;
  } else {
    var RGB = colors.calendar[calColor].background;
  }
  var A = 0.3;
  var colorStr = 'rgba('+parseInt(RGB.substring(1,3),16)+','+parseInt(RGB.substring(3,5),16)+','+parseInt(RGB.substring(5,7),16)+','+A+')';

  div.style.background = colorStr;
  div.style.width = "50%";
  div.style.top = offset + "%";
  div.style.flex = 1;

  var slot_index = slot.childNodes.length - 1;
  while (slot_index >= 0 && $.inArray(slot_index, slot.takenIndexes) != -1) {
    slot_index--;
  }
  if (slot_index < 0) {
    slot.appendChild(div);
  } else {
    slot.insertBefore(div, slot.childNodes[slot_index]);
  }
  setTimeout(function(){
    div.style.maxWidth = div.offsetWidth;
    div.style.width = "";
  })

  //2 heights: event duration height; hover height
  div.defaultHeight = (duration * 100) + "%";
  div.style.height = div.defaultHeight;
  div.smallHeight = div.offsetHeight;
  div.style.height = "auto";
  setTimeout(function() {
    div.autoHeight = div.offsetHeight;
    if (div.autoHeight < div.smallHeight) {
      div.autoHeight = div.smallHeight;
    }
    div.style.height = div.smallHeight + "px";
  }, 10);

  div.onmouseover = function(event){
    var item = event.target;
    item.style.zIndex = 9999;
    item.parentNode.style.zIndex = 9999;
    item.style.height = item.autoHeight + 25 + "px";
    div.style.background = "white";
    div.style.flex = dayList.numItems;
  }

  div.onmouseout = function(event){
    var item = event.target;
    item.style.zIndex = event.target.defaultZIndex;
    item.parentNode.style.zIndex = 3;
    item.style.height = item.smallHeight + "px";
    div.style.background = colorStr;
    div.style.width = "";
    div.style.flex = 1;
  }

  div.style.zIndex = div.defaultZIndex;
  dayList.numItems++;
  name.style.fontSize = "";
  dateStr.style.fontSize = "";
  place.style.fontSize = "";

  //spacer for overlapping divs

  var i;
  for (i = 1; i < Math.round(duration) + (startTime.getMinutes() / 60); i++) {
    sloti = dayList.children[startTime.getHours() - start_offset + i];
    while (sloti.numItems <= slot.numItems || sloti.numItems < 1) {
      spacer = document.createElement("div");
      spacer.style.flex = 1;
      sloti.appendChild(spacer);
      sloti.numItems++;
    }
    sloti.takenIndexes.push(slot.numItems);
  }

  slot.takenIndexes.push(slot.numItems);
  slot.numItems++;
  }
  return 1;

}

function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes;
  return strTime;
}

var date_back_btn = document.getElementById("date-back");
var date_forward_btn = document.getElementById("date-forward");
var today_label = document.getElementById("today-title");
var tomorrow_label = document.getElementById("tomorrow-title");

function date_back() {

  today = new Date(today.getTime() - (24 * 60 * 60 * 1000))
  tomorrow = new Date(tomorrow.getTime() - (24 * 60 * 60 * 1000))
  today_label.innerHTML = dayList[today.getDay()] + " " + (today.getMonth()+1) + "/" + today.getDate();
  tomorrow_label.innerHTML = dayList[tomorrow.getDay()] + " " + (tomorrow.getMonth()+1) + "/" + tomorrow.getDate();
  getListofCalendars();
  
}

function date_forward() {

  today = new Date(today.getTime() + (24 * 60 * 60 * 1000))
  tomorrow = new Date(tomorrow.getTime() + (24 * 60 * 60 * 1000))
  today_label.innerHTML = dayList[today.getDay()] + " " + (today.getMonth()+1) + "/" + today.getDate();
  tomorrow_label.innerHTML = dayList[tomorrow.getDay()] + " " + (tomorrow.getMonth()+1) + "/" + tomorrow.getDate();
  getListofCalendars();
  
}

date_back_btn.addEventListener("click", date_back);
date_forward_btn.addEventListener("click", date_forward);
