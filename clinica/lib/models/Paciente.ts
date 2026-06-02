import mongoose, { Schema, Document, Types } from "mongoose";

export interface IPlanoAnexo {
    _id?: Types.ObjectId;
    nomeArquivo: string;
    urlArquivo: string;
    anotacao?: string;
    createdAt?: Date;
}

export interface IPlanoExercicioEmbed {
    _id?: Types.ObjectId;
    exercicio: Types.ObjectId;
    nome: string;
    descricao: string;
    ordem: number;
}

export interface IPlanoTratamentoEmbed {
    _id?: Types.ObjectId;
    queixa: string;
    historico?: string;
    diagnostico?: string;
    objetivo?: string;
    frequenciaSemanal?: number;
    sessoesPrevistas?: number;
    dataInicio?: Date;
    previsaoAlta?: Date;
    status: "ativo" | "finalizado" | "cancelado";
    exercicios: IPlanoExercicioEmbed[];
    anexos: IPlanoAnexo[];
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IPaciente extends Document {
    fisio: Types.ObjectId;
    nome: string;
    sobrenome: string;
    dataNascimento?: Date;
    sexo?: string;
    celular?: string;
    observacoes?: string;
    status: "ativo" | "inativo";
    planos: IPlanoTratamentoEmbed[];
    sessoesRealizadas: number;
    ultimaSessao?: Date;
    proximaSessao?: Date;
}

const PlanoAnexoSchema = new Schema<IPlanoAnexo>({
    nomeArquivo: { type: String, required: true },
    urlArquivo: { type: String, required: true },
    anotacao: { type: String },
}, { timestamps: { createdAt: true, updatedAt: false } });

const PlanoExercicioEmbedSchema = new Schema<IPlanoExercicioEmbed>({
    exercicio: { type: Schema.Types.ObjectId, ref: "Exercicio", required: true },
    nome: { type: String, required: true },
    descricao: { type: String, required: true },
    ordem: { type: Number, required: true },
}, { _id: true });

const PlanoTratamentoEmbedSchema = new Schema<IPlanoTratamentoEmbed>({
    queixa: { type: String, required: true },
    historico: { type: String },
    diagnostico: { type: String },
    objetivo: { type: String },
    frequenciaSemanal: { type: Number },
    sessoesPrevistas: { type: Number },
    dataInicio: { type: Date },
    previsaoAlta: { type: Date },
    status: { type: String, enum: ["ativo", "finalizado", "cancelado"], default: "ativo" },
    exercicios: { type: [PlanoExercicioEmbedSchema], default: [] },
    anexos: { type: [PlanoAnexoSchema], default: [] },
}, { timestamps: true });

const PacienteSchema = new Schema<IPaciente>({
    fisio: { type: Schema.Types.ObjectId, ref: "User", required: true },
    nome: { type: String, required: true, trim: true },
    sobrenome: { type: String, required: true, trim: true },
    dataNascimento: { type: Date },
    sexo: { type: String, enum: ["masculino", "feminino", "outro"] },
    celular: { type: String },
    observacoes: { type: String },
    status: { type: String, enum: ["ativo", "inativo"], default: "ativo" },
    planos: { type: [PlanoTratamentoEmbedSchema], default: [] },
    sessoesRealizadas: { type: Number, default: 0 },
    ultimaSessao: { type: Date },
    proximaSessao: { type: Date },
}, { timestamps: true });

PacienteSchema.index({ fisio: 1, status: 1 });
PacienteSchema.index({ fisio: 1, nome: 1 });
PacienteSchema.index({ fisio: 1, "planos.status": 1 });

export default mongoose.models.Paciente || mongoose.model<IPaciente>("Paciente", PacienteSchema);
