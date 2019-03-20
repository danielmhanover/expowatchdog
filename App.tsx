import React from 'react';
import { StyleSheet, Text, View, StatusBar, ScrollView } from 'react-native';
import moment from 'moment'
import * as _ from 'lodash'
import { pulseHistorical } from './Data';

type IData = {
  [id: string]: number // dates in ISO string format to percentages
}

type IState = {
  data?: IData
}

export default class App extends React.Component<{}, IState> {

  constructor(props: {}) {
    super(props);
    this.state = {
      data: {}
    }
  }

  componentDidMount() {
    pulseHistorical.subscribe((observer) => {
      console.warn("here")
      const data: IData = observer.reduce((prev, curr) => {
        prev[curr.day.toISOString()] = (curr.wearing)
        return prev
      }, {} as IData)
      this.setState({
        data,
      })
    })
  }

  render() {
    return (
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
                  { `${this.state.data[key]*20}/20 hours` }
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
      </View>
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
