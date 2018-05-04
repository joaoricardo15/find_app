var server = true;
var url = "https://findserver.azurewebsites.net/positions";
var minimumPrecision = 0.0001;
var updateInterval = 1000;
var updatePositionsTimer;
var localPositions = [];
var positionWatch;
var myPosition;
var myId;
var map;
var markerCluster;

function onMapReady() {
    
    myId = window.localStorage.getItem('myId');

    if(myId)
        initMap();
    else 
        initLogin();    
}

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
    if(positions.length > 0)
    {
        var markers = [];

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
                            //color: 'white',
                            //fontFamily: '',
                            //fontSize: '25',
                            //fontWeight: '5',
                            text: position.id.substring(0, 3)
                        },
                        animation: google.maps.Animation.DROP,
                        icon: {
                            url: 'images/Homer_128px.png',
                            //size: new google.maps.Size(128, 128),
                            //origin: new google.maps.Point(0, 0),
                            //anchor: new google.maps.Point(0, 32),
                            labelOrigin: new google.maps.Point(71, 71)
                        },
                        zIndex: zIndex
                    });

                    localPositions.push({
                        id: position.id,
                        marker: marker
                    });

                    markerCluster.addMarker(marker, true);
                }
            }
        }
        
    }
    
    // retira os marcadores que não estão no servidor
    for(var localIndex in localPositions)
    {
        if(localPositions[localIndex])
        {
            var index = positions.findIndex(position => position.id === localPositions[localIndex].id);
                
            if(index < 0)
            {   
            
                if(localPositions[localIndex].id === myId)
                {
                    // para o watch antes de catar nova location
                    navigator.geolocation.clearWatch(positionWatch);
                    navigator.geolocation.getCurrentPosition((position) => {
                        uploadMyPosition(position);
                        positionWatch = navigator.geolocation.watchPosition(uploadMyPosition);
                    });
                }
                else
                {
                    localPositions[localIndex].marker.setMap(null);
                    markerCluster.removeMarker(localPositions[localIndex].marker);
                    localPositions[localIndex] = null;
                    localPositions.splice(localIndex,1);
                }
            }
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

        markerCluster = new MarkerClusterer(map, [], {
            //maxZoom: 17,
            gridSize: 30,
            minimumClusterSize: 2,
            styles: [
                {
                    url: 'images/Simpsons_128px.png',
                    width: 170,
                    height: 145,
                    anchor: [18, 52],
                    //textSize: 22,
                    textColor: 'white',
                    iconAnchor: [55, 120]
                }
            ],
            imagePath: 'images/'
        });

        uploadMyPosition(position);

        positionWatch = navigator.geolocation.watchPosition(uploadMyPosition);
    });
    
    updatePositionsTimer = setInterval(updatePositions, updateInterval);
}

function initLogin()
{
    var idBar = document.createElement("div");
    idBar.innerHTML = '\
        <div id="loginBox">\
            <span id="loginTitle"> Insira aqui o no de usuario que voce quer utilizar</span></br>\
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