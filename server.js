console.clear()
const express = require('express');
const ejs = require('ejs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const { Client, GatewayIntentBits } = require('discord.js');
const Discord = require("discord.js");
const {
  
  Message,
  EmbedBuilder,
  MessageActionRow,
  MessageSelectMenu,
  MessageButton
} = require('discord.js');
const embed = EmbedBuilder;

const prefix = "!";


const MongoDBURI = process.env.MONGO_URI || 'mongodb://localhost/ManualAuth';

mongoose.connect(MongoDBURI, {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
});

const client = new Client({
	
  intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
	],

});



    


client.on("ready", () => {
     client.user.setActivity("codroid.host", "LISTENING");
      
    console.log("Loaded up!")
});
client.on('ready', async () => {
  console.log(`Token Working`)
    console.log(`Logging in to bot...`)
  console.log(`Logged into ${client.user.username}`)
 
});




client.login(process.env.token);
app.use(session({
  secret: 'work hard',
  resave: true,
  saveUninitialized: false,
  store: new MongoStore({
    mongooseConnection: db
  })
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(__dirname + '/views'));

const index = require('./routes/index');
app.use('/', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('File Not Found');
  err.status = 404;
  next(err);
});

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});

// listen on port 3000
app.listen(process.env.PORT || 3000, () => {
  console.log('Express app listening on port 3000');
});

client.on("messageCreate", async(message) =>{
  if (message.author.bot || !message.guild) return;
  let args = message.content.split(" ");
  let command = args.shift()
  if (command == prefix + `hy`) {
    message.author.send('hy');

    message.reply(`ok`);
  }
  if (command == prefix + `addcoin`) {
    const codro_email =args[0];
    let coin= args[1];
    if(!coin || isNaN(args[1]))
    {
      return message.reply(`invalid coin`);
    }
    if(!codro_email)
    {
      return message.reply(`invalid email`);
    }
       if(!message.member.permissions.has("ADMINISTRATOR")){
    return message.reply("You don't have permission to do that.");
    }
    User.findOne({ email: codro_email}, (err, data) => {
        if(data)
        {
          data.codrocoins= data.codrocoins-(-coin);
          data.save((err, Person) => {
					 if (err)
				 		console.log(err);
					 else{
						console.log('Success'); 
         /*   message.reply(`sucessfully added ${coin} codrocoins for ${codro_email} new balnce is ${data.codrocoins}`);*/
              const codroembed = new EmbedBuilder()
	.setTitle('Added Codrocoins ©')
	.setDescription(`Successfully added ${coin} codrocoins for ${codro_email} new balance is ${data.codrocoins}`)
                .setTimestamp()
               .setColor(0x3498DB);
             
          message.channel.send({ embeds: [codroembed] });
          }
          });
          
        }
        else{
          message.reply(`invalid email ${codro_email}`); 
        }
      })
  }
    
  })