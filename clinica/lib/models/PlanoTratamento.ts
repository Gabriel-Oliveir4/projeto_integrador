import mongoose, {Schema, Document, Types} from "mongoose";

export interface IPlanoTratamento extends Document {
    paciente: Types.ObjectId;
    queixa: string;
    historico?: string;
    diagnostico?: string;
    objetivo?: string;
    frequenciaSemanal?: number;
    sessoesPrevistas?: number;
    dataInicio?: Date;
    previsaoAlta?: Date;
    exercicios: Types.ObjectId[];
    status: "ativo" | "finalizado" | "cancelado";
}

const PlanoTratamentoSchema = new Schema<IPlanoTratamento>({
    paciente: { type: Schema.Types.ObjectId, ref: "Paciente", required: true },
    queixa: { type: String, required: true },
    historico: { type: String },
    diagnostico: { type: String },
    objetivo: { type: String },
    frequenciaSemanal: { type: Number },
    sessoesPrevistas: { type: Number },
    dataInicio: { type: Date },
    previsaoAlta: { type: Date },
    exercicios: [{ type: Schema.Types.ObjectId, ref: "Exercicio" }],
    status: { type: String, enum: ["ativo", "finalizado", "cancelado"], default: "ativo" }
}, { timestamps: true });

export default mongoose.models.PlanoTratamento || mongoose.model<IPlanoTratamento>("PlanoTratamento", PlanoTratamentoSchema);