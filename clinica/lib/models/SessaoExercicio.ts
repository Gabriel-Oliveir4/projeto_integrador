import mongoose, {Schema, Document, Types} from "mongoose";

export interface ISessaoExercicio extends Document {
    planoexercicio: Types.ObjectId;
    sessao: Types.ObjectId;
    status: "realizado" | "adaptado" | "nao_realizado" | "superado";
    comentario?: string;
}

const SessaoExercicioSchema: Schema = new Schema<ISessaoExercicio>({
    planoexercicio: {type: Schema.Types.ObjectId, ref: "PlanoExercicio", required: true},
    sessao: {type: Schema.Types.ObjectId, ref: "Sessao", required: true},
    status: {type: String, enum: ["realizado", "adaptado", "nao_realizado", "superado"], default: "realizado"},
    comentario: {type: String}
}, { timestamps: true });

export default mongoose.models.SessaoExercicio || mongoose.model<ISessaoExercicio>("SessaoExercicio", SessaoExercicioSchema);