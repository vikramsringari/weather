/*
Vikram Sringari
5/12/2016
CSE 154 AC
HW5: Weather
This JavaScript file gives functionality to the Weather page using 
search bars/buttons, slider for temperature and buttons for dettermining
whether to show preicipitation or the slider for temperature.
This takes information from the server about cities and based on the 
searches of user out puts the city's info, its temperature, it's 
future temperature based on the slider's movement, the forcast for
each day of the week and the precipitation for each day of the week.
*/
(function() {
	"use strict";

	var temperatureMarker; // is the marker for the slider
	var SUCCESS = 200; //test for proper server  connection
	var WEEK = 7; // number of days in a week

	// This function enables users to have options when searching for a
	// city and when a city is chosen enables users to press the button to 
	// show precipitation or temperature and change the marker for the slider.
	// These are enabled when the page is loaded.
	window.onload = function() {
		searchData("cities", cities); 
		document.getElementById("search").onclick = load;
		document.getElementById("temp").onclick = showTemperature;
		document.getElementById("slider").onchange = shift;
		document.getElementById("precip").onclick = showPrecipitation; 
	};

	// This function takes the a mode which is used to dettermine the extension
	// to the php page that XML and JSON data is extracted from, and then runs 
	// a loadfunction that takes the data and outputs on the page.
	function searchData(mode, loadFunction) {
		var ajax = new XMLHttpRequest();
		ajax.onload = loadFunction;
		var city = document.getElementById("citiesinput").value;
		var url = "https://webster.cs.washington.edu/cse154/weather.php" + 
			"?mode=" + mode + "&city=" + city;
		ajax.open("GET", url, true);	
		ajax.send();
	}
	
	// Dettermines what item is visible on the page
	// Takes the id of the item in question and the state of the display
	// to dettermine the if it is visible.
	function visibility(display, id) {
		document.getElementById(id).style.display = display;
	}
	
	// Turns off or on the visibility of the loading gifs.
	// This is based one state of display.
	function loading(display) {
		visibility(display, "loadingforecast");
		visibility(display, "loadinggraph");
		visibility(display, "loadinglocation");
		
	}
	
	// Turns off or on the visibility of the functionality buttons/slider.
	// This is based one state of display.
	function functionality(display) {
		visibility(display, "slider");
		visibility(display, "buttons");
	}
	
	// Loads the page after the search button is clicked.
	// This gets rid of any data that was previosly on the page about the
	// city that was search. While loading shows loading gifs and not 
	// the buttons/slider, and once done loading shows city information
	// temperature, forcast, and precipitation.
	function load() {
		visibility("none", "nodata");
		visibility("none", "errors");
		functionality("none");
		document.getElementById("location").innerHTML = ""; 
		document.getElementById("currentTemp").innerHTML = "";
		document.getElementById("graph").innerHTML = "";
		document.getElementById("forecast").innerHTML = "";
		document.getElementById("slider").value = 0;
		visibility("block", "resultsarea");
		loading("block");
		searchData("oneday", cityInformation);
		searchData("week", weeklyForecast);
		searchData("oneday", precipitationData);
	}
	
	// This shows the options for cities in the drop down search bar
	// which is from a list of given cities from the server.
	// If the status is not successful (200) sends error message.
	function cities() {
		visibility("none", "loadingnames");
		if (this.status == SUCCESS) { 
			var list = this.responseText.split("\n");
			for (var i = 0; i < list.length; i++) {
				var city = document.createElement("option");
				city.innerHTML = list[i];
				document.getElementById("cities").appendChild(city);
			} 
		} else { 
			error(this.status, this.statusText);
		}
	}

	// Displays the the precipitation graphs and not the 
	// the temperature slider when precipitation button is clicked
	function showPrecipitation() {
		visibility("none", "temps");
		visibility( "", "graph");
	}

	// Displays the the temperature slider and not the 
	// the precipitation graphs when temperature button is clicked
	function showTemperature() {
		visibility("none", "graph");
		visibility("", "temps");
	}

	// Displays Information about the city that was searched.
	// Displays the current date and time (zone) in the city.
	// Also displays the weather in the city.
	// Displays the current temperature in the city which is denoted
	// by the it being the left most on the slider (left to right).
	// It displays the buttons and sliders once it has this info has 
	// finished loading.
	// If the status is not successful (200) sends error message.
	function cityInformation() {
		visibility("none", "loadinglocation");
		functionality("block");
		if (this.status == SUCCESS) {
			var cityName = this.responseXML.querySelector("name").textContent; 
			var currentDate = Date(); 
			var weather = this.responseXML.querySelector("symbol").getAttribute("description"); 
			temperatureMarker = this.responseXML.querySelectorAll("temperature");
			var description = [cityName, currentDate, weather];		
			for (var i = 0; i < description.length; i++) {
				var locationP = document.createElement("p");// creates p tags so that it is gray
				locationP.innerHTML = description[i];
				document.getElementById("location").appendChild(locationP);
				if (i == 0) {// This makes the city's font bigger
					locationP.classList.add("title");
				}
				document.getElementById("location").appendChild(locationP);
			}
			var temperatureDiv = document.createElement("div");
			temperatureDiv.innerHTML = 
				Math.round(this.responseXML.querySelector("temperature").textContent) + "&#8457";
			document.getElementById("currentTemp").appendChild(temperatureDiv);
		} else {
			error(this.status, this.statusText);
		}
	}
	
	// This gives the temperature for each interval of 3 hours of that day based on the
	// slider marker moving. This displays the value of the temperature where the temperature 
	// is displayed.
	function shift() {
		var marker = 
			(document.getElementById("slider").value) / (document.getElementById("slider").step);
		// enables correct temperature to be shown with each movement of the marker in the slider
		document.getElementById("currentTemp").innerHTML = 
			Math.round(temperatureMarker[marker].textContent) + "&#8457";
	}
	
	// Displays the week's forcast by displaying an image of the weather each day, and 
	// showing the temperature for that day in the row below. It displays this almost
	// like a table. If the status is not successful (200) sends error message.
	function weeklyForecast() {
		visibility("none", "loadingforecast");
		if (this.status == SUCCESS) {
			var cities = JSON.parse(this.responseText);
			for (var row = 0; row < 2; row++) {
				var table = document.createElement("tr");
				for (var col = 0; col < WEEK; col++) { 
					var block = document.createElement("td");
					if (row == 0) {
						var image = document.createElement("img");
						var weather = "https://openweathermap.org/img/w/" +
							cities.weather[col].icon +".png";
						image.src = weather;
						block.appendChild(image);
					} else if(row == 1) {
						block.innerHTML = Math.round(cities.weather[col].temperature) + 
							"&#176";
					}
					table.appendChild(block);
				}
				document.getElementById("forecast").appendChild(table);
			}
		} else{
			error(this.status, this.statusText);
		}
	}
	
	// It displays the precipitation chances for each day of week.
	// This is diplayed as graph where the highest chances of precipitation 
	// are shown with higher bars, and lower are shown with smaller bars.
	// The actual percent chance is shown underneather the top of each bar.
	// If the status is not successful (200) sends error message.
	function precipitationData() {
		visibility("none", "loadinggraph");
		visibility("none", "graph"); 
		if (this.status == SUCCESS) {
			var precipitation = this.responseXML.querySelectorAll("clouds");
			var precipitationGraph = document.createElement("tr");
			for (var i = 0; i < WEEK; i++) { 
				var precipitationBar = document.createElement("td");
				var percent = document.createElement("div");
				percent.style.height = precipitation[i].getAttribute("chance") + "px";
				percent.innerHTML = precipitation[i].getAttribute("chance") + "%";
				precipitationBar.appendChild(percent);
				precipitationGraph.appendChild(precipitationBar);	
			}
			document.getElementById("graph").appendChild(precipitationGraph);
		}else { 
			error(this.status, this.statusText);
		}
	}
	
	// This function reports errors when the status is not 200
	// If the status is 410 it means that the searched city is
	// not found. If the status is not 410 or 200, a specific
	// error is given with a specific error code.
	function error(status, text){
		loading("none");
		functionality("none");
		if(status == 410){
			visibility("", "nodata");
		} else {
			var otherError = document.getElementById("errors");
			otherError.innerHTML = "Other Error Found " + "Server Error: " +
							 status + " Server Problem: " + text;
		}
	}

})();
