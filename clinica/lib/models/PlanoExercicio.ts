import mongoose, {Schema, Document, Types} from "mongoose";

export interface IPlanoExercicio extends Document {
    planotratamento: Types.ObjectId;
    exercicio: Types.ObjectId;
    ordem: number;
}

const PlanoExercicioSchema: Schema = new Schema<IPlanoExercicio>({
    planotratamento: {type: Schema.Types.ObjectId, ref: "PlanoTratamento", required: true},
    exercicio: {type: Schema.Types.ObjectId, ref: "Exercicio", required: true},
    ordem: {type: Number, required: true}
});

export default mongoose.models.PlanoExercicio || mongoose.model<IPlanoExercicio>("PlanoExercicio", PlanoExercicioSchema);