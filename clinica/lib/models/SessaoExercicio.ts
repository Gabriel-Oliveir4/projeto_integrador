import mongoose, {Schema, Document, Types} from "mongoose";

export interface ISessaoExercicio extends Document {
    exercicio: Types.ObjectId;
    sessao: Types.ObjectId;
    status: "realizado" | "adaptado" | "nao_realizado" | "superado";
    comentario?: string;
}

const SessaoExercicioSchema: Schema = new Schema<ISessaoExercicio>({
    exercicio: {type: Schema.Types.ObjectId, ref: "Exercicio", required: true},
    sessao: {type: Schema.Types.ObjectId, ref: "Sessao", required: true},
    status: {type: String, enum: ["realizado", "adaptado", "nao_realizado", "superado"], default: "realizado"},
    comentario: {type: String}
}, { timestamps: true });

export default mongoose.models.SessaoExercicio || mongoose.model<ISessaoExercicio>("SessaoExercicio", SessaoExercicioSchema);