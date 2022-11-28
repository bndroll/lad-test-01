import { model, Schema } from 'mongoose';


const MoviesMetadataSchema = new Schema({
    id: Number,
    original_title: String
});

export const MoviesMetadata = model('MoviesMetadata', MoviesMetadataSchema);