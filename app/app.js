import mongoose from 'mongoose';
import dotenv from 'dotenv';
import csv from 'fast-csv';
import axios from 'axios';
import { Rating } from './schemas/ratings.js';
import { MoviesMetadata } from './schemas/movies-metadata.js';


dotenv.config();


const run = async (mongoPath) => {
    await mongoose.connect(mongoPath);

    let batchArr = [];
    let counter = 0;

    let res = await axios.get(`http://localhost:${process.env.SERVER_PORT}/file/ratings.csv`, {responseType: 'stream'});
    let stream = res.data.pipe(csv.parse({headers: true}));

    for await (const record of stream) {
        const {movieId, rating} = record;
        batchArr.push({movieId, rating});
        counter++;

        if (counter >= 1000) {
            stream.pause();
            await Rating.insertMany(batchArr);
            batchArr = [];
            counter = 0;
            stream.resume();
        }
    }

    await Rating.insertMany(batchArr);
    batchArr = [];
    counter = 0;

    res = await axios.get(`http://localhost:${process.env.SERVER_PORT}/file/movies_metadata.csv`, {responseType: 'stream'});
    stream = res.data.pipe(csv.parse({headers: true}));

    for await (const record of stream) {
        const {id, original_title} = record;
        batchArr.push({id, original_title});
        counter++;

        if (counter >= 1000) {
            stream.pause();
            await MoviesMetadata.insertMany(batchArr);
            batchArr = [];
            counter = 0;
            stream.resume();
        }
    }

    await MoviesMetadata.insertMany(batchArr);

    await Rating.aggregate([
        {
            $lookup: {
                from: 'moviesmetadatas',
                localField: 'movieId',
                foreignField: 'id',
                as: 'records'
            }
        },
        {$addFields: {recordsSize: {$size: '$records'}}},
        {$match: {recordsSize: {$gte: 1}}},
        {$unset: ['recordsSize']},
        {$sort: {rating: -1}},
        {$limit: 10}
    ])
        .exec()
        .then(result => {
            for (const item of result) {
                console.log(`Название фильма\t${item.records[0].original_title}\nСредний рейтинг\t${item.rating}\n`);
            }
        });
};

run(process.env.MONGO_URL);