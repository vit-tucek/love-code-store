import React, { Component } from 'react'
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native'
import map from 'lodash/map'

import { messageTypes } from '../const'
import { NavigationBar } from '../components/Navigation'

import registerWsHandler from '../lib/socket'
import AppText from '../components/AppText'
import VisitorDetail from '../scenes/VisitorDetail'
import FontIcon from '../components/FontIcon'
import callApi from '../lib/api'
import { HTTP_BACKEND_URL } from '../config'

const visitors = [{
  persona: {
    hash: 'kev',
    image: require('../images/macaulay.png'),
    name: 'Kevin Costner',
    custom_data: {
      tshirtSize: 'M',
      shoeSize: 44,
      waistSize: 34
    }
  },
  recent_purchases: [
    {
      id: 4,
      name: 'Denim Jeans',
      image: 'https://codelove-stor.s3.amazonaws.com/uploads/production/web_application_item/4/01.jpeg',
      category: 'pants',
      price: 12000,
      purchased_at: '2016-11-05T11:26:07.248Z'
    }
  ],
  recommendation: [

  ]
}, {
  persona: {
    hash: 'chorli',
    image: require('../images/charlie.png'),
    name: 'Charlie Sheen',
    celebrity: true,
    custom_data: {}
  },
  recent_purchases: [],
  recommendation: []
}]

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      visitors,
      inventory: []
    }
  }

  selectVisitor (visitor) {
    this.props.navigator.push({
      component: VisitorDetail,
      title: visitor.persona.name || 'New Visitor',
      visitor,
      inventory: this.state.inventory,
      rightAction: NavigationBar.rightActionTypes.SHOW_CART
    })
  }

  componentDidMount () {
    callApi({
      method: 'GET',
      path: `${HTTP_BACKEND_URL}/inventory.json`
    })
    .then((res) => {
      this.setState({ inventory: res.data })
    })
    .catch((err) => {
      console.log(err)
    })

    registerWsHandler((msg) => {
      if (msg.indexOf('{') >= 0) {
        const message = JSON.parse(msg)
        switch (message.type) {
          case messageTypes.PERSON_ADDED:
            this.setState({
              visitors: [ ...this.state.visitors, message.data ]
            })
            return
          case messageTypes.PERSON_REMOVED:
            return
          default:
            return
        }
      } else {
        console.log('invalid message', msg)
      }
    })
  }

  render () {
    return (
      <View style={{ flex: 1, padding: 16 }}>
        <View style={{ alignItems: 'center' }}>
          <AppText type='title' style={{ paddingVertical: 34 }}>Visitors</AppText>
        </View>
        <View style={{ flexDirection: 'row' }}>
          {map(this.state.visitors, (visitor, i) => {
            const avatarSource = typeof visitor.persona.image === 'string'
            ? { uri: visitor.persona.image }
            : visitor.persona.image
            return (
              <TouchableOpacity
                style={{ flex: 0.33333 }}
                activeOpacity={0.75}
                onPress={() => this.selectVisitor(visitor)}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                  <View style={styles.avatar}>
                    <Image
                      style={styles.avatarImage}
                      source={avatarSource} />
                    {visitor.persona.celebrity
                    ? (
                      <FontIcon
                        icon='star'
                        size={36}
                        color='#af783f'
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0
                        }} />
                    ) : null}
                  </View>
                  <AppText
                    numberOfLines={1}
                    style={{ textAlign: 'center', paddingVertical: 8 }}>
                    {visitor.persona.name || 'New Visitor'}
                  </AppText>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  avatar: {
    height: 120,
    width: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#af783f'
  },
  avatarImage: {
    width: null,
    height: null,
    flex: 1,
    resizeMode: 'cover',
    borderRadius: 60
  },
  fixCircleClipping: {
    position: 'absolute',
    top: -2,
    bottom: -2,
    right: -2,
    left: -2,
    borderRadius: 120 / 2 + 2 / 2,
    borderWidth: 2,
    borderColor: '#af783f'
  }

})

export default Home
