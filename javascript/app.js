function initMap() {
	coordinates = {lat: latitude, lng: longitude};
	map = new google.maps.Map(document.getElementById('map'), {
	  zoom: 10,
	  center: coordinates
	});

	marker = new google.maps.Marker({
	  position: coordinates,
	  map: map
	});	
}

var latitude = "";
var longitude = "";
var map;
var marker;
var coordinates;
var script;
var rowSelected;
      
///////////////////// STARTING DOCUMENT ON READY ///////////////

$(document).on('ready', function (){

///////  LAUNCH MY SAVED CONCERTS WINDOW //////////
	$("#seeSaved").on("click", function(){
		$("#pop").css("display", "block");
		$('#mapRow').removeClass('hide');

	});//end of event for see my concerts


	$("#theX").on("click", function(){
		$("#pop").css("display", "none");
	});//End of popwindow closer

    // Initialize variables for google API
    var city = "";
    var state = "";
    var zipCode = "";
    var forecastArray = [];
    var queryZipURL = "";
	var startDate;
	var endDate;
	var jambaseQueryURL;
	var event = {};
	var artistName;
	var venueName;
	var venueAddress; 
	var eventDate;
	var eventArray = [];

	var forecastIndex = 0;

	var config = {
		// Anita's Firebase
		apiKey: "AIzaSyDOIoquUe1iXuYzqu6VvpOBbHVJbCUhK1Y",
    	authDomain: "anitaproject1.firebaseapp.com",
    	databaseURL: "https://anitaproject1.firebaseio.com",
    	storageBucket: "anitaproject1.appspot.com",
    	messagingSenderId: "163725238244"

    	//Zach's Firebase
        // apiKey: "AIzaSyBjAys6Wyrn9H6zcbpxIdDRvNfKEqTZtCs",
        // authDomain: "groupprojectcodi-1488653714316.firebaseapp.com",
        // databaseURL: "https://groupprojectcodi-1488653714316.firebaseio.com",
        // storageBucket: "groupprojectcodi-1488653714316.appspot.com",
        // messagingSenderId: "681410190421"
    };

    firebase.initializeApp(config);

	$("#startDateInput").datepicker();

	$("#endDateInput").datepicker();

	$("#startDateInput").change(function(){
		startDate = moment($("#startDateInput").val()).format().slice(0,13);
	});

	$("#endDateInput").change(function(){
		endDate = moment($('#endDateInput').val()).format().slice(0,13);
	})		
	
	////////// starting click handler for submit button.   //////////////////
	$('#search').on('click', function(){
		clearOldData();
		var addHeaderRow = $("#concertTable");
		var headerRow = $("<tr>");
		headerRow.append("<th>Artist</th>");
		headerRow.append("<th>Venue</th>");
		headerRow.append("<th>Date</th>");
		headerRow.append("<th>Save</th>");
		addHeaderRow.append(headerRow);
		city = $("#cityInput").val();
		state = $("#stateInput").val();
	    // First ajax call to get latitude and longitude from google
		$.ajax({
	        url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + city + "+" + state + "&sensor=true",
	        method: "GET"
	      }).done(function(response) {
			if (response.status === "ZERO_RESULTS") {

				$(".errorMessages").html("City/State are invalid");
				$(".errorMessages").css("display", "block")
			} else if (startDate > endDate) {
				$(".errorMessages").html("End date must be after start date");
				$(".errorMessages").css("display", "block")
			}
			else {
				$(".errorMessages").css("display", "none");

				latitude = response.results[0].geometry.location.lat;
				longitude = response.results[0].geometry.location.lng;
				
				//this adds the script tag for the map
				script = $('<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDcg7dc9u-CVCPWxCPVW-3SsVeSL9caXcI&callback=initMap" type="text/javascript"></script>');	
				$("body").append(script);
			}
		});
		// zipCode = 78701;

		//Ajax call to use latitude and longitude to get zip code
		$('#mapRow').removeClass('hide');
		//got an extra API key for zipwise. Change which row is commented to switch between them.
		
		// queryZipURL = "https://www.zipwise.com/webservices/citysearch.php?key=qkgfv1x9ijil1ftw&format=json&string=" 
		queryZipURL = "https://www.zipwise.com/webservices/citysearch.php?key=3hvbj4tu3e0sp7fy&format=json&string=" 
      		+ city + "&state=" + state;
		$.ajax({
			url: queryZipURL,
			method: "GET"
		}).done(function(response) {
			//THIS NEEDS TO GO BACK IN THE FINAL VERSION!!!
			if(response && response.results[0] && response.results[0].zip) {
				zipCode = response.results[0].zip;
			// zipCode = 78701;
				jambaseQueryURL = 'http://api.jambase.com/events?zipCode='+zipCode+
										'&radius=10&startDate='+startDate+
										'%3A00%3A00&endDate='+endDate+
										// '%3A00%3A00&page=0&api_key=8fyq9sabmukrkq5fa8grq6qd';
										//extra api key
										'%3A00%3A00&page=0&api_key=tce5wmzuk9w333ns7nv4xsv9';
				$.ajax({
						url: jambaseQueryURL,
						method: "GET"
				}).done (function(snap){
					eventArray = snap.Events;
					for (var i=0; i<eventArray.length; i++) {
						artistName = eventArray[i].Artists.map(function(artist) {
							return artist.Name;
						}).join("<br>");
						venueName = eventArray[i].Venue.Name;
						venueAddress = eventArray[i].Venue.Address;
						eventDate = eventArray[i].Date.slice(0,10);
						eventDate = moment(eventDate).format('dddd MMM Do');

						var addRow = $("#concertTable");

						var columnArtist = $("<td>" + artistName + "</td>");
						columnArtist.attr("class", "table-data");
						columnArtist.attr("value", i);

						var columnVenue = $("<td>" + venueName + "</td>");
						columnVenue.attr("class", "table-data");
						columnVenue.attr("value", i);

						var columnDate = $("<td>" + eventDate + "</td>");
						columnDate.attr("class", "table-data");
						columnDate.attr("value", i);

						var columnSaveData = $("<td>");

						var columnSaveButton = $("<button>SAVE</button>");
						columnSaveButton.attr("class", "btn btn-default save-button");
						columnSaveButton.attr("type", "button");
						columnSaveButton.attr("value", i);
						columnSaveData.append(columnSaveButton);

						var newRow = $("<tr class= \"concert-row\">");
						newRow.append(columnArtist);
						newRow.append(columnVenue);
						newRow.append(columnDate);
						newRow.append(columnSaveData);
						addRow.append(newRow);
					}

					$(document).on("click", ".table-data", function(){
						var thisValue = $(this).attr("value");
						latitude = eventArray[thisValue].Venue.Latitude;
						longitude = eventArray[thisValue].Venue.Longitude;
						
						if (latitude != 0) {
							var new_marker_position = new google.maps.LatLng(latitude, longitude);
							marker.setPosition(new_marker_position);
							map.panTo(marker.getPosition(new_marker_position));
							map.setZoom(15)
						}
					});

				});
			}
			
		})

	    //ajax call to get information from Weather Underground
		$.ajax({
        	url: "https://api.wunderground.com/api/0b14145e9f9901bc/forecast10day/q/" +
          	state + "/" + city + ".json",
        	method: "GET"
      	}).done(function(response) {
      		for (i = 0; i < 10; i++) {
	      		var highTemp = response.forecast.simpleforecast.forecastday[i].high.fahrenheit;
	      		var lowTemp = response.forecast.simpleforecast.forecastday[i].low.fahrenheit;
	      		var iconImg = response.forecast.simpleforecast.forecastday[i].icon_url;
	      		var month = response.forecast.simpleforecast.forecastday[i].date.month;
	      		var day = response.forecast.simpleforecast.forecastday[i].date.day;
	      		var year = response.forecast.simpleforecast.forecastday[i].date.year;
	      		forecastArray.push({
	      			highTemp: highTemp,
	      			lowTemp: lowTemp,
	      			iconImg: iconImg,
	      			month: month,
	      			day: day,
	      			year: year
	      		})
      		}

      		$("#weatherDate").html(forecastArray[forecastIndex].month + "/" + forecastArray[forecastIndex].day);
      		
      		$("#highTemp").html(forecastArray[forecastIndex].highTemp + String.fromCharCode(176) + "F");
      		
      		$("#lowTemp").html(forecastArray[forecastIndex].lowTemp + String.fromCharCode(176) + "F");
      		
      		var image = $("<img>");    		
      		image.attr("src", forecastArray[forecastIndex].iconImg);
      		
      		var addImage = $("#weatherImg").append(image);
      		
      		$("#leftArrow").on("click", function(){
      			if (forecastIndex == 0) {}
      				else {
      					forecastIndex --;
      					updateWeatherInfo();
      				}
      		});

      		$("#rightArrow").on("click", function(){
      			if (forecastIndex == 9) {}
      				else {
      					forecastIndex ++;
      					updateWeatherInfo();
      				}
      		});

      		function updateWeatherInfo() {
		      	$("#weatherDate").empty();
				$("#highTemp").empty();
				$("#lowTemp").empty();
				$("#weatherImg").empty();
				$("#weatherDate").html(forecastArray[forecastIndex].month + "/" + forecastArray[forecastIndex].day);
				$("#highTemp").html(forecastArray[forecastIndex].highTemp + String.fromCharCode(176) + "F");
				$("#lowTemp").html(forecastArray[forecastIndex].lowTemp + String.fromCharCode(176) + "F");
				image.attr("src", forecastArray[forecastIndex].iconImg);
				addImage = $("#weatherImg").append(image);
      		}
		});
	});

	$(document).on("click", ".save-button", function(){
		rowSelected = $(this).attr("value");
		var saveArtistName = eventArray[rowSelected].Artists.map(function(artist) {
			return artist.Name;
		}).join("<br>");
		var saveVenueName = eventArray[rowSelected].Venue.Name;
		var saveEventDate = eventArray[rowSelected].Date.slice(0,10);
		saveEventDate = moment(saveEventDate).format('dddd MMM Do');
		firebase.database().ref().push({
			artistName: saveArtistName,
			venueName: saveVenueName,
			eventDate: saveEventDate
		})
	});

	firebase.database().ref().on('child_added', function(snap){
		$("#savedConcertTable").append(
			'<tr><td>'+snap.val().artistName+'</td>'+
			'<td>'+snap.val().venueName+'</td>'+
			'<td>'+snap.val().eventDate+'</td></tr>'
		);		
	})

	function clearOldData() {
		$("#concertTable").empty();
		$("#weatherDate").empty();
		$("#highTemp").empty();
		$("#lowTemp").empty();
		$("#weatherImg").empty();
	};
});	