# Planes Near Me

- I love watching planes and taking pictures of it! 
- I use FlightRadar24 (the app) to track planes but it doesnt have a feature that notifies me when a plane is near me
- Due to this I have to open the app again and again to see planes nearby me so that I could take some photos or watch them flying
- This app solves this problem

Here's how it works - 
1) it takes in my location and searches for the radius in a fixed radius
2) and whenever a plane is near me it notifies me, along with its callsign and airports
3) and if i want, i can open the app to see some planes near the airport area or change the radius

### How to use?
- Allow notification and location access
- Toggle location from "Your Location" to "Delhi Airport" by clicking on the box that shows the location
- Toggle radius(choose from 1km/2km/3km) by clicking on the box that shows the radius
- You have to wait for approximately 3-4 minutes to start seeing the planes as the api is a little slow, sorry for that

ps - the api which the app uses is self-made (altho it uses OpenSky API and scrapes some data from websites but the radius scan is implemented by me), it takes in the coordinates and radius and returns plane data [https://saisantoshpal.hackclub.app/lat/long/radius](https://saisantoshpal.hackclub.app/lat/long/radius)