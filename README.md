# Ritmo — MVP visual

Protótipo mobile em Expo e TypeScript para apoiar estudantes e trabalhadores com TDAH na
organização de atividades e rotinas, com uma interface mobile-first, clara e sem pressão.

## Executar

```bash
npm install
npm run android
```

Também é possível iniciar o Expo e abrir o projeto em um dispositivo Android com Expo Go:

```bash
npm start
```

## Telas do protótipo

- **Hoje:** agenda de exemplo e convite gentil para registrar uma atividade após a aula.
- **Atividades:** cadastro visual de nome, prazo e prioridade.
- **Rotina:** horários editáveis de sono, refeições e foco, além de opção para silenciar lembretes.
- **Google Agenda:** apresentação da conexão e mensagem neutra para continuar sem conectar.

As interações e os dados são temporários e locais à tela. Este MVP não autentica contas Google,
acessa nem sincroniza o Calendar, envia notificações, persiste sessões ou salva dados. A integração
OAuth, as permissões reais de Calendar, a renovação de tokens no servidor e a persistência precisam
ser implementadas em uma etapa posterior.
"# agente-tdah" 
