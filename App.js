import React, { Component } from 'react';
import { Platform, Text, View, StyleSheet, Dimensions, TouchableHighlight } from 'react-native';
import { Constants, Location, Permissions, MapView } from 'expo';

/**
 *https://maps.googleapis.com/maps/api/place/nearbysearch/json?
 *location=-33.8670522,151.1957362&radius=500&type=food&key=YOUR_API_KEY
**/
const { width, heiht } = Dimensions.get('window')
const LATITUDEDELTA = 0.0922;
const LONGITUDEDELTA = 0.922;

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
      places: null,
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

  getUrlParameters(lat, lon, radius, type, API) {
    const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json?'
    const location = `location=${lat},${lon}&radius=${radius}`
    const typeData = `&type=${type}`
    const key = `&key=${API}`

    return url + location + typeData + key
  }

  getPlaces() {
    const url = this.getUrlParameters(this.state.region.latitude, this.state.region.longitude, 1000, 'food', 'AIzaSyC-EpAyfsk1465-CUMWvTzAv9uSRsW9o0M');
    fetch(url)
      .then((data) => data.json())
      .then((data) => {
        const arrayMarkers = []
        data.results.map((element, i) => {

          console.log(element)
          arrayMarkers.push(
            <MapView.Marker
              key={i}
              coordinate={{
                latitude: element.geometry.location.lat,
                longitude: element.geometry.location.lng
              }}
            >
              <MapView.Callout>
                <View>
                  <Text>{element.name}</Text>
                  <Text>{element.opening_hours ? 'ABIERTO AHORA' : 'CERRADO'}</Text>
                </View>
              </MapView.Callout>
            </MapView.Marker>
          )
        })
        this.setState({
          places: arrayMarkers
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

    let location = await Location.getCurrentPositionAsync({
      enableHighAccuracy: true
    });
    this.setState({
      region: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDEDELTA,
        longitudeDelta: LONGITUDEDELTA
      }
    })

    await Location.watchPositionAsync(
      {
        enableHighAccuracy: true,
        imeInterval: 20000
      },
      (position) => {
        const newRegion = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: LATITUDEDELTA,
          longitudeDelta: LONGITUDEDELTA
        }
        this.setState({ region: newRegion })
      }
    )
  };


  showPlaces = () => {
    this.setState({ places: null })
    this.getPlaces();
  }



  render() {

    return (
      <View style={styles.container}>
        <TouchableHighlight
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            zIndex: 2
          }}
          onPress={() => this.showPlaces()}>
          <Text>Show Food Places</Text>
        </TouchableHighlight>
        {this.state.region.latitude ?
          <MapView
            style={styles.map}
            region={this.state.region}
            showsUserLocation={true}
            followsUserLocation={true}>

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
    width: width
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(130,4,150, 0.9)",
  },
});

