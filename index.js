import { TwitterApi } from "twitter-api-v2";
import Prisma from "@prisma/client";
import { TelegramClient } from "telegram";
import Sesion from "telegram/sessions";

const { StringSession } = Sesion;

const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

const apiId = parseInt(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION);

const tgClient = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

await tgClient.connect();

const {
  name,
  id_str: id,
  followers_count,
  friends_count,
} = await client.currentUser();

const summary = `${name} (id: ${id}) has ${followers_count} followers and is following ${friends_count} accounts.`;
console.log(summary);

// const { includes } = await client.v2.me({ expansions: ["pinned_tweet_id"] });
// console.log(includes.tweets);

// const { data: createdTweet } = await client.v2.tweet(
//   "first tweet from twitter-api-v2 🚶‍♂️"
// );
// console.log("Tweet", createdTweet.id, ":", createdTweet.text);

async function newFollowers(currentFollower) {
  const info = await prisma.follower
    .findUnique({
      where: {
        userId: currentFollower.id,
      },
    })
    .catch((e) => console.log(e));
  if (info === null) {
    await prisma.follower
      .create({
        data: {
          userId: currentFollower.id,
          name: currentFollower.name,
          username: currentFollower.username,
        },
      })
      .then(async () => {
        const text = `New follower: ${currentFollower.name} (https://twitter.com/${currentFollower.username})`;
        console.log(text);
        await tgClient
          .sendMessage("me", {
            message: text,
            linkPreview: false,
            parseMode: "html",
          })
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e))
      .finally(async () => {
        await prisma.$disconnect();
      });
  }
}

async function newFollowing(currentFollowing) {
  const info = await prisma.following
    .findUnique({
      where: {
        userId: currentFollowing.id,
      },
    })
    .catch((e) => console.log(e));
  if (info === null) {
    await prisma.following
      .create({
        data: {
          userId: currentFollowing.id,
          name: currentFollowing.name,
          username: currentFollowing.username,
        },
      })
      .then(async () => {
        const text = `Now following: ${currentFollowing.name} (https://twitter.com/${currentFollowing.username})`;
        console.log(text);
        await tgClient
          .sendMessage("me", {
            message: text,
            linkPreview: false,
            parseMode: "html",
          })
          .catch((e) => console.log(e));
      })
      .catch((e) => console.log(e))
      .finally(async () => {
        await prisma.$disconnect();
      });
  }
}

async function trackUnfollows(idList) {
  const badPeople = await prisma.follower
    .findMany({
      where: {
        userId: {
          notIn: idList,
        },
      },
    })
    .catch((e) => console.log(e))
    .finally(async () => {
      await prisma.$disconnect();
    });
  if (badPeople.length > 0) {
    for (let i = 0; i < badPeople.length; i++) {
      const f = badPeople[i];
      const text = `${f.name} (https://twitter.com/${f.username}) unfollowed you.`;
      await tgClient
        .sendMessage("me", {
          message: text,
          linkPreview: false,
          parseMode: "html",
        })
        .catch((e) => console.log(e));
      console.log(text);
      console.log(f);
      // borrar de la base de datos
      await prisma.follower
        .delete({
          where: {
            userId: f.userId,
          },
        })
        .then(() => {
          console.log("Deleted");
        })
        .catch((e) => console.log(e));
      await prisma.deleted.create({
        data: {
          userId: f.userId,
        },
      });
    }
  }
}

async function comparison() {
  const followerCount = await prisma.follower
    .count()
    .catch((e) => console.log(e));
  const followingCount = await prisma.following
    .count()
    .catch((e) => console.log(e));
  const text = `Followers in DB: ${followerCount}\nIn Twitter: ${followers_count}\nFollowing in DB: ${followingCount}\nIn Twitter: ${friends_count}`;
  console.log(text);
  await tgClient
    .sendMessage("me", { message: text })
    .catch((e) => console.log(e));
}

async function followersLoop() {
  let idList = [];
  // followers ={id, name, username}
  const followers = await client.v2.followers(id, { asPaginator: true });
  for await (const follower of followers) {
    idList.push(follower.id);
    await newFollowers(follower);
  }
  await trackUnfollows(idList);
}

async function followingloop() {
  let idList = [];
  // following ={id, name, username}
  const iAmFollowing = await client.v2.following(id, { asPaginator: true });
  for await (const following of iAmFollowing) {
    idList.push(following.id);
    await newFollowing(following);
  }
}

async function main() {
  await followingloop();
  await followersLoop();
  await comparison();
  process.exit(0);
}

main();
