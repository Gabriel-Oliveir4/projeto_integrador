import mongoose, { Schema, Document } from "mongoose";

export interface IExercicios extends Document {
    nome: string;
    descricao: string;
}

const ExercicioSchema = new Schema<IExercicios>({
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, required: true },
});

ExercicioSchema.index({ nome: 1 });

export default mongoose.models.Exercicio || mongoose.model<IExercicios>("Exercicio", ExercicioSchema);
