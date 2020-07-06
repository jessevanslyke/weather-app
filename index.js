$(document).ready(function() {

    // Pull your current list of cities as results- if nothing found, make a new array, then save to localStorage
    function updateHistory(city) {
        // On page refresh, this is called with no city. Basically we're using this for reloading the search history so we skip this
        var results;
        if (city !== undefined) {
            results = JSON.parse(localStorage.getItem("searchResults")) || [];
            results.push(city);
            localStorage.setItem("searchResults", JSON.stringify(results));
        }

        // If we added a new city, we now get the new results- otherwise on page refresh, we just get the stored results
        results = JSON.parse(localStorage.getItem("searchResults"));

        // Render (or re-render) the updated results to HTML
        $("#searchHistory").empty();
        if (results !== undefined && results !== null) {
            results.forEach(element => {
                $("#searchHistory").append("<li class=\"list-group-item btn\"><button type=\"submit\" class=\"btn\" id=\"historyResults\">" + element + "</button></li>"); 
            });
        }
    }

    // Function to get weather data on button click
    function getWeatherDetails(city) {
        var queryURL = "https://api.openweathermap.org/data/2.5/forecast?q=" + city + "&appid=0b4376c133f1d9524532f75ab1163c55&units=imperial";

        // Primary AJAX call to get current weather data (except UV index)
        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function(response) {
            var originalDate = response.list[0].dt_txt.split(" ");
            var updatedDate = updateDateString(originalDate[0]);

            $("#currentWeather").attr("style", "border: 1px solid lightgrey; padding: 10px;")
            $("#cityName").text(city + " (" + updatedDate + ") ");
            $("#cityName").append("<img alt=\"weather icon\" id=\"weatherIcon\" />");
            $("#weatherIcon").attr("src", "https://openweathermap.org/img/w/" + response.list[0].weather[0].icon + ".png");
            $("#temp").html("Temperature: " + response.list[0].main.temp + "&#176;F");
            $("#humidity").html("Humidity: " + response.list[0].main.humidity + "%");
            $("#windSpeed").html("Wind Speed: " + response.list[0].wind.speed + " MPH");

            var lat = response.city.coord.lat;
            var long = response.city.coord.lon;

            queryURL = "https://api.openweathermap.org/data/2.5/uvi/forecast?appid=0b4376c133f1d9524532f75ab1163c55&lat=" + lat + "&lon=" + long;

            // Secondary AJAX call to get UV index data (requires latitude/longitude from original AJAX call)
            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function(response) {
                $("#uvIndexText").text("UV Index: ").append("<span id=\"uvIndexValue\"></span>");
                $("#uvIndexValue").text(response[0].value);
                $("#uvIndexValue").removeClass();

                // Change the color of the 'button' based on the UV index value
                if (response[0].value < 3)
                    $("#uvIndexValue").addClass("btn-sm text-white").attr("style", "background-color: green;");
                if (response[0].value >= 3 && response[0].value < 6)
                    $("#uvIndexValue").addClass("btn-sm text-black").attr("style", "background-color: yellow;");
                if (response[0].value >= 6 && response[0].value < 8)
                    $("#uvIndexValue").addClass("btn-sm text-white").attr("style", "background-color: orange;");
                if (response[0].value >= 8 && response[0].value < 11)
                    $("#uvIndexValue").addClass("btn-sm text-white").attr("style", "background-color: red;");
                if (response[0].value >= 11)
                    $("#uvIndexValue").addClass("btn-sm text-white").attr("style", "background-color: purple;");
            })

            /* Now to get the 5-day forecast
               Note: My origianl implementation was going to use the original 5 day API call
                     However, it gave the forecast in 3 hour intervals, so it would not be entirely accurate
                     as far as a 'daily forecast' goes. So, I swapped to OneCall API for a daily forecast.
            */
            queryURL = "https://api.openweathermap.org/data/2.5/onecall?appid=0b4376c133f1d9524532f75ab1163c55&exclude=current,minutely,hourly&units=imperial&lat=" + lat + "&lon=" + long;

            $.ajax({
                url: queryURL,
                method: "GET"
            }).then(function(response) {
                // daily[0] returns today, so daily[1] returns tomorrow, etc.
                var updatedDate = updateUnixDate(response.daily[1].dt * 1000);
                
                $("#day1Date").html(updatedDate);
                $("#day1Date").append("<img alt=\"weather icon\" id=\"weatherIcon1\" />");
                $("#weatherIcon1").attr("src", "https://openweathermap.org/img/w/" + response.daily[1].weather[0].icon + ".png");
                $("#day1Temp").html("Temp: " + response.daily[1].temp.day + "&#176;F");
                $("#day1Humidity").html("Humidity: " + response.daily[1].humidity + "%");

                updatedDate = updateUnixDate(response.daily[2].dt * 1000);

                $("#day2Date").html(updatedDate);
                $("#day2Date").append("<img alt=\"weather icon\" id=\"weatherIcon2\" />");
                $("#weatherIcon2").attr("src", "https://openweathermap.org/img/w/" + response.daily[2].weather[0].icon + ".png");
                $("#day2Temp").html("Temp: " + response.daily[2].temp.day + "&#176;F");
                $("#day2Humidity").html("Humidity: " + response.daily[2].humidity + "%");
                
                updatedDate = updateUnixDate(response.daily[3].dt * 1000);

                $("#day3Date").html(updatedDate);
                $("#day3Date").append("<img alt=\"weather icon\" id=\"weatherIcon3\" />");
                $("#weatherIcon3").attr("src", "https://openweathermap.org/img/w/" + response.daily[3].weather[0].icon + ".png");
                $("#day3Temp").html("Temp: " + response.daily[3].temp.day + "&#176;F");
                $("#day3Humidity").html("Humidity: " + response.daily[3].humidity + "%");

                updatedDate = updateUnixDate(response.daily[4].dt * 1000);

                $("#day4Date").html(updatedDate);
                $("#day4Date").append("<img alt=\"weather icon\" id=\"weatherIcon4\" />");
                $("#weatherIcon4").attr("src", "https://openweathermap.org/img/w/" + response.daily[4].weather[0].icon + ".png");
                $("#day4Temp").html("Temp: " + response.daily[4].temp.day + "&#176;F");
                $("#day4Humidity").html("Humidity: " + response.daily[4].humidity + "%");

                updatedDate = updateUnixDate(response.daily[5].dt * 1000);

                $("#day5Date").html(updatedDate);
                $("#day5Date").append("<img alt=\"weather icon\" id=\"weatherIcon5\" />");
                $("#weatherIcon5").attr("src", "https://openweathermap.org/img/w/" + response.daily[5].weather[0].icon + ".png");
                $("#day5Temp").html("Temp: " + response.daily[5].temp.day + "&#176;F");
                $("#day5Humidity").html("Humidity: " + response.daily[5].humidity + "%");
            })
        })
    }

    // Function that will take the date format provided by OpenWeather API and manipulates it into a different format
    function updateDateString(date) {
        var updatedDate = date.split("-").reverse();
        var tmp = updatedDate[1];
        updatedDate[1] = updatedDate[0];
        updatedDate[0] = tmp;
        updatedDate = updatedDate.join("/");

        return updatedDate;
    }

    // Because OneCall API only returns dt in UNIX format, we have to make yet another function to handle it...
    function updateUnixDate(date) {
        var newDate = new Date(date);
        var month = newDate.getMonth() + 1 < 10 ? ("0" + (newDate.getMonth() + 1)) : newDate.getMonth() + 1;
        var day = newDate.getDate() < 10 ? ("0" + (newDate.getDate())) : newDate.getDate();
        var year = newDate.getFullYear().toString();
        var updatedDate = month + "/" + day + "/" + year;
        
        return updatedDate;
    }

    // Perform the onclick event handler for searching for a city
    $("#search").on("click", function(event) {
        event.preventDefault();

        if ( $("#cityName").val() === "")
            return;
        
        city = $("#cityName").val();

        updateHistory(city);
        getWeatherDetails(city);
    })

    // Perform the onclick event handler for clicking the button on a saved search and disply the weather data
    $(document).on("click", "button#historyResults", function(event) {
        event.preventDefault();

        getWeatherDetails($(this)[0].textContent);

    })

    // Always perform a history update on page load/reload
    updateHistory();
})