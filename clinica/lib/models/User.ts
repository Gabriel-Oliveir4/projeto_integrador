import mongoose, {Schema, Document} from "mongoose";

export interface IUser extends Document {
    nome: string;
    sobrenome:string;
    email: string;
    senha: string;
    celular?: string;
}

const UserSchema: Schema = new Schema({
    nome: {type: String, required: true, trim: true },
    sobrenome: {type: String, required: true, trim: true },
    email: {type: String, required: true, unique: true, trim: true, lowercase: true },
    senha: {type: String, required: true, select: false },
    celular: {type: String}
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
