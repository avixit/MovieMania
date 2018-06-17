'use strict';
const Alexa = require('alexa-sdk');

const APP_ID = 'amzn1.ask.skill.f1cc11d8-2494-4a62-8303-58ed843bd8ee';

const SKILL_NAME = 'Movie Mania';
const HELP_MESSAGE = 'You can ask for a movie name and I will tell you the year it was published. For example, \'Tell me about Amazing Spider man\'';
const STOP_MESSAGE = 'Thank you for using Movie Mania skill! To launch again, say \'Movie Mania\'. Have a great day.';
const WELCOME_MESSAGE = 'Welcome to ' + SKILL_NAME + '. ' + HELP_MESSAGE;

var http = require('http');

const allMovieManiaHandlers = {
    'LaunchRequest': function () {
        this.emit('welcomeIntent');
    },
    'welcomeIntent': function () {
        this.emit(":ask", WELCOME_MESSAGE);
    },
    'movieDetailsIntent': function () {
		var movieName = (this.event.request.intent.slots.movieNameWordOne.value + ' ' + 
                        this.event.request.intent.slots.movieNameWordTwo.value + ' ' + 
                        this.event.request.intent.slots.movieNameWordThree.value + ' ' + 
                        this.event.request.intent.slots.movieNameWordFour.value + ' ' + 
                        this.event.request.intent.slots.movieNameWordFive.value + ' ' + 
                        this.event.request.intent.slots.movieNameWordSix.value).replace(/undefined/g,'').trim();
						
		 console.log('movie : '+movieName);
       
		getDataFromTheMovieDBapi(movieName, this);
    },
    'AMAZON.HelpIntent': function () {
        this.emit(':ask', HELP_MESSAGE);
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak(STOP_MESSAGE);
        this.emit(':responseReady');
    },
    'Unhandled': function() {
        this.emit(':ask', 'Sorry, I did not get that. Try saying a again.');
    },
};

function getDataFromTheMovieDBapi(movieName, obj){

		httpGetTheMovieDBapi(movieName,  (movieObj) => {
		   
				if(movieObj == null){
					obj.response.speak('Sorry, I could not find any movie like \'' + movieName + '\'');
					obj.emit(':responseReady');
				}else{
				    var dateArr = movieObj.release_date.split('-');
					obj.emit(':ask', 'Movie \'' + movieObj.title + '\' was released in ' + dateArr[2] + '/' + dateArr[1] + '/' + dateArr[0] + '. Say a movie name to continue.');
				}
		});

}

function httpGetTheMovieDBapi(movieName, callBack){
    
   var url = 'http://api.themoviedb.org/3/search/movie?api_key=5357c68c829e4039d7ac719cb306467d&query='+movieName; 
   console.log("Requesting: " + url); 
   var responseJSON=new Object(), speechOutput; 
    
    http.get(url, function(res){
                res.setEncoding('utf8'); 
                res.on('data', function(responseRAW){ 
                console.log('responseRAW:'+responseRAW);
                   
                if(responseRAW) 
                {   
                    try
                    {
                        responseJSON = JSON.parse(responseRAW); 
                    }
                    catch(e)
                    {
                        if (e instanceof SyntaxError)
                        {
                            console.log('JSON Parse error identified. Trying split method to find movie details.');
                            var result = [ [] ];
                            result[0].title = responseRAW.split(':')[9].split("\"")[1];
                            result[0].release_date = responseRAW.split(':')[18].split("\"")[1];
                            
                            responseJSON.results = result;
                        } 
                        else 
                        {
                            console.log("I caught an error, but it wasn't a SyntaxError. I handle all non-SyntaxErrors here.");
                        }
                    }
                
                }
                else
                { 
                       console.log('Unable to resolve web request to happycloud.') 
                }
                
                if(responseJSON.Error) 
                {
                     callBack(null);
                }else{
                    callBack(responseJSON.results[0]);
                }       
                
               }); 
       }).on('error', function (e) { 
           speechOutput = 'Please try another movie'; 
           console.log(speechOutput);
           callBack(null);
       });
       
}

exports.handler = function (event, context, callback) {
    const alexa = Alexa.handler(event, context, callback);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(allMovieManiaHandlers);
    alexa.execute();
};
