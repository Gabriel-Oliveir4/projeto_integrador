import mongoose, {Schema, Document, Types} from "mongoose";

export interface IAnexo extends Document {
    planotratamento: Types.ObjectId;
    nomeArquivo: string;
    urlArquivo: string;
    anotacao?: string;
}

const AnexoSchema: Schema = new Schema<IAnexo>({
    planotratamento: {type: Schema.Types.ObjectId, ref: "PlanoTratamento", required: true},
    nomeArquivo: {type: String, required: true},
    urlArquivo: {type: String, required: true},
    anotacao: {type: String}
}, { timestamps: true });

export default mongoose.models.Anexo || mongoose.model<IAnexo>("Anexo", AnexoSchema);