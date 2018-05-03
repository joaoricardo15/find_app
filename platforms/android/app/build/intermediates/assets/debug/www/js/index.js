var server = true;
var myId;
var myLastId;
var url = "https://findserver.azurewebsites.net/positions";
var localPositions = [];
var updateInterval = 1000;
var uploadMyPositionTimer;
var updatePositionsTimer;
var uploadInterval = 1000;
var minimumPrecision = 0.0001;
var myPosition;
var myLastPosition;
var map;

function initMap() {
    navigator.geolocation.getCurrentPosition((position) => {
        
        myPosition = {lat: position.coords.latitude, lng: position.coords.longitude};

        map = new google.maps.Map(document.getElementById('map'), {
            center: myPosition,
            zoom: 15
        });
    });
}

//function onSuccess(position) {}

//function onError(error) {}

//var watchID = navigator.geolocation.watchPosition(onSuccess, onError, { timeout: 30000 });

function uploadMyPosition()
{
    navigator.geolocation.getCurrentPosition((position) => {

        myPosition = {lat: position.coords.latitude, lng: position.coords.longitude};

        if(!myLastPosition || myId != myLastId || Math.abs(myPosition.lat - myLastPosition.lat) > minimumPrecision || Math.abs(myPosition.lng - myLastPosition.lng) > minimumPrecision)
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

            if(myId != myLastId)
                myLastId = myId;
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
                        fontSize: '15px',
                        fontWeight: '5px',
                        text: position.id
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
                    zIndex: 1
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
        var index = positions.findIndex(position => position.id === localPosition.id);
            
        if(index < 0)
        {
            localPositions[localIndex].marker.setMap(null);
            localPositions[localIndex] = null;
        }
   }
}

function updateUserName()
{
    var userName = document.getElementById('userName').value;

    if(userName != "" && userName != myLastId)
    {
        myId = userName;

        clearInterval(uploadMyPositionTimer);
        uploadMyPositionTimer = setInterval(uploadMyPosition, uploadInterval);
        clearInterval(updatePositionsTimer);
        updatePositionsTimer = setInterval(updatePositions, updateInterval);
    }    
}