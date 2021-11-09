class Game {
  
  state;
  container
  config;
  gameID;
  steps;
  currentStep;
  isLoading;

  constructor(container) {
    this.container = container;
    this.state = 'stop';
    this.loading(true);
    this.getConfig(); 
    container.find('#new-game').on('click',() => {
      //console.log(this.state);
      this.state = 'play';
      this.startGame();
    });

    this.container.find('#next-step').on('click',() => {
      //console.log(this.state);
      if(this.state == 'play') 
        this.showNextStep();
      else {
        this.state = 'play';
        this.startGame();
      }
    });
  }

  getConfig () {
    let that = this;
    $.ajax({ 
        type: 'GET', 
        url: 'http://62.171.153.163/subul/conf.json', 
        dataType: 'json',
        success: function (data) { 
          that.config = data;
          this.state = 'init';
        },
        error: function (err) {
          console.error('Error: ', err);
        }
    });
  }

  startGame() {
    let game = this.getRandomGame();
   
    while(!this.getMoreExsiting(game.id)){
      game = this.getRandomGame();
    }
    
    this.gameID = game.id;
    this.steps = game.steps;
    this.currentStep = 1;

   
    let solationPathes = this.showRandomSolationPathes(3);
    solationPathes = this.randomSort(solationPathes);
    
    this.loading(false);

    let solationsBox = this.container.find('#solations')
    this.container.find('#steps').html('');
    solationsBox.html('');
    this.container.find('#more-note').html('');


    this.showNextStep();

    solationPathes.forEach(path => {
      let item = $(this.getSolationItem(path));
      item.on('click',this.checkIfCorrect.bind(this))
      solationsBox.append(item);
    })
    


    //console.log(solationPathes);
    //console.log(game);
  }

  loading(isLoading) {
    this.isLoading = isLoading;
    this.state = isLoading ? 'stop' : 'play';
    isLoading ? this.container.addClass('is-loading') : this.container.removeClass('is-loading')
  }

  getRandomGame() {
    return this.config.games[this.getRandomGameId()];
  }

  getCurrentGame() {
    return this.config.games[this.gameID];
  }

  showNextStep() {
    let game = this.getCurrentGame();
    if(game.steps -1 == this.currentStep){
      this.notyify(`We are sorry, no more trials left`);
      return ;
    }
    
    let stepPath = this.getStepImagePath(this.gameID,this.currentStep++)
   
    this.notyify(`The ${this.getStepRank()} out of ${this.steps}`);

    this.container.find('#steps').append(this.getStepItem(stepPath))
  }

  getRandomGameId() {
    let allGames = this.config.games.length;
    return Math.floor(Math.random() * allGames)
  }

  getStepImagePath(gameId,stap) {
    return `/${this.config.root}/${this.config.games[gameId].root}/img${stap}.png`;

  }

  getSolationImagePath(gameId) {
    return `/${this.config.root}/${this.config.games[gameId].root}/img${this.config.games[gameId].steps}.png`;
  }

  showRandomSolationPathes(count) {
    let all = [];
    let selectedIds = [this.gameID];
    all.push(this.getSolationImagePath(this.gameID))

    for (let index = 0; index < count-1; index++) {
      let id;
      let getMore = true;
      while(getMore){
       id = this.getRandomGameId();
       if(!selectedIds.includes(id)) {
        selectedIds.push(id)
        getMore = false
       }

      }
      all.push(this.getSolationImagePath(id))
    }

    return all;
  }

  checkIfCorrect(event) {
    if(this.state !='play'){
      this.stopGame();
      this.notyify('You can press new game button')
      return ;
    }

    let answer = event.currentTarget.getAttribute('src');
    if(this.getSolationImagePath(this.gameID) == answer){
      this.youWin();
      this.stopGame();
    }else{
      this.youFail();
      this.stopGame();
    }
      
  }
  

  getSolationItem(src) {
    return `<img src="${src}" class="solation-item">`
  }

  getStepItem(src) {
    return `<img src="${src}" class="step-item">`
  }

  youWin() {
    this.notyify('You Win')
    this.container.find('#more-note').html(`
      <dev class="success-box">
          <div class="img-box">
              <img src="img/hart.png">
          </div>
          <h3>Excelent!</h3>
          <h4> you guessed in ${this.getStepRank()}</h4>
      </dev>
    `)
  }
  youFail() {
    this.notyify('You Fail')
    this.container.find('#more-note').html(`
      <dev class="fail-box">
          <h3>You Lose!</h3>
          <h4>Try Again</h4>
      </dev>
    `)
  }

  getStepRank(){
    let res = '';
    switch(this.currentStep-1){
      case 1 : res = '1st step'; break;
      case 2 : res = '2nd steps';break;
      case 3 : res = '3rd steps';break;
      default: res = (this.currentStep-1)+'th steps';
    }
    return res;
  }

  stopGame(){
    this.state = 'stop';
    this.container.addClass('no-action');
  }

  notyify(msg){
    this.container.find('#notes').text(msg)
  }

  randomSort (array) {
  var currentIndex = array.length, tempValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    tempValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = tempValue;
  }

  return array;
}

  getMoreExsiting(gameId) {
    try{
        let old = localStorage.getItem("origami_subol");

        if(old){
          old = JSON.parse(old);
          if(old.length == this.config.games.length){
            old = [];
          }
          else if(old.includes(gameId)){
            return false
          }
          old.push(gameId);
          localStorage.setItem("origami_subol",JSON.stringify(old));
        }else{
          localStorage.setItem("origami_subol",JSON.stringify([gameId]));
        }
    }catch(e){
        console.warn('getMoreExsiting not work')
    }
    return true
  }

}

$(function() {
  new Game($('#game-container'))
    
    let days;
    let hoursLeft;
    let hours;
    let minutesLeft;
    let minutes;
    let remainingSeconds;

    let daysEl = document.getElementById('deal_days_1');
    let hourEl = document.getElementById('deal_hrs_1');
    let minEl = document.getElementById('deal_min_1');
    let secEl = document.getElementById('deal_sec_1');

    let startDate = new Date();
    let endDate   = new Date("4/15/2021 10:30");
    let seconds_count = (endDate.getTime() - startDate.getTime()) / 1000;
    function timer() {
        
      days = Math.floor(seconds_count / 24 / 60 / 60);
      hoursLeft = Math.floor((seconds_count) - (days * 86400));
      hours = Math.floor(hoursLeft / 3600);
      minutesLeft = Math.floor((hoursLeft) - (hours * 3600));
      minutes = Math.floor(minutesLeft / 60);
      remainingSeconds = Math.floor(seconds_count % 60);

      function pad(n,lable) {
            n = n < 10 ? "0" + n : ""+n;

            n=n.split('');
            return`
              <h1>${n[0]}</h1>
              <h1>${n[1]}</h1>
              <p>${lable}</p>
            `
      }
      daysEl.innerHTML = pad(days,'Days');
      hourEl.innerHTML = pad(hours,'Hours');
      minEl.innerHTML = pad(minutes,'Minutes');
      secEl.innerHTML = pad(remainingSeconds,'Secound');

      if (seconds_count == 0) {
          clearInterval(countdownTimer);
          daysEl.innerHTML = hourEl.innerHTML = minEl.innerHTML = secEl.innerHTML = pad(0);
      } else {
          seconds_count --;
      }
        
    }

    let countdownTimer = setInterval(timer, 1000)

})

 $(".menu-game-toggle").click(function(e) {
    e.preventDefault();
	  // var isIE11 = !!navigator.userAgent.match(/Trident.*rv\:11\./);
	
    $("#wrapper").toggleClass("toggled");

  	// if(isIE11){
		// 	if($("#wrapper").hasClass("toggled")){
		// 		$('#sidebar-wrapper').css("margin-left", "-52%")
		// 	} else {
		// 			$('#sidebar-wrapper').css("margin-left", "-50%")	
		// 	}	 
		// }
});



;