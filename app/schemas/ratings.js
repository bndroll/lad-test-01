import { model, Schema } from 'mongoose';


const RatingSchema = new Schema({
    movieId: Number,
    rating: Number
});

export const Rating = model('Rating', RatingSchema);