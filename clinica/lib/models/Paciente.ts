import mongoose, {Schema, Document, Types} from "mongoose"; 

export interface IPaciente extends Document {
    nome: string;
    sobrenome: string;
    dataNascimento?: Date;
    sexo?: string;
    celular?: string;
    observacoes?: string;
    status: "ativo" | "inativo";
}

const PacienteSchema = new Schema<IPaciente>({
    fisio: { type: Schema.Types.ObjectId, ref: "User", required: true },
    nome: { type: String, required: true, trim: true },
    sobrenome: { type: String, required: true, trim: true },
    dataNascimento: { type: Date },
    sexo: { type: String, enum: ["masculino", "feminino", "outro"] },
    celular: { type: String },
    observacoes: { type: String },
    status: { type: String, enum: ["ativo", "inativo"], default: "ativo" } //inicialmente cria ativo, fica inativo quando completar o tratamento ou caso o fisioterapeuta alterare manualmente
}, { timestamps: true });

export default mongoose.models.Paciente || mongoose.model<IPaciente>("Paciente", PacienteSchema);