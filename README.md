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

## Leitura da agenda com Gemini

O print é enviado para a API route `src/app/api/agenda/analyze+api.ts`, que chama o Gemini
(Interactions API, saída JSON estruturada, `store: false`) no servidor. A chave nunca vai para o app.

```bash
cp .env.example .env.local   # preencha GEMINI_API_KEY
npm start                     # reinicie o servidor após alterar o .env.local
```

Em builds nativos de produção, a route precisa estar implantada (`npx expo export --platform web`
+ EAS Hosting) e o `origin` do plugin `expo-router` configurado no `app.json`.

## Telas do protótipo

- **Login:** primeira tela, com "Continuar com Google" (login simulado). As abas só ficam
  acessíveis após entrar, e "Sair da conta" na aba Google volta para o login.
- **Configuração (wizard):** aparece logo após o login. O estudante envia um print da grade de
  aulas, o Gemini transcreve as aulas semanais e o estudante revisa antes de salvar na agenda.
- **Hoje:** aulas do dia vindas da agenda configurada e convite gentil para registrar uma atividade após a aula.
- **Atividades:** cadastro visual de nome, prazo e prioridade.
- **Rotina:** horários editáveis de sono, refeições e foco, além de opção para silenciar lembretes.
- **Google Agenda:** conta conectada, sincronização (em breve) e opção de sair.

As interações e os dados são temporários e locais à tela. Este MVP não autentica contas Google,
acessa nem sincroniza o Calendar, envia notificações, persiste sessões ou salva dados. A integração
OAuth, as permissões reais de Calendar, a renovação de tokens no servidor e a persistência precisam
ser implementadas em uma etapa posterior.
"# agente-tdah" 
