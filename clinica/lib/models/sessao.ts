import mongoose, {Schema, Document, Types} from "mongoose";

export interface ISessao extends Document {
    paciente: Types.ObjectId;
    planoTratamento: Types.ObjectId;
    data: Date;
    status: "agendado" | "em_andamento"  | "cancelado" | "concluido" | "nao_compareceu";
    observacoesGerais?: string;
}

const SessaoSchema: Schema = new Schema<ISessao>({
    paciente: {type: Schema.Types.ObjectId, ref: "Paciente", required: true},
    planoTratamento: {type: Schema.Types.ObjectId, ref: "PlanoTratamento", required: true},
    data: {type: Date, required: true},
    status: {type: String, enum: ["agendado", "em_andamento", "cancelado", "concluido", "nao_compareceu"], default: "agendado"},
    observacoesGerais: {type: String}
}, { timestamps: true });

export default mongoose.models.Sessao || mongoose.model<ISessao>("Sessao", SessaoSchema);