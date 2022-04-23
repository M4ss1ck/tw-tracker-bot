import { TwitterApi } from "twitter-api-v2";
import Prisma from "@prisma/client";

const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

const client = new TwitterApi({
  appKey: process.env.TWITTER_CONSUMER_KEY,
  appSecret: process.env.TWITTER_CONSUMER_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN_KEY,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

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
      .then(() => {
        const text = "New follower: " + currentFollower.name;
        console.log(text);
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
      console.log(f.name + " (@" + f.username + ") unfollowed me");
      console.log(f);
      // borrar de la base de datos
      await prisma.follower
        .delete({
          where: {
            userId: f.userId,
          },
        })
        .then(() => console.log("Deleted"))
        .catch((e) => console.log(e));
    }
  }
}

async function countStoredFollowers() {
  const count = await prisma.follower.count().catch((e) => console.log(e));
  console.log("Stored: " + count + "\nIn Twitter: " + followers_count);
}

async function followLoop() {
  let idList = [];
  // followers ={id, name, username}
  const followers = await client.v2.followers(id, { asPaginator: true });
  for await (const follower of followers) {
    idList.push(follower.id);
    await newFollowers(follower);
  }
  await trackUnfollows(idList);
}

followLoop();
countStoredFollowers();
