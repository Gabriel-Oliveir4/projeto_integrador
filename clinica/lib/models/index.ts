// Registra todos os models no mongoose.
// Importar este arquivo garante que populate() encontre qualquer ref,
// mesmo em cold start de serverless (Vercel).
import "./User";
import "./Paciente";
import "./Exercicio";
import "./PlanoTratamento";
import "./PlanoExercicio";
import "./sessao";
import "./SessaoExercicio";
import "./Anexo";
