import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet, Dimensions } from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';

/**
 *https://maps.googleapis.com/maps/api/place/nearbysearch/json?
 *location=-33.8670522,151.1957362&radius=500&type=food&key=YOUR_API_KEY
**/
const {width,heiht} = Dimensions.get('window')

export default class App extends Component {
  constructor() {
    super()
    this.state = {
      location: null,
      region: {
        latitude: null,
        longitude: null,
        latitudeDelta: null,
        longitudeDelta: null,
      },
      places:null,
      errorMessage: null,
    };
  }

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  getUrlParameters(lat,lon,radius, type,API){
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
    const location = `location=${lat},${lon}&radius=${radius}`
    const typeData = `&type=${type}`
    const key = `&key=${API}`

    return url+location+typeData+key
  }

  getPlaces(lat,lon){
    const url = this.getUrlParameters(lat,lon,1000,'food','AIzaSyC-EpAyfsk1465-CUMWvTzAv9uSRsW9o0M');
    fetch(url)
      .then((data) => data.json())
      .then((data) => {
        const arrayMarkers = []
        data.results.map((element, i) => {

          console.log(element)
          arrayMarkers.push(
            <MapView.Marker
              key = {i}
              coordinate = {{
                latitude : element.geometry.location.lat,
                longitude : element.geometry.location.lng
              }}
            >
              <MapView.Callout>
                <View>
                  <Text>{element.name}</Text>
                   <Text>{element.opening_hours? 'ABIERTO AHORA': 'CERRADO'}</Text> 
                </View>
              </MapView.Callout>
            </MapView.Marker>
          )
        })
        this.setState({
          places : arrayMarkers
        })
      })
    
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    this.setState({ location });

    const lat = location.coords.latitude
    const lon = location.coords.longitude
    const accuracy = location.coords.accuracy
    this.calcDelta(lat, lon, accuracy)

    this.getPlaces(lat,lon)
  };

  calcDelta(lat, lon, accuracy) {
    const oneDegreeOfLongitudeInMeters = 111.32;
    const circunference = (40075 / 360)

    const latDelta = accuracy * (1 / (Math.cos(lat) * circunference))
    const lonDelta = (accuracy / oneDegreeOfLongitudeInMeters)

    this.setState({
      region: {
        latitude: lat,
        longitude: lon,
        latitudeDelta: latDelta,
        longitudeDelta: lonDelta,
      }
    })
  }

  render() {

    return (
      <View style={styles.container}>
        {this.state.region.latitude ?
          <MapView
            style={styles.map}
            initialRegion={this.state.region}>
          
            <MapView.Marker coordinate = {{ 
              latitude: this.state.region.latitude,
              longitude: this.state.region.longitude
            }}>
              <View style={styles.marker} />
            </MapView.Marker>

            {this.state.places}
            
          </MapView>
          :
          null}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  map: {
    flex: 1,
    width:width
  },
   marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(130,4,150, 0.9)",
  },
});

