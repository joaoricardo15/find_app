var server = true;
var url = "https://findserver.azurewebsites.net/positions";
var localPositions = [];
var uploadMyPositionTimer;
var updatePositionsTimer;
var updateInterval = 1000;
var uploadInterval = 1000;
var minimumPrecision = 0.0001;
var myPosition;
var myId;
var map;

function onMapReady() {
    
    myId = window.localStorage.getItem('myId');

    if(myId)
        initMap();
    else 
        initLogin();    
}

// function uploadMyPosition()
// {
//     navigator.geolocation.getCurrentPosition((position) => {

//         if(!myPosition || Math.abs(position.coords.latitude - myPosition.lat) > minimumPrecision || Math.abs(position.coords.longitude - myPosition.lng) > minimumPrecision)
//         {
//             myPosition = {lat: position.coords.latitude, lng: position.coords.longitude};
            
//             var data = {id: window.localStorage.getItem('myId'), lat: myPosition.lat, lng: myPosition.lng};

//             $.ajax({
//                 url: url,
//                 type: "POST",
//                 data: JSON.stringify(data),
//                 dataType: "json",
//                 contentType: "application/json; charset=utf-8",
//                 success: function(data, status){}
//             });
//         }
//     });
// }

function uploadMyPosition(position)
{
    myPosition = {lat: position.coords.latitude, lng: position.coords.longitude};
    
    var data = {id: myId, lat: myPosition.lat, lng: myPosition.lng};

    $.ajax({
        url: url,
        type: "POST",
        data: JSON.stringify(data),
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(data, status){}
    });
}

function updatePositions()
{
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(data, status){ updateMarkers(data) }
    });
}

function updateMarkers(positions)
{
    for(var position of positions)
    {
        if(position.id)    
        {
            var index = localPositions.findIndex(localPosition => localPosition.id === position.id);
            
            if(index > -1)
            {
                var lat = localPositions[index].marker.getPosition().lat();
                var lng = localPositions[index].marker.getPosition().lng();
            
                if(Math.abs(lat - position.lat) > minimumPrecision || Math.abs(lng - position.lng) > minimumPrecision)
                    localPositions[index].marker.setPosition({lat: position.lat, lng: position.lng});
            }
            else
            {
                var alphabet = [ 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];

                var index = alphabet.findIndex(letter => letter === position.id[0].toLowerCase());

                if(index < 1)
                    index = 1;

                var zIndex = index * position.id.length;

                var marker = new google.maps.Marker({
                    map: map,
                    title: 'Nome do herói: '+position.id,
                    position: {
                        lat: position.lat,
                        lng: position.lng
                    },
                    label: {
                        //color: '',
                        //fontFamily: '',
                        fontSize: '18px',
                        //fontWeight: '2px',
                        text: position.id.substring(0, 3)
                    },
                    //label: '<div style="font-size:20px;">'+position.id+'</div>',
                    //icon: 'images/bart-icon.png',
                    animation: google.maps.Animation.DROP,
                    //animation: google.maps.Animation.BOUNCE,
                    // icon: {
                    //     url: '/images/bart-icon.png',
                    //     // This marker is 20 pixels wide by 32 pixels high.
                    //     size: new google.maps.Size(20, 32),
                    //     // The origin for this image is (0, 0).
                    //     origin: new google.maps.Point(0, 0),
                    //     // The anchor for this image is the base of the flagpole at (0, 32).
                    //     anchor: new google.maps.Point(0, 32),
                    //     labelOrigin: new google.maps.Point(10, 20),

                    //   }
                    zIndex: zIndex
                });

                localPositions.push({
                    id: position.id,
                    marker: marker
                });
            }
        }
    }

    for(var localIndex in localPositions)
    {
        var index = positions.findIndex(position => position.id === localPositions[localIndex].id);
            
        if(index < 0 && localPositions[localIndex].id != myId)
        {
            localPositions[localIndex].marker.setMap(null);
            localPositions[localIndex] = null;
        }
    }
}

function login()
{
    var userName = document.getElementById('userName').value;

    if(userName != "")
    {
        myId = userName;
        window.localStorage.setItem('myId', userName);

        finishLogin();
        initMap();
    }    
}

function initMap()
{
    navigator.geolocation.getCurrentPosition((position) => {

        var divMap = document.createElement("div");
        divMap.id = "map";
        document.body.appendChild(divMap);

        map = new google.maps.Map(divMap, {
            center: {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            },
            zoom: 15
        });

        uploadMyPosition(position);
    });

    //uploadMyPositionTimer = setInterval(uploadMyPosition, uploadInterval);
    navigator.geolocation.watchPosition(uploadMyPosition);

    updatePositionsTimer = setInterval(updatePositions, updateInterval);
}

function initLogin()
{
    var idBar = document.createElement("div");
    idBar.innerHTML = '\
        <div id="loginBox">\
            <span id="loginTitle"> Insira aqui o seu nome de usuário</span></br>\
            <div id="loginBar">\
                <input id="userName" class="form-control" type="text" placeholder="Insert your user name (ex: joao)">\
                <button id="goButton" class="btn btn-default" type="button" onclick="login()">Go!</button>\
            </div>\
        </div>';
    idBar.id = "loginPage";
    document.body.appendChild(idBar);
}

function finishLogin()
{
    var idBar = document.getElementById("loginPage");
    document.body.removeChild(idBar);
}