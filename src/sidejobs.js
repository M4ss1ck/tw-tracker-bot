import { TwitterApi } from "twitter-api-v2";
//import { TelegramClient } from "telegram";
// import Sesion from "telegram/sessions";

// const { StringSession } = Sesion;

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// const apiId = parseInt(process.env.API_ID);
// const apiHash = process.env.API_HASH;
// const stringSession = new StringSession(process.env.SESSION);

// const tgClient = new TelegramClient(stringSession, apiId, apiHash, {
//   connectionRetries: 5,
// });

// await tgClient.connect();

let fList = [];

const sorteo = async () => {
  const baguFollowers = await client.v2.followers("1451517972904878097", {
    asPaginator: true,
  });
  for await (const follower of baguFollowers) {
    fList.push(follower.username);
  }
  const random = Math.floor(Math.random() * fList.length);
  const resultado = fList[random];
  console.log(resultado);
};

sorteo();
