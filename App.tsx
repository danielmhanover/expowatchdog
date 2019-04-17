import React from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView } from 'react-native';
import moment from 'moment'
import * as _ from 'lodash'
import { pulseHistorical, database, firestore } from './Data';
import { MenuProvider } from 'react-native-popup-menu';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { BleManager } from 'react-native-ble-plx';


type IData = {
  [id: string]: number // dates in ISO string format to percentages
}

type IState = {
  data?: IData
  device_options?: string[]
  connected_device?: {}
}

export default class App extends React.Component<{}, IState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      data: {}
    }
  }

  manager: any

  componentDidMount() {
    this.manager = new BleManager({
      restoreStateIdentifier: "com.ese450.bluetooth_state"
    });
    pulseHistorical.subscribe((observer) => {
      const data: IData = observer.reduce((prev, curr) => {
        prev[curr.day.toISOString()] = Math.max(Math.min(curr.wearing, 1.2), 0)
        return prev
      }, {} as IData)
      this.setState({
        data,
      })
    })
    firestore.collection('pulse').orderBy('timestamp', 'desc').limit(1).onSnapshot((snapshot) => {
      this.setState({
        latest_version: snapshot.docs[0].data().stage
      })
    })
    // database.ref("latest_version").on("value", (snapshot) => {
    //   const v = snapshot.val()
    //   if (v) {
    //     this.setState({
    //       latest_version: v
    //     })
    //   }
    // })
  }

  render() {
    return (
      <MenuProvider>
        <View style={styles.container}>
          <StatusBar />
          <View style={{
            height: 20,
            width: '100%',
          }} />
          <View style={{
            width: '100%',
            height: 44,
            borderBottomColor: 'grey',
            borderBottomWidth: 0.5,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          { (this.state.options && !this.state.connected_device) ? <Menu>
            <MenuTrigger text='Connect' />
            <MenuOptions>
              {
                this.state.options.map((s) => {
                  return (
                    <MenuOption onSelect={() => {console.warn("here")}} text={s} />)
                })
              }
            </MenuOptions>
          </Menu> : <Text style={{ position: 'absolute', left: 20, top: 10, bottom: 0 }}>Connected!</Text>}
            <Text style={{
              fontSize: 18,
            }}>InvEasy</Text>
          </View>
          <ScrollView style={{
            width: '100%'
          }}>
            { _.keys(this.state.data).map((key) => {
              const backgroundColor = (
                this.state.data[key] > 0.9 ? '#d7e5e2' :
                this.state.data[key] > 0.6 ? '#f6e3c3' :
                '#f7c4c4'
              )
              const textColor = (
                this.state.data[key] > 0.9 ? '#aad0c5' :
                this.state.data[key] > 0.6 ? '#face83' :
                '#f98283'
              )
              return (<View style={{
                width: '100%',
                height: 64,
                justifyContent: 'flex-start',
                flexDirection: 'row',
                backgroundColor: '#f5f4f5'
              }}>
                <View style={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  marginLeft: 20,
                  height: '100%',
                  zIndex: 1000,
                }}>
                  <Text style={{
                    color: 'black',
                  }}>{ moment(key).format('ddd, MMMM Do') }</Text>
                  <Text style={{
                    color: textColor,
                  }}>
                    { `${Math.floor(this.state.data[key]*20*100)/100}/20 hours` }
                  </Text>
                </View>
                <View style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: (this.state.data[key] * 100) + '%',
                  backgroundColor
                }}></View>
              </View>)
            }) }
          </ScrollView>
          <Text>Began treatment on {moment('12/01/2018').format("MM/DD/YYYY")}</Text>
          <Text>Should be on stage {Math.floor(moment().diff(moment('12/01/2018'), 'weeks')/2)}</Text>
          {
            this.state.latest_version && 
            <Text style={{
              fontSize: 24
            }}>{ `Wearing stage ${this.state.latest_version} of 20` }</Text>
          }
        </View>
      </MenuProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});
