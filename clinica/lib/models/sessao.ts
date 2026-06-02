import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISessaoExercicioEmbed {
    _id?: Types.ObjectId;
    exercicio: Types.ObjectId;
    nome: string;
    descricao: string;
    ordem: number;
    status: "realizado" | "adaptado" | "nao_realizado" | "superado";
    comentario?: string;
}

export interface ISessao extends Document {
    fisio: Types.ObjectId;
    paciente: Types.ObjectId;
    pacienteNome: string;
    planoTratamento: Types.ObjectId;
    planoQueixa?: string;
    data: Date;
    status: "agendado" | "em_andamento" | "cancelado" | "concluido" | "nao_compareceu";
    observacoesGerais?: string;
    exercicios: ISessaoExercicioEmbed[];
}

const SessaoExercicioEmbedSchema = new Schema<ISessaoExercicioEmbed>({
    exercicio: { type: Schema.Types.ObjectId, ref: "Exercicio", required: true },
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    ordem: { type: Number, default: 0 },
    status: { type: String, enum: ["realizado", "adaptado", "nao_realizado", "superado"], default: "realizado" },
    comentario: { type: String },
}, { _id: true });

const SessaoSchema = new Schema<ISessao>({
    fisio: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paciente: { type: Schema.Types.ObjectId, ref: "Paciente", required: true },
    pacienteNome: { type: String, required: true },
    planoTratamento: { type: Schema.Types.ObjectId, required: true },
    planoQueixa: { type: String },
    data: { type: Date, required: true },
    status: { type: String, enum: ["agendado", "em_andamento", "cancelado", "concluido", "nao_compareceu"], default: "agendado" },
    observacoesGerais: { type: String },
    exercicios: { type: [SessaoExercicioEmbedSchema], default: [] },
}, { timestamps: true });

SessaoSchema.index({ fisio: 1, data: 1 });
SessaoSchema.index({ paciente: 1, data: -1 });
SessaoSchema.index({ fisio: 1, status: 1, data: 1 });

export default mongoose.models.Sessao || mongoose.model<ISessao>("Sessao", SessaoSchema);
