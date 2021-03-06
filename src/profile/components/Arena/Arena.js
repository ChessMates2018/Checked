import React, {Component} from 'react'
import PotentialOpponents from './SubComponents/PotentialOpponents';
import axios from 'axios'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {setLightPlayer, setDarkPlayer, setRoomId} from '../../../ducks/Reducer'
// import io from 'socket.io-client'
import {socket} from '../../../utils/SocketFunctions'
import {withRouter} from 'react-router-dom'


class Arena extends Component {
  constructor(props) {
    super(props)

    this.state = {
      players: [],
      inArenaToggle: true
    }
    this.joinArena = this.joinArena.bind(this)
  }

  componentDidMount(){
    axios.get(`/api/loggedin`).then(res => {
      this.setState({
        players: res.data
      })
    })
    socket.on('is online', (data) => {
      
      axios.get(`/api/loggedin`).then(res => {
        this.setState({
          players: res.data
        })
      })
    })
    socket.on('is offline', (data) => {
     
      axios.get(`/api/loggedin`).then(res => {
        this.setState({
          players: res.data
        })
        
      })
    })
    socket.on('push to board', (challenged, gameId, challenger) => {
      let light = challenged.challenged.challenger
      let dark = challenged.challenged.challenged
      if(this.props.username === challenged.challenged.challenged){
        axios.post('/api/newGameHistory', {dark, light})
        this.props.history.push(`/gameboard/${challenged.challenged.gameId}/${dark}/${light}`)
      }
    })
  }

  componentWillUnmount(){
    socket.off('is online', 'turned off')
    socket.off('is offline', 'user is offline')
    socket.off('push to board', 'cannot send user to board')
  }

  joinArena(info){
    let {username} = this.props
    console.log(username)
    this.setState((prevState) => ({
      players: [...prevState.players, {username}], inArenaToggle: !this.state.inArenaToggle
    }))
    axios.put('/api/joinArena', {username: username}).then()
  } 

  newGame = (challenged) => {
    let challenger = this.props.username
    //MAD LOGIC
    //generate gameid
    axios.get(`/api/gameNumber`)
    //push challenger to board
    .then(res => {
      // console.log('gameId res', res)
      let {gameId} = res.data
      socket.emit(`challenge initiated`, {challenged, gameId, challenger})
      if(challenged === "Computer"){
        this.props.history.push(`/AIgameboard/${gameId}/${challenged}/${challenger}`)

      } else {
        this.props.history.push(`/gameboard/${gameId}/${challenged}/${challenger}`)

      }
    })
    //grab username of challenged off button click and emit to socket along with gameId (this may cause timing issues, will need to see)
    //set up an io.on if username === the username cooming back from socket push to board  

  }
    

  leaveArena = () => {
    let {players} = this.state
    let {username} = this.props
    let newPlayers = players
    for (let i = 0; i < newPlayers.length; i++){
      if (newPlayers[i] === username){
       newPlayers.splice(i,1)
      }
    }
    let {inArenaToggle} = this.state
    this.setState({
      inArenaToggle: !inArenaToggle, players: newPlayers
    })
  }



  render () {
    let {opponentsList} = this.props
    
    /** destructuer stull off of info.4 */
    return (
      <div className = 'arenaBlock'>
        <h3>Opponents</h3>
        <PotentialOpponents
        currentPlayer={this.props.username}
        opponentsList={this.state.players}
        newGame={this.newGame} 
        />
        {/* {this.displayArena()} */}
        {/* <PotentialOpponents
        opponentsList = {opponentsList}
        /> */}
        <h2 id="challenge-header">Challenge a user in the Arena!</h2>
        {/* {
          this.state.inArenaToggle
          ?
          <button 
          onClick={this.joinArena} 
          className="button arena_btn">Join the Arena</button>
          :
          <button
            onClick = {this.leaveArena} 
            className="button arena_btn">Leave the Arena</button>
         
        } */}
        {/* {this.displayButton()} */}
      </div>
    )
  }
}

function mapStateToProps (state) {
  let {username, light, dark, roomId} = state
  return {username, light, dark, roomId}
}

export default withRouter(connect(mapStateToProps, {setLightPlayer, setDarkPlayer, setRoomId})(Arena))