const config = {
  prefix: "!"
}
const mySecret = process.env['TOKEN']
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const AppleMusic  = require("erela.js-apple");
const Facebook = require("erela.js-facebook");
const Deezer  = require("erela.js-deezer");
const filter  = require("erela.js-filters");
const Spotify = require("better-erela.js-spotify").default;
const { Manager } = require("erela.js");

const client = new Client();
client.commands = new Collection();

const files = readdirSync("./commands")
  .filter(file => file.endsWith(".js"));

for (const file of files) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.manager = new Manager({
  nodes: [
    {
      host: "lava.link",
      port: 80,
      pass: "youshallnotpass", 
    }
  ],
  autoPlay: true,
  plugins: [
    new AppleMusic(),
    new Facebook(),
    new Deezer(),
    new Spotify(),
    new filter()
  ],
  send: (id, payload) => {
    const guild = client.guilds.cache.get(id);
    if (guild) guild.shard.send(payload);
  }
})
  .on("nodeConnect", node => console.log(`Node "${node.options.identifier}" connected.`))
  .on("nodeError", (node, error) => console.log(
    `Node "${node.options.identifier}" encountered an error: ${error.message}.`
  ))
  .on("trackStart", (player, track) => {
    const channel = client.channels.cache.get(player.textChannel);
    channel.send(`Now playing: \`${track.title}\`, 님이 틀었습니다. \`${track.requester.tag}\`.`);
  })
  .on("queueEnd", player => {
    const channel = client.channels.cache.get(player.textChannel);
    channel.send("Queue has ended.");
    player.destroy();
  });

client.once("ready", () => {
  client.manager.init(client.user.id);
  console.log(`Logged in as ${client.user.tag}`);
});

client.on("raw", d => client.manager.updateVoiceState(d));

client.on("message", async message => {
  if (!message.content.startsWith(config.prefix) || !message.guild || message.author.bot) return;
  const [name, ...args] = message.content.slice(1).split(/\s+/g);

  const command = client.commands.get(name);
  if (!command) return;

  try {
    command.run(message, args);
  } catch (err) {
    message.reply(`an error occurred while running the command: ${err.message}`);
  }
});

client.on('message',msg=>{
  if(msg.content === '하이'){
    msg.reply('안녕하세요')
  }
})
client.on('message',msg=>{
  if(msg.content === 'ㅋㅋㅋㅋ'){
    msg.reply('왜 웃는거죠 휴먼')
  }
})
client.on('message',msg=>{
  if(msg.content === '시발봇'){
    msg.reply('그 옛날 렝귤러도 이기는 나 시발자동차를 왜 부르는거지?')
  }
})


client.login(mySecret);
