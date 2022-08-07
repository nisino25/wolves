<template>
<html >
  <head></head>
  <body :style="currentTime == 'day' ? 'background-color: #E0B589;' : 'background-color: #363945; color: white'" >
      <div class="wrapper">
      <div class="container" v-if="readyToPlay">

        <div class="nav" style="margin-bottom: 10px;">
          <strong>Werewolf</strong>
          <br>
          <span>Possibly {{teamSituation}}</span><br><br>
          <span  style="margin-bottom:20px">Day {{detailData.length}}
          <img v-if="currentTime == 'day'"  src="../public/icons/sun.png">
          <img v-if="currentTime == 'night'" style="filter: invert(100%);"  src="../public/icons/moon.png">
          </span>
        </div>
        
        <div class="players row"  >
          <template  v-for="(player,index) in players" :key="index">
            <transition name="fade">

              <div class="card"  :style="[!player.alive  ? 'opacity: 0.5 ' : '']" @click="clickingAPlayer(player)">
                <img src="../public/icons/user.png" alt="Avatar">
                <div class="container">
                  <span class="name">{{player.name}}</span><br><br>
                  <span :style="getColor(player.team)">{{player.team}}</span><br>
                  <span>{{player.role}}</span><br>
                  <span>{{player.doneWihtNightAction}}</span>
                  
                </div>
              </div>
            </transition>
            <div v-if="(index+1) % 3==0" cals="line-break">
            
            </div>  
          </template>
 
        </div>

        <div class="controller">
          <button v-if="canMoveForward" @click="moveToNextState()">Forward the Time</button>
          <button v-else style="opacity: 0.2">Forward the Time</button>
          <br><br>

          <div v-if="currentPlayer">
            Using: {{currentPlayer.name}} <br><br>
            <span v-if="!currentPlayer.doneWihtNightAction">Choose your target</span><br>
            <span v-if="currentPlayer.doneWihtNightAction">You chose <b style="color:red">{{currentPlayer.target}} </b> as your target</span><br>
            <span v-if="actionWarning" class="warning">{{actionWarning}}</span>

          </div>
        </div>


      </div>
  
    </div>

    <transition name="fade" >
          <div class='modal-overlay fade-in' v-if="showModal" style="height: 100vh">
            
              <div class="modal" style=" transition : all 0.6s ease 0s;">
                
                
                <div v-if="modalStatus == 1">
                  <form onsubmit="event.preventDefault()">
                    <label>Size of Group</label>
                    <input type="text" placeholder="Type the number of the group.." v-model="groupSize" >

                    <span v-if="modalWarning" class="warning">{{modalWarning}}</span>
                    <button @click="createARoom()" class="create" >Create a room</button>
                    OR<br>
                    <button @click="skipToRoles()" class="join">Skip to roles</button>
                    <button @click="defaultCreation()" class="join"  >Default Creation</button>

                  </form>
                </div>

                <div v-if="modalStatus == 2">
                  <form onsubmit="event.preventDefault()">
                    <label>Type the name for the players</label>
                    

                    <template v-for="(player,index) in players" :key="index">
                      <input required="required" type="text" :placeholder="`Type No.`+ (index+1) + ` name..`" v-model="player.name">

                    </template>

                    <span v-if="modalWarning" class="warning">{{modalWarning}}</span>
                    <button @click="doneWithNames()" class="create" >Create a room</button>

                  </form>
                </div>

                <div v-if="modalStatus == 3">
                  <form onsubmit="event.preventDefault()">

                    <div v-if="rolesTabs == 0">
                      <template v-for="(role,index) in roles.wolves " :key="index">
                        <label v-if="rolesTabs == 0">Max number of possible wolves</label>
                        <input v-if="rolesTabs == 0" type="number" placeholder="Type the number of possible wolves.." v-model="maxWolvesNum" >

                        <input type="checkbox"  :value="role.name" v-model="roles.wolves[index].assigned">
                        <label for="jack">{{role.name}}</label>
                      </template>
                    </div>

                    <div v-if="rolesTabs == 1">
                      <template v-for="(role,index) in roles.villagers " :key="index">
                        <input type="checkbox"  :value="role.name" v-model="roles.villagers[index].assigned">
                        <label for="jack">{{role.name}}</label>
                      </template>
                    </div>

                    <div v-if="rolesTabs == 2">
                      <template v-for="(role,index) in roles.solos " :key="index">
                        <input type="checkbox"  :value="role.name" v-model="roles.solos[index].assigned">
                        <label for="jack">{{role.name}}</label>
                      </template>
                    </div>

                    <div>
                      <button class="tab-button" :style="[rolesTabs== 0 ? '' : 'opacity: 0.3']" @click="rolesTabs = 0" >Wolves{{tempCount.wolves}}</button>
                      <button class="tab-button" :style="[rolesTabs== 1 ? '' : 'opacity: 0.3']" @click="rolesTabs =1">Villagers{{tempCount.villagers}}</button>
                      <button class="tab-button" :style="[rolesTabs== 2 ? '' : 'opacity: 0.3']" @click="rolesTabs = 2">Solos{{tempCount.solos}}</button>
                    </div>
                    <span v-if="modalWarning" class="warning">{{modalWarning}}</span>
                    <button class="create"  :style="[continueFlag ? '' : 'opacity: 0.4']" @click="doneWithRoles()">Play Game</button>
                    <!-- <span>{{tempAssigned}}</span> -->
                    <!-- <button class="create" @click="rolesTabs = 0">Play Game</button> -->
                  </form>
                </div>

                


              </div>
          </div>

        
    </transition>
    
  </body>
</html>
  


</template>

<script>
import {roles} from './const/roles.js'
export default {
  name: 'App',
  components: {
  },
  data(){
    return{
      readyToPlay: false,
      groupSize: 6,
      players: [],

      showModal: true,
      modalStatus: 1,
      modalWarning: undefined,



      rolesTabs: 0,
      roles,

      maxWolvesNum: 1,


      tempWolves: [],
      tempVillagers: [],
      tempSolos: [],
      actualRoles: {wolves: [], villagers: [], solos: []},
      rolesCount : 0,
      // --------------------------
      actionWarning: undefined,
      target: undefined,

      detailData:[],

      currentPlayer: undefined,


    }
  },
  methods:{

    // setup ------------------------------
    createARoom(){

      // check if the number is correct
      if(this.groupSize >= 10 || this.groupSize < 3) {
        this.modalWarning = 'Cannot have the number '
        return 
      }
      

      let count =0
      while(count < this.groupSize){
        this.players.push({name: `player${count+1}`, alive: true,role: undefined,team: undefined,target: undefined, dayVotingTarget: undefined,})
        count++
      }
      
      this.modalStatus++
      // console.log(this.players)

    },
    doneWithNames(){
      
      for(let i in this.players){
        let player = this.players[i]

        // checking if the empty value exists or not
        if(player.name == ''){
          this.modalWarning = 'Name cannot be empty'
          return 
        } 

        // checking if the name is not duplicage
        for(let c in this.players){
          if(player.name == this.players[c].name && i !== c){
          // console.log(`${i}: ${c}`)
          this.modalWarning = 'Cannot have the same name'
          return 
        } 
        }
      }

      // console.log(this.players)
      this.modalStatus++
    },
    doneWithRoles(){
      
      // considert the team balance
      if(!this.continueFlag) return
      if(this.modalWarning) return


      // think about the portion of the wolf team
      



      // assign the roles in backgeound
      this.assignRoles()
      this.copyTheDetail()
      this.showModal = false

      this.readyToPlay = true
      

    },
    assignRoles(){
      // console.log('------------------------starting up')
      // console.log(this.teamSituation)
      // just werewolf is not possible
      // just villager is not possible

      // just solos
      if(this.teamSituation == 'just solos'){
        for(let i in this.players){
          let player = this.players[i]
          player.team = 'solos'
          player.role =  this.getRandomRole(player.team)
          this.rolesCount++
        }
        return 
      }

      // -----------------------------------------------------------------------------------------

      // wolves, villager
      if(this.teamSituation == 'wolves and villagers'){
        // console.loeg('no preoblem until here')
        
        // make 2 teams
        this.getTwoTeams()
        


        // assign the roles to the rest of the team
        while(this.notAssignedPlayers.length !== 0){
          
          let randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
          let theName = this.notAssignedPlayers[randomNum]
          let player = this.players.find(o => o.name === theName) 

          // if you cannot put more wolves, just add villager
          
          if(this.doneWithWolvesAssigning()){

            player.team = 'villagers' 
            player.role = this.getRandomRole('villagers')
             

          }else{
            if(this.wolvesOrNot()){
              player.team = 'wolves' 
              player.role = this.getRandomRole('wolves')
            }else{
              player.team = 'villagers' 
              player.role = this.getRandomRole('villagers')
            }
          }
        }
        return 
      }

      // // wolves, solos
      // if(this.tempCount.wolves > 0 && this.tempCount.villagers == 0 && this.tempCount.solos >0){
      //   return 'wolves and solos'
      // }

      // // villagers, solos
      // if(this.tempCount.wolves == 0 && this.tempCount.villagers > 0 && this.tempCount.solos >0){
      //   return 'villagers and solos'
      // }

      // // -----------------------------------


      // // with everyone
      // if(this.tempCount.wolves > 0 && this.tempCount.villagers > 0 && this.tempCount.solos >0){
      //   return 'every team'
      // }

      // return false
      
    },
    doneWithWolvesAssigning(){
      let count = 0
      for(let i in this.players){
        let player = this.players[i]
        if(player.team == 'wolves') count++
      }

      if(count >= this.maxWolvesNum){
        return true
      }else{
        return false
      }
    },
    copyTheDetail(){
      for(let i in this.players){
        let player = this.players[i]
        if(player.role == 'villager' || player.role == 'fool' ){
          player.canMoveAtNight= false
          // player.doneWihtNightAction= true
        }else{
          player.canMoveAtNight= true
        }
      }
    },




    wolvesOrNot(){
      var d = Math.random();
      if (d < 0.75){
        // console.log('human')
        return false
      }else{
        console.log('wovles')
        return true
      }
          // 3
    },
    getTwoTeams(){

      let randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
      let theName = this.notAssignedPlayers[randomNum]
      let player = this.players.find(o => o.name === theName)

      switch(this.teamSituation){
        case 'wolves and villagers':
          player.team = 'wolves'
          player.role =  this.getRandomRole('wolves')
          break;

        case 'villagers and solos':
          player.team = 'solos'
          player.role =  this.getRandomRole('solos')
          break;


      }
      // console.log(`${player.name}: ${player.role}-----------------`)

      randomNum =Math.floor(Math.random() * this.notAssignedPlayers.length);
      theName = this.notAssignedPlayers[randomNum]
      player = this.players.find(o => o.name === theName)
      player.team = 'villagers'
      player.role = this.getRandomRole('villagers')
      // console.log(`${player.name}: ${player.role}-----------------`)
      // console.log('done with setup')


    },
    getRandomRole(team){
      // console.log(this.tempSolos)
      // let role
      let list = []
      // console.log('assigning')
      switch(team){
        
        case 'wolves':
          for(let i in this.roles.wolves){
            let role = this.roles.wolves[i]
            if(role.assigned) list.push(role.name)
          }
          return list[Math.floor(Math.random()* list.length)]; 

        case 'villagers':
          for(let i in this.roles.villagers){
            let role = this.roles.villagers[i]
            if(role.assigned) list.push(role.name)
          }
          return list[Math.floor(Math.random()* list.length)]; 

        case 'solos':
          for(let i in this.roles.solos){
            let role = this.roles.solos[i]
            if(role.assigned) list.push(role.name)
          }
          return list[Math.floor(Math.random()* list.length)]; 
        
      }
      
    },

    // game controlling ----------------------------------------------------------
    clickingAPlayer(player){
      this.actionWarning = undefined
      // most likely cannot pick yourself right?
      if(this.currentPlayer.name == player.name){
        this.actionWarning = 'Cannot choose yourself'
        this.currentPlayer.target = undefined
        this.currentPlayer.doneWihtNightAction = false
        return
      }

      if(this.currentTime == 'night'){
        // if(this.currentPlayer.doneWihtNightAction) return
        if(this.currentPlayer.team == 'wolves'){
          console.log('----------reacehd here--------')
          if(player.team == 'wolves'){
            this.actionWarning = 'Cannot choose the same team'
            this.currentPlayer.target = undefined
            this.currentPlayer.doneWihtNightAction = false
            return 
          } 
          this.currentPlayer.target = player.name
          this.currentPlayer.doneWihtNightAction = true
          return
        }

      }
    },
    moveToNextState(){

      // case 1 the very first time
      if(this.detailData.length == 0){
        this.detailData.push( {nightLog: undefined, dayLog: undefined, isNightOver: false, isDayOver: false, })

        this.nightActions()
        return
      }


      // case 2 when the night is over
      if(!this.latestData.isNightOver){
        this.latestData.isNightOver = true
        return
      }

      // case 3 when the day is over
      if(this.latestData.isNightOver){
        this.latestData.isDayOver = true
        this.detailData.push( {nightLog: undefined, dayLog: undefined, isNightOver: false, isDayOver: false, })

        this.nightActions()

      }


      // if(this.detailData)

      // {nightLog: undefined, dayLog: undefined, isNightOver: false, isDayOver: false, }
    },

    nightActions(){

      // toggle moveable flag
      for(let i in this.players){
        let player = this.players[i]
        if(player.alive && player.canMoveAtNight){
          player.doneWihtNightAction = false
          player.target = true
        }
      }


      // wolves voting for each one
      let player = this.players.find(o => o.name === this.unVotedWolves[0]) 
      this.currentPlayer = player
      




      // judge 

    },






    // styles ------------------------------------------------
    getColor(team){
      switch(team){
        case 'wolves':
          return 'color: red'

        case 'solos':
          return 'color:green'
      }
    },

    // controlling the game easily----------------------------------------
    defaultCreation(){
      this.createARoom()
      this.doneWithNames()
      this.doneWithRoles()
    },
    skipToRoles(){
      this.createARoom()
      this.doneWithNames()
    },

    
  },
  watch:{
    modalStatus(){
      this.modalWarning = undefined
    },
    actualRoles(){
      this.modalWarning = undefined
    },
    tempWolves(){
      console.log(this.tempWolves)
    },

    maxWolvesNum(){
      if(this.modalStatus !== 3) return
      if(( this.maxWolvesNum >= (this.players.length * 0.5) ) || this.maxWolvesNum < 1){
        this.modalWarning = 'Wolve number cannot be that high'
      }else{
        this.modalWarning = undefined
      }
    }

  },
  computed:{
    tempRolesList(){
      switch(this.rolesTabs) {
        case 0:  // if (x === 'value1')
          return this.roles.wolves

        case 1:  // if (x === 'value2')
          return this.roles.villagers

        case 2:  // if (x === 'value2')
          return this.roles.solos
          
        default:
          return false
      }
    },

    tempList(){
      switch(this.rolesTabs) {
        case 0:  // if (x === 'value1')
          return this.tempWolves

        case 1:  // if (x === 'value2')
          return this.tempVillagers

        case 2:  // if (x === 'value2')
          return this.tempSolos
          
        default:
          return false
      }
    },

    tempCount(){
      let list = {}

      let count  =0
      for(let i in this.roles.wolves){
        let player = this.roles.wolves[i]
        if(player.assigned) count++
      }

      // list.push(count)
      list.wolves = count

      count = 0
      for(let i in this.roles.villagers){
        let player = this.roles.villagers[i]
        if(player.assigned) count++
      }
      // list.push(count)
      list.villagers = count

      count = 0
      for(let i in this.roles.solos){
        let player = this.roles.solos[i]
        if(player.assigned) count++
      }
      // list.push(count)
      list.solos = count


      return list


    },

    continueFlag(){
      if(this.tempCount.wolves == 0){
        if(this.tempCount.solos == 0){
          return false
        }else{
          // this.teamsSituation = ''
          return true
        }
      }

      if(this.tempCount.villagers == 0){
        if(this.tempCount.solos == 0){
          return false
        }else{
          return true
        }
      }



      return true

    },

    teamSituation(){
      // just werewolf is not possible
      // just villager is not possible

      // just solos
      if(this.tempCount.wolves == 0 && this.tempCount.villagers == 0){
        return 'just solos'
      }

      // -----------------------------------

      // wolves, villager
      if(this.tempCount.wolves > 0 && this.tempCount.villagers > 0 && this.tempCount.solos == 0){
        return 'wolves and villagers'
      }

      // wolves, solos
      if(this.tempCount.wolves > 0 && this.tempCount.villagers == 0 && this.tempCount.solos >0){
        return 'wolves and solos'
      }

      // villagers, solos
      if(this.tempCount.wolves == 0 && this.tempCount.villagers > 0 && this.tempCount.solos >0){
        return 'villagers and solos'
      }

      // -----------------------------------


      // with everyone
      if(this.tempCount.wolves > 0 && this.tempCount.villagers > 0 && this.tempCount.solos >0){
        return 'every team'
      }

      return false
      

      
    }, 

    tempAssigned(){
      let list = {}
      let roleList = []
      for(let i in this.roles.wolves){
        let role = this.roles.wolves[i]
        if(role.assigned) roleList.push(role.name)
      }
      list.push(roleList)
      roleList = []

      for(let i in this.roles.villagers){
        let role = this.roles.villagers[i]
        if(role.assigned) roleList.push(role.name)
      }
      list.push(roleList)
      roleList = []

      for(let i in this.roles.solos){
        let role = this.roles.solos[i]
        if(role.assigned) roleList.push(role.name)
      }
      list.push(roleList)
      return list
    },

    notAssignedPlayers(){
      let list = []
      for(let i in this.players){
        let player = this.players[i]
        if(!player.role) list.push(player.name)
      }
      return list
    },

    

    latestData(){
      return this.detailData.slice(-1)[0]
    },

    currentTime(){
      if(this.detailData ==0){
        return 'day'
      }

      if(!this.latestData.isNightOver){
        return `night`
      }else{
        return `day`
      }

      // return false

    },


    // ------------------------------
    canMoveForward(){
      if(this.currentTime == 'day'){
        return true
      }

      if(this.currentTime == 'night'){
        for(let i in this.players){
          let player = this.players[i]
          if(player.canMoveAtNight && !player.doneWihtNightAction) return false
        }
        return true
      }

      return false
    },

    currentSurvivors(){
      let list = {}
      let count = 0
      for(let i in this.players){
        let player = this.players[i]
        if(player.team =='wolves') count++
      }
      list.wolves = count
      count = 0

      for(let i in this.players){
        let player = this.players[i]
        if(player.team =='villagers') count++
      }
      list.villagers = count
      count = 0

      for(let i in this.players){
        let player = this.players[i]
        if(player.team =='solos') count++
      }
      list.solos =count
      count = 0

      return list
    },

    unVotedWolves(){
      let list = []
      for(let i in this.players){
        let player = this.players[i]
        if(player.team == 'wolves' && !player.doneWihtNightAction)  list.push(player.name)
      }

      return list
    },



    
    
    
  },
  mounted(){
    // console.log('hello')
    for(let i in this.roles.wolves){
      let role = this.roles.wolves[i]
      if(!role.default) break;
      this.tempWolves.push(role.name)
      role.assigned = true
    }

    for(let i in this.roles.villagers){
      // console.log('hello')
      let role = this.roles.villagers[i]
      if(!role.default) break;
      this.tempVillagers.push(role.name)
      role.assigned = true
    }
    // console.log('hello')

    for(let i in this.roles.solos){
      let role = this.roles.solos[i]
      if(!role.default) break;
      this.tempSolos.push(role.name)
      role.assigned = true
    }
    // console.log('hello')
    
    // console.log(this.tempWolves)
    // console.log(this.tempVillagers)
    // console.log(this.tempSolos)
  }
}
</script>

<style>
html {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 20px;
  /* background-color: #E0B589; */
  /* padding: 0 0; */
  margin: 0;
  /* height: 100%; */
}
body{
  margin:0;
  padding:0;
  
  height: 100vh;
  /* overflow: hidden; */
  
  
  /* background-color: #E0B589; */
}

.warning{
  color:crimson;
}


@import './assets/styles/style.scss';
/* -------------------------------------------------------- */

.modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  /* bottom: 0; */
  /* height: 667px; */
  z-index: 98;
  background-color: rgba(0, 0, 0, 0.7);
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99;
  
  width: 75%;
  max-width: 400px;
  background-color: #f2f2f2;
  border-radius: 16px;
  
  padding: 25px;
}

.modal h1 {
  color: #222;
  font-size: 32px;
  font-weight: 900;
  margin-bottom: 15px;
}
 
.modal p {
  color: #666;
  font-size: 18px;
  font-weight: 400;
  margin-bottom: 15px;
}

.fade-in {
	opacity: 1;
	animation-name: fadeInOpacity;
	animation-iteration-count: 1;
	animation-timing-function: ease-in;
	animation-duration: .4s;
}
@keyframes fadeInOpacity {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
}


.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}

input[type=text], select {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

input[type=number], select {
  width: 100%;
  padding: 12px 20px;
  margin: 8px 0;
  display: inline-block;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-sizing: border-box;
  font-size: 16px;
}

.modal  .create {
  width: 100%;
  background-color: #4CAF50;
  color: white;
  padding: 14px 20px;
  margin: 10px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal  .join {
  width: 100%;
  background-color: #6495ed;
  color: white;
  padding: 14px 20px;
  margin: 5px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal  .cancel {
  width: 100%;
  background-color: firebrick;
  color: white;
  padding: 14px 20px;
  margin: 20px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tab-button {
  width: 25%;
  background-color:  #363945;
  /* opacity: 0.3; */
  color: white;
  padding: 10px 5px;
  margin: 10px 3%;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.undo-button{
  float:right;
  margin-right:15px;
  width: auto;
  background-color: grey;
  color: white;
  padding: 4px 5px;
  /* margin: 5px 0; */
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.loader {
  border: 16px solid #f3f3f3;
  border-radius: 50%;
  border-top: 16px solid #3498db;
  width: 80px;
  height: 80px;

  -webkit-animation: spin 2s linear infinite; /* Safari */
  animation: spin 2s linear infinite;

  margin: 30px auto;

  
}

/* Safari */
@-webkit-keyframes spin {
  0% { -webkit-transform: rotate(0deg); }
  100% { -webkit-transform: rotate(360deg); }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}




/*  cards */
.players{
  padding-right: 5px;
  padding-left: 5px;
  color: #2c3e50;
  margin-top: 20px;
  /* position: relative; */
  /* background-color: red; */
  display: flex;
  /* width: 100%; */

  /* background: tomato; */
  /* display: flex; */
  flex-flow: row wrap;
  align-content: space-between;
  justify-content: space-between;

}
.card {
  background-color: #939597;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
  transition: 0.3s;
  width: 30%;
  border-radius: 5px;
  margin-left: 1.5%;

  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2); /* this adds the "card" effect */
  /* padding: 0px; */
  text-align: center;
  background-color: #f1f1f1;
  margin-bottom: 15px;
  height: auto;
  font-size: 80%;
}

.line-break {
  width: 100%;
}

.card img {
  margin-top: 10px;
  margin-bottom: 0px;
  border-radius: 5px 5px 0 0;
  height: 35px;
  width: auto;
}

.card .name{
  font-weight: bold;
  margin-bottom: px;
  padding: 10px
  /* color: red */
}




/* nav  */
.nav{
  position: relative;
  padding-top: 20px;
}

.nav img{
  margin-left: 0px;
  margin-bottom: -9px;
  width:30px;
  height:auto;
  /* position: absolute; */
  /* right: -20px */
  /* right: 0; */

}


/* controller  */
.controller{
  /* position: */
  width: 90%;
  margin: 0 auto ;
  margin-top: 20px;
  /* background-color: green; */

}
.controller button {
  width: 120px;
  background-color: #6495ed;
  color: white;
  padding: 14px 8px;
  margin: 5px 0;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}



</style>
