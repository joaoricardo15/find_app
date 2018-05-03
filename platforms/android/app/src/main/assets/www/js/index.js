var server = true;
var myId;
var url = "https://findserver.azurewebsites.net/positions";
var localPositions = [];
var uploadMyPositionTimer;
var updatePositionsTimer;
var updateInterval = 1000;
var uploadInterval = 1000;
var minimumPrecision = 0.0001;
var myPosition;
var myLastPosition;
var map;
var idBar;

function initMap() {
    
    myId = window.localStorage.getItem('myId');

    if(myId){

        navigator.geolocation.getCurrentPosition((position) => {
        
            myPosition = {lat: position.coords.latitude, lng: position.coords.longitude};
    
            map = new google.maps.Map(document.getElementById('map'), {
                center: myPosition,
                zoom: 15
            });
        });

        clearInterval(uploadMyPositionTimer);
        uploadMyPositionTimer = setInterval(uploadMyPosition, uploadInterval);
        clearInterval(updatePositionsTimer);
        updatePositionsTimer = setInterval(updatePositions, updateInterval);
    }   
    else {
        idBar = document.createElement("div");
        idBar.innerHTML = '\
            <div style="width:89%;padding-top:8px;padding-bottom:8px;display:inline-flex;">\
                <input id="userName" type="text" class="form-control" placeholder="Insert your user name (ex: joao)">\
                <span class="input-group-btn">\
                    <button class="btn btn-default" type="button" onclick="getUserName()">Go!</button>\
                </span>\
            </div>';
        document.body.appendChild(idBar);  
    }   
}

//function onSuccess(position) {}

//function onError(error) {}

//var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

function uploadMyPosition()
{
    navigator.geolocation.getCurrentPosition((position) => {

        myPosition = {lat: position.coords.latitude, lng: position.coords.longitude};

        if(!myLastPosition || Math.abs(myPosition.lat - myLastPosition.lat) > minimumPrecision || Math.abs(myPosition.lng - myLastPosition.lng) > minimumPrecision)
        {
            var data = {id: myId, lat: myPosition.lat, lng: myPosition.lng};

            $.ajax({
                url: url,
                type: "POST",
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json; charset=utf-8",
                success: function(data, status){}
            });

            myLastPosition = myPosition;
        }
        
    });
}

function updatePositions()
{
    $.ajax({
        url: url,
        type: "GET",
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        success: function(data, status){
            updateMarkers(data);
        }
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
                        fontWeight: '2px',
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
            
        if(index < 0)
        {
            localPositions[localIndex].marker.setMap(null);
            localPositions[localIndex] = null;
        }
   }
}

function getUserName()
{
    var userName = document.getElementById('userName').value;

    if(userName != "")
    {
        myId = userName;
        window.localStorage.setItem('myId', userName);

        navigator.geolocation.getCurrentPosition((position) => {
        
            myPosition = {lat: position.coords.latitude, lng: position.coords.longitude};
    
            map = new google.maps.Map(document.getElementById('map'), {
                center: myPosition,
                zoom: 15
            });
        });

        uploadMyPositionTimer = setInterval(uploadMyPosition, uploadInterval);
        updatePositionsTimer = setInterval(updatePositions, updateInterval);

        idBar.remove()
    }    
}