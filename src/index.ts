import { TwitterApi, UserV2 } from "twitter-api-v2";
import { PrismaClient } from "@prisma/client";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { ToadScheduler, SimpleIntervalJob, AsyncTask } from "toad-scheduler";

const prisma = new PrismaClient();

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY as string,
  appSecret: process.env.TWITTER_CONSUMER_SECRET as string,
  accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY as string,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET as string,
});

const apiId = parseInt(process.env.API_ID as string);
const apiHash = process.env.API_HASH as string;
const stringSession = new StringSession(process.env.SESSION as string);

const tgClient = new TelegramClient(stringSession, apiId, apiHash, {
  connectionRetries: 5,
});

(async () => await tgClient.connect())();

const id = "2528783778";
// let name: string, id: string, followers_count: number, friends_count: number;

// (async () => {
//   const user = await client.currentUser();
//   //console.log(user);
//   name = user.name;
//   id = user.id_str;
//   followers_count = user.followers_count;
//   friends_count = user.friends_count;
// })();

//const summary = `${name} (id: ${id}) has ${followers_count} followers and is following ${friends_count} accounts.`;
//console.log(summary);

async function newFollowers(currentFollower: UserV2) {
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
      .catch((e) => console.log(e));
  }
}

async function newFollowing(currentFollowing: UserV2) {
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
      .catch((e) => console.log(e));
  }
}

async function trackUnfollows(idList: string[]) {
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
  if (badPeople && badPeople.length > 0) {
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
      await prisma.deleted
        .create({
          data: {
            userId: f.userId,
          },
        })
        .catch(() =>
          console.log(
            "No se pudo agregar a los Eliminados, probablemente ya exista"
          )
        );
    }
  }
}

async function trackUnfollowings(idList: string[]) {
  const badPeople = await prisma.following
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
  if (badPeople && badPeople.length > 0) {
    for (let i = 0; i < badPeople.length; i++) {
      const f = badPeople[i];
      const text = `You stop following ${f.name} (https://twitter.com/${f.username}).`;
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
      await prisma.following
        .delete({
          where: {
            userId: f.userId,
          },
        })
        .then(() => {
          console.log("Deleted");
        })
        .catch((e) => console.log(e));
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
  const text = `Followers: ${followerCount}\nFollowing: ${followingCount}`;
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
  await trackUnfollowings(idList);
}

// TODO: notFollowing()

async function main() {
  await followingloop();
  await followersLoop();
  await comparison();
  // process.exit(0);
}

//main();

const scheduler = new ToadScheduler();

const task = new AsyncTask(
  "simple task",
  async () => {
    await main();
  },
  (err) => console.log(err)
);
const job = new SimpleIntervalJob(
  { hours: 8, runImmediately: true },
  task,
  "check my twitter"
);

scheduler.addSimpleIntervalJob(job);

console.log("Status: ", scheduler.getById("check my twitter").getStatus());
