'use strict';
const { app, initDb } = require('./app');

const PORT = process.env.PORT || 3001;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`chave-ms-auth rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Falha ao inicializar banco:', err);
    process.exit(1);
  });
