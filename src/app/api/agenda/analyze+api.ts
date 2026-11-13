// Server-only route: POST /api/agenda/analyze
// Sends a screenshot of the student's academic agenda to Gemini and returns
// the weekly classes as structured JSON. GEMINI_API_KEY never reaches the app bundle.

import { WEEKDAYS, type AnalyzeAgendaResponse, type ClassEvent } from '@/lib/schedule-model';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions';
const GEMINI_API_REVISION = '2026-05-20';
const DEFAULT_MODEL = 'gemini-3.8-flash';
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const MAX_BASE64_LENGTH = 14_000_000; // ~10 MB image, well under Gemini's 20 MB inline limit
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

const PROMPT = `Você transcreve a grade horária acadêmica de um estudante a partir de um print
(captura de tela) de um portal acadêmico, aplicativo ou planilha.

Siga este procedimento antes de responder:
1. Identifique as COLUNAS de dias. Brasil: "2ª-feira"/"Seg" = mon, "3ª-feira"/"Ter" = tue,
   "4ª-feira"/"Qua" = wed, "5ª-feira"/"Qui" = thu, "6ª-feira"/"Sex" = fri, "Sáb" = sat, "Dom" = sun.
2. Identifique as LINHAS de horário (ex.: "20:00~20:44"). Grades costumam ter uma linha por
   aula curta (45–50 min). Se houver numeração ("1ª aula") com tabela de horários, use-a
   (ex.: "aula 1 = 07:30–08:20"). Nunca invente horários.
3. Preencha PRIMEIRO o campo "cells" com TODAS as células não vazias da grade, coluna por
   coluna, linha por linha (dia, faixa de horário e texto da célula). Não pule nenhuma
   coluna: confira se cada dia da semana visível foi percorrido. Só depois monte "events"
   a partir de "cells".
4. Junte células consecutivas da MESMA disciplina no MESMO dia em UM bloco:
   start = início da primeira linha, end = fim da última linha do bloco.
   Se houver intervalo entre células da mesma disciplina, crie blocos separados.
5. Use legendas da página para expandir abreviações (ex.: "SIST DISRT" na legenda vira
   "Sistemas Distribuídos") e para achar o professor da disciplina. Use o mapa de salas, se
   houver, para descrever o local (ex.: "LAB07 - Laboratório 07, 1º Andar").

Para cada bloco informe:
- title: nome completo da disciplina (da legenda, se houver), sem códigos.
- weekday: mon, tue, wed, thu, fri, sat ou sun.
- start / end: formato 24h "HH:MM".
- location: sala/local, se visível.
- professor: somente o nome do(a) professor(a) DESTA disciplina, se visível. Nunca liste
  vários nomes nem comentários.
- notes: turma e código da disciplina (ex.: "Turma 2026.2.TADS.5N · TADS.27"), se visíveis.

Regras:
- Ignore cabeçalhos, nome/matrícula do estudante, filtros e botões da página.
- Se algo estiver ilegível ou ambíguo, omita o bloco e explique em warnings.
- Se a imagem não for uma grade acadêmica, retorne events vazio e explique em warnings.
- Escreva warnings em português, curtos e gentis.`;

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    // Scratchpad listed first so the model enumerates the whole grid before summarizing.
    // Without it, the model sometimes stops after the first class. Ignored by sanitize().
    cells: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          weekday: { type: 'string', enum: [...WEEKDAYS] },
          slot: { type: 'string', description: 'faixa de horário da linha, ex.: 20:00~20:44' },
          text: { type: 'string' },
        },
        required: ['weekday', 'slot', 'text'],
      },
    },
    events: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          weekday: { type: 'string', enum: [...WEEKDAYS] },
          start: { type: 'string', description: '24h HH:MM' },
          end: { type: 'string', description: '24h HH:MM' },
          location: { type: 'string' },
          professor: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['title', 'weekday', 'start', 'end'],
      },
    },
    warnings: { type: 'array', items: { type: 'string' } },
  },
  required: ['cells', 'events', 'warnings'],
};

function json(body: AnalyzeAgendaResponse, status = 200) {
  return Response.json(body, { status });
}

function normalizeTime(value: unknown) {
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(\d{1,2})[:hH](\d{2})$/);
  if (!match) return null;
  const time = `${match[1].padStart(2, '0')}:${match[2]}`;
  return TIME_RE.test(time) ? time : null;
}

function optionalText(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/** Never trust model output blindly: keep only well-formed events. */
function sanitize(raw: unknown): { events: Omit<ClassEvent, 'id'>[]; warnings: string[] } {
  const data = (raw ?? {}) as { events?: unknown; warnings?: unknown };
  const warnings = Array.isArray(data.warnings)
    ? data.warnings.filter((w): w is string => typeof w === 'string')
    : [];
  const events: Omit<ClassEvent, 'id'>[] = [];
  let dropped = 0;

  for (const item of Array.isArray(data.events) ? data.events : []) {
    const e = (item ?? {}) as Record<string, unknown>;
    const title = optionalText(e.title);
    const weekday = WEEKDAYS.find((d) => d === e.weekday);
    const start = normalizeTime(e.start);
    const end = normalizeTime(e.end);
    if (!title || !weekday || !start || !end) {
      dropped += 1;
      continue;
    }
    events.push({
      title,
      weekday,
      start,
      end,
      location: optionalText(e.location),
      professor: optionalText(e.professor),
      notes: optionalText(e.notes),
    });
  }

  if (dropped > 0) {
    warnings.push(`${dropped} item(ns) foram ignorados por estarem incompletos.`);
  }
  return { events, warnings };
}

function extractText(interaction: unknown) {
  const steps = (interaction as { steps?: unknown[] })?.steps ?? [];
  return steps
    .flatMap((step) => {
      const s = step as { type?: string; content?: { type?: string; text?: string }[] };
      return s.type === 'model_output' ? (s.content ?? []) : [];
    })
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text)
    .join('');
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('[analyze-agenda] GEMINI_API_KEY is not set');
    return json({ error: 'O serviço de leitura da agenda não está configurado.' }, 500);
  }

  let body: { imageBase64?: unknown; mimeType?: unknown };
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Requisição inválida.' }, 400);
  }

  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
  const mimeType = typeof body.mimeType === 'string' ? body.mimeType : 'image/jpeg';
  if (!imageBase64) {
    return json({ error: 'Nenhuma imagem foi enviada.' }, 400);
  }
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return json({ error: 'Formato de imagem não suportado. Use JPG, PNG ou WEBP.' }, 415);
  }
  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return json({ error: 'A imagem é muito grande. Tente um print menor.' }, 413);
  }

  let geminiResponse: Response;
  try {
    geminiResponse = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
        'Api-Revision': GEMINI_API_REVISION,
      },
      body: JSON.stringify({
        model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
        store: false, // don't retain students' schedules on Google's side
        input: [
          { type: 'text', text: PROMPT },
          { type: 'image', mime_type: mimeType, data: imageBase64, resolution: 'high' },
        ],
        // Dense grids need careful reading; lower levels skipped columns in testing.
        generation_config: { thinking_level: 'high' },
        response_format: { type: 'text', mime_type: 'application/json', schema: RESPONSE_SCHEMA },
      }),
    });
  } catch (error) {
    console.error('[analyze-agenda] network error', error);
    return json({ error: 'Não foi possível falar com o serviço agora. Tente de novo.' }, 502);
  }

  if (!geminiResponse.ok) {
    console.error('[analyze-agenda] Gemini error', geminiResponse.status, await geminiResponse.text());
    return json({ error: 'Não conseguimos ler a imagem agora. Tente de novo em instantes.' }, 502);
  }

  try {
    const interaction = await geminiResponse.json();
    const text = extractText(interaction);
    if (!text) {
      console.error('[analyze-agenda] empty output', interaction?.status, interaction?.errors);
      return json({ error: 'Não conseguimos ler a imagem. Tente outro print.' }, 502);
    }
    return json(sanitize(JSON.parse(text)));
  } catch (error) {
    console.error('[analyze-agenda] invalid model output', error);
    return json({ error: 'A leitura veio incompleta. Tente de novo.' }, 502);
  }
}
