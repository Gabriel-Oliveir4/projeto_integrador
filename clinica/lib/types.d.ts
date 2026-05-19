//diz para o typescript que o global pode ter uma propriedade mongoose (se tirar da erro em todos os imports de mongoose)

declare global {
  var mongoose: {
    conn: typeof import("mongoose") | null;
    promise: Promise<typeof import("mongoose")> | null;
  };
}

export {};