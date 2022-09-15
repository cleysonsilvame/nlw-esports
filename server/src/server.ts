import { PrismaClient } from "@prisma/client";
import express from "express";
import cors from "cors";
import { convertHourStringToMinutes } from "./utils/covert-hour-string-to-minutes";
import { convertMinutesToHourString } from "./utils/covert-minutes-to-hour-string";

const app = express();
app.use(express.json());
app.use(cors());
const prisma = new PrismaClient();

app.get("/games", async (_, response) => {
  const games = await prisma.game.findMany({
    include: {
      _count: {
        select: {
          ads: true,
        },
      },
    },
  });

  return response.json(games);
});

app.post("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;
  const body = request.body;

  //validations - zod js

  const ad = await prisma.ad.create({
    data: {
      gameId,
      name: body.name,
      discord: body.discord,
      yearsPlaying: body.yearsPlaying,
      weekDays: body.weekDays.join(","),
      hourStart: convertHourStringToMinutes(body.hourStart),
      hourEnd: convertHourStringToMinutes(body.hourEnd),
      useVoiceChannel: body.useVoiceChannel,
    },
  });

  return response.status(201).json(ad);
});

app.get("/games/:id/ads", async (request, response) => {
  const gameId = request.params.id;

  const ads = await prisma.ad.findMany({
    select: {
      id: true,
      name: true,
      yearsPlaying: true,
      weekDays: true,
      hourStart: true,
      hourEnd: true,
      useVoiceChannel: true,
    },
    where: {
      gameId,
    },
  });

  return response.json(
    ads.map(ad => {
      return {
        ...ad,
        weekDays: ad.weekDays.split(","),
        hourStart: convertMinutesToHourString(ad.hourStart),
        hourEnd: convertMinutesToHourString(ad.hourEnd),
      };
    })
  );
});

app.get("/ads/:id/discord", async (request, response) => {
  const adId = request.params.id;

  const ad = await prisma.ad.findUniqueOrThrow({
    select: {
      discord: true,
    },
    where: {
      id: adId,
    },
  });

  return response.json(ad);
});

app.listen(3333);
