import mongoose, {Schema, Document, Types} from "mongoose";

export interface IExercicios extends Document {
    nome: string;
    descricao: string;
}

const ExercicioSchema: Schema = new Schema<IExercicios>({
    nome: {type: String, required: true},
    descricao: {type: String, required: true}
});

export default mongoose.models.Exercicio || mongoose.model<IExercicios>("Exercicio", ExercicioSchema);